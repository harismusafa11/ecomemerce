import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

// Create Prisma client instance
const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('[VOUCHERS] Starting query...');
        console.log('[VOUCHERS] DATABASE_URL exists:', !!process.env.DATABASE_URL);

        // Ultra-simple query with explicit select
        const vouchers = await prisma.voucher.findMany({
            select: {
                id: true,
                code: true,
                discountPercentage: true,
                startDate: true,
                endDate: true,
                productId: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log('[VOUCHERS] Found:', vouchers.length, 'vouchers');

        return res.status(200).json(vouchers);
    } catch (error) {
        console.error('[VOUCHERS] Error:', error);

        return res.status(500).json({
            error: 'Failed to fetch vouchers',
            message: error instanceof Error ? error.message : String(error),
            type: error instanceof Error ? error.constructor.name : typeof error
        });
    } finally {
        await prisma.$disconnect();
    }
}
