import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateBukuTamuInput, checkRateLimit, getClientIP } from '@/lib/security';
import { verifyHcaptcha } from '@/lib/hcaptcha';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;

    // Build where clause untuk search
    const where = search ? {
      OR: [
        { nama: { contains: search } },
        { instansi: { contains: search } },
        { alamat: { contains: search } },
        { keperluan: { contains: search } },
      ],
    } : {};

    // Get total count untuk pagination
    const total = await prisma.bukuTamu.count({ where });

    // Get data dengan pagination
    const data = await prisma.bukuTamu.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Get data error:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: maksimal 3 submission per 5 menit per IP
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`submit:${clientIP}`, 3, 5 * 60 * 1000);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak pengisian. Silakan tunggu ${rateLimit.retryAfter} detik sebelum mencoba lagi` },
        { status: 429, headers: { 'Retry-After': rateLimit.retryAfter?.toString() || '300' } }
      );
    }

    const body = await request.json();

    // Verifikasi hCaptcha jika token tersedia
    if (body.hcaptchaToken) {
      const hcaptchaResult = await verifyHcaptcha(body.hcaptchaToken);
      
      if (!hcaptchaResult.success) {
        return NextResponse.json(
          { error: hcaptchaResult.error || 'Verifikasi CAPTCHA gagal' },
          { status: 400 }
        );
      }

      logger.info('hCaptcha verified successfully');
    } else if (process.env.HCAPTCHA_SECRET_KEY) {
      // Jika hCaptcha dikonfigurasi tapi token tidak ada, tolak request
      return NextResponse.json(
        { error: 'Token CAPTCHA diperlukan' },
        { status: 400 }
      );
    }

    // Validasi dan sanitasi input
    const validation = validateBukuTamuInput(body);
    if (!validation.valid) {
      logger.error('[VALIDATION ERROR] Invalid input', { errors: validation.errors, data: body });
      
      return NextResponse.json(
        { error: 'Data tidak valid', errors: validation.errors },
        { status: 400 }
      );
    }

    const sanitizedData = validation.sanitized!;

    // Check for duplicate entry (same name and instansi on the same day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingEntry = await prisma.bukuTamu.findFirst({
      where: {
        nama: sanitizedData.nama,
        instansi: sanitizedData.instansi,
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existingEntry) {
      return NextResponse.json(
        { 
          error: 'Anda sudah mengisi buku tamu hari ini',
          detail: 'Data dengan nama dan instansi yang sama sudah tercatat hari ini'
        },
        { status: 409 }
      );
    }

    const newEntry = await prisma.bukuTamu.create({
      data: {
        nama: sanitizedData.nama,
        alamat: sanitizedData.alamat,
        instansi: sanitizedData.instansi,
        keperluan: sanitizedData.keperluan,
        fotoUrl: sanitizedData.fotoUrl,
      },
    });

    return NextResponse.json(newEntry, { status: 201 });
  } catch (error) {
    logger.error('Create data error:', error);
    return NextResponse.json(
      { error: 'Gagal menyimpan data' },
      { status: 500 }
    );
  }
}
