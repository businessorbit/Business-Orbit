import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/config/database';
import { getUserFromToken } from '@/lib/utils/auth';

// Note: Avoid in-memory caching on serverless to prevent stale profile images
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      );
    }

    const { id: userIdParam } = params || ({} as any);
    const userId = parseInt(userIdParam);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Get user basic info
    const userResult = await pool.query(
      `SELECT id, name, email, phone, profile_photo_url, profile_photo_id, 
              banner_url, banner_id, skills, description, created_at
       FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userResult.rows[0];

    // Get user preferences (chapters and secret groups)
    const preferencesResult = await pool.query(
      'SELECT chapters, secret_groups FROM user_preferences WHERE user_id = $1',
      [userId]
    );

    let chapters: string[] = [];
    let secretGroups: string[] = [];

    if (preferencesResult.rows.length > 0) {
      chapters = preferencesResult.rows[0].chapters || [];
      secretGroups = preferencesResult.rows[0].secret_groups || [];
    }

    // Return user data with groups
    const responseData = {
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        profilePhotoUrl: userData.profile_photo_url,
        bannerUrl: userData.banner_url,
        skills: userData.skills || [],
        description: userData.description,
        createdAt: userData.created_at
      },
      groups: {
        chapters,
        secretGroups
      }
    };

    const res = NextResponse.json(responseData);
    // Disable caching to always reflect latest Cloudinary URLs
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.headers.set('Pragma', 'no-cache');
    res.headers.set('Expires', '0');
    return res;

  } catch (error: any) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
