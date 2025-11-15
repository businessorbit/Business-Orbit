/**
 * Next.js Instrumentation Hook
 * This file runs when the Next.js server starts
 * Used to initialize background workers and services
 */

export async function register() {
  // Only run on server side in production
  if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
    // Import and start the scheduled posts worker
    const worker = await import('./lib/services/scheduled-posts-worker')
    console.log('[Instrumentation] Scheduled posts worker initialized')
  }
}

