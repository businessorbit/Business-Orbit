import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/config/database'
import { getUserFromToken } from '@/lib/utils/auth'

// Test endpoint to add sample members to chapters for testing
export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getUserFromToken(request)
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all chapters
    const chaptersResult = await pool.query('SELECT id, name, location_city FROM chapters LIMIT 5')
    const chapters = chaptersResult.rows

    if (chapters.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'No chapters found. Please seed chapters first.' 
      }, { status: 400 })
    }

    // Create test users and add them to chapters
    const testUsers = [
      { name: 'Test User 1', email: 'test1@example.com' },
      { name: 'Test User 2', email: 'test2@example.com' },
      { name: 'Test User 3', email: 'test3@example.com' },
      { name: 'Test User 4', email: 'test4@example.com' },
      { name: 'Test User 5', email: 'test5@example.com' }
    ]

    const addedMembers = []

    for (let i = 0; i < testUsers.length; i++) {
      const testUser = testUsers[i]
      const chapter = chapters[i % chapters.length] // Distribute users across chapters

      try {
        // Create user
        const userResult = await pool.query(
          'INSERT INTO users (name, email, is_admin) VALUES ($1, $2, $3) RETURNING id',
          [testUser.name, testUser.email, false]
        )
        const userId = userResult.rows[0].id

        // Add user to chapter
        await pool.query(
          'INSERT INTO chapter_memberships (user_id, chapter_id) VALUES ($1, $2)',
          [userId, chapter.id]
        )

        addedMembers.push({
          userId,
          userName: testUser.name,
          chapterName: chapter.name,
          chapterLocation: chapter.location_city
        })
      } catch (error) {
        console.error(`Failed to add test user ${testUser.name}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Added ${addedMembers.length} test members to chapters`,
      addedMembers
    })

  } catch (error) {
    console.error('Test members error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint to check member counts
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getUserFromToken(request)
    if (!user || !user.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get chapter member counts
    const result = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.location_city,
        COUNT(cm.user_id) as member_count
      FROM chapters c
      LEFT JOIN chapter_memberships cm ON c.id = cm.chapter_id
      GROUP BY c.id, c.name, c.location_city
      ORDER BY member_count DESC, c.name
    `)

    return NextResponse.json({
      success: true,
      chapters: result.rows.map(row => ({
        ...row,
        member_count: parseInt(row.member_count) || 0
      }))
    })

  } catch (error) {
    console.error('Test members check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


