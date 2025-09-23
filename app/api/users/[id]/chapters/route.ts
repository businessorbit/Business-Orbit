import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/config/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: userId } = params || ({} as any)
    
    // Validate user ID
    if (!userId || typeof userId !== 'string' || !/^\d+$/.test(userId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid user ID',
        message: 'User ID must be a valid number'
      }, { status: 400 })
    }
    
    const result = await pool.query(
      `SELECT c.id, c.name, c.location_city,
              COUNT(cm2.user_id) AS member_count
       FROM chapter_memberships cm
       JOIN chapters c ON c.id = cm.chapter_id
       LEFT JOIN chapter_memberships cm2 ON cm2.chapter_id = c.id
       WHERE cm.user_id = $1
       GROUP BY c.id, c.name, c.location_city
       ORDER BY c.location_city, c.name`,
      [parseInt(userId)]
    )
    
    return NextResponse.json({ 
      success: true,
      chapters: result.rows,
      count: result.rows.length
    })
  } catch (error: any) {
    // Deduplicate noisy logs (e.g., retries) within a short window
    const _now = Date.now()
    ;(globalThis as any).__chaptersLog = (globalThis as any).__chaptersLog || { msg: '', ts: 0 }
    const _cache = (globalThis as any).__chaptersLog as { msg: string; ts: number }
    const _msg = String(error?.message || error)
    if (_msg !== _cache.msg || _now - _cache.ts > 3000) {
      console.error('GET /api/users/[id]/chapters error:', _msg)
      _cache.msg = _msg
      _cache.ts = _now
    }
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch user chapters',
      message: 'Database error occurred while fetching user chapters'
    }, { status: 500 })
  }
}