import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding production database...');

    // 1. Create Admin User
    console.log('Creating admin user...');
    const admin = await prisma.user.upsert({
        where: { email: 'admin@tapakpamungkas.com' },
        update: {},
        create: {
            name: 'Admin Pamungkas',
            email: 'admin@tapakpamungkas.com',
            password: 'admin123', // In production, hash this!
            isAdmin: true,
        },
    });
    console.log('✅ Admin user created:', admin.email);

    // 2. Create Sample Products
    console.log('Creating sample products...');
    const products = await Promise.all([
        prisma.product.upsert({
            where: { id: 1 },
            update: {},
            create: {
                name: 'Mahaguru Mata Bathin',
                description: 'Keilmuan spiritual untuk membuka mata bathin',
                price: 500000,
                stock: 10,
                category: 'Keilmuan',
                imageUrls: ['https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=500']
            }
        }),
        prisma.product.upsert({
            where: { id: 2 },
            update: {},
            create: {
                name: 'Batu Akik Bertuah',
                description: 'Batu akik dengan energi spiritual',
                price: 750000,
                stock: 5,
                category: 'Media Bertuah',
                imageUrls: ['https://images.unsplash.com/photo-1611365892117-00ac5ef43c90?w=500']
            }
        }),
        prisma.product.upsert({
            where: { id: 3 },
            update: {},
            create: {
                name: 'Minyak Herbal Mistis',
                description: 'Minyak herbal untuk pengobatan spiritual',
                price: 300000,
                stock: 15,
                category: 'Media Herbal',
                imageUrls: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500']
            }
        })
    ]);
    console.log(`✅ Created ${products.length} products`);

    // 3. Create Vouchers
    console.log('Creating vouchers...');
    const vouchers = await Promise.all([
        prisma.voucher.upsert({
            where: { code: 'WELCOME10' },
            update: {},
            create: {
                code: 'WELCOME10',
                discountPercentage: 10,
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-12-31'),
            }
        }),
        prisma.voucher.upsert({
            where: { code: 'FLASH50' },
            update: {},
            create: {
                code: 'FLASH50',
                discountPercentage: 50,
                startDate: new Date('2025-01-01'),
                endDate: new Date('2025-06-30'),
            }
        })
    ]);
    console.log(`✅ Created ${vouchers.length} vouchers`);

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
