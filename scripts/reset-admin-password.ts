import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const username = process.argv[2];
    const newPassword = process.argv[3];

    if (!username || !newPassword) {
      console.error('❌ Usage: npm run reset-admin <username> <new_password>');
      console.error('   Example: npm run reset-admin admin NewPassword123');
      process.exit(1);
    }

    // Check if admin exists
    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin) {
      console.error(`❌ Admin dengan username "${username}" tidak ditemukan!`);
      process.exit(1);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.admin.update({
      where: { username },
      data: { password: hashedPassword },
    });

    console.log('✅ Password berhasil direset!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 Username: ${admin.username}`);
    console.log(`📝 Nama: ${admin.name}`);
    console.log(`🔑 Password Baru: ${newPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Silakan login dengan password baru!');
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
