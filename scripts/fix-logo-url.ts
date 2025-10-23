import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixLogoUrl() {
  try {
    console.log('🔧 Memperbaiki logo URL...');

    // Get current settings
    const settings = await prisma.settings.findUnique({
      where: { id: 1 },
    });

    if (!settings) {
      console.log('⚠️  Settings tidak ditemukan');
      return;
    }

    console.log('📝 Logo URL saat ini:', settings.logoUrl);

    if (!settings.logoUrl) {
      console.log('ℹ️  Tidak ada logo URL yang perlu diperbaiki');
      return;
    }

    // Extract filename from R2 URL
    const oldUrl = settings.logoUrl;
    const filename = oldUrl.split('/').pop();

    if (!filename) {
      console.log('❌ Gagal mengekstrak filename dari URL');
      return;
    }

    // Generate new URL using API route
    const newUrl = `/api/images/${filename}`;

    console.log('📝 Logo URL baru:', newUrl);

    // Update settings
    await prisma.settings.update({
      where: { id: 1 },
      data: { logoUrl: newUrl },
    });

    console.log('✅ Logo URL berhasil diperbaiki!');
    console.log('');
    console.log('Sebelum:', oldUrl);
    console.log('Sesudah:', newUrl);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixLogoUrl();
