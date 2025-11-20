import prisma from '../server/db';

async function main() {
    console.log('Seeding data...');

    // Products
    const products = [
        {
            name: 'Minyak Pelet Semar Mesem',
            description: 'Minyak mistis legendaris untuk pengasihan tingkat tinggi.',
            price: 500000,
            imageUrls: ['https://files.catbox.moe/z44d2s.png'],
            category: 'Media Bertuah',
            stock: 10
        },
        {
            name: 'Keris Omyang Jimbe',
            description: 'Keris pusaka untuk kewibawaan dan pagar gaib.',
            price: 1500000,
            imageUrls: ['https://files.catbox.moe/z44d2s.png'],
            category: 'Keilmuan',
            stock: 5
        },
        {
            name: 'Madu Hutan Asli',
            description: 'Madu murni dari hutan pedalaman, baik untuk kesehatan.',
            price: 150000,
            imageUrls: ['https://files.catbox.moe/z44d2s.png'],
            category: 'Media Herbal',
            stock: 50
        }
    ];

    for (const p of products) {
        // Check if exists to avoid duplicates if run multiple times
        const existing = await prisma.product.findFirst({ where: { name: p.name } });
        if (!existing) {
            await prisma.product.create({ data: p });
            console.log(`Created product: ${p.name}`);
        }
    }

    // Vouchers
    const vouchers = [
        { code: 'WELCOME10', discountPercentage: 10, startDate: new Date(), endDate: new Date('2025-12-31') },
        { code: 'FLASH50', discountPercentage: 50, startDate: new Date(), endDate: new Date('2025-12-31') }
    ];

    for (const v of vouchers) {
        const existing = await prisma.voucher.findUnique({ where: { code: v.code } });
        if (!existing) {
            await prisma.voucher.create({ data: v });
            console.log(`Created voucher: ${v.code}`);
        }
    }

    console.log('Seeding complete.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
