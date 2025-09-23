import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/config/database'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chapterId } = await params
    
    console.log('Fetching members for chapter:', chapterId)
    
    // Validate chapter ID (UUID format)
    if (!chapterId || typeof chapterId !== 'string') {
      console.error('Invalid chapter ID:', chapterId)
      return NextResponse.json({
        success: false,
        error: 'Invalid chapter ID',
        message: 'Chapter ID is required'
      }, { status: 400 })
    }
    
    // Test database connection first
    const client = await pool.connect()
    try {
      const result = await client.query(
        `SELECT u.id, u.name, u.email, u.profile_photo_url
         FROM chapter_memberships cm
         JOIN users u ON u.id = cm.user_id
         WHERE cm.chapter_id = $1
         ORDER BY cm.joined_at DESC, u.name`,
        [chapterId]
      )
      
      console.log(`Found ${result.rows.length} members for chapter ${chapterId}`)
      
      return NextResponse.json({ 
        success: true,
        members: result.rows,
        count: result.rows.length
      })
    } finally {
      client.release()
    }
  } catch (error: any) {
    console.error('GET /api/chapters/[id]/members error:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail
    })
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch chapter members',
      message: 'Database error occurred while fetching chapter members'
    }, { status: 500 })
  }
}