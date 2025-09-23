import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/config/database'
import { getUserFromToken } from '@/lib/utils/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { chapterId: string } }
) {
  try {
    const { chapterId } = params || ({} as any)
    const url = new URL(request.url)
    const limitParam = url.searchParams.get('limit')
    const cursor = url.searchParams.get('cursor')
    const limit = Math.min(Math.max(parseInt(limitParam || '50', 10) || 50, 1), 100)

    if (!chapterId) {
      return NextResponse.json({ success: false, error: 'chapterId required' }, { status: 400 })
    }

    // Enforce auth and membership
    const user = await getUserFromToken(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    const membership = await pool.query(
      'SELECT 1 FROM chapter_memberships WHERE user_id = $1 AND chapter_id = $2 LIMIT 1',
      [user.id, chapterId]
    )
    if (membership.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    // Pagination
    let where = 'WHERE m.chapter_id = $1'
    const values: any[] = [chapterId]

    if (cursor) {
      const date = new Date(cursor)
      if (!isNaN(date.getTime())) {
        where += ' AND m.created_at < $2'
        values.push(date.toISOString())
      } else {
        const tsRes = await pool.query('SELECT created_at FROM chapter_messages WHERE id = $1 AND chapter_id = $2', [cursor, chapterId])
        if (tsRes.rowCount > 0) {
          where += ' AND m.created_at < $2'
          values.push(tsRes.rows[0].created_at)
        }
      }
    }

    const sql = `
      SELECT m.id::text, m.chapter_id::text as chapter_id, m.sender_id::text as sender_id, m.content, m.created_at,
             u.name as sender_name, u.profile_photo_url as sender_avatar_url
      FROM chapter_messages m
      JOIN users u ON u.id = m.sender_id
      ${where}
      ORDER BY m.created_at DESC
      LIMIT $${values.length + 1}
    `
    values.push(limit + 1)

    const res = await pool.query(sql, values)
    const rows = res.rows

    const hasMore = rows.length > limit
    const sliced = rows.slice(0, limit)
    const messages = sliced
      .map((r: any) => ({
        id: String(r.id),
        chapterId: String(r.chapter_id),
        senderId: String(r.sender_id),
        senderName: r.sender_name || 'User',
        senderAvatarUrl: r.sender_avatar_url || null,
        content: r.content,
        timestamp: new Date(r.created_at).toISOString(),
      }))
      .reverse()

    const nextCursor = hasMore ? new Date(sliced[sliced.length - 1].created_at).toISOString() : null

    return NextResponse.json({ success: true, messages, nextCursor })
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('GET /api/chat/[chapterId]/messages error', error?.message || error)
    return NextResponse.json({ success: false, error: 'Internal error' }, { status: 500 })
  }
}


