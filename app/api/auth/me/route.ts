import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/utils/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePhotoUrl: user.profile_photo_url,
        profilePhotoId: user.profile_photo_id,
        bannerUrl: user.banner_url,
        bannerId: user.banner_id,
        skills: user.skills,
        description: user.description,
        profession: user.profession,
        createdAt: user.created_at,
        isAdmin: user.is_admin || false
      }
    });
  } catch (error: any) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
