import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/config/database';

export async function GET(req: NextRequest) {
  try {
    // Check if database pool is available
    if (!pool) {
      console.error("Database pool is not initialized. Check DATABASE_URL environment variable.");
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 500 }
      );
    }

    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Try query with host_id first, fallback to without host_id if column doesn't exist
    let result;
    try {
      // Query events where user is the host, include creator and host info
      const query = `
        SELECT 
          e.id,
          e.title,
          e.description,
          e.date,
          e.event_type,
          e.status,
          e.venue_address,
          e.host_id,
          COUNT(DISTINCT r.id) AS rsvp_count,
          ep.name AS creator_name,
          ep.email AS creator_email,
          u.name AS host_name,
          u.email AS host_email
        FROM events e
        LEFT JOIN rsvps r ON e.id = r.event_id
        LEFT JOIN event_proposals ep ON 
          LOWER(TRIM(e.title)) = LOWER(TRIM(ep.event_title)) AND
          DATE(e.date) = DATE(ep.event_date) AND
          ep.status = 'approved'
        LEFT JOIN users u ON e.host_id = u.id
        WHERE e.host_id = $1 AND e.status = 'approved'
        GROUP BY e.id, ep.name, ep.email, u.name, u.email
        ORDER BY e.date ASC
      `;

      result = await pool.query(query, [userId]);
      
      // If no results and host_id column exists, also check if there are events
      // that were created from proposals by this user (via event_proposals table)
      if (result.rows.length === 0) {
        try {
          // Try to find events created from proposals by this user
          // This handles cases where host_id might not have been set during approval
          const fallbackQuery = `
            SELECT DISTINCT
              e.id,
              e.title,
              e.description,
              e.date,
              e.event_type,
              e.status,
              e.venue_address,
              e.host_id,
              COUNT(DISTINCT r.id) AS rsvp_count,
              ep.name AS creator_name,
              ep.email AS creator_email,
              u.name AS host_name,
              u.email AS host_email
            FROM events e
            LEFT JOIN rsvps r ON e.id = r.event_id
            INNER JOIN event_proposals ep ON 
              LOWER(TRIM(e.title)) = LOWER(TRIM(ep.event_title)) AND
              DATE(e.date) = DATE(ep.event_date)
            LEFT JOIN users u ON e.host_id = u.id
            WHERE ep.user_id = $1 
              AND ep.status = 'approved'
              AND e.status = 'approved'
            GROUP BY e.id, ep.name, ep.email, u.name, u.email
            ORDER BY e.date ASC
          `;
          
          const fallbackResult = await pool.query(fallbackQuery, [userId]);
          if (fallbackResult.rows.length > 0) {
            result = fallbackResult;
          }
        } catch (fallbackError) {
          // If fallback query fails, just use the original empty result
          console.log('Fallback query failed, using original result');
        }
      }
    } catch (dbError: any) {
      // If host_id column doesn't exist, try alternative approach
      if (dbError?.code === '42703' && dbError?.message?.includes('host_id')) {
        // Try to find events via event_proposals table
        try {
          const alternativeQuery = `
            SELECT DISTINCT
              e.id,
              e.title,
              e.description,
              e.date,
              e.event_type,
              e.status,
              e.venue_address,
              COUNT(DISTINCT r.id) AS rsvp_count,
              ep.name AS creator_name,
              ep.email AS creator_email,
              NULL AS host_name,
              NULL AS host_email
            FROM events e
            LEFT JOIN rsvps r ON e.id = r.event_id
            INNER JOIN event_proposals ep ON 
              LOWER(TRIM(e.title)) = LOWER(TRIM(ep.event_title)) AND
              DATE(e.date) = DATE(ep.event_date)
            WHERE ep.user_id = $1 
              AND ep.status = 'approved'
              AND e.status = 'approved'
            GROUP BY e.id, ep.name, ep.email
            ORDER BY e.date ASC
          `;
          
          result = await pool.query(alternativeQuery, [userId]);
        } catch (altError) {
          // If alternative also fails, return empty array
          console.error('Alternative query also failed:', altError);
          return NextResponse.json([], { status: 200 });
        }
      } else {
        // Re-throw if it's a different error
        throw dbError;
      }
    }
    
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching hosting events:', error);
    
    // Provide more detailed error message for debugging
    let errorMessage = 'Failed to fetch hosting events';
    if (error?.code === '42P01') {
      errorMessage = "Database table not found. Please run migrations.";
    } else if (error?.code === '42703') {
      errorMessage = "Database column not found. Please run migrations.";
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

