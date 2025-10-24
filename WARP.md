# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Digital guest book (Buku Tamu) application built with Next.js 16 (App Router), TypeScript, and PostgreSQL (Prisma ORM). Features include visitor registration with optional photo uploads to Cloudflare R2, admin dashboard for data management, and comprehensive security features including hCaptcha, rate limiting, and XSS protection.

## Essential Commands

### Development
```bash
npm run dev              # Start development server (localhost:3000)
npm run build            # Build production bundle (runs prisma generate first)
npm start                # Start production server
npm run lint             # Run ESLint checks
```

### Database
```bash
npm run db:migrate       # Run Prisma migrations (dev)
npm run db:push          # Push schema changes without migration
npm run db:studio        # Open Prisma Studio GUI
npx prisma generate      # Generate Prisma Client after schema changes
npx prisma migrate deploy # Deploy migrations to production
```

### Admin Management
```bash
npm run create-admin     # Create new admin user (interactive)
npm run reset-admin      # Reset admin password
npm run check-admin      # Check admin records in database
```

### Deployment
```bash
# Production migration on Vercel
vercel login
vercel env pull .env.production.local
npx prisma migrate deploy
```

## Architecture

### Database Models (Prisma)
- **BukuTamu**: Guest book entries (nama, alamat, instansi, keperluan, fotoUrl, createdAt)
- **Admin**: Administrator accounts with bcrypt-hashed passwords
- **Settings**: Customizable app settings (logo, organization name, page title, welcome text)

### Security Layer (`lib/security.ts`)
Core security utilities used across the application:
- **Input Sanitization**: `sanitizeInput()` strips HTML tags and malicious scripts
- **File Validation**: `validateFile()` enforces whitelist (JPEG, PNG, WebP), 5MB max, prevents path traversal
- **Rate Limiting**: In-memory tracking with automatic cleanup - 5 req/min for uploads, 3 req/5min for form submissions
- **Account Lockout**: `checkAccountLockout()` implements 5 failed attempts = 15min lockout for admin login
- **Filename Sanitization**: `sanitizeFilename()` prevents directory traversal and malicious extensions

### Authentication Flow (`lib/auth.ts`)
- JWT-based sessions using `jose` library
- 7-day session expiration
- HttpOnly cookies (secure flag in production)
- Session validation via `verifySession()` for protected routes
- **Critical**: JWT_SECRET environment variable must be set to strong random value in production

### File Storage (`lib/r2.ts`)
- Cloudflare R2 (S3-compatible) for image storage
- All images served through `/api/images/[key]` route for security
- Public URLs abstracted via `getPublicImageUrl(key)` helper

### API Structure
All routes follow Next.js 15+ App Router conventions:
- `app/api/buku-tamu/route.ts` - GET (list entries), POST (create entry)
- `app/api/buku-tamu/[id]/route.ts` - PUT (update), DELETE (require admin auth)
- `app/api/upload/route.ts` - POST file upload with rate limiting and validation
- `app/api/auth/login/route.ts` - Admin login with lockout protection
- `app/api/images/[key]/route.ts` - Proxied image serving from R2

### Page Routes
- `/` - Main page with guest book form and entries display
- `/form` - Dedicated form entry page
- `/display` - Public display view of guest book entries
- `/admin/login` - Admin authentication
- `/admin/dashboard` - Entry management (edit/delete)
- `/admin/settings` - App customization (logo, text, organization details)

## Environment Variables

Required for development (see `.env.example`):
```env
DATABASE_URL              # PostgreSQL connection string (note: migrated from MySQL)
R2_ACCOUNT_ID            # Cloudflare R2 account ID
R2_ACCESS_KEY_ID         # R2 API token access key
R2_SECRET_ACCESS_KEY     # R2 API token secret
R2_BUCKET_NAME           # R2 bucket name
R2_PUBLIC_DOMAIN         # R2 public URL (https://your-domain.r2.dev)
JWT_SECRET               # Strong random secret for session signing
NEXT_PUBLIC_HCAPTCHA_SITE_KEY  # hCaptcha site key (client-side)
HCAPTCHA_SECRET_KEY      # hCaptcha secret (server-side)
NODE_ENV                 # development | production
```

## Important Patterns

### Database Provider Migration
The codebase originally used MySQL but has migrated to PostgreSQL. Prisma schema uses `postgresql` provider. When reviewing historical documentation (README.md, SETUP_GUIDE.md), note that DATABASE_URL format has changed from `mysql://` to PostgreSQL connection strings.

### Security-First Development
- **All user inputs** must pass through `sanitizeInput()` before database storage
- **All file uploads** must pass through `validateFile()` before R2 upload
- **Rate limiting** must be applied to all public-facing POST endpoints using `checkRateLimit()`
- **Admin routes** must validate session using `getSession()` or `getSessionFromRequest()`

### Client vs Server Components
- Prisma Client can **only** be used in Server Components, API routes, or Server Actions
- File uploads use client-side compression via `browser-image-compression` before API submission
- hCaptcha widget rendered client-side, verified server-side in API routes

### Error Handling
- Use `lib/logger.ts` for structured logging (info, warn, error, debug)
- Return standardized JSON responses: `{ error: string }` or `{ data: any }`
- Admin operations log security events (failed logins, lockouts) via logger

## Testing

No automated test suite currently exists. Manual testing guidelines:
- XSS: Test form inputs with `<script>alert('test')</script>`
- Rate limiting: Submit forms repeatedly to trigger 429 responses
- File upload: Test with PHP/EXE files, oversized files (>5MB)
- Admin lockout: Test 5+ failed login attempts

## Additional Documentation

- `SECURITY.md` - Comprehensive security implementation details
- `SETUP_GUIDE.md` - Step-by-step local and production setup
- `HCAPTCHA_SETUP.md` - hCaptcha integration guide
- `ADMIN_LOGIN_SECURITY.md` - Admin authentication security details
- `VERCEL_DEPLOYMENT.md` - Vercel deployment instructions
- `PRODUCTION_DEPLOYMENT.md` - Production checklist
