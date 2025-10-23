import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔐 Create New Admin User\n');
    
    // Check existing admins
    const existingAdmins = await prisma.admin.findMany();
    console.log(`📋 Current admins in database: ${existingAdmins.length}`);
    existingAdmins.forEach(admin => {
      console.log(`   - ${admin.username} (${admin.name})`);
    });
    console.log('');
    
    // Delete all old admins
    console.log('🗑️  Deleting all old admin users...');
    const deleted = await prisma.admin.deleteMany();
    console.log(`✅ Deleted ${deleted.count} old admin(s)\n`);
    
    // Create new admin with default credentials
    const username = 'admin';
    const password = 'admin123';
    const name = 'Administrator';
    
    console.log('📝 Creating new admin with default credentials:');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`   Name: ${name}\n`);
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newAdmin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
        name,
      },
    });
    
    console.log('✅ Admin user created successfully!\n');
    console.log('═══════════════════════════════════════');
    console.log('📋 Login Credentials:');
    console.log('═══════════════════════════════════════');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('═══════════════════════════════════════');
    console.log('\n🌐 Login URLs:');
    console.log('   Local:      http://localhost:3000/admin/login');
    console.log('   Production: https://bukutamunew.vercel.app/admin/login');
    console.log('\n⚠️  IMPORTANT: Change password after first login!');
    console.log('   Use: npx tsx scripts/reset-admin-password.ts\n');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
