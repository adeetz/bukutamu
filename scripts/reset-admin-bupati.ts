import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const username = 'admin_bupati';
  const newPassword = 'admin123'; // Ganti dengan password yang Anda inginkan
  
  try {
    console.log(`\nMereset password untuk: ${username}`);
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const updated = await prisma.admin.update({
      where: { username },
      data: { password: hashedPassword },
    });

    console.log(`✓ Password berhasil direset!`);
    console.log(`Username: ${updated.username}`);
    console.log(`Password baru: ${newPassword}`);
    console.log(`\nSilakan login dengan kredensial di atas.\n`);
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.error(`✗ Username "${username}" tidak ditemukan!`);
    } else {
      console.error('✗ Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
