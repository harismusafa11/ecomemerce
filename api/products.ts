import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'GET') {
            const products = await prisma.product.findMany({
                orderBy: { createdAt: 'desc' }
            });
            return res.status(200).json(products);
        }

        if (req.method === 'POST') {
            const { name, description, price, imageUrls, category, stock } = req.body;

            const product = await prisma.product.create({
                data: {
                    name,
                    description,
                    price: Number(price),
                    imageUrls,
                    category,
                    stock: Number(stock),
                },
            });

            return res.status(201).json(product);
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Error in products API:', error);
        res.status(500).json({
            error: 'Failed to process request',
            details: error instanceof Error ? error.message : String(error)
        });
    } finally {
        await prisma.$disconnect();
    }
}
