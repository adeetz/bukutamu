# Panduan Setup Lengkap

## Setup Lokal (Development)

### 1. Persiapan Database MySQL

**Melalui Laragon:**

1. Jalankan Laragon dan pastikan MySQL sudah running
2. Buka Menu → MySQL → MySQL Console (atau phpMyAdmin)
3. Buat database baru:

```sql
CREATE DATABASE buku_tamu_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. Konfigurasi File .env

File `.env` sudah ada, pastikan isinya sudah disesuaikan:

```env
DATABASE_URL="mysql://root:@localhost:3306/buku_tamu_db"

# Cloudflare R2 - isi setelah membuat bucket
R2_ACCOUNT_ID="your_account_id"
R2_ACCESS_KEY_ID="your_access_key_id"
R2_SECRET_ACCESS_KEY="your_secret_access_key"
R2_BUCKET_NAME="buku-tamu-photos"
R2_PUBLIC_URL="https://your-bucket.r2.dev"
```

**Catatan untuk DATABASE_URL:**
- Jika password MySQL kosong: `mysql://root:@localhost:3306/buku_tamu_db`
- Jika ada password: `mysql://root:password@localhost:3306/buku_tamu_db`

### 3. Setup Cloudflare R2 (untuk Upload Foto)

#### Buat Bucket di Cloudflare R2:

1. Daftar/Login ke [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Klik **R2** di sidebar kiri
3. Klik **Create bucket**
4. Beri nama: `buku-tamu-photos` (atau nama lain)
5. Klik **Create bucket**

#### Buat API Token:

1. Di halaman R2, klik **Manage R2 API Tokens**
2. Klik **Create API token**
3. Beri nama: `Buku Tamu API`
4. Permissions: **Object Read & Write**
5. Klik **Create API Token**
6. **PENTING**: Salin dan simpan:
   - Access Key ID
   - Secret Access Key
   - (Anda tidak bisa melihat Secret Access Key lagi setelah ini!)

#### Set Bucket menjadi Public:

1. Klik bucket `buku-tamu-photos`
2. Klik tab **Settings**
3. Scroll ke **Public access**
4. Klik **Allow Access** atau **Connect Domain**
5. Jika menggunakan Custom Domain:
   - Pilih domain Cloudflare Anda
   - Buat subdomain, misalnya: `cdn.yourdomain.com`
6. Jika menggunakan R2.dev subdomain:
   - Klik **Allow Access**
   - Salin URL: `https://pub-xxxx.r2.dev`

#### Update .env dengan info R2:

```env
R2_ACCOUNT_ID="xxxxx"  # Bisa dilihat di URL dashboard
R2_ACCESS_KEY_ID="access_key_dari_api_token"
R2_SECRET_ACCESS_KEY="secret_key_dari_api_token"
R2_BUCKET_NAME="buku-tamu-photos"
R2_PUBLIC_URL="https://pub-xxxx.r2.dev"  # URL public bucket
```

### 4. Install Dependencies dan Setup Database

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Jalankan migrasi database
npx prisma migrate dev --name init
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka browser: [http://localhost:3000](http://localhost:3000)

---

## Setup Production (Vercel + AA Panel)

### 1. Persiapan Database di AA Panel

1. Login ke AA Panel server Anda
2. Buka **Database** → **MySQL**
3. Klik **Add Database**
4. Isi:
   - Database name: `buku_tamu_prod`
   - Username: buat user baru atau gunakan existing
   - Password: (buat password yang kuat)
5. Catat informasi koneksi:
   - Host: biasanya `localhost` atau IP server
   - Port: `3306` (default)
   - Database: `buku_tamu_prod`
   - Username: `user_yang_dibuat`
   - Password: `password_yang_dibuat`

### 2. Push Kode ke GitHub

```bash
# Inisialisasi Git (jika belum)
git init

# Add semua file
git add .

# Commit
git commit -m "Initial commit: Buku Tamu Digital"

# Buat repository di GitHub, lalu:
git remote add origin https://github.com/username/buku-tamu.git
git branch -M main
git push -u origin main
```

### 3. Deploy ke Vercel

1. Login ke [Vercel](https://vercel.com)
2. Klik **Add New** → **Project**
3. Import repository GitHub Anda
4. Di halaman konfigurasi:
   - Framework Preset: **Next.js** (auto-detect)
   - Root Directory: `./`
   - Build Command: (default) `npm run build`
   - Output Directory: (default) `.next`

5. **Tambahkan Environment Variables** (penting!):

   Klik **Environment Variables** dan tambahkan:

   ```
   DATABASE_URL
   mysql://username:password@host:3306/buku_tamu_prod
   
   R2_ACCOUNT_ID
   your_account_id
   
   R2_ACCESS_KEY_ID
   your_access_key_id
   
   R2_SECRET_ACCESS_KEY
   your_secret_access_key
   
   R2_BUCKET_NAME
   buku-tamu-photos
   
   R2_PUBLIC_URL
   https://pub-xxxx.r2.dev
   ```

6. Klik **Deploy**

### 4. Setup Database di Production

Setelah deployment berhasil, setup database production:

**Opsi A: Melalui SSH ke Server AA Panel**

```bash
# SSH ke server
ssh user@your-server.com

# Masuk ke direktori project (clone dari GitHub)
git clone https://github.com/username/buku-tamu.git
cd buku-tamu

# Install dependencies
npm install

# Buat file .env production
nano .env

# Paste DATABASE_URL production
DATABASE_URL="mysql://username:password@localhost:3306/buku_tamu_prod"

# Jalankan migrasi
npx prisma migrate deploy
```

**Opsi B: Melalui Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.production.local

# Jalankan migrasi (perlu akses ke database production)
npx prisma migrate deploy
```

**Opsi C: Manual SQL (jika opsi A & B tidak memungkinkan)**

1. Generate SQL migration:
   ```bash
   npx prisma migrate deploy --create-only
   ```

2. Salin SQL dari file `prisma/migrations/xxx_init/migration.sql`

3. Buka phpMyAdmin atau MySQL Console di AA Panel

4. Jalankan SQL tersebut di database production

### 5. Verifikasi Deployment

1. Buka URL Vercel Anda: `https://your-project.vercel.app`
2. Coba isi form buku tamu
3. Cek apakah data tersimpan dan muncul di halaman utama
4. Test upload foto

---

## Troubleshooting

### Error: "PrismaClient is unable to run in this browser environment"

Pastikan Anda tidak menggunakan Prisma Client di client component. Prisma hanya bisa digunakan di:
- API Routes (`app/api/**/route.ts`)
- Server Components
- Server Actions

### Error: "Can't reach database server"

1. Cek DATABASE_URL di `.env` sudah benar
2. Pastikan MySQL sudah running (Laragon)
3. Test koneksi database:
   ```bash
   npx prisma db push
   ```

### Error: Upload foto gagal

1. Cek semua environment variables R2 sudah benar
2. Pastikan bucket sudah public
3. Cek API Token masih valid
4. Test dengan curl:
   ```bash
   curl -X POST http://localhost:3000/api/upload \
     -F "file=@path/to/image.jpg"
   ```

### Error di Production Vercel

1. Cek Vercel Logs:
   - Buka project di Vercel
   - Tab **Deployments**
   - Klik deployment terakhir
   - Klik **View Function Logs**

2. Pastikan Environment Variables sudah di-set dengan benar

3. Cek database production bisa diakses dari Vercel:
   - Vercel perlu akses ke database (pastikan firewall/security group mengizinkan)
   - Atau gunakan database yang accessible dari internet

---

## Tips

### Menggunakan External MySQL Database (untuk Production)

Jika AA Panel database tidak bisa diakses dari Vercel, pertimbangkan:

1. **PlanetScale** (Free tier available)
2. **Railway** (Free tier available)
3. **Neon** (PostgreSQL - perlu ubah schema)
4. **Vercel Postgres**

### Optimize untuk Production

Di `next.config.ts`, tambahkan:

```typescript
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-*.r2.dev',
      },
    ],
  },
  // Optimize production build
  swcMinify: true,
  compress: true,
};
```

### Backup Database

**Export data:**
```bash
npx prisma db pull
mysqldump -u root buku_tamu_db > backup.sql
```

**Import data:**
```bash
mysql -u root buku_tamu_db < backup.sql
```
