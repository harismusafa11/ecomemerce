import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding production database with rich product catalog...');

    // 1. Create Admin User
    const admin = await prisma.user.upsert({
        where: { email: 'admin@tapakpamungkas.com' },
        update: {},
        create: {
            name: 'Admin Pamungkas',
            email: 'admin@tapakpamungkas.com',
            password: 'admin123',
            isAdmin: true,
        },
    });
    console.log('✅ Admin user ready:', admin.email);

    // 2. Clear existing items to ensure clean seed
    await prisma.cartItem.deleteMany({}).catch(() => {});
    await prisma.wishlistItem.deleteMany({}).catch(() => {});
    await prisma.product.deleteMany({}).catch(() => {});

    // 3. Create Rich Products Catalog
    const sampleProducts = [
        {
            id: 1,
            name: 'Keris Pusaka Sepuh Luk 7 Dapur Jangkung',
            description: 'Pusaka sepuh tangguh keilmuan kuno berenergi wibawa raja, perlindungan gaib, penunduk sengkolo, dan pemikat keberuntungan bisnis/karir.',
            price: 2500000,
            stock: 1,
            category: 'Pusaka & Keris',
            imageUrls: ['https://files.catbox.moe/z44d2s.png']
        },
        {
            id: 2,
            name: 'Mustika Kelapa Asli Bertuah',
            description: 'Mustika kelapa alam berdaya pengasihan karomah tinggi, penarik rezeki dari 4 penjuru angin, dan pelaris usaha dagang.',
            price: 1200000,
            stock: 3,
            category: 'Media Bertuah',
            imageUrls: ['https://files.catbox.moe/z44d2s.png']
        },
        {
            id: 3,
            name: 'Minyak Hikmah Ruwatan Agung 7 Rupa',
            description: 'Racikan minyak hikmah murni terijazahkan untuk pembersihan sengkolo aura diri, buang sial, dan ketenangan jiwa raga.',
            price: 350000,
            stock: 25,
            category: 'Herbal & Keilmuan',
            imageUrls: ['https://files.catbox.moe/z44d2s.png']
        },
        {
            id: 4,
            name: 'Tasbih Karomah Kayu Stigi Asli 99 Butir',
            description: 'Tasbih kayu stigi bertuah yang diasma dengan zikir karomah kebatinan nusantara untuk penderas hajat dan penguat wibawa.',
            price: 450000,
            stock: 10,
            category: 'Media Bertuah',
            imageUrls: ['https://files.catbox.moe/z44d2s.png']
        },
        {
            id: 5,
            name: 'Ijazah Kitab Keilmuan Mahaguru Mata Bathin',
            description: 'Panduan lengkap dan pengijazahan keilmuan pembukaan mata batin, indera keenam, serta komunikasi batiniah terpercaya.',
            price: 500000,
            stock: 50,
            category: 'Herbal & Keilmuan',
            imageUrls: ['https://files.catbox.moe/z44d2s.png']
        },
        {
            id: 6,
            name: 'Azimat Rajah Pagar Gaib Rumah & Usaha',
            description: 'Media rajah khusus bertuah sebagai perisai dari serangan gaib, santet, guna-guna, serta kejahatan fisik dan psikis.',
            price: 300000,
            stock: 15,
            category: 'Media Bertuah',
            imageUrls: ['https://files.catbox.moe/z44d2s.png']
        },
        {
            id: 7,
            name: 'Cincin Perak Mustika Kecubung Wulung',
            description: 'Cincin perak berhiaskan batu kecubung wulung asli berenergi daya tarik pesona, karisma kepemimpinan, dan kewibawaan puncak.',
            price: 850000,
            stock: 4,
            category: 'Media Bertuah',
            imageUrls: ['https://files.catbox.moe/z44d2s.png']
        },
        {
            id: 8,
            name: 'Garam Ruwatan Garansi Syifa & Aura',
            description: 'Garam mandian ruwatan ter-asma untuk menetralisir aura negatif diri, membuang kesialan, dan melapangkan pintu rezeki.',
            price: 150000,
            stock: 30,
            category: 'Herbal & Keilmuan',
            imageUrls: ['https://files.catbox.moe/z44d2s.png']
        }
    ];

    for (const prod of sampleProducts) {
        await prisma.product.upsert({
            where: { id: prod.id },
            update: prod,
            create: prod,
        });
    }
    console.log(`✅ Created/Updated ${sampleProducts.length} rich products`);

    // 4. Create Vouchers
    await prisma.voucher.upsert({
        where: { code: 'WELCOME10' },
        update: {},
        create: {
            code: 'WELCOME10',
            discountPercentage: 10,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2026-12-31'),
        }
    });

    await prisma.voucher.upsert({
        where: { code: 'PAMUNGKAS50' },
        update: {},
        create: {
            code: 'PAMUNGKAS50',
            discountPercentage: 50,
            startDate: new Date('2025-01-01'),
            endDate: new Date('2026-12-31'),
        }
    });
    console.log('✅ Vouchers ready');

    console.log('🎉 Seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
