import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  try {
    console.log('\n=== Reset Password Admin ===\n');

    // Tampilkan daftar admin
    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        name: true,
      }
    });

    if (admins.length === 0) {
      console.log('Tidak ada admin di database.');
      return;
    }

    console.log('Daftar Admin:');
    admins.forEach(admin => {
      console.log(`${admin.id}. ${admin.username} (${admin.name})`);
    });

    const username = await question('\nMasukkan username admin: ');
    const newPassword = await question('Masukkan password baru: ');

    if (!username || !newPassword) {
      console.log('Username dan password harus diisi!');
      return;
    }

    if (newPassword.length < 6) {
      console.log('Password minimal 6 karakter!');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const updated = await prisma.admin.update({
      where: { username },
      data: { password: hashedPassword },
    });

    console.log(`\n✓ Password untuk ${updated.username} berhasil direset!`);
  } catch (error: any) {
    if (error.code === 'P2025') {
      console.error('\n✗ Username tidak ditemukan!');
    } else {
      console.error('\n✗ Error:', error.message);
    }
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main();
