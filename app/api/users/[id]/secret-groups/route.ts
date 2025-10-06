import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/config/database'

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const res = await pool.query(
      `SELECT g.id, g.name, g.description, g.created_at,
              (SELECT COUNT(m2.user_id)::int FROM secret_group_memberships m2 WHERE m2.group_id = g.id) AS member_count
       FROM secret_group_memberships m
       JOIN secret_groups g ON g.id = m.group_id
       WHERE m.user_id = $1
       ORDER BY g.created_at DESC`,
      [id]
    )
    return NextResponse.json({ groups: res.rows })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to load user groups', details: e?.message }, { status: 500 })
  }
}








