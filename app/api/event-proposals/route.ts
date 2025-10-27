import { NextRequest, NextResponse } from "next/server";
import pool from '@/lib/config/database';

// GET all proposals
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    
    let query = 'SELECT * FROM event_proposals';
    const params: any[] = [];
    
    if (status) {
      query += ' WHERE status = $1';
      params.push(status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    return NextResponse.json(result.rows, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching proposals:", error);
    return NextResponse.json({ error: "Failed to fetch proposals" }, { status: 500 });
  }
}

// Approve proposal and create event
export async function POST(req: NextRequest) {
  try {
    const { proposalId, userId } = await req.json();
    
    if (!proposalId) {
      return NextResponse.json({ error: "Proposal ID is required" }, { status: 400 });
    }
    
    // Get the proposal
    const proposalResult = await pool.query(
      'SELECT * FROM event_proposals WHERE id = $1',
      [proposalId]
    );
    
    if (proposalResult.rows.length === 0) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }
    
    const proposal = proposalResult.rows[0];
    
    // Create the event with host_id
    const createEventQuery = `
      INSERT INTO events (title, description, date, event_type, venue_address, status, host_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    
    const eventType = proposal.mode.toLowerCase() === 'online' ? 'online' : 'physical';
    const venueAddress = eventType === 'physical' ? proposal.description : '';
    
    const eventResult = await pool.query(createEventQuery, [
      proposal.event_title,
      proposal.description,
      proposal.event_date,
      eventType,
      venueAddress,
      'approved', // Auto-approve when created by admin
      proposal.user_id // Set host_id from proposal's user_id
    ]);
    
    // Update proposal status
    await pool.query(
      'UPDATE event_proposals SET status = $1 WHERE id = $2',
      ['approved', proposalId]
    );
    
    return NextResponse.json({ 
      success: true, 
      event: eventResult.rows[0] 
    }, { status: 200 });
    
  } catch (error: any) {
    console.error("Error approving proposal:", error);
    return NextResponse.json({ error: "Failed to approve proposal" }, { status: 500 });
  }
}

// Reject proposal
export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const proposalId = url.searchParams.get('id');
    
    if (!proposalId) {
      return NextResponse.json({ error: "Proposal ID is required" }, { status: 400 });
    }
    
    await pool.query(
      'UPDATE event_proposals SET status = $1 WHERE id = $2',
      ['rejected', proposalId]
    );
    
    return NextResponse.json({ success: true }, { status: 200 });
    
  } catch (error: any) {
    console.error("Error rejecting proposal:", error);
    return NextResponse.json({ error: "Failed to reject proposal" }, { status: 500 });
  }
}

