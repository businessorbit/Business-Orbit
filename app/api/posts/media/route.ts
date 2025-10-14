import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/auth';
import { cloudinary } from '@/lib/config/cloudinary';

export const config = {
  api: {
    bodyParser: false,
  },
};

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

    // Parse the multipart form data
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    console.log('Media upload - Files received:', files.length);
    console.log('Media upload - File details:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
    console.log('Media upload - FormData entries:', Array.from(formData.entries()));

    if (!files || files.length === 0) {
      console.log('Media upload - No files provided, returning error');
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

      // Convert File to Buffer for Cloudinary
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Cloudinary directly
      console.log('Starting Cloudinary upload for file:', file.name);
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
              console.log('Cloudinary upload success:', result?.public_id);
              resolve(result);
            }
          }
        ).end(buffer);
      });

      const uploadData = uploadResult as any;
      
      console.log('Media upload - Cloudinary result:', {
        public_id: uploadData.public_id,
        secure_url: uploadData.secure_url,
        resource_type: uploadData.resource_type
      });
      
      uploadedMedia.push({
        media_type: uploadData.resource_type === 'video' ? 'video' : 'image',
        cloudinary_public_id: uploadData.public_id,
        cloudinary_url: uploadData.secure_url,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type
      });
    }

    return NextResponse.json({
      success: true,
      data: uploadedMedia
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload media' },
      { status: 500 }
    );
  }
}
