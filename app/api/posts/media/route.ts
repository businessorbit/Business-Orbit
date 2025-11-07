import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/auth';
import { cloudinary } from '@/lib/config/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME && !process.env.CLOUDINARY_URL) {
      console.error('Cloudinary not configured - missing environment variables');
      return NextResponse.json(
        { success: false, error: 'Image upload service is not configured. Please contact support.' },
        { status: 500 }
      );
    }

    // Parse the multipart form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No files provided' },
        { status: 400 }
      );
    }

    if (files.length > 2) {
      return NextResponse.json(
        { success: false, error: 'Maximum 2 files allowed' },
        { status: 400 }
      );
    }

    const uploadedMedia = [];

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        return NextResponse.json(
          { success: false, error: 'File size too large (max 10MB)' },
          { status: 400 }
        );
      }

      try {
        // Convert File to Buffer for Cloudinary
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Cloudinary directly
        const uploadResult = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              folder: 'business-orbit/feed',
              resource_type: 'auto',
              transformation: [
                { width: 1200, height: 1200, crop: 'limit' },
                { quality: 'auto' }
              ]
            },
            (error: any, result: any) => {
              if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
              } else {
                resolve(result);
              }
            }
          ).end(buffer);
        });

        const uploadData = uploadResult as any;
        
        if (!uploadData || !uploadData.secure_url) {
          throw new Error('Invalid response from image upload service');
        }
        
        uploadedMedia.push({
          media_type: uploadData.resource_type === 'video' ? 'video' : 'image',
          cloudinary_public_id: uploadData.public_id,
          cloudinary_url: uploadData.secure_url,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type
        });
      } catch (fileError: any) {
        console.error(`Error uploading file ${file.name}:`, fileError);
        // Return specific error message
        const errorMessage = fileError.message || fileError.http_code 
          ? `Failed to upload ${file.name}. ${fileError.message || 'Please try again.'}`
          : `Failed to upload ${file.name}. Please check your connection and try again.`;
        
        return NextResponse.json(
          { success: false, error: errorMessage },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: uploadedMedia
    });
  } catch (error: any) {
    console.error('Error uploading media:', error);
    const errorMessage = error.message || 'Failed to upload media. Please try again.';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
