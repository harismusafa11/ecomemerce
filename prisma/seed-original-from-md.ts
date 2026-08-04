import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Cleaning out test products 1-8 and seeding authentic products 9-50...');

    // Delete test fallback products 1-8
    await prisma.product.deleteMany({
        where: {
            id: { in: [1, 2, 3, 4, 5, 6, 7, 8] }
        }
    }).catch(() => {});

    const filePath = path.join(process.cwd(), 'public-Product-selection.md');
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    const productsToInsert = [];

    for (let i = 2; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || !line.startsWith('|')) continue;

        const parts = line.split('|').map(p => p.trim());
        if (parts.length < 10) continue;

        const id = parseInt(parts[1], 10);
        
        // Skip IDs 1-8 as requested by user to only keep authentic database catalog
        if (isNaN(id) || id <= 8) continue;

        const category = parts[2];
        const createdAtStr = parts[3];
        const descriptionRaw = parts[4];
        const imageUrlsRaw = parts[5];
        const name = parts[6];
        const price = parseInt(parts[7], 10);
        const stock = parseInt(parts[8], 10);
        const updatedAtStr = parts[9];

        if (!name) continue;

        let imageUrls = [];
        try {
            imageUrls = JSON.parse(imageUrlsRaw);
        } catch {
            imageUrls = [];
        }

        const description = descriptionRaw.replace(/<br\s*\/?>/gi, '\n');

        productsToInsert.push({
            id,
            name,
            description,
            price: isNaN(price) ? 100000 : price,
            stock: isNaN(stock) ? 10 : stock,
            category: category || 'Keilmuan',
            imageUrls: Array.isArray(imageUrls) && imageUrls.length > 0 ? imageUrls : [],
            createdAt: createdAtStr ? new Date(createdAtStr) : new Date(),
            updatedAt: updatedAtStr ? new Date(updatedAtStr) : new Date(),
        });
    }

    console.log(`Parsed ${productsToInsert.length} authentic products (IDs 9-50)!`);

    // Upsert all authentic products
    let count = 0;
    for (const prod of productsToInsert) {
        await prisma.product.upsert({
            where: { id: prod.id },
            update: prod,
            create: prod,
        });
        count++;
    }

    console.log(`🎉 Successfully seeded ${count} authentic products into database!`);
}

main()
    .catch(err => {
        console.error('Seeding error:', err);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
