import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/config/database'

// DELETE: Remove user from a specific chapter
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: chapterId } = await params
    console.log('=== DELETE MEMBERSHIP API DEBUG ===');
    console.log('Chapter ID from params:', chapterId);
    
    // Validate chapter ID
    if (!chapterId || typeof chapterId !== 'string') {
      console.error('Invalid chapter ID:', chapterId);
      return NextResponse.json({
        success: false,
        error: 'Invalid chapter ID',
        message: 'Chapter ID is required'
      }, { status: 400 })
    }

    // For now, we'll need to get user ID from request body since we removed auth
    const body = await request.json()
    const { userId } = body
    console.log('Request body:', body);
    console.log('User ID from body:', userId);
    
    if (!userId) {
      console.error('No user ID provided');
      return NextResponse.json({
        success: false,
        error: 'User ID required',
        message: 'User ID is required to leave a chapter'
      }, { status: 400 })
    }

    // Delete the chapter membership
    const result = await pool.query(
      'DELETE FROM chapter_memberships WHERE user_id = $1 AND chapter_id = $2 RETURNING *',
      [userId, chapterId]
    )
    
    console.log('Database query result:', result);
    console.log('Rows affected:', result.rowCount);
    console.log('Returned rows:', result.rows);
    
    if (result.rows.length === 0) {
      console.error('No membership found to delete');
      return NextResponse.json({
        success: false,
        error: 'Membership not found',
        message: 'You are not a member of this chapter or the chapter does not exist'
      }, { status: 404 })
    }

    console.log('Successfully deleted membership:', result.rows[0]);
    return NextResponse.json({ 
      success: true,
      message: 'Successfully left the chapter',
      deleted_membership: result.rows[0]
    })
  } catch (error: any) {
    console.error('DELETE /api/chapters/[id]/membership error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to leave chapter',
      message: 'Database error occurred while leaving the chapter'
    }, { status: 500 })
  }
}


