import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/config/database'
import { getUserFromToken } from '@/lib/utils/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get pending invites for this user (by email or user_id)
    const result = await pool.query(
      `SELECT 
        sgi.id,
        sgi.group_id,
        sgi.status,
        sgi.created_at,
        sg.name as group_name,
        sg.description as group_description,
        u.name as sender_name,
        u.email as sender_email
       FROM secret_group_invites sgi
       JOIN secret_groups sg ON sg.id = sgi.group_id
       JOIN users u ON u.id = sgi.sender_id
       WHERE (sgi.recipient_email = $1 OR sgi.recipient_user_id = $2)
         AND sgi.status = 'pending'
       ORDER BY sgi.created_at DESC`,
      [user.email, user.id]
    )

    return NextResponse.json({
      success: true,
      invites: result.rows
    })

  } catch (error: any) {
    console.error('Error fetching secret group invites:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch invites'
    }, { status: 500 })
  }
}

