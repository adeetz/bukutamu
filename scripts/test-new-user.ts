import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection with new user...\n');
    
    // Test read
    const adminCount = await prisma.admin.count();
    console.log(`✅ Read access OK - Found ${adminCount} admin(s)`);
    
    const bukuTamuCount = await prisma.bukuTamu.count();
    console.log(`✅ Read access OK - Found ${bukuTamuCount} buku tamu record(s)`);
    
    // Test connection info
    const result = await prisma.$queryRaw<Array<{current_user: string, current_database: string}>>`
      SELECT current_user, current_database();
    `;
    
    console.log('\n📊 Connection Info:');
    console.log(`   User: ${result[0].current_user}`);
    console.log(`   Database: ${result[0].current_database}`);
    
    console.log('\n✅ All tests passed! New user is working correctly.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
