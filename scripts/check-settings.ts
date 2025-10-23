import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSettings() {
  try {
    const settings = await prisma.settings.findUnique({
      where: { id: 1 }
    });

    if (!settings) {
      console.log('⚠️  No settings found in database');
      return;
    }

    console.log('✅ Settings found:\n');
    console.log('═══════════════════════════════════════');
    console.log(`Organization: ${settings.organizationName}`);
    console.log(`Logo URL: ${settings.logoUrl || '(not set)'}`);
    console.log(`Welcome Text: ${settings.welcomeText || '(not set)'}`);
    console.log(`Updated: ${settings.updatedAt}`);
    console.log('═══════════════════════════════════════\n');

    if (settings.logoUrl) {
      console.log('🌐 Logo should be visible at:');
      console.log(`   - Home: http://localhost:3000/`);
      console.log(`   - Form: http://localhost:3000/form`);
      console.log(`   - Settings: http://localhost:3000/admin/settings\n`);
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSettings();
