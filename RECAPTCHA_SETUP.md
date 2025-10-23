# 🤖 Setup Google reCAPTCHA v3 (Gratis)

Google reCAPTCHA v3 sudah terintegrasi untuk melindungi form dari bot dan spam. **100% GRATIS** dan tidak mengganggu user (invisible CAPTCHA).

## 📋 Cara Setup

### 1. Daftar reCAPTCHA di Google

1. Buka: **https://www.google.com/recaptcha/admin/create**
2. Login dengan akun Google Anda
3. Isi form registrasi:

   ```
   Label: Buku Tamu Digital
   reCAPTCHA type: ✅ Score based (v3)
   Domains: 
     - localhost (untuk development)
     - yourdomain.com (domain production Anda)
   
   ✅ Accept the reCAPTCHA Terms of Service
   ```

4. Klik **SUBMIT**

### 2. Copy Keys

Setelah submit, Anda akan mendapat 2 keys:

```
Site Key: 6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Secret Key: 6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

⚠️ **PENTING:**
- **Site Key** = Public (dipakai di frontend)
- **Secret Key** = RAHASIA (dipakai di backend, jangan dishare!)

### 3. Setup Environment Variables

1. Buka file `.env` di root project
2. Tambahkan kedua keys:

```bash
# Google reCAPTCHA v3
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="6Lc_paste_site_key_di_sini"
RECAPTCHA_SECRET_KEY="6Lc_paste_secret_key_di_sini"
```

3. **Save file `.env`**

### 4. Restart Development Server

```bash
# Stop server (Ctrl+C)
# Start ulang
npm run dev
```

### 5. Test reCAPTCHA

1. Buka: **http://localhost:3000/form**
2. Isi form buku tamu
3. Di bawah tombol submit, Anda akan lihat:
   ```
   Situs ini dilindungi oleh reCAPTCHA dan Privacy Policy 
   serta Terms of Service Google berlaku.
   ```
4. Saat submit form, reCAPTCHA akan otomatis verifikasi di background

✅ Jika berhasil: Data tersimpan
❌ Jika gagal: Muncul error "Verifikasi CAPTCHA gagal"

---

## 🔍 Cara Kerja reCAPTCHA v3

### Score System

Google memberikan **score 0.0 - 1.0** untuk setiap pengunjung:

| Score | Arti |
|-------|------|
| 0.0 - 0.4 | 🤖 **Sangat mungkin bot** - DITOLAK |
| 0.5 - 0.7 | ⚠️ **Mencurigakan** - DITERIMA tapi perlu monitoring |
| 0.8 - 1.0 | ✅ **Kemungkinan besar manusia** - DITERIMA |

**Threshold di aplikasi ini: 0.5**

### Invisible CAPTCHA

- ✅ **Tidak ada checkbox** "I'm not a robot"
- ✅ **Tidak mengganggu user**
- ✅ **Analisis otomatis** di background
- ✅ **User experience tetap smooth**

---

## 🛠️ Troubleshooting

### Error: "reCAPTCHA not configured"

**Penyebab:** Environment variables belum diset

**Solusi:**
1. Pastikan `.env` ada di root project
2. Pastikan kedua keys sudah diisi
3. Restart development server

### Error: "Token CAPTCHA diperlukan"

**Penyebab:** Frontend tidak mengirim token

**Solusi:**
1. Cek console browser (F12)
2. Pastikan tidak ada error "Failed to load reCAPTCHA script"
3. Cek koneksi internet (script load dari Google)

### Error: "Verifikasi CAPTCHA gagal"

**Penyebab:** Score terlalu rendah (<0.5) atau token invalid

**Solusi:**
1. Pastikan **Secret Key** benar di `.env`
2. Pastikan domain sudah didaftarkan di Google reCAPTCHA console
3. Clear browser cache dan cookies
4. Coba dari browser/device lain

### reCAPTCHA Badge Tidak Muncul

**Penyebab:** Site key tidak diset atau salah

**Solusi:**
1. Cek `.env` → pastikan `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` terisi
2. Pastikan format key benar (dimulai dengan `6Lc`)
3. Restart server

### Error: "Invalid site key"

**Penyebab:** Site key salah atau domain tidak cocok

**Solusi:**
1. Buka: https://www.google.com/recaptcha/admin
2. Klik settings site Anda
3. Tambahkan domain `localhost` dan domain production Anda
4. Copy ulang Site Key, pastikan tidak ada spasi

---

## 📊 Monitoring (Opsional)

### Lihat Statistik reCAPTCHA

1. Buka: **https://www.google.com/recaptcha/admin**
2. Klik site Anda
3. Lihat dashboard:
   - Jumlah request
   - Score distribution
   - Bot traffic patterns

### Check Logs

**Di Development:**
```bash
# Console log saat form disubmit
reCAPTCHA verified, score: 0.9
```

**Di Server Logs:**
```bash
# API akan log score setiap kali verifikasi
[POST] /api/buku-tamu - reCAPTCHA score: 0.7
```

---

## 🚀 Production Deployment

### Update Domain

Sebelum deploy ke production:

1. Buka: https://www.google.com/recaptcha/admin
2. Klik settings site Anda
3. Di **Domains**, tambahkan domain production:
   ```
   yourdomain.com
   www.yourdomain.com
   ```
4. Save

### Environment Variables di Production

Pastikan set environment variables di hosting platform:

**Vercel:**
```bash
Settings → Environment Variables → Add
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc...
RECAPTCHA_SECRET_KEY=6Lc...
```

**Netlify:**
```bash
Site settings → Environment variables → Add variable
```

**Docker/VPS:**
```bash
# .env.production
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=6Lc...
RECAPTCHA_SECRET_KEY=6Lc...
```

---

## ❓ FAQ

### Q: Apakah reCAPTCHA v3 benar-benar gratis?

**A:** Ya! 100% gratis untuk 1 juta request per bulan. Lebih dari cukup untuk mayoritas website.

### Q: Apakah bisa pakai reCAPTCHA v2 (checkbox)?

**A:** Bisa, tapi v3 lebih bagus karena:
- Tidak mengganggu user
- Tidak perlu klik checkbox
- Lebih akurat dengan machine learning

### Q: Bagaimana jika user dapat score rendah padahal manusia?

**A:** Sangat jarang terjadi. Jika terjadi:
1. User bisa coba lagi
2. Bisa lower threshold dari 0.5 ke 0.3 di `lib/recaptcha.ts`

### Q: Apakah bisa disable reCAPTCHA sementara?

**A:** Ya, hapus/comment environment variables di `.env`:

```bash
# NEXT_PUBLIC_RECAPTCHA_SITE_KEY="..."
# RECAPTCHA_SECRET_KEY="..."
```

Form tetap jalan tapi tanpa proteksi CAPTCHA.

---

## 📚 Referensi

- **Google reCAPTCHA Admin:** https://www.google.com/recaptcha/admin
- **Dokumentasi v3:** https://developers.google.com/recaptcha/docs/v3
- **Best Practices:** https://developers.google.com/recaptcha/docs/v3#interpreting_the_score

---

**Last Updated:** 2025-10-23  
**Version:** 1.0.0
