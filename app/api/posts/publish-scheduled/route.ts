import { NextResponse } from 'next/server'
import pool from '@/lib/config/database'

// Force dynamic rendering to prevent build-time analysis
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Idempotent endpoint to publish any scheduled posts whose time has arrived.
// Safe to call periodically (e.g., on feed load or via cron).
// Supports both GET (for cron services) and POST methods.
async function publishScheduledPosts() {
  const client = await pool.connect()
  try {
    // First, check for scheduled posts that should be published (for debugging)
    const checkQuery = `
      SELECT id, content, scheduled_at, status, NOW() as current_time
      FROM posts
      WHERE status = 'scheduled'
        AND scheduled_at IS NOT NULL
      ORDER BY scheduled_at ASC
      LIMIT 5
    `
    const checkResult = await client.query(checkQuery)
    
    // Use database NOW() for accurate timezone-aware comparison
    // This ensures we're comparing in the same timezone as the database
    const query = `
      UPDATE posts
      SET status = 'published',
          published_at = COALESCE(published_at, NOW())
      WHERE status = 'scheduled'
        AND scheduled_at IS NOT NULL
        AND scheduled_at <= NOW()
      RETURNING id, content, scheduled_at, published_at
    `
    const result = await client.query(query)
    
    // Log for debugging
    if (result.rows.length > 0) {
      console.log(`Published ${result.rows.length} scheduled post(s)`)
    } else if (checkResult.rows.length > 0) {
      // Log upcoming scheduled posts for debugging
      console.log(`Found ${checkResult.rows.length} scheduled post(s), but none ready to publish yet`)
      checkResult.rows.forEach((row: any) => {
        console.log(`  - Post ${row.id}: scheduled_at=${row.scheduled_at}, current_time=${row.current_time}`)
      })
    }
    
    return { 
      success: true, 
      published: result.rows.length,
      posts: result.rows.map((row: any) => ({
        id: row.id,
        scheduled_at: row.scheduled_at,
        published_at: row.published_at
      })),
      // Include debug info in development
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          scheduled_posts_count: checkResult.rows.length,
          upcoming_posts: checkResult.rows.map((row: any) => ({
            id: row.id,
            scheduled_at: row.scheduled_at,
            current_time: row.current_time
          }))
        }
      })
    }
  } catch (error: any) {
    console.error('Error publishing scheduled posts:', error)
    throw error
  } finally {
    client.release()
  }
}

export async function GET() {
  try {
    const result = await publishScheduledPosts()
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to publish scheduled posts' }, { status: 500 })
  }
}

export async function POST() {
  try {
    const result = await publishScheduledPosts()
    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to publish scheduled posts' }, { status: 500 })
  }
}


