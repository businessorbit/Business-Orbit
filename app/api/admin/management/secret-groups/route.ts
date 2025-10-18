import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/config/database'

async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS secret_groups (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS secret_group_memberships (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      group_id UUID NOT NULL REFERENCES secret_groups(id) ON DELETE CASCADE,
      joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, group_id)
    );
  `)
}

export async function GET() {
  try {
    await ensureTables()
    const res = await pool.query(
      `SELECT g.id, g.name, g.description, g.created_at, COUNT(m.user_id)::int AS member_count
       FROM secret_groups g
       LEFT JOIN secret_group_memberships m ON m.group_id = g.id
       GROUP BY g.id
       ORDER BY g.created_at DESC`
    )
    return NextResponse.json({ groups: res.rows }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: 'Failed to load groups', details: e?.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTables()
    const body = await req.json().catch(() => ({}))
    const name = String(body?.name || '').trim()
    const description = body?.description ? String(body.description) : null
    if (!name) return NextResponse.json({ success: false, message: 'Group name is required' }, { status: 400 })

    const ins = await pool.query(
      `INSERT INTO secret_groups (name, description) VALUES ($1, $2)
       RETURNING id, name, description, created_at`,
      [name, description]
    )
    const group = { ...ins.rows[0], member_count: 0 }
    return NextResponse.json({ success: true, group }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'Failed to create group', details: e?.message }, { status: 500 })
  }
}
