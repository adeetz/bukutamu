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
    const dateFilter = searchParams.get('date') || '';
    
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    // Search filter
    if (search) {
      where.OR = [
        { nama: { contains: search } },
        { instansi: { contains: search } },
        { alamat: { contains: search } },
        { keperluan: { contains: search } },
      ];
    }

    // Date filter (filter by specific date with timezone support)
    if (dateFilter) {
      // Ambil timezone offset dari client (dalam menit, negatif untuk timezones di depan UTC)
      // Contoh: WIB (UTC+7) = -420 menit
      const timezoneOffset = parseInt(searchParams.get('timezoneOffset') || '0');
      
      // Parse dateFilter sebagai UTC midnight
      const targetDate = new Date(dateFilter + 'T00:00:00Z');
      
      // Adjust ke timezone user: tambahkan offset untuk mendapatkan midnight di timezone user
      // WIB = UTC+7 = offset -420, jadi kita TAMBAHKAN offset untuk convert UTC ke local
      // Midnight di WIB dalam UTC = midnight UTC + offset
      // Contoh: 25 Oct 00:00 WIB = 24 Oct 17:00 UTC (karena WIB = UTC+7)
      const utcStartDate = new Date(targetDate.getTime() + (timezoneOffset * 60 * 1000));
      const utcEndDate = new Date(utcStartDate.getTime() + (24 * 60 * 60 * 1000));

      where.createdAt = {
        gte: utcStartDate,
        lt: utcEndDate,
      };
    }

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
    // Menggunakan timezone offset dari client untuk duplicate check yang akurat
    const timezoneOffset = body.timezoneOffset || 0;
    
    // Dapatkan waktu sekarang dan adjust ke timezone user
    const now = new Date();
    // Konversi ke waktu di timezone user (pakai offset terbalik untuk adjust)
    const localNow = new Date(now.getTime() - (timezoneOffset * 60 * 1000));
    // Set ke midnight di timezone user
    localNow.setUTCHours(0, 0, 0, 0);
    // Konversi balik ke UTC: ini adalah "start of today in user timezone" dalam UTC
    // Contoh: 25 Oct 00:00 WIB = 24 Oct 17:00 UTC (untuk WIB offset=-420)
    const utcToday = new Date(localNow.getTime() + (timezoneOffset * 60 * 1000));
    const utcTomorrow = new Date(utcToday.getTime() + (24 * 60 * 60 * 1000));

    const existingEntry = await prisma.bukuTamu.findFirst({
      where: {
        nama: sanitizedData.nama,
        instansi: sanitizedData.instansi,
        createdAt: {
          gte: utcToday,
          lt: utcTomorrow,
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
