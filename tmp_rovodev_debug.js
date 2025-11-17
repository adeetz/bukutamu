const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected');
    
    // Get sample data
    const sampleData = await prisma.bukuTamu.findFirst();
    console.log('📄 Sample data:', sampleData);
    
    // Check if we have any data
    const count = await prisma.bukuTamu.count();
    console.log(`📊 Total records: ${count}`);
    
    // Check status values
    const statusGroups = await prisma.bukuTamu.groupBy({
      by: ['status'],
      _count: true
    });
    console.log('📈 Status distribution:', statusGroups);
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

debugDatabase();