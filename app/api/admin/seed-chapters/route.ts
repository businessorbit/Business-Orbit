import { NextRequest, NextResponse } from 'next/server'
import { seedChapters, getChapterStats } from '@/lib/database/seed-chapters'

// : Seed predefined chapters (admin only)
export async function POST(request: NextRequest) {
  try {
    const result = await seedChapters()
    
    if (result.success) {
      // Get updated stats
      const stats = await getChapterStats()
      
      return NextResponse.json({
        success: true,
        message: result.message,
        stats,
        chapters: result.chapters
      }, { status: 201 })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: result.message
      }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Chapter seeding API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to seed chapters'
    }, { status: 500 })
  }
}

// GET: Get chapter statistics
export async function GET(request: NextRequest) {
  try {
    const stats = await getChapterStats()
    
    return NextResponse.json({
      success: true,
      stats
    })
  } catch (error: any) {
    console.error('Chapter stats API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to get chapter statistics'
    }, { status: 500 })
  }
}


