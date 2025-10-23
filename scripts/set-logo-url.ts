import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GANTI URL ini dengan URL logo Anda di R2
const LOGO_URL = 'https://8617252b51a0c41edf4e3476084aeee1.r2.cloudflarestorage.com/your-logo.png';

async function setLogoUrl() {
  try {
    console.log('🔧 Setting logo URL...\n');
    console.log(`   URL: ${LOGO_URL}\n`);

    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: {
        logoUrl: LOGO_URL,
      },
      create: {
        id: 1,
        organizationName: 'Diskominfo Tanah Bumbu',
        logoUrl: LOGO_URL,
      },
    });

    console.log('✅ Logo URL updated successfully!\n');
    console.log('📋 Current settings:');
    console.log(`   Organization: ${settings.organizationName}`);
    console.log(`   Logo URL: ${settings.logoUrl}`);
    console.log(`   Welcome Text: ${settings.welcomeText || '(not set)'}\n`);
    console.log('🌐 Logo is now live on your website!');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

setLogoUrl();
