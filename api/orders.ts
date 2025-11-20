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
            const orders = await prisma.order.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    },
                    items: {
                        include: { product: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
            });
            return res.status(200).json(orders);
        }

        if (req.method === 'POST') {
            const { userId, items, total } = req.body;

            if (!userId || !items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ error: 'Invalid order data' });
            }

            const order = await prisma.order.create({
                data: {
                    userId: Number(userId),
                    total: Number(total),
                    status: 'Pending Payment',
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.id,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                    },
                },
                include: { items: { include: { product: true } } },
            });

            return res.status(201).json(order);
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Error in orders API:', error);
        res.status(500).json({
            error: 'Failed to process order',
            details: error instanceof Error ? error.message : String(error)
        });
    } finally {
        await prisma.$disconnect();
    }
}
