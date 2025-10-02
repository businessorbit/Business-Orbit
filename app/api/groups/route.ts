import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/config/database'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const name = String(body?.name || '').trim()
    const description = body?.description ? String(body.description) : null
    if (!name) {
      return NextResponse.json({ success: false, message: 'Group name is required' }, { status: 400 })
    }
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
