// Sanitasi input untuk mencegah XSS
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Hapus < dan >
    .replace(/javascript:/gi, '') // Hapus javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Hapus event handlers seperti onclick=
    .substring(0, 1000); // Limit panjang maksimal
}

// Validasi panjang input
export function validateLength(input: string, maxLength: number, fieldName: string): { valid: boolean; error?: string } {
  if (!input || input.trim().length === 0) {
    return { valid: false, error: `${fieldName} tidak boleh kosong` };
  }
  if (input.length > maxLength) {
    return { valid: false, error: `${fieldName} maksimal ${maxLength} karakter` };
  }
  return { valid: true };
}

// Validasi file upload
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  // Cek tipe file
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Tipe file tidak diizinkan. Hanya menerima: JPEG, PNG, WebP' 
    };
  }

  // Cek ukuran file
  if (file.size > MAX_FILE_SIZE) {
    return { 
      valid: false, 
      error: `Ukuran file terlalu besar. Maksimal ${MAX_FILE_SIZE / 1024 / 1024}MB` 
    };
  }

  // Cek ekstensi file dari nama
  const extension = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  
  if (!extension || !allowedExtensions.includes(extension)) {
    return { 
      valid: false, 
      error: 'Ekstensi file tidak valid' 
    };
  }

  return { valid: true };
}

// Sanitasi nama file
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.+/g, '.')
    .replace(/^\./, '') // Hapus dot di awal
    .substring(0, 255); // Limit panjang nama file
}

// Rate limiting storage (in-memory)
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup expired entries setiap 5 menit
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function checkRateLimit(
  identifier: string, 
  maxRequests: number, 
  windowMs: number
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Buat entry baru atau reset
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return { allowed: true };
  }

  if (entry.count >= maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Increment counter
  entry.count++;
  return { allowed: true };
}

export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  // Cek header X-Real-IP
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  return 'unknown';
}

export function sanitizeUsername(username: string): string {
  return username
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .substring(0, 50);
}

// Account lockout tracking
interface LockoutEntry {
  attempts: number;
  lockedUntil: number | null;
  lastAttempt: number;
}

const lockoutStore = new Map<string, LockoutEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of lockoutStore.entries()) {
    if (now - entry.lastAttempt > 60 * 60 * 1000) {
      lockoutStore.delete(key);
    }
  }
}, 10 * 60 * 1000);

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 menit
export const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 menit

export function checkAccountLockout(identifier: string): { 
  locked: boolean; 
  attempts: number;
  remainingTime?: number;
  message?: string;
} {
  const entry = lockoutStore.get(identifier);
  const now = Date.now();

  if (!entry) {
    return { locked: false, attempts: 0 };
  }

  // Cek apakah masih locked
  if (entry.lockedUntil && now < entry.lockedUntil) {
    const remainingTime = Math.ceil((entry.lockedUntil - now) / 1000);
    return { 
      locked: true, 
      attempts: entry.attempts,
      remainingTime,
      message: `Akun terkunci. Coba lagi dalam ${Math.ceil(remainingTime / 60)} menit`
    };
  }

  // Reset jika sudah lewat lockout period
  if (entry.lockedUntil && now >= entry.lockedUntil) {
    lockoutStore.delete(identifier);
    return { locked: false, attempts: 0 };
  }

  if (now - entry.lastAttempt > ATTEMPT_WINDOW) {
    lockoutStore.delete(identifier);
    return { locked: false, attempts: 0 };
  }

  return { locked: false, attempts: entry.attempts };
}

export function recordFailedLogin(identifier: string): void {
  const entry = lockoutStore.get(identifier);
  const now = Date.now();

  if (!entry) {
    lockoutStore.set(identifier, {
      attempts: 1,
      lockedUntil: null,
      lastAttempt: now
    });
    return;
  }

  entry.attempts++;
  entry.lastAttempt = now;

  if (entry.attempts >= MAX_LOGIN_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_DURATION;
  }
}

export function resetLoginAttempts(identifier: string): void {
  lockoutStore.delete(identifier);
}

// Validasi input buku tamu
export interface BukuTamuInput {
  nama: string;
  alamat: string;
  instansi: string;
  keperluan: string;
  fotoUrl?: string | null;
}

export function validateBukuTamuInput(data: any): { valid: boolean; errors?: string[]; sanitized?: BukuTamuInput } {
  const errors: string[] = [];

  // Validasi dan sanitasi nama
  const namaValidation = validateLength(data.nama, 200, 'Nama');
  if (!namaValidation.valid) {
    errors.push(namaValidation.error!);
  }

  // Validasi dan sanitasi alamat
  const alamatValidation = validateLength(data.alamat, 500, 'Alamat');
  if (!alamatValidation.valid) {
    errors.push(alamatValidation.error!);
  }

  // Validasi dan sanitasi instansi
  const instansiValidation = validateLength(data.instansi, 200, 'Instansi');
  if (!instansiValidation.valid) {
    errors.push(instansiValidation.error!);
  }

  // Validasi dan sanitasi keperluan
  const keperluanValidation = validateLength(data.keperluan, 1000, 'Keperluan');
  if (!keperluanValidation.valid) {
    errors.push(keperluanValidation.error!);
  }

  // Validasi fotoUrl jika ada
  if (data.fotoUrl && typeof data.fotoUrl === 'string') {
    const isValidUrl = data.fotoUrl.startsWith('http://') || data.fotoUrl.startsWith('https://');
    const isValidRelativePath = data.fotoUrl.startsWith('/');
    
    if (isValidUrl) {
      try {
        new URL(data.fotoUrl);
      } catch {
        errors.push('URL foto tidak valid');
      }
    } else if (!isValidRelativePath) {
      errors.push('URL foto tidak valid');
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    sanitized: {
      nama: sanitizeInput(data.nama),
      alamat: sanitizeInput(data.alamat),
      instansi: sanitizeInput(data.instansi),
      keperluan: sanitizeInput(data.keperluan),
      fotoUrl: data.fotoUrl || null
    }
  };
}
