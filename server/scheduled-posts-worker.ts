/**
 * Background Worker for Publishing Scheduled Posts
 * This service runs continuously and checks for scheduled posts every minute
 * Run this as a separate process on your EC2 server
 */

import pool from '../lib/config/database'

async function publishScheduledPosts() {
  const client = await pool.connect()
  try {
    const now = new Date()
    const query = `
      UPDATE posts
      SET status = 'published',
          published_at = COALESCE(published_at, NOW())
      WHERE status = 'scheduled'
        AND scheduled_at IS NOT NULL
        AND scheduled_at <= $1
      RETURNING id
    `
    const result = await client.query(query, [now])
    
    if (result.rows.length > 0) {
      console.log(`[${new Date().toISOString()}] Published ${result.rows.length} scheduled post(s)`)
    }
    
    return { success: true, published: result.rows.length }
  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Error publishing scheduled posts:`, error.message)
    return { success: false, error: error.message }
  } finally {
    client.release()
  }
}

// Run the check every minute (60000 milliseconds)
async function startWorker() {
  console.log(`[${new Date().toISOString()}] Scheduled Posts Worker started - checking every minute`)
  
  // Run immediately on start
  await publishScheduledPosts()
  
  // Then run every minute
  setInterval(async () => {
    await publishScheduledPosts()
  }, 60000) // 60 seconds = 1 minute
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log(`[${new Date().toISOString()}] Scheduled Posts Worker shutting down...`)
  if (pool) {
    await pool.end()
  }
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log(`[${new Date().toISOString()}] Scheduled Posts Worker shutting down...`)
  if (pool) {
    await pool.end()
  }
  process.exit(0)
})

// Start the worker
startWorker().catch((error) => {
  console.error('Failed to start Scheduled Posts Worker:', error)
  process.exit(1)
})

