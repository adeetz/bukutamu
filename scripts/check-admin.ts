import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const admins = await prisma.admin.findMany();
    console.log('📋 Admin yang ada di database:');
    console.log(admins);
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin();
