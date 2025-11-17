import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const username = 'bupati';
  const newPassword = 'admin123'; // Ganti password di sini
  
  try {
    console.log(`\nMereset password untuk: ${username}`);
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Gunakan raw query untuk bypass Prisma schema
    await prisma.$executeRaw`
      UPDATE admin 
      SET password = ${hashedPassword}
      WHERE username = ${username}
    `;

    console.log(`✓ Password berhasil direset!`);
    console.log(`Username: ${username}`);
    console.log(`Password baru: ${newPassword}`);
    console.log(`\nSilakan login dengan kredensial di atas.\n`);
  } catch (error: any) {
    console.error('✗ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
