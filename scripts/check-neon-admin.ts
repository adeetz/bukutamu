import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    console.log('🔍 Checking admin users in Neon database...\n');
    
    const admins = await prisma.admin.findMany();
    
    if (admins.length === 0) {
      console.log('❌ Tidak ada admin user di database Neon!');
      console.log('📝 Silakan buat admin baru dengan: npm run create-admin <username> <password> <name>');
    } else {
      console.log(`✅ Ditemukan ${admins.length} admin user(s):\n`);
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. Username: ${admin.username}`);
        console.log(`   Nama: ${admin.name}`);
        console.log(`   Created: ${admin.createdAt}`);
        console.log('');
      });
    }
    
    const bukuTamuCount = await prisma.bukuTamu.count();
    console.log(`📚 Total data buku tamu: ${bukuTamuCount}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
