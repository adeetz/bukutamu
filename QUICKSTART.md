# Quick Start Guide

## Langkah Cepat untuk Memulai

### 1. Setup Database (di Laragon)

```bash
# Buka MySQL Console di Laragon, lalu jalankan:
CREATE DATABASE buku_tamu_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Konfigurasi Environment Variables

File `.env` sudah tersedia, cek dan sesuaikan:

```env
DATABASE_URL="mysql://root:@localhost:3306/buku_tamu_db"
```

Untuk R2, **sementara bisa dikosongkan dulu** jika ingin test tanpa upload foto:

```env
R2_ACCOUNT_ID="test"
R2_ACCESS_KEY_ID="test"
R2_SECRET_ACCESS_KEY="test"
R2_BUCKET_NAME="test"
R2_PUBLIC_URL="https://test.r2.dev"
```

> **Catatan:** Tanpa R2 yang dikonfigurasi dengan benar, upload foto akan error, tapi form tetap bisa diisi (tanpa foto).

### 3. Setup & Jalankan

```bash
# Jalankan migrasi database
npm run db:migrate

# Jalankan development server
npm run dev
```

### 4. Akses Aplikasi

Buka browser: **http://localhost:3000**

---

## Testing Tanpa R2 (Development Lokal)

Jika belum siap setup Cloudflare R2, Anda bisa:

1. Isi form **tanpa mengupload foto**
2. Data akan tersimpan di database
3. Upload foto akan error jika R2 belum dikonfigurasi

## Setup Cloudflare R2 (Opsional untuk Development)

Ikuti panduan lengkap di **SETUP_GUIDE.md** bagian "Setup Cloudflare R2"

Atau ringkasan:
1. Daftar di [Cloudflare](https://dash.cloudflare.com)
2. Buka R2 → Create bucket → `buku-tamu-photos`
3. Create API Token dengan permission **Read & Write**
4. Set bucket menjadi **Public**
5. Update `.env` dengan credentials yang didapat

---

## Perintah Berguna

```bash
# Jalankan development
npm run dev

# Lihat database dengan GUI
npm run db:studio

# Migrasi database (setelah ubah schema)
npm run db:migrate

# Push schema tanpa membuat migration
npm run db:push

# Build untuk production
npm run build

# Jalankan production build
npm run start
```

---

## Apa Selanjutnya?

1. **Setup R2** - Ikuti SETUP_GUIDE.md untuk konfigurasi lengkap
2. **Kustomisasi** - Edit tampilan di `app/page.tsx` dan `app/form/page.tsx`
3. **Deploy** - Ikuti panduan deployment di SETUP_GUIDE.md

---

## Butuh Bantuan?

- **Full Setup Guide**: Baca `SETUP_GUIDE.md`
- **General Info**: Baca `README.md`
- **Error Database**: Pastikan MySQL running di Laragon
- **Error TypeScript**: Jalankan `npm install` ulang
