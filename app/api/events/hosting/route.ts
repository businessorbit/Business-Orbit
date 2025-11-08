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
          COUNT(DISTINCT r.id) AS rsvp_count
        FROM events e
        LEFT JOIN rsvps r ON e.id = r.event_id
        WHERE e.host_id = $1 AND e.status = 'approved'
        GROUP BY e.id
        ORDER BY e.date ASC
      `;

      result = await pool.query(query, [userId]);
    } catch (dbError: any) {
      // If host_id column doesn't exist, return empty array (no hosting events yet)
      // This happens if the migration to add host_id hasn't been run
      if (dbError?.code === '42703' && dbError?.message?.includes('host_id')) {
        // Return empty array since host_id column doesn't exist
        // User hasn't hosted any events yet (or migration not run)
        return NextResponse.json([], { status: 200 });
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

