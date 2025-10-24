# ⚡ Quick hCaptcha Setup (5 menit)

Aplikasi sudah berjalan tapi **hCaptcha belum dikonfigurasi**. Ikuti langkah cepat ini:

## 🚀 Setup Cepat

### 1. Daftar hCaptcha (GRATIS)

Buka: **https://dashboard.hcaptcha.com/signup**
- Daftar dengan email atau Google account (gratis)

### 2. Buat Site Baru

Setelah login:
1. Klik **"+ New Site"**
2. Isi:
   - **Site Name**: Buku Tamu Digital
   - **Hostnames**: `localhost`
3. Klik **Save**

### 3. Copy Keys

Anda akan mendapat 2 keys:
```
Site Key: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Secret Key: 0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 4. Tambahkan ke File `.env`

Buka file `.env` di root project, tambahkan:

```bash
NEXT_PUBLIC_HCAPTCHA_SITE_KEY="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
HCAPTCHA_SECRET_KEY="0xXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
```

**Ganti dengan keys Anda yang sebenarnya!**

### 5. Restart Server

```bash
# Stop server (Ctrl+C)
# Start ulang
npm run dev
```

### 6. Test

1. Buka: http://localhost:3000/form
2. Anda akan lihat widget hCaptcha
3. Centang "I am human"
4. Submit form - Selesai!

---

## ⚠️ Jika Tidak Ingin Pakai hCaptcha

Aplikasi tetap bisa jalan tanpa hCaptcha, tapi **tidak ada proteksi dari bot/spam**.

Cara disable:
1. Jangan tambahkan keys di `.env`
2. Widget hCaptcha tidak akan muncul
3. Form tetap berfungsi normal

---

## 📚 Dokumentasi Lengkap

Lihat: **`HCAPTCHA_SETUP.md`** untuk panduan lengkap dan troubleshooting.

---

**Last Updated:** 2025-10-24
