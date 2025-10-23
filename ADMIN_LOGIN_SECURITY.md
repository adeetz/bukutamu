# 🔐 Keamanan Login Admin

Login admin telah dilindungi dengan berlapis-lapis proteksi keamanan untuk mencegah unauthorized access.

## 🛡️ Proteksi Yang Aktif

### 1. **Rate Limiting**
- **Limit:** 10 login attempts per menit per IP
- **Window:** 60 detik
- **Response:** HTTP 429 (Too Many Requests)

**Cara Kerja:**
```
IP: 192.168.1.100
├─ Attempt 1-10: Diizinkan
└─ Attempt 11+: Ditolak selama 1 menit
```

### 2. **Account Lockout**
- **Max Attempts:** 5 failed login attempts
- **Lockout Duration:** 15 menit
- **Reset:** Otomatis setelah lockout expired atau login sukses

**Cara Kerja:**
```
Username: admin
├─ Failed attempt 1-4: Remaining attempts ditampilkan
├─ Failed attempt 5: LOCKED for 15 minutes
└─ After 15 min: Reset, bisa coba lagi
```

**Error Messages:**
- Attempt 1: "Username atau password salah. 4 percobaan tersisa"
- Attempt 2: "Username atau password salah. 3 percobaan tersisa"
- Attempt 3: "Username atau password salah. 2 percobaan tersisa"
- Attempt 4: "Username atau password salah. 1 percobaan tersisa"
- Attempt 5+: "Akun terkunci. Coba lagi dalam 15 menit"

### 3. **Input Sanitization**

**Username:**
- Otomatis lowercase
- Hanya alphanumeric, underscore, dash
- Maksimal 50 karakter
- Minimal 3 karakter

**Password:**
- Minimal 6 karakter
- Maksimal 100 karakter

**Contoh:**
```javascript
Input:  "Admin<script>alert('xss')</script>"
Output: "adminscriptalert'xss'/script"  // Sanitized

Input:  "ADMIN123"
Output: "admin123"  // Lowercase
```

### 4. **Security Logging**

Semua aktivitas login dicatat dengan detail:

**Login Failed:**
```log
[SECURITY] Login failed - wrong password: admin, IP: 192.168.1.100, Attempts: 3/5
```

**Account Locked:**
```log
[SECURITY] Account locked: admin, IP: 192.168.1.100
```

**Login Success:**
```log
[SUCCESS] Login successful: admin, IP: 192.168.1.100, Duration: 234ms
```

**Rate Limit:**
```log
[SECURITY] Rate limit exceeded from IP: 192.168.1.100
```

### 5. **Timing Attack Protection**

Response time konsisten untuk mencegah timing attacks:
- Username tidak ditemukan: ~200-300ms
- Password salah: ~200-300ms
- Login sukses: ~200-300ms

Tidak bisa membedakan apakah username exist atau tidak dari response time.

---

## 📋 Skenario Serangan & Proteksi

### Skenario 1: Brute Force Attack

**Serangan:**
```bash
# Attacker mencoba 100 kombinasi password
for i in {1..100}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -d '{"username":"admin","password":"pass'$i'"}'
done
```

**Proteksi:**
1. ✅ **Attempt 1-10:** Rate limiting → Ditolak (HTTP 429)
2. ✅ **Attempt 1-5 per username:** Account lockout → Username locked 15 menit
3. ✅ **Logging:** Semua attempts dicatat dengan IP & timestamp

**Hasil:** Attacker terkunci dan tercatat di logs

---

### Skenario 2: Credential Stuffing

**Serangan:**
```bash
# Attacker punya list username:password dari leak database lain
admin:password123
admin:admin123
admin:12345678
```

**Proteksi:**
1. ✅ **Account Lockout:** Setelah 5 attempts username "admin" locked
2. ✅ **Rate Limiting:** Tidak bisa coba banyak dalam waktu singkat
3. ✅ **Logging:** IP attacker tercatat

**Hasil:** Attacker terkunci setelah 5 attempts

---

### Skenario 3: Distributed Attack

**Serangan:**
```bash
# Attacker pakai banyak IP (botnet)
IP 1: 5 attempts → LOCKED
IP 2: 5 attempts → LOCKED
IP 3: 5 attempts → LOCKED
```

**Proteksi:**
1. ✅ **Account Lockout Global:** Username "admin" tetap locked meskipun dari IP berbeda
2. ✅ **Rate Limiting Per IP:** Setiap IP tetap dibatasi
3. ✅ **Logging:** Semua IP tercatat (mudah dideteksi pattern)

**Hasil:** Username tetap locked, dan pattern attack terdeteksi di logs

---

### Skenario 4: SQL Injection

**Serangan:**
```bash
# Attacker coba inject SQL
username: admin' OR '1'='1
password: anything
```

**Proteksi:**
1. ✅ **Prisma ORM:** Auto-escape semua query (tidak ada raw SQL)
2. ✅ **Input Sanitization:** Karakter khusus dihapus
3. ✅ **Validation:** Format username divalidasi

**Hasil:** Injection tidak berhasil, username tidak ditemukan

---

### Skenario 5: XSS via Username

**Serangan:**
```bash
# Attacker coba inject XSS
username: <script>alert('XSS')</script>
```

**Proteksi:**
1. ✅ **Sanitization:** Tag HTML dihapus
2. ✅ **Alphanumeric Only:** Hanya a-z, 0-9, underscore, dash

**Hasil:** Username menjadi "scriptalertxss/script" → tidak ditemukan

---

## 🔍 Monitoring & Audit

### Check Logs

**Development:**
```bash
# Lihat terminal/console
npm run dev

# Logs akan muncul real-time
[SECURITY] Login failed - wrong password: admin, IP: 127.0.0.1
```

**Production:**
```bash
# Redirect stdout ke file
npm start > logs/app.log 2>&1

# Tail logs
tail -f logs/app.log | grep SECURITY
```

### Analisa Pattern Serangan

**Cari failed attempts:**
```bash
grep "Login failed" logs/app.log | wc -l
```

**Cari account lockout:**
```bash
grep "Account locked" logs/app.log
```

**Top attacking IPs:**
```bash
grep "Login failed" logs/app.log | awk -F'IP: ' '{print $2}' | cut -d',' -f1 | sort | uniq -c | sort -nr | head -10
```

---

## ⚙️ Konfigurasi

Semua setting ada di `lib/security.ts`:

```typescript
// Ubah max login attempts
export const MAX_LOGIN_ATTEMPTS = 5;  // Default: 5

// Ubah durasi lockout
export const LOCKOUT_DURATION = 15 * 60 * 1000;  // Default: 15 menit

// Ubah window untuk reset attempts
export const ATTEMPT_WINDOW = 15 * 60 * 1000;  // Default: 15 menit
```

**Contoh Custom:**
```typescript
// Lebih ketat (3 attempts, lock 30 menit)
export const MAX_LOGIN_ATTEMPTS = 3;
export const LOCKOUT_DURATION = 30 * 60 * 1000;

// Lebih longgar (10 attempts, lock 5 menit)
export const MAX_LOGIN_ATTEMPTS = 10;
export const LOCKOUT_DURATION = 5 * 60 * 1000;
```

---

## 🧪 Testing Keamanan

### Test 1: Account Lockout

```bash
# Coba login 5x dengan password salah
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"wrong'$i'"}'
  echo ""
done

# Expected: Attempt ke-5 harus locked
```

### Test 2: Rate Limiting

```bash
# Coba login 15x dalam 1 menit
for i in {1..15}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test"}'
  echo ""
done

# Expected: Attempt 11+ harus 429 (Too Many Requests)
```

### Test 3: Input Sanitization

```bash
# Coba XSS
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"<script>alert(1)</script>","password":"test"}'

# Expected: Username disanitasi, login gagal
```

---

## 🚨 Incident Response

### Jika Melihat Serangan

1. **Check Logs:**
   ```bash
   tail -100 logs/app.log | grep SECURITY
   ```

2. **Identifikasi IP Attacker:**
   ```bash
   grep "Login failed" logs/app.log | grep "IP: suspicious_ip"
   ```

3. **Block IP di Firewall (Manual):**
   ```bash
   # Linux
   sudo iptables -A INPUT -s suspicious_ip -j DROP
   
   # Nginx
   # Tambahkan di nginx.conf
   deny suspicious_ip;
   ```

4. **Reset Account Lockout (Jika Perlu):**
   ```javascript
   // Di lib/security.ts, tambahkan manual reset function
   import { resetLoginAttempts } from '@/lib/security';
   
   // Call via API atau script
   resetLoginAttempts('user:admin');
   ```

---

## 📞 Troubleshooting

### "Akun terkunci" padahal tidak salah login

**Penyebab:** Mungkin ada yang coba brute force account Anda

**Solusi:**
1. Tunggu 15 menit
2. Atau restart server (lockout di-memory, akan reset)
3. Check logs untuk lihat IP penyerang

### Login sangat lambat

**Penyebab:** Bcrypt hashing memang lambat (by design untuk security)

**Solusi:** Ini normal, jangan di-lower bcrypt rounds

### Lupa password admin

**Solusi:**
```bash
# Reset password via script
npm run create-admin admin new_password123 "Administrator"

# Ini akan overwrite admin yang lama
```

---

## 📚 Referensi

- **OWASP Authentication:** https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
- **Account Lockout Best Practices:** https://owasp.org/www-community/controls/Blocking_Brute_Force_Attacks
- **Bcrypt Security:** https://security.stackexchange.com/questions/4781/do-any-security-experts-recommend-bcrypt-for-password-storage

---

**Last Updated:** 2025-10-23  
**Version:** 1.0.0
