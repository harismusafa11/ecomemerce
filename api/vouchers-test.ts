import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        console.log('Starting voucher query...');

        // Try simplest possible query
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
                // Explicitly exclude claimedBy relation
            }
        });

        console.log('Vouchers found:', vouchers.length);

        return res.status(200).json(vouchers);
    } catch (error) {
        console.error('Voucher query error:', error);
        return res.status(500).json({
            error: 'Failed to fetch vouchers',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
    } finally {
        await prisma.$disconnect();
    }
}
