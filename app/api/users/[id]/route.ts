import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/config/database';
import { getUserFromToken } from '@/lib/utils/auth';

// Cache for user profiles (in production, use Redis or similar)
const profileCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      );
    }

    const { id: userIdParam } = await params;
    const userId = parseInt(userIdParam);

    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `profile_${userId}`;
    const cached = profileCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
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

    // Cache the response
    profileCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });

    return NextResponse.json(responseData);

  } catch (error: any) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
