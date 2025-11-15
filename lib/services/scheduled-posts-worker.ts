import pool from '@/lib/config/database'

/**
 * Background worker to automatically publish scheduled posts
 * Runs every minute to check and publish posts whose scheduled time has arrived
 */
class ScheduledPostsWorker {
  private intervalId: NodeJS.Timeout | null = null
  private isRunning = false

  /**
   * Check and publish any scheduled posts that are due
   */
  private async publishScheduledPosts() {
    // Skip if pool is not available (e.g., during build)
    if (!pool) {
      return
    }

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
        console.log(`[ScheduledPostsWorker] Published ${result.rows.length} scheduled post(s) at ${now.toISOString()}`)
      }
    } catch (error) {
      console.error('[ScheduledPostsWorker] Error publishing scheduled posts:', error)
    } finally {
      client.release()
    }
  }

  /**
   * Start the worker - checks every minute
   */
  start() {
    if (this.isRunning) {
      return
    }

    // Only run in production or when explicitly enabled
    if (process.env.NODE_ENV === 'production' || process.env.ENABLE_SCHEDULED_POSTS_WORKER === 'true') {
      this.isRunning = true
      
      // Run immediately on start (with small delay to ensure DB is ready)
      setTimeout(() => {
        this.publishScheduledPosts()
      }, 10000) // Wait 10 seconds for database connection
      
      // Then run every 30 seconds for better accuracy
      this.intervalId = setInterval(() => {
        this.publishScheduledPosts()
      }, 30000) // 30 seconds

      console.log('[ScheduledPostsWorker] Started - checking for scheduled posts every 30 seconds')
    }
  }

  /**
   * Stop the worker
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      this.isRunning = false
      console.log('[ScheduledPostsWorker] Stopped')
    }
  }
}

// Create singleton instance
const scheduledPostsWorker = new ScheduledPostsWorker()

// Auto-start when this module is loaded (server-side only)
if (typeof window === 'undefined') {
  // Start immediately - database connection will be ready by the time first check runs
  scheduledPostsWorker.start()
}

export default scheduledPostsWorker
