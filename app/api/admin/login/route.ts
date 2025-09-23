import { NextRequest, NextResponse } from 'next/server';

// Static admin credentials as requested
const ADMIN_EMAIL = 'adminbusinessorbit@gmail.com';
const ADMIN_PASSWORD = 'admin@123';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const isValid = email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true, isAdmin: true });

    // Set a separate admin-only cookie so it never conflicts with user auth
    response.cookies.set('admin_session', '1', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      // Short session expiry; adjust as needed
      maxAge: 60 * 60 * 4, // 4 hours
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


