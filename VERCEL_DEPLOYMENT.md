# 🚀 Vercel Deployment Guide

Panduan step-by-step untuk deploy ke Vercel.

## ⚠️ PENTING: Setup Environment Variables SEBELUM Deploy

Vercel **HARUS** memiliki environment variables SEBELUM menjalankan build.

---

## 📋 Step-by-Step Deployment

### Step 1: Persiapkan Database Production

**Option A: PlanetScale (Recommended for Vercel)**
1. Sign up di [planetscale.com](https://planetscale.com)
2. Create database baru
3. Copy connection string (format: `mysql://...`)

**Option B: MySQL dari AA Panel / cPanel**
1. Create database MySQL
2. Format connection string:
   ```
   mysql://username:password@host:3306/database_name
   ```
3. Pastikan server MySQL bisa diakses dari internet (whitelist IP Vercel)

### Step 2: Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy output (contoh: `ed12420a015af85ac065f4fdf31d8b8daa0af319...`)

### Step 3: Setup Cloudflare R2

1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com)
2. R2 Object Storage → Create Bucket
3. Nama bucket: `buku-tamu-photos-prod`
4. Settings → Public Access → **Allow Access**
5. R2 → Manage R2 API Tokens → Create API Token
6. Copy:
   - Account ID
   - Access Key ID
   - Secret Access Key
   - Public URL (biasanya: `https://pub-xxxxx.r2.dev`)

### Step 4: Setup reCAPTCHA (Optional)

1. Go to [Google reCAPTCHA](https://www.google.com/recaptcha/admin/create)
2. Create site dengan:
   - Type: **reCAPTCHA v3**
   - Domains: `your-domain.vercel.app` (atau custom domain)
3. Copy Site Key dan Secret Key

### Step 5: Push ke GitHub

```bash
cd C:\laragon\www\datapeserta

# Add all files
git add .

# Commit
git commit -m "Production-ready: Buku Tamu Digital"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### Step 6: Import Project ke Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **New Project**
3. Import your GitHub repository
4. **JANGAN klik Deploy dulu!**

### Step 7: Setup Environment Variables di Vercel

Di Vercel project settings, tambahkan environment variables:

```env
DATABASE_URL=mysql://username:password@host:3306/database_name

R2_ACCOUNT_ID=your_r2_account_id
R2_ACCESS_KEY_ID=your_r2_access_key_id
R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
R2_BUCKET_NAME=buku-tamu-photos-prod
R2_PUBLIC_DOMAIN=https://pub-xxxxx.r2.dev

JWT_SECRET=your_generated_jwt_secret_here

NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_recaptcha_site_key
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key

NODE_ENV=production
```

**Tips:**
- Set untuk **Production**, **Preview**, dan **Development**
- Atau pilih hanya **Production** jika tidak perlu preview deploys

### Step 8: Deploy!

1. Click **Deploy**
2. Tunggu build selesai (sekitar 2-5 menit)
3. Jika sukses, Vercel akan memberikan URL: `https://your-project.vercel.app`

### Step 9: Run Database Migration

**Option A: Via Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.production.local

# Run migration
npx prisma migrate deploy
```

**Option B: Via Server (jika database di server sendiri)**

```bash
# SSH to database server
ssh user@your-server.com

# Clone repo
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# Setup .env dengan DATABASE_URL production
echo "DATABASE_URL=mysql://user:pass@localhost:3306/dbname" > .env

# Install dependencies
npm ci

# Run migration
npx prisma migrate deploy
```

### Step 10: Create Admin Account

**Via Vercel CLI:**

```bash
vercel env pull
npm run create-admin
```

Masukkan username, password, dan nama admin.

### Step 11: Test Deployment

1. Buka URL Vercel: `https://your-project.vercel.app`
2. Test form submission
3. Test image upload
4. Test admin login: `https://your-project.vercel.app/admin/login`
5. Test CRUD operations di dashboard

---

## 🔧 Troubleshooting

### Error: "Missing required environment variable: DATABASE_URL"

**Penyebab:** Environment variables belum di-set di Vercel

**Solusi:**
1. Go to Vercel project → Settings → Environment Variables
2. Add `DATABASE_URL` dan semua variables lain
3. **Redeploy:** Deployments → ... → Redeploy

### Error: "Can't reach database server"

**Penyebab:** Database tidak bisa diakses dari Vercel

**Solusi:**
1. Cek database server bisa diakses dari internet
2. Whitelist Vercel IPs (atau allow all IPs untuk testing)
3. Test connection:
   ```bash
   mysql -h your-host -P 3306 -u username -p
   ```

### Error: "Prisma migration failed"

**Penyebab:** Migration belum dijalankan di production database

**Solusi:**
```bash
# Pull env vars
vercel env pull

# Run migration
npx prisma migrate deploy

# Atau run manual:
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

### Error: "Image upload failed"

**Penyebab:** R2 credentials salah atau bucket tidak public

**Solusi:**
1. Verify R2 credentials di Vercel env vars
2. Check R2 bucket settings → Public Access → **Allow Access**
3. Test R2 URL di browser: `https://pub-xxxxx.r2.dev`

### Error: "reCAPTCHA verification failed"

**Penyebab:** Domain tidak terdaftar di reCAPTCHA

**Solusi:**
1. Go to [reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Edit site → Add domain: `your-project.vercel.app`
3. Redeploy di Vercel

---

## 🎯 Custom Domain (Optional)

### Setup Custom Domain

1. Vercel Project → Settings → Domains
2. Add domain: `yourdomain.com`
3. Update DNS records di domain provider:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (5-60 menit)

### Update reCAPTCHA Domain

1. Go to reCAPTCHA Admin
2. Edit site → Add: `yourdomain.com`

### Update Next.js Config (Optional)

Edit `next.config.ts`:

```typescript
remotePatterns: [
  // ... existing patterns
  {
    protocol: 'https',
    hostname: 'yourdomain.com',
  },
],
```

Commit & push → Vercel auto-deploy.

---

## 📊 Post-Deployment Checklist

- [ ] Database migration sukses
- [ ] Admin account created
- [ ] Form submission works
- [ ] Image upload works
- [ ] reCAPTCHA works
- [ ] Admin login works
- [ ] CRUD operations work
- [ ] Pagination works
- [ ] Search works
- [ ] Export Excel works
- [ ] Custom domain (jika ada) works
- [ ] SSL certificate active (auto by Vercel)

---

## 🔒 Security Recommendations

1. **Enable Vercel Password Protection** (untuk staging):
   - Settings → Deployment Protection → Password Protection

2. **Setup Monitoring**:
   - Vercel Analytics (auto-enabled)
   - (Optional) Sentry untuk error tracking

3. **Database Backup**:
   - Setup automated backup di database provider
   - Test restore procedure

4. **Environment Variables Audit**:
   - Never commit `.env` files
   - Rotate JWT_SECRET every 3-6 months
   - Rotate R2 API keys every 6 months

---

## 🎉 Success!

Jika semua checklist ✅, aplikasi Buku Tamu Digital sudah live di production!

**Next Steps:**
- Share URL ke users
- Monitor error logs di Vercel dashboard
- Setup automated backups
- Add monitoring/analytics

**Need Help?**
Check Vercel logs: Project → Deployments → [Your Deployment] → Function Logs
