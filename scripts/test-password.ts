import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPassword() {
  try {
    const password = 'admin123';
    
    console.log('🧪 Testing password hash...');
    console.log('Password plain:', password);
    
    // Get admin from database
    const admin = await prisma.admin.findUnique({
      where: { username: 'admin' }
    });
    
    if (!admin) {
      console.error('❌ Admin not found');
      return;
    }
    
    console.log('Hash in DB:', admin.password);
    
    // Test compare
    const isValid = await bcrypt.compare(password, admin.password);
    console.log('Is valid:', isValid ? '✅ YES' : '❌ NO');
    
    // Create new hash
    const newHash = await bcrypt.hash(password, 10);
    console.log('New hash:', newHash);
    
    // Test new hash
    const isNewValid = await bcrypt.compare(password, newHash);
    console.log('New hash valid:', isNewValid ? '✅ YES' : '❌ NO');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPassword();
