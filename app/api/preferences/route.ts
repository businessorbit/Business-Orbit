import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/config/database';
import { getUserFromToken } from '@/lib/utils/auth';

// Sample data for Chapters and Secret Groups
const AVAILABLE_CHAPTERS = [
  "Mumbai", "Delhi", "Bengaluru", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad",
  "Chandigarh", "Indore", "Bhubaneswar", "Noida", "Gurugram", "Jaipur", "Lucknow", "Kanpur", 
  "Nagpur", "Visakhapatnam", "Surat", "Vadodara"
];

// Static fallback only; primary source is DB secret_groups
const AVAILABLE_SECRET_GROUPS_FALLBACK = [
  'Tech Innovators', 'Creative Minds', 'Business Leaders', 'Startup Founders',
  'Digital Nomads', 'Art Enthusiasts', 'Fitness Freaks', 'Food Lovers',
  'Travel Buffs', 'Book Worms', 'Music Makers', 'Sports Champions',
  'Gaming Community', 'Photography Club', 'Design Thinkers', 'Marketing Gurus',
  'Finance Wizards', 'Healthcare Heroes', 'Education Pioneers', 'Social Impact'
];

async function getAvailableSecretGroupsFromDB(): Promise<string[]> {
  try {
    const res = await pool.query(
      `SELECT name FROM secret_groups ORDER BY created_at DESC`
    );
    const names = (res.rows || []).map((r: any) => String(r.name)).filter(Boolean);
    // If DB has none, use fallback to keep onboarding usable
    return names.length ? names : AVAILABLE_SECRET_GROUPS_FALLBACK;
  } catch {
    return AVAILABLE_SECRET_GROUPS_FALLBACK;
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);

    if (!user) {
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 401 }
      );
    }

    const { chapters, secretGroups } = await request.json();
    const userId = user.id;

    // Validation: Must have at least 1 chapter
    if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
      return NextResponse.json(
        { error: 'You must select at least 1 chapter' },
        { status: 400 }
      );
    }

    // Validation: Must have at least 1 secret group
    if (!secretGroups || !Array.isArray(secretGroups) || secretGroups.length === 0) {
      return NextResponse.json(
        { error: 'You must select at least 1 secret group' },
        { status: 400 }
      );
    }

    // Validation: All chapters must be from available list
    const invalidChapters = chapters.filter((chapter: string) => !AVAILABLE_CHAPTERS.includes(chapter));
    if (invalidChapters.length > 0) {
      return NextResponse.json(
        { error: `Invalid chapters: ${invalidChapters.join(', ')}` },
        { status: 400 }
      );
    }

    // Validation: All secret groups must exist in DB (with fallback)
    const dbGroups = await getAvailableSecretGroupsFromDB();
    const invalidGroups = secretGroups.filter((group: string) => !dbGroups.includes(group));
    if (invalidGroups.length > 0) {
      return NextResponse.json(
        { error: `Invalid secret groups: ${invalidGroups.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if preferences already exist
    const existingPrefs = await pool.query(
      'SELECT id FROM user_preferences WHERE user_id = $1',
      [userId]
    );

    if (existingPrefs.rows.length > 0) {
      // Update existing preferences
      const result = await pool.query(
        `UPDATE user_preferences 
         SET chapters = $1, secret_groups = $2, onboarding_completed = TRUE, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $3
         RETURNING *`,
        [chapters, secretGroups, userId]
      );

      return NextResponse.json({
        message: 'Preferences updated successfully',
        preferences: result.rows[0]
      });
    } else {
      // Create new preferences
      const result = await pool.query(
        `INSERT INTO user_preferences (user_id, chapters, secret_groups, onboarding_completed)
         VALUES ($1, $2, $3, TRUE)
         RETURNING *`,
        [userId, chapters, secretGroups]
      );

      return NextResponse.json({
        message: 'Preferences saved successfully',
        preferences: result.rows[0]
      }, { status: 201 });
    }

  } catch (error: any) {
    console.error('Save preferences error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const secretGroups = await getAvailableSecretGroupsFromDB();
    return NextResponse.json({
      chapters: AVAILABLE_CHAPTERS,
      secretGroups
    });
  } catch (error: any) {
    console.error('Get onboarding data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
