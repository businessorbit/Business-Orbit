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

    // Get the invite
    const inviteResult = await pool.query(
      `SELECT * FROM secret_group_invites 
       WHERE id = $1 
         AND (recipient_email = $2 OR recipient_user_id = $3)
         AND status = 'pending'`,
      [inviteId, user.email, user.id]
    )

    if (inviteResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invite not found or already processed'
      }, { status: 404 })
    }

    const invite = inviteResult.rows[0]

    // Start transaction
    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Update invite status
      await client.query(
        'UPDATE secret_group_invites SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['accepted', inviteId]
      )

      // Add user to group membership
      await client.query(
        `INSERT INTO secret_group_memberships (user_id, group_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, group_id) DO NOTHING`,
        [user.id, invite.group_id]
      )

      await client.query('COMMIT')

      return NextResponse.json({
        success: true,
        message: 'Invite accepted and joined group successfully'
      })

    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }

  } catch (error: any) {
    console.error('Error accepting secret group invite:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to accept invite'
    }, { status: 500 })
  }
}

