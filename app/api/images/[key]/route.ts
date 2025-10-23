import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME } from '@/lib/r2';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;

    console.log('Fetching image with key:', key);
    console.log('Bucket:', R2_BUCKET_NAME);

    if (!key) {
      return NextResponse.json(
        { error: 'Key tidak valid' },
        { status: 400 }
      );
    }

    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    const response = await r2Client.send(command);
    console.log('R2 Response received, ContentType:', response.ContentType);

    if (!response.Body) {
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
        { status: 404 }
      );
    }

    const bytes = await response.Body.transformToByteArray();
    const contentType = response.ContentType || 'image/jpeg';

    return new NextResponse(new Uint8Array(bytes).buffer as ArrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Get image error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil gambar' },
      { status: 500 }
    );
  }
}
