import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';
import { 
  sanitizeUsername, 
  checkRateLimit, 
  getClientIP,
  checkAccountLockout,
  recordFailedLogin,
  resetLoginAttempts
} from '@/lib/security';

export async function POST(request: NextRequest) {
  const clientIP = getClientIP(request);
  const startTime = Date.now();

  try {
    // Rate limiting: maksimal 10 login attempts per menit per IP
    const rateLimit = checkRateLimit(`login:${clientIP}`, 10, 60 * 1000);
    
    if (!rateLimit.allowed) {
      console.warn(`[SECURITY] Rate limit exceeded from IP: ${clientIP}`);
      return NextResponse.json(
        { error: `Terlalu banyak percobaan login. Tunggu ${rateLimit.retryAfter} detik` },
        { status: 429, headers: { 'Retry-After': rateLimit.retryAfter?.toString() || '60' } }
      );
    }

    const { username, password } = await request.json();

    // Validasi input
    if (!username || !password) {
      console.warn(`[SECURITY] Empty credentials from IP: ${clientIP}`);
      return NextResponse.json(
        { error: 'Username dan password harus diisi' },
        { status: 400 }
      );
    }

    // Sanitasi username
    const sanitizedUsername = sanitizeUsername(username);

    if (!sanitizedUsername || sanitizedUsername.length < 3) {
      console.warn(`[SECURITY] Invalid username format from IP: ${clientIP}`);
      return NextResponse.json(
        { error: 'Format username tidak valid' },
        { status: 400 }
      );
    }

    // Validasi panjang password
    if (password.length < 6 || password.length > 100) {
      console.warn(`[SECURITY] Invalid password length from IP: ${clientIP}`);
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Cek account lockout
    const lockoutCheck = checkAccountLockout(`user:${sanitizedUsername}`);
    if (lockoutCheck.locked) {
      console.warn(`[SECURITY] Account locked: ${sanitizedUsername}, IP: ${clientIP}`);
      return NextResponse.json(
        { 
          error: lockoutCheck.message,
          locked: true,
          remainingTime: lockoutCheck.remainingTime
        },
        { status: 429 }
      );
    }

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { username: sanitizedUsername },
    });

    if (!admin) {
      // Record failed attempt untuk username yang tidak ada
      recordFailedLogin(`user:${sanitizedUsername}`);
      console.warn(`[SECURITY] Login failed - user not found: ${sanitizedUsername}, IP: ${clientIP}`);
      
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      recordFailedLogin(`user:${sanitizedUsername}`);
      const lockoutStatus = checkAccountLockout(`user:${sanitizedUsername}`);
      const remainingAttempts = 5 - lockoutStatus.attempts;
      
      console.warn(
        `[SECURITY] Login failed - wrong password: ${sanitizedUsername}, ` +
        `IP: ${clientIP}, Attempts: ${lockoutStatus.attempts}/5`
      );

      return NextResponse.json(
        { 
          error: remainingAttempts > 0 
            ? `Username atau password salah. ${remainingAttempts} percobaan tersisa`
            : 'Terlalu banyak percobaan gagal. Akun terkunci sementara',
          remainingAttempts
        },
        { status: 401 }
      );
    }

    // Login berhasil - reset attempts
    resetLoginAttempts(`user:${sanitizedUsername}`);

    // Create session
    await createSession({
      userId: admin.id,
      username: admin.username,
      name: admin.name,
    });

    const duration = Date.now() - startTime;
    console.log(
      `[SUCCESS] Login successful: ${admin.username}, ` +
      `IP: ${clientIP}, Duration: ${duration}ms`
    );

    return NextResponse.json({
      success: true,
      message: 'Login berhasil',
      user: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `[ERROR] Login error from IP: ${clientIP}, ` +
      `Duration: ${duration}ms, Error:`, 
      error
    );
    
    return NextResponse.json(
      { error: 'Gagal login. Silakan coba lagi' },
      { status: 500 }
    );
  }
}
