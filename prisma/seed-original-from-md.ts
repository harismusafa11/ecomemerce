import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Parsing public-Product-selection.md and seeding 147 original products...');

    const filePath = path.join(process.cwd(), 'public-Product-selection.md');
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    const productsToInsert = [];

    for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || !line.startsWith('|')) continue;

        // Split line by '|'
        const parts = line.split('|').map(p => p.trim());
        if (parts.length < 10) continue;

        const id = parseInt(parts[1], 10);
        const category = parts[2];
        const createdAtStr = parts[3];
        const descriptionRaw = parts[4];
        const imageUrlsRaw = parts[5];
        const name = parts[6];
        const price = parseInt(parts[7], 10);
        const stock = parseInt(parts[8], 10);
        const updatedAtStr = parts[9];

        if (isNaN(id) || !name) continue;

        let imageUrls = [];
        try {
            imageUrls = JSON.parse(imageUrlsRaw);
        } catch {
            imageUrls = ['https://files.catbox.moe/z44d2s.png'];
        }

        // Clean up description <br /> tags
        const description = descriptionRaw.replace(/<br\s*\/?>/gi, '\n');

        productsToInsert.push({
            id,
            name,
            description,
            price: isNaN(price) ? 100000 : price,
            stock: isNaN(stock) ? 10 : stock,
            category: category || 'General',
            imageUrls: Array.isArray(imageUrls) && imageUrls.length > 0 ? imageUrls : ['https://files.catbox.moe/z44d2s.png'],
            createdAt: createdAtStr ? new Date(createdAtStr) : new Date(),
            updatedAt: updatedAtStr ? new Date(updatedAtStr) : new Date(),
        });
    }

    console.log(`Parsed ${productsToInsert.length} products from public-Product-selection.md!`);

    // Upsert admin user
    await prisma.user.upsert({
        where: { email: 'admin@tapakpamungkas.com' },
        update: {},
        create: {
            name: 'Admin Pamungkas',
            email: 'admin@tapakpamungkas.com',
            password: 'admin123',
            isAdmin: true,
        },
    });
    console.log('✅ Admin user ready');

    // Upsert all products
    let count = 0;
    for (const prod of productsToInsert) {
        await prisma.product.upsert({
            where: { id: prod.id },
            update: prod,
            create: prod,
        });
        count++;
    }

    console.log(`🎉 Successfully seeded ${count} original products into Prisma PostgreSQL database!`);
}

main()
    .catch(err => {
        console.error('Seeding error:', err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
