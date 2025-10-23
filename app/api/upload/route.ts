import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME, getPublicImageUrl } from '@/lib/r2';
import { validateFile, sanitizeFilename, checkRateLimit, getClientIP } from '@/lib/security';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: maksimal 5 upload per menit per IP
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`upload:${clientIP}`, 5, 60 * 1000);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak request. Coba lagi dalam ${rateLimit.retryAfter} detik` },
        { status: 429, headers: { 'Retry-After': rateLimit.retryAfter?.toString() || '60' } }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'File tidak ditemukan' },
        { status: 400 }
      );
    }

    // Validasi file (tipe, ukuran, ekstensi)
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Sanitasi nama file
    const sanitizedName = sanitizeFilename(file.name);
    const extension = sanitizedName.split('.').pop();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const filename = `${timestamp}-${randomStr}.${extension}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    logger.debug('Uploading file', { filename, bucket: R2_BUCKET_NAME });

    // Upload ke R2 dengan ContentType yang sudah divalidasi
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: filename,
        Body: buffer,
        ContentType: file.type,
        // Security headers
        ContentDisposition: 'inline',
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    logger.info('Upload successful', { filename, size: file.size });

    // Generate URL to access the file via our API
    const fileUrl = getPublicImageUrl(filename);

    return NextResponse.json({ url: fileUrl, key: filename });
  } catch (error) {
    logger.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Gagal mengupload file' },
      { status: 500 }
    );
  }
}
