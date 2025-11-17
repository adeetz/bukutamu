"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function createBupatiUsers() {
    try {
        console.log('🔧 Creating Bupati and Admin Bupati users...');
        // Hash passwords
        const adminPassword = await bcryptjs_1.default.hash('admin123', 12);
        const bupatiPassword = await bcryptjs_1.default.hash('bupati123', 12);
        // Create Admin Bupati
        const adminBupati = await prisma.admin.upsert({
            where: { username: 'admin_bupati' },
            update: {},
            create: {
                username: 'admin_bupati',
                name: 'Admin Bupati',
                password: adminPassword,
                role: 'BUPATI',
            }
        });
        // Create Bupati
        const bupati = await prisma.admin.upsert({
            where: { username: 'bupati' },
            update: {},
            create: {
                username: 'bupati',
                name: 'Bupati Tanah Bumbu',
                password: bupatiPassword,
                role: 'BUPATI'
            }
        });
        console.log('✅ Users created successfully!');
        console.log('');
        console.log('👤 Admin Bupati:');
        console.log('   Username: admin_bupati');
        console.log('   Password: admin123');
        console.log('   Role: ADMIN_BUPATI');
        console.log('');
        console.log('👑 Bupati:');
        console.log('   Username: bupati');
        console.log('   Password: bupati123');
        console.log('   Role: BUPATI');
        console.log('');
        console.log('🔧 Admin Bupati dapat:');
        console.log('   - Memfilter status: Menunggu, Diarahkan, Selesai');
        console.log('   - Melihat semua data tamu');
        console.log('');
        console.log('👑 Bupati dapat:');
        console.log('   - Mengarahkan tamu ke dinas/pejabat tertentu');
        console.log('   - Memutuskan tamu langsung menghadap atau diarahkan');
        console.log('   - Memberikan catatan untuk tamu');
    }
    catch (error) {
        console.error('❌ Error creating users:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
createBupatiUsers();
