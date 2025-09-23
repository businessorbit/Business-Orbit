import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { cloudinary } from '@/lib/config/cloudinary';
import pool from '@/lib/config/database';
import { generateToken, setTokenCookie } from '@/lib/utils/auth';
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const skills = formData.get('skills') as string;
    const description = formData.get('description') as string;
    const profilePhoto = formData.get('profilePhoto') as File;
    const banner = formData.get('banner') as File;

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Name, email, password, and confirm password are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Parse skills array
    let skillsArray: string[] = [];
    if (skills) {
      try {
        skillsArray = JSON.parse(skills);
        if (!Array.isArray(skillsArray)) {
          skillsArray = [];
        }
      } catch (error) {
        console.error('Error parsing skills:', error);
        skillsArray = [];
      }
    }

    // Handle file uploads with Cloudinary
    let profilePhotoUrl: string | null = null;
    let profilePhotoId: string | null = null;
    let bannerUrl: string | null = null;
    let bannerId: string | null = null;

    // Upload profile photo to Cloudinary
    if (profilePhoto && profilePhoto.size > 0) {
      try {
        const arrayBuffer = await profilePhoto.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const profilePhotoResult = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'business-orbit',
              transformation: [
                { width: 800, height: 800, crop: 'limit' },
                { quality: 'auto' }
              ]
            },
            (error, result) => {
              if (error) {
                console.error('Profile photo upload error:', error);
                reject(error);
              } else {
                console.log('Profile photo uploaded:', result);
                resolve(result);
              }
            }
          );
          uploadStream.end(buffer);
        });
        
        profilePhotoUrl = profilePhotoResult.secure_url || profilePhotoResult.url;
        profilePhotoId = profilePhotoResult.public_id;
      } catch (error) {
        console.error('Profile photo upload error:', error);
        return NextResponse.json(
          { error: 'Failed to upload profile photo' },
          { status: 500 }
        );
      }
    }

    // Upload banner to Cloudinary
    if (banner && banner.size > 0) {
      try {
        const arrayBuffer = await banner.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const bannerResult = await new Promise<any>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'business-orbit',
              transformation: [
                { width: 1200, height: 400, crop: 'limit' },
                { quality: 'auto' }
              ]
            },
            (error, result) => {
              if (error) {
                console.error('Banner upload error:', error);
                reject(error);
              } else {
                console.log('Banner uploaded:', result);
                resolve(result);
              }
            }
          );
          uploadStream.end(buffer);
        });
        
        bannerUrl = bannerResult.secure_url || bannerResult.url;
        bannerId = bannerResult.public_id;
      } catch (error) {
        console.error('Banner upload error:', error);
        return NextResponse.json(
          { error: 'Failed to upload banner image' },
          { status: 500 }
        );
      }
    }

    // Insert user into database
    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, profile_photo_url, profile_photo_id, banner_url, banner_id, skills, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id, name, email, phone, profile_photo_url, profile_photo_id, banner_url, banner_id, skills, description, created_at`,
      [name, email, phone, passwordHash, profilePhotoUrl, profilePhotoId, bannerUrl, bannerId, skillsArray, description]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = generateToken(user.id);

    // Create response
    const response = NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profilePhotoUrl: user.profile_photo_url,
        bannerUrl: user.banner_url,
        skills: user.skills,
        description: user.description,
        createdAt: user.created_at
      }
    }, { status: 201 });

    // Set cookie
    setTokenCookie(response, token);

    return response;

  } catch (error: any) {
    console.error('Signup error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
    
    // Provide more specific error messages
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }
    
    if (error.code === '42P01') {
      return NextResponse.json(
        { error: 'Database table not found. Please run the database setup.' },
        { status: 500 }
      );
    }
    
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { error: 'Database connection failed. Please check if PostgreSQL is running.' },
        { status: 500 }
      );
    }
    
    if (error.code === '28P01') {
      return NextResponse.json(
        { error: 'Database authentication failed. Please check your database credentials.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
      },
      { status: 500 }
    );
  }
}
