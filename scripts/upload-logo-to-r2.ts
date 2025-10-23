import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, R2_BUCKET_NAME } from '@/lib/r2';
import * as fs from 'fs';
import * as path from 'path';

// INSTRUCTIONS:
// 1. Letakkan file logo di folder scripts dengan nama "logo-diskominfo.png" (atau .jpg)
// 2. Jalankan: npx tsx scripts/upload-logo-to-r2.ts
// 3. Copy URL yang dihasilkan ke halaman settings

const LOGO_FILE = 'logo-diskominfo.png'; // Ganti dengan nama file Anda

async function uploadLogo() {
  try {
    const logoPath = path.join(__dirname, LOGO_FILE);
    
    // Check if file exists
    if (!fs.existsSync(logoPath)) {
      console.error(`❌ File not found: ${logoPath}`);
      console.log('\n📁 Please put your logo file in scripts folder:');
      console.log(`   scripts/${LOGO_FILE}`);
      console.log('\nSupported formats: PNG, JPG, JPEG, GIF, WebP');
      process.exit(1);
    }

    const fileBuffer = fs.readFileSync(logoPath);
    const fileSize = fileBuffer.length;
    const fileSizeMB = (fileSize / 1024 / 1024).toFixed(2);

    console.log('📤 Uploading logo to R2...\n');
    console.log(`   File: ${LOGO_FILE}`);
    console.log(`   Size: ${fileSizeMB} MB`);

    // Generate filename
    const extension = path.extname(LOGO_FILE);
    const filename = `logo-diskominfo-tanah-bumbu${extension}`;

    // Determine content type
    const contentTypeMap: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    const contentType = contentTypeMap[extension.toLowerCase()] || 'image/png';

    // Upload to R2
    await r2Client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: filename,
        Body: fileBuffer,
        ContentType: contentType,
        ContentDisposition: 'inline',
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    // Get R2 public URL
    const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;
    if (!R2_PUBLIC_URL) {
      throw new Error('R2_PUBLIC_URL not found in .env');
    }

    const logoUrl = `${R2_PUBLIC_URL}/${filename}`;

    console.log('\n✅ Upload successful!\n');
    console.log('📝 Logo URL:');
    console.log(`   ${logoUrl}\n`);
    console.log('🔧 Next steps:');
    console.log('   1. Copy the URL above');
    console.log('   2. Go to: http://localhost:3000/admin/settings');
    console.log('   3. Paste URL in the form (or it will auto-fill)');
    console.log('   4. Save settings\n');

    // Try to update database directly
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      await prisma.settings.upsert({
        where: { id: 1 },
        update: { logoUrl },
        create: {
          id: 1,
          organizationName: 'Diskominfo Tanah Bumbu',
          logoUrl,
        },
      });

      console.log('✅ Database updated automatically!');
      console.log('   Logo is now live on your website!\n');
    } catch (dbError) {
      console.log('⚠️  Could not update database automatically.');
      console.log('   Please update manually via settings page.\n');
    } finally {
      await prisma.$disconnect();
    }

  } catch (error: any) {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  }
}

uploadLogo();
