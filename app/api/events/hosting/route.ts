import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/config/database';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

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

    const result = await pool.query(query, [userId]);
    
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching hosting events:', error);
    return NextResponse.json({ error: 'Failed to fetch hosting events' }, { status: 500 });
  }
}

