import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const username = process.argv[2];
    const password = process.argv[3];
    const name = process.argv[4];

    if (!username || !password || !name) {
      console.error('❌ Usage: npm run create-admin <username> <password> <name>');
      console.error('   Example: npm run create-admin admin password123 "Admin Utama"');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findUnique({
      where: { username },
    });

    if (existingAdmin) {
      console.error(`❌ Admin dengan username "${username}" sudah ada!`);
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
        name,
      },
    });

    console.log('✅ Admin berhasil dibuat!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`👤 Username: ${admin.username}`);
    console.log(`📝 Nama: ${admin.name}`);
    console.log(`🔑 Password: ${password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 Silakan login di: http://localhost:3000/admin/login');
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
