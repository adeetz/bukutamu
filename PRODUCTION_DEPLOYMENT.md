# 🚀 Production Deployment Guide

Panduan lengkap untuk deploy aplikasi Buku Tamu Digital ke production.

## ✅ Pre-Deployment Checklist

### 1. Environment Variables (CRITICAL)

**Generate Secure JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Setup Environment Variables di Hosting:**

Buka hosting provider (Vercel/Netlify/dll) dan tambahkan environment variables berikut:

```env
# Database - Production MySQL
DATABASE_URL="mysql://username:password@production-host:3306/database_name"

# Cloudflare R2 Storage
R2_ACCOUNT_ID="your_production_account_id"
R2_ACCESS_KEY_ID="your_production_access_key"
R2_SECRET_ACCESS_KEY="your_production_secret_key"
R2_BUCKET_NAME="your_production_bucket_name"
R2_PUBLIC_DOMAIN="https://your-production-domain.r2.dev"

# JWT Secret - Use generated secret from command above
JWT_SECRET="PASTE_GENERATED_SECRET_HERE"

# hCaptcha
NEXT_PUBLIC_HCAPTCHA_SITE_KEY="your_production_site_key"
HCAPTCHA_SECRET_KEY="your_production_secret_key"

# Environment
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### 2. Database Setup

**Step 1: Create Production Database**
- Login ke MySQL server production (via AA Panel / cPanel / etc)
- Create new database
- Create user with proper permissions

**Step 2: Run Migrations**
```bash
# Install Vercel CLI (if deploying to Vercel)
npm i -g vercel

# Pull environment variables
vercel env pull .env.production.local

# Run migration
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

### 3. Cloudflare R2 Setup

1. Login ke [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **R2 Object Storage**
3. Create new bucket (e.g., `buku-tamu-photos-prod`)
4. Go to **Settings** → **Public Access** → **Allow Access**
5. Create API Token:
   - R2 → **Manage R2 API Tokens**
   - Create token dengan **Read & Write** permission
   - Copy Account ID, Access Key ID, dan Secret Access Key
6. (Optional) Setup custom domain:
   - Bucket Settings → Custom Domain
   - Add `photos.yourdomain.com`

### 4. hCaptcha Setup

1. Go to [hCaptcha Dashboard](https://dashboard.hcaptcha.com/sites)
2. Create new site:
   - Name: `Buku Tamu Production`
   - Hostnames: Add production domain (`yourdomain.com`)
3. Copy **Site Key** dan **Secret Key**
4. Add to environment variables

### 5. Create Admin Account

```bash
# Setelah deploy pertama kali, jalankan:
npm run create-admin

# Atau via Vercel CLI:
vercel run npm run create-admin
```

Masukkan credentials admin dengan aman!

### 6. Next.js Configuration

Update `next.config.ts` dengan production domain:

```typescript
remotePatterns: [
  // ... existing patterns
  {
    protocol: 'https',
    hostname: 'yourdomain.com',
  },
],
```

---

## 🔧 Deployment Steps

### Option A: Deploy ke Vercel

**PENTING:** Baca panduan lengkap di `VERCEL_DEPLOYMENT.md`

**Quick Steps:**

**1. Push ke GitHub:**
```bash
git add .
git commit -m "Initial production setup"
git remote add origin https://github.com/username/repo-name.git
git branch -M main
git push -u origin main
```

**2. Setup Environment Variables di Vercel:**
⚠️ **HARUS dilakukan SEBELUM deploy!**
- Go to [vercel.com](https://vercel.com) → New Project
- Import repository
- **Settings → Environment Variables**
- Add semua variables dari `.env.production.template`
- **JANGAN klik Deploy sebelum env vars ready!**

**3. Deploy:**
- Click **Deploy**
- Tunggu build selesai

**4. Post-deployment:**
```bash
# Run database migration
vercel env pull
npx prisma migrate deploy

# Create admin account
npm run create-admin
```

**Detailed Guide:** See `VERCEL_DEPLOYMENT.md`

### Option B: Deploy ke Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Init
netlify init

# Set environment variables
netlify env:set DATABASE_URL "mysql://..."
netlify env:set JWT_SECRET "your-secret"
# ... add all variables

# Deploy
netlify deploy --prod
```

### Option C: VPS / Custom Server

```bash
# SSH to server
ssh user@your-server.com

# Clone repository
git clone https://github.com/username/repo-name.git
cd repo-name

# Install dependencies
npm ci --production

# Setup environment
cp .env.production.template .env
nano .env  # Edit dengan production values

# Build
npm run build

# Run migrations
npx prisma migrate deploy

# Start with PM2
pm2 start npm --name "buku-tamu" -- start
pm2 save
pm2 startup
```

---

## 🔒 Security Checklist

- [ ] JWT_SECRET menggunakan random string yang kuat (64+ characters)
- [ ] Database credentials tidak di-commit ke git
- [ ] `.env` file ada di `.gitignore`
- [ ] hCaptcha enabled untuk production
- [ ] Rate limiting aktif (sudah built-in)
- [ ] Account lockout enabled (sudah built-in)
- [ ] HTTPS enabled di production domain
- [ ] Cookie secure flag enabled (otomatis di production)
- [ ] Error messages tidak expose sensitive data
- [ ] Console.log sudah diganti dengan logger

---

## 🧪 Testing Sebelum Go-Live

### 1. Functionality Tests
- [ ] Form submission works
- [ ] Image upload works
- [ ] hCaptcha works
- [ ] Admin login works
- [ ] CRUD operations work
- [ ] Pagination works
- [ ] Search works
- [ ] Export Excel works

### 2. Security Tests
- [ ] Test rate limiting (try submit form 5x quickly)
- [ ] Test account lockout (fail login 5x)
- [ ] Test XSS (try input `<script>alert('xss')</script>`)
- [ ] Test SQL injection (try `' OR '1'='1`)
- [ ] Test file upload limits (try upload 10MB file)

### 3. Performance Tests
- [ ] Check page load time < 3s
- [ ] Check image optimization
- [ ] Check lighthouse score > 80
- [ ] Test on mobile device

---

## 📊 Monitoring & Maintenance

### Setup Error Tracking (Recommended)

**Option 1: Sentry**
```bash
npm install @sentry/nextjs

# Init
npx @sentry/wizard@latest -i nextjs

# Update app/error.tsx to send errors to Sentry
```

**Option 2: LogRocket / Datadog**

### Database Backup

Setup automated backup di MySQL server:
```bash
# Cron job untuk backup harian
0 2 * * * mysqldump -u user -p database > /backup/buku-tamu-$(date +\%Y\%m\%d).sql
```

### Monitoring Checklist
- [ ] Setup uptime monitoring (UptimeRobot, Pingdom)
- [ ] Setup error tracking (Sentry)
- [ ] Setup analytics (Google Analytics, Plausible)
- [ ] Monitor disk space (R2 usage)
- [ ] Monitor database size

---

## 🆘 Troubleshooting

### Issue: Build Failed - Prisma Error
```bash
# Solution: Generate Prisma client
npx prisma generate
npm run build
```

### Issue: Database Connection Error
```bash
# Check DATABASE_URL format:
# Correct: mysql://user:pass@host:3306/dbname
# Wrong: mysql://user:pass@host/dbname (missing port)

# Test connection
npx prisma db push
```

### Issue: Images Not Loading
- Check R2_PUBLIC_DOMAIN is correct
- Verify R2 bucket is set to Public
- Check CORS settings in R2

### Issue: hCaptcha Failed
- Verify domain is added in hCaptcha dashboard
- Check NEXT_PUBLIC_HCAPTCHA_SITE_KEY is correct
- Check HCAPTCHA_SECRET_KEY is correct

### Issue: Admin Can't Login
```bash
# Reset admin password
npm run create-admin
# Enter same username to update password
```

---

## 📞 Support

Jika ada masalah setelah deployment:
1. Check application logs di hosting dashboard
2. Check database connection
3. Verify environment variables
4. Test API endpoints manually

---

## 🎉 Post-Deployment

Setelah berhasil deploy:
- [ ] Test semua fitur end-to-end
- [ ] Share URL ke stakeholders
- [ ] Document admin credentials (simpan di password manager)
- [ ] Setup monitoring alerts
- [ ] Schedule weekly/monthly maintenance
- [ ] Create backup restoration procedure

**Congratulations! Aplikasi Buku Tamu sudah live! 🚀**
