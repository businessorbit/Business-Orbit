import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/config/database'
import { getUserFromToken } from '@/lib/utils/auth'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { targetUserId, action } = await request.json()

    if (!targetUserId || !action) {
      return NextResponse.json({ 
        success: false, 
        error: 'targetUserId and action are required' 
      }, { status: 400 })
    }

    if (action !== 'follow' && action !== 'unfollow') {
      return NextResponse.json({ 
        success: false, 
        error: 'Action must be either follow or unfollow' 
      }, { status: 400 })
    }

    if (user.id === targetUserId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot follow yourself' 
      }, { status: 400 })
    }

    // Check if target user exists
    const targetUser = await pool.query(
      'SELECT id, name FROM users WHERE id = $1 AND is_admin = false',
      [targetUserId]
    )

    if (targetUser.rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found' 
      }, { status: 404 })
    }

    if (action === 'follow') {
      // Check if already following
      const existingFollow = await pool.query(
        'SELECT id FROM user_follows WHERE follower_id = $1 AND following_id = $2',
        [user.id, targetUserId]
      )

      if (existingFollow.rows.length > 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Already following this user' 
        }, { status: 400 })
      }

      // Check if request already exists
      const existingRequest = await pool.query(
        'SELECT id, status FROM follow_requests WHERE requester_id = $1 AND target_id = $2',
        [user.id, targetUserId]
      )

      if (existingRequest.rows.length > 0) {
        const request = existingRequest.rows[0]
        if (request.status === 'pending') {
          return NextResponse.json({ 
            success: false, 
            error: 'Follow request already sent' 
          }, { status: 400 })
        } else if (request.status === 'accepted') {
          return NextResponse.json({ 
            success: false, 
            error: 'Already following this user' 
          }, { status: 400 })
        } else if (request.status === 'declined') {
          // Allow resending if previously declined
          await pool.query(
            'UPDATE follow_requests SET status = $1, updated_at = NOW() WHERE id = $2',
            ['pending', request.id]
          )
          return NextResponse.json({ 
            success: true, 
            message: `Follow request sent to ${targetUser.rows[0].name}` 
          })
        }
      }

      // Create follow request
      await pool.query(
        'INSERT INTO follow_requests (requester_id, target_id, status) VALUES ($1, $2, $3)',
        [user.id, targetUserId, 'pending']
      )

      return NextResponse.json({ 
        success: true, 
        message: `Follow request sent to ${targetUser.rows[0].name}` 
      })
    } else {
      // Unfollow - remove from both tables
      const followResult = await pool.query(
        'DELETE FROM user_follows WHERE follower_id = $1 AND following_id = $2',
        [user.id, targetUserId]
      )

      const requestResult = await pool.query(
        'DELETE FROM follow_requests WHERE requester_id = $1 AND target_id = $2',
        [user.id, targetUserId]
      )

      if (followResult.rowCount === 0 && requestResult.rowCount === 0) {
        return NextResponse.json({ 
          success: false, 
          error: 'Not following this user' 
        }, { status: 400 })
      }

      return NextResponse.json({ 
        success: true, 
        message: `Unfollowed ${targetUser.rows[0].name}` 
      })
    }

  } catch (error: any) {
    console.error('Error handling follow action:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to process follow action' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's following list
    const result = await pool.query(`
      SELECT uf.following_id, u.name, u.profile_photo_url
      FROM user_follows uf
      JOIN users u ON uf.following_id = u.id
      WHERE uf.follower_id = $1
      ORDER BY uf.created_at DESC
    `, [user.id])

    const following = result.rows.map((row: any) => ({
      id: row.following_id,
      name: row.name,
      profilePhotoUrl: row.profile_photo_url
    }))

    return NextResponse.json({ 
      success: true, 
      following,
      count: following.length 
    })

  } catch (error: any) {
    console.error('Error fetching following list:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch following list' 
    }, { status: 500 })
  }
}

