import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/config/database'
import { getUserFromToken } from '@/lib/utils/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { inviteId } = await params

    // Update invite status to declined
    const result = await pool.query(
      `UPDATE secret_group_invites 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
         AND (recipient_email = $3 OR recipient_user_id = $4)
         AND status = 'pending'
       RETURNING *`,
      ['declined', inviteId, user.email, user.id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invite not found or already processed'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: 'Invite declined successfully'
    })

  } catch (error: any) {
    console.error('Error declining secret group invite:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to decline invite'
    }, { status: 500 })
  }
}

