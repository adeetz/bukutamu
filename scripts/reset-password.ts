import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPassword() {
  try {
    const username = process.argv[2] || 'admin';
    const newPassword = process.argv[3] || 'password123';

    console.log(`🔄 Reset password untuk username: ${username}`);

    // Hash password dengan bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const admin = await prisma.admin.update({
      where: { username },
      data: { password: hashedPassword },
    });

    console.log('✅ Password berhasil direset!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 Username: ${admin.username}`);
    console.log(`🔑 Password Baru: ${newPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Silakan login dengan password baru!');
  } catch (error) {
    console.error('❌ Error reset password:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
