# Buku Tamu Digital

Aplikasi web buku tamu digital yang memungkinkan pengunjung mengisi data diri dan mengunggah foto opsional. Data disimpan di database MySQL dan foto disimpan di Cloudflare R2 Object Storage.

## Fitur

- Form input data buku tamu (nama, alamat, instansi, keperluan)
- Upload foto opsional
- Tampilan data dalam bentuk card
- Responsive design
- Mendukung deployment di Vercel dengan database di AA Panel

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: MySQL dengan Prisma ORM
- **Storage**: Cloudflare R2 Object Storage
- **Deployment**: Vercel

## Setup Development (Local)

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database MySQL

Buat database baru di MySQL (melalui Laragon/phpMyAdmin):

```sql
CREATE DATABASE buku_tamu_db;
```

### 3. Konfigurasi Environment Variables

Copy file `.env.example` ke `.env` dan sesuaikan konfigurasi:

```env
# Database MySQL Local
DATABASE_URL="mysql://root:@localhost:3306/buku_tamu_db"

# Cloudflare R2 Configuration
R2_ACCOUNT_ID="your_account_id"
R2_ACCESS_KEY_ID="your_access_key_id"
R2_SECRET_ACCESS_KEY="your_secret_access_key"
R2_BUCKET_NAME="buku-tamu-photos"
R2_PUBLIC_URL="https://your-bucket.r2.dev"
```

### 4. Setup Cloudflare R2

1. Buat akun di [Cloudflare](https://dash.cloudflare.com)
2. Buka R2 Object Storage
3. Buat bucket baru (misalnya: `buku-tamu-photos`)
4. Buat API Token di R2 dengan permission **Read & Write**
5. Atur bucket menjadi **Public** (Settings → Public Access → Allow Access)
6. Salin Account ID, Access Key ID, dan Secret Access Key ke file `.env`
7. URL public bucket biasanya: `https://pub-[hash].r2.dev`

### 5. Jalankan Migrasi Database

```bash
npx prisma migrate dev --name init
```

### 6. Generate Prisma Client

```bash
npx prisma generate
```

### 7. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## Setup Production (Vercel + AA Panel)

### 1. Setup Database di AA Panel

1. Login ke AA Panel
2. Buat database MySQL baru
3. Catat informasi:
   - Host (biasanya `localhost` atau IP server)
   - Port (default: `3306`)
   - Username
   - Password
   - Database Name

### 2. Deploy ke Vercel

1. Push kode ke GitHub repository

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/username/repo-name.git
git push -u origin main
```

2. Login ke [Vercel](https://vercel.com)
3. Import repository GitHub
4. Tambahkan Environment Variables di Vercel:

```
DATABASE_URL=mysql://username:password@host:3306/database_name
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key_id
R2_SECRET_ACCESS_KEY=your_secret_access_key
R2_BUCKET_NAME=buku-tamu-photos
R2_PUBLIC_URL=https://your-bucket.r2.dev
```

5. Deploy

### 3. Jalankan Migrasi di Production

Setelah deployment pertama, jalankan migrasi database:

```bash
# Install Vercel CLI jika belum
npm i -g vercel

# Login
vercel login

# Jalankan migrasi
vercel env pull .env.production.local
npx prisma migrate deploy
```

Atau bisa menjalankan migrasi langsung di server AA Panel melalui SSH:

```bash
npx prisma migrate deploy
```

## Struktur Database

Tabel `buku_tamu`:

| Field     | Type         | Description                |
|-----------|--------------|----------------------------|
| id        | INT          | Primary key (auto increment) |
| nama      | VARCHAR(255) | Nama lengkap pengunjung     |
| alamat    | TEXT         | Alamat lengkap             |
| instansi  | VARCHAR(255) | Nama instansi/organisasi    |
| keperluan | TEXT         | Keperluan kunjungan        |
| fotoUrl   | VARCHAR(500) | URL foto di R2 (nullable)   |
| createdAt | DATETIME     | Timestamp pembuatan        |

## Endpoints API

### GET `/api/buku-tamu`
Mengambil semua data buku tamu (sorted by latest)

### POST `/api/buku-tamu`
Menyimpan data buku tamu baru

**Body:**
```json
{
  "nama": "string",
  "alamat": "string",
  "instansi": "string",
  "keperluan": "string",
  "fotoUrl": "string | null"
}
```

### POST `/api/upload`
Upload foto ke Cloudflare R2

**Body:** FormData dengan field `file`

**Response:**
```json
{
  "url": "https://your-bucket.r2.dev/filename.jpg"
}
```

## Troubleshooting

### Error: Database Connection
- Pastikan MySQL sudah running
- Cek DATABASE_URL di `.env` sudah benar
- Pastikan database sudah dibuat

### Error: Upload Foto Gagal
- Cek konfigurasi R2 di `.env`
- Pastikan bucket sudah di-set public
- Verify API Token memiliki permission Read & Write

### Error: Prisma Client
Jalankan:
```bash
npx prisma generate
```

## License

MIT
