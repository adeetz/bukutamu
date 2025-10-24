# 🤖 Setup hCaptcha (Gratis)

hCaptcha sudah terintegrasi untuk melindungi form dari bot dan spam. **100% GRATIS** dengan fokus pada privasi pengguna.

## 📋 Cara Setup

### 1. Daftar hCaptcha

1. Buka: **https://www.hcaptcha.com/signup-interstitial**
2. Daftar dengan email atau akun Google Anda
3. Setelah login, buka dashboard: **https://dashboard.hcaptcha.com/sites**

### 2. Tambah Site Baru

1. Klik tombol **"+ New Site"**
2. Isi form registrasi:

   ```
   Site Name: Buku Tamu Digital
   Hostnames:
     - localhost (untuk development)
     - yourdomain.com (domain production Anda)
   
   Passing Threshold: Easy (untuk pengalaman user yang lebih baik)
   ```

3. Klik **"Save"**

### 3. Copy Keys

Setelah save, Anda akan mendapat 2 keys:

```
Site Key: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Secret Key: 0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

⚠️ **PENTING:**
- **Site Key** = Public (dipakai di frontend)
- **Secret Key** = RAHASIA (dipakai di backend, jangan dishare!)

### 4. Setup Environment Variables

1. Buka file `.env` di root project
2. Tambahkan kedua keys:

```bash
# hCaptcha
NEXT_PUBLIC_HCAPTCHA_SITE_KEY="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
HCAPTCHA_SECRET_KEY="0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

3. **Save file `.env`**

### 5. Restart Development Server

```bash
# Stop server (Ctrl+C)
# Start ulang
npm run dev
```

### 6. Test hCaptcha

1. Buka: **http://localhost:3000/form**
2. Isi form buku tamu
3. Anda akan melihat widget hCaptcha di atas tombol submit
4. Centang checkbox "I am human"
5. Submit form

✅ Jika berhasil: Data tersimpan
❌ Jika gagal: Muncul error "Verifikasi CAPTCHA gagal"

---

## 🔍 Keunggulan hCaptcha

### Privacy First

- ✅ **Tidak mengumpulkan data personal**
- ✅ **Compliance dengan GDPR, CCPA, dan regulasi privasi lainnya**
- ✅ **Tidak menjual data pengguna**

### User-Friendly

- ✅ **Checkbox sederhana** - User hanya perlu centang "I am human"
- ✅ **Challenge yang fair** - Jika diperlukan, challenge lebih mudah dari kompetitor
- ✅ **Accessibility support** - Support untuk screen reader dan keyboard navigation

### Free & Reliable

- ✅ **100% gratis untuk unlimited request**
- ✅ **99.9% uptime SLA**
- ✅ **Fast response time**

---

## 🛠️ Troubleshooting

### Error: "hCaptcha not configured"

**Penyebab:** Environment variables belum diset

**Solusi:**
1. Pastikan `.env` ada di root project
2. Pastikan kedua keys sudah diisi
3. Restart development server

### Error: "Token CAPTCHA diperlukan"

**Penyebab:** Frontend tidak mengirim token

**Solusi:**
1. Cek console browser (F12)
2. Pastikan tidak ada error loading hCaptcha script
3. Cek koneksi internet

### Error: "Verifikasi CAPTCHA gagal"

**Penyebab:** Token invalid atau sudah expired

**Solusi:**
1. Pastikan **Secret Key** benar di `.env`
2. Pastikan hostname sudah didaftarkan di hCaptcha dashboard
3. Clear browser cache dan cookies
4. Coba dari browser/device lain

### hCaptcha Widget Tidak Muncul

**Penyebab:** Site key tidak diset atau salah

**Solusi:**
1. Cek `.env` → pastikan `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` terisi
2. Pastikan format key benar (format UUID atau 0x hex)
3. Restart server
4. Hard refresh browser (Ctrl+Shift+R)

### Error: "Invalid sitekey"

**Penyebab:** Site key salah atau hostname tidak cocok

**Solusi:**
1. Buka: https://dashboard.hcaptcha.com/sites
2. Klik settings site Anda
3. Tambahkan hostname `localhost` dan domain production Anda
4. Copy ulang Site Key, pastikan tidak ada spasi

---

## 📊 Monitoring (Opsional)

### Lihat Statistik hCaptcha

1. Buka: **https://dashboard.hcaptcha.com/overview**
2. Lihat dashboard:
   - Total requests
   - Pass rate
   - Bot detection stats
   - Geographic distribution

### Customize Widget Theme

Di dashboard hCaptcha, Anda bisa customize:
- **Light/Dark theme**
- **Widget size** (normal, compact, invisible)
- **Difficulty level** (easy, medium, hard)

---

## 🚀 Production Deployment

### Update Hostname

Sebelum deploy ke production:

1. Buka: https://dashboard.hcaptcha.com/sites
2. Klik settings site Anda
3. Di **Hostnames**, tambahkan domain production:
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
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
HCAPTCHA_SECRET_KEY=0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Netlify:**
```bash
Site settings → Environment variables → Add variable
```

**Docker/VPS:**
```bash
# .env.production
NEXT_PUBLIC_HCAPTCHA_SITE_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
HCAPTCHA_SECRET_KEY=0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## ❓ FAQ

### Q: Apakah hCaptcha benar-benar gratis?

**A:** Ya! 100% gratis untuk unlimited request. Tidak ada batasan monthly quota.

### Q: Apakah lebih baik dari reCAPTCHA?

**A:** hCaptcha lebih fokus pada privasi dan tidak mengumpulkan data personal seperti Google reCAPTCHA. Pilihan tergantung kebutuhan Anda.

### Q: Apakah bisa invisible (tanpa checkbox)?

**A:** Ya, hCaptcha support invisible mode. Ubah di dashboard → Site Settings → Challenge Behavior → Passive.

### Q: Bagaimana jika user tidak bisa solve challenge?

**A:** Sangat jarang terjadi. User bisa request challenge baru atau gunakan audio challenge untuk accessibility.

### Q: Apakah bisa disable hCaptcha sementara?

**A:** Ya, hapus/comment environment variables di `.env`:

```bash
# NEXT_PUBLIC_HCAPTCHA_SITE_KEY="..."
# HCAPTCHA_SECRET_KEY="..."
```

Form tetap jalan tapi tanpa proteksi CAPTCHA.

---

## 🔄 Migrasi dari reCAPTCHA

Jika sebelumnya menggunakan reCAPTCHA, migrasi ke hCaptcha sudah selesai dengan perubahan:

1. ✅ Package `@hcaptcha/react-hcaptcha` sudah terinstall
2. ✅ File `lib/hcaptcha.ts` untuk verifikasi server-side
3. ✅ Form page sudah menggunakan widget hCaptcha
4. ✅ API route sudah verifikasi token hCaptcha

**Yang perlu Anda lakukan:**
- Daftar di hCaptcha dan dapatkan keys
- Set environment variables di `.env`
- Restart server

---

## 📚 Referensi

- **hCaptcha Dashboard:** https://dashboard.hcaptcha.com
- **Dokumentasi:** https://docs.hcaptcha.com
- **React Integration:** https://www.npmjs.com/package/@hcaptcha/react-hcaptcha
- **Privacy Policy:** https://www.hcaptcha.com/privacy

---

**Last Updated:** 2025-10-24  
**Version:** 2.0.0
