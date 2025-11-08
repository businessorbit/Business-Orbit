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

    // Convert userId to integer
    const userIdInt = parseInt(userId, 10);
    if (isNaN(userIdInt)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Try query with host_id first, fallback to without host_id if column doesn't exist
    let result;
    try {
      // First, try direct host_id query (fastest if host_id is set correctly)
      let hostQuery = `
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

      try {
        result = await pool.query(hostQuery, [userIdInt]);
        console.log(`[Hosting API] Host query result: ${result.rows.length} events for user ${userIdInt}`);
      } catch (hostError: any) {
        // If host_id column doesn't exist, skip this query
        if (hostError?.code === '42703' && hostError?.message?.includes('host_id')) {
          console.log(`[Hosting API] host_id column doesn't exist, trying proposal query`);
          result = { rows: [] };
        } else {
          throw hostError;
        }
      }
      
      // If no results, try to find events via event_proposals (works even if host_id wasn't set)
      if (result.rows.length === 0) {
        const proposalQuery = `
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
            (LOWER(TRIM(e.title)) = LOWER(TRIM(ep.event_title)) OR
             LOWER(TRIM(e.title)) LIKE LOWER(TRIM(ep.event_title)) || '%' OR
             LOWER(TRIM(ep.event_title)) LIKE LOWER(TRIM(e.title)) || '%')
            AND DATE(e.date) = DATE(ep.event_date)
          LEFT JOIN users u ON e.host_id = u.id
          WHERE ep.user_id = $1 
            AND ep.status = 'approved'
            AND e.status = 'approved'
          GROUP BY e.id, ep.name, ep.email, u.name, u.email
          ORDER BY e.date ASC
        `;

        const proposalResult = await pool.query(proposalQuery, [userIdInt]);
        console.log(`[Hosting API] Proposal query result: ${proposalResult.rows.length} events for user ${userIdInt}`);
        if (proposalResult.rows.length > 0) {
          result = proposalResult;
        }
      }
    } catch (dbError: any) {
      // If host_id column doesn't exist, try alternative approach
      if (dbError?.code === '42703' && dbError?.message?.includes('host_id')) {
        // Try to find events via event_proposals table only (without host_id)
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
          
          result = await pool.query(alternativeQuery, [userIdInt]);
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
    
    console.log(`[Hosting API] Returning ${result.rows.length} events for user ${userIdInt}`);
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

