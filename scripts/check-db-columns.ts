import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Query untuk melihat kolom di tabel buku_tamu
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'buku_tamu'
      ORDER BY ordinal_position;
    `;
    
    console.log('\n=== Kolom di tabel buku_tamu ===\n');
    console.log(columns);
    
    // Query untuk melihat kolom di tabel admin
    const adminColumns = await prisma.$queryRaw`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'admin'
      ORDER BY ordinal_position;
    `;
    
    console.log('\n=== Kolom di tabel admin ===\n');
    console.log(adminColumns);
  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
