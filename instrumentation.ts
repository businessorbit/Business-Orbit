/**
 * Next.js Instrumentation Hook
 * This file runs when the Next.js server starts
 * Used to initialize background workers and services
 */

export async function register() {
  // Only run on server side in production (not during build)
  if (
    typeof window === 'undefined' &&
    process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PHASE !== 'phase-production-build' &&
    process.env.NEXT_PHASE !== 'phase-development-build'
  ) {
    try {
      // Import and start the scheduled posts worker
      const worker = await import('./lib/services/scheduled-posts-worker')
      console.log('[Instrumentation] Scheduled posts worker initialized')
    } catch (error) {
      console.error('[Instrumentation] Failed to initialize worker:', error)
    }
  }
}

