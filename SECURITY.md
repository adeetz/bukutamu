# 🔒 Dokumentasi Keamanan

Aplikasi Buku Tamu Digital telah dilengkapi dengan berbagai fitur keamanan untuk melindungi dari serangan umum.

## ✅ Perlindungan yang Telah Diimplementasikan

### 1. **Proteksi XSS (Cross-Site Scripting)**

**Lokasi:** `lib/security.ts` - `sanitizeInput()`

**Cara Kerja:**
- Menghapus tag HTML (`<` dan `>`)
- Memblokir `javascript:` protocol
- Menghilangkan event handlers (`onclick=`, `onerror=`, dll)
- Membatasi panjang input maksimal 1000 karakter

**Contoh:**
```typescript
// Input berbahaya:
"<script>alert('hacked')</script>"

// Setelah sanitasi:
"scriptalert('hacked')/script"
```

### 2. **Validasi File Upload Ketat**

**Lokasi:** `lib/security.ts` - `validateFile()`

**Perlindungan:**
- ✅ **Whitelist tipe file**: Hanya menerima JPEG, PNG, WebP
- ✅ **Validasi ukuran**: Maksimal 5MB per file
- ✅ **Cek ekstensi**: Validasi ekstensi file dari nama file
- ✅ **Sanitasi nama file**: Menghapus karakter berbahaya
- ✅ **Random filename**: Generate nama file unik dengan timestamp + random string

**File yang DITOLAK:**
- `.exe`, `.php`, `.js`, `.html`, `.svg` (bisa berisi script)
- File lebih dari 5MB
- File dengan double extension (`.jpg.php`)
- File dengan path traversal (`../../etc/passwd`)

### 3. **Rate Limiting**

**Lokasi:** `lib/security.ts` - `checkRateLimit()`

**Batasan:**
| Endpoint | Limit | Window |
|----------|-------|--------|
| Upload File | 5 request | 1 menit |
| Submit Form | 3 request | 5 menit |

**Cara Kerja:**
- Tracking request per IP address
- In-memory storage dengan auto cleanup
- HTTP 429 response jika limit terlewati
- Header `Retry-After` memberitahu kapan bisa coba lagi

### 4. **Validasi Input Lengkap**

**Lokasi:** `lib/security.ts` - `validateBukuTamuInput()`

**Validasi:**
- ✅ Field tidak boleh kosong
- ✅ Panjang maksimal per field:
  - Nama: 200 karakter
  - Alamat: 500 karakter
  - Instansi: 200 karakter
  - Keperluan: 1000 karakter
- ✅ URL foto harus valid (jika diisi)

### 5. **SQL Injection Protection**

**Cara Kerja:**
- Menggunakan Prisma ORM yang otomatis escape parameter
- Tidak ada raw SQL query
- Parameterized queries untuk semua operasi database

### 6. **reCAPTCHA v3 Protection** ✅ BARU!

**Lokasi:** `lib/recaptcha.ts` + Form Buku Tamu

**Cara Kerja:**
- Google reCAPTCHA v3 (invisible, tidak mengganggu user)
- Score-based verification (0.0 - 1.0)
- Threshold: 0.5 (di bawah ini ditolak sebagai bot)
- Otomatis analisis perilaku user di background

**Setup:**
Lihat panduan lengkap di: **`RECAPTCHA_SETUP.md`**

### 7. **Admin Login Protection** ✅ BARU!

**Lokasi:** `app/api/auth/login/route.ts` + `lib/security.ts`

**Proteksi Berlapis:**
- ✅ **Rate Limiting:** 10 attempts per menit per IP
- ✅ **Account Lockout:** 5 failed attempts = locked 15 menit
- ✅ **Input Sanitization:** Username & password validation
- ✅ **Brute Force Protection:** Automatic lockout
- ✅ **Security Logging:** Track semua login attempts
- ✅ **Timing Attack Protection:** Consistent response time
- ✅ **Remaining Attempts Indicator:** User tahu berapa attempts tersisa

**Detail Lengkap:** Lihat `ADMIN_LOGIN_SECURITY.md`

### 8. **Authentication untuk Operasi Sensitif**

**Perlindungan:**
- Edit data memerlukan login admin
- Delete data memerlukan login admin
- Session-based authentication
- Cookie httpOnly dan secure

## 📋 Checklist Keamanan

### API Endpoints

#### ✅ `/api/upload` (POST)
- [x] Rate limiting (5 req/menit)
- [x] Validasi tipe file
- [x] Validasi ukuran file (max 5MB)
- [x] Sanitasi nama file
- [x] Random filename generation
- [x] Security headers (ContentDisposition, CacheControl)

#### ✅ `/api/buku-tamu` (POST)
- [x] Rate limiting (3 req/5 menit)
- [x] Sanitasi semua input (XSS protection)
- [x] Validasi panjang input
- [x] Cek duplikasi data
- [x] Error handling yang aman

#### ✅ `/api/buku-tamu/[id]` (PUT)
- [x] Authentication required
- [x] Sanitasi semua input
- [x] Validasi panjang input
- [x] Validasi ID numerik
- [x] Cek data exists
- [x] Cek duplikasi

#### ✅ `/api/buku-tamu/[id]` (DELETE)
- [x] Authentication required
- [x] Validasi ID numerik
- [x] Cek data exists

## 🚨 Yang Masih Perlu Dipertimbangkan

### 1. ~~CAPTCHA~~ ✅ SUDAH DIIMPLEMENTASIKAN!
**Status:** ✅ **Aktif - Google reCAPTCHA v3**

**Yang Sudah Diterapkan:**
- ✅ Google reCAPTCHA v3 (invisible)
- ✅ Score-based verification
- ✅ Threshold 0.5 untuk bot detection
- ✅ Integrated di form submission

**Setup:** Lihat `RECAPTCHA_SETUP.md`

### 2. HTTPS
**Status:** Tergantung deployment

**Rekomendasi:**
- Gunakan HTTPS di production
- Force SSL/TLS
- HSTS headers

### 3. CORS Policy
**Status:** Default Next.js

**Rekomendasi:**
- Konfigurasi CORS yang ketat di production
- Whitelist domain yang diizinkan

### 4. Content Security Policy (CSP)
**Status:** Belum diimplementasikan

**Rekomendasi:**
```javascript
// next.config.js
headers: [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; img-src 'self' data: https:; script-src 'self' 'unsafe-inline';"
  }
]
```

## 🔍 Testing Keamanan

### Manual Testing

**1. Test XSS:**
```bash
# Coba submit form dengan:
nama: <script>alert('XSS')</script>
alamat: <img src=x onerror=alert('XSS')>
```
✅ Expected: Input di-sanitasi, script tidak dieksekusi

**2. Test Rate Limiting:**
```bash
# Submit form 4 kali dalam 5 menit
# Request ke-4 harus ditolak dengan 429
```

**3. Test File Upload:**
```bash
# Upload file .php atau .exe
# Expected: Ditolak dengan error "Tipe file tidak diizinkan"

# Upload file >5MB
# Expected: Ditolak dengan error "Ukuran file terlalu besar"
```

### Automated Testing

```bash
# Install security audit tools
npm audit
npm audit fix

# Check dependencies vulnerabilities
npx snyk test
```

## 📞 Melaporkan Kerentanan

Jika menemukan kerentanan keamanan, segera laporkan ke tim development.

**Jangan:**
- Publikasikan kerentanan di tempat publik
- Exploit kerentanan di production

**Lakukan:**
- Report secara private ke admin
- Berikan detail reproduksi bug
- Tunggu patch sebelum disclosure

## 📚 Referensi

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [Prisma Security](https://www.prisma.io/docs/concepts/components/prisma-client/raw-database-access#sql-injection)

---

**Last Updated:** 2025-10-23  
**Version:** 1.0.0
