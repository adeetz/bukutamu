import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('🔐 Testing login functionality...\n');
    
    // Test 1: Check database connection
    console.log('1️⃣ Testing database connection...');
    const adminCount = await prisma.admin.count();
    console.log(`   ✅ Connected - Found ${adminCount} admin(s)\n`);
    
    // Test 2: Try to find admin
    console.log('2️⃣ Finding admin user...');
    const admin = await prisma.admin.findUnique({
      where: { username: 'admin' }
    });
    
    if (!admin) {
      console.log('   ❌ Admin user not found!');
      process.exit(1);
    }
    
    console.log(`   ✅ Found admin: ${admin.name} (${admin.username})\n`);
    
    // Test 3: Test password verification
    console.log('3️⃣ Testing password verification...');
    const testPassword = 'admin123'; // Default password
    const isValid = await bcrypt.compare(testPassword, admin.password);
    
    if (isValid) {
      console.log(`   ✅ Password verification works!\n`);
    } else {
      console.log(`   ❌ Password doesn't match (might be using different password)\n`);
    }
    
    // Show credentials to test
    console.log('📝 Test credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123 (default) or your custom password\n');
    
    console.log('✅ Database is ready for login!');
    console.log('\n🚀 Start dev server with: npm run dev');
    console.log('   Then go to: http://localhost:3000/admin/login');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testLogin();
