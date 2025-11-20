import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userId, code } = req.body;

        console.log('[VOUCHER-VALIDATE] Validating voucher:', code, 'for user:', userId);

        if (!userId || !code) {
            return res.status(400).json({ error: 'userId and code required' });
        }

        // Find voucher by code
        const voucher = await prisma.voucher.findFirst({
            where: { code },
            select: {
                id: true,
                code: true,
                discountPercentage: true,
                startDate: true,
                endDate: true,
                productId: true,
            }
        });

        if (!voucher) {
            console.log('[VOUCHER-VALIDATE] Voucher not found');
            return res.status(404).json({ error: 'Voucher not found' });
        }

        // Check if voucher is valid (date range)
        const now = new Date();
        if (now < new Date(voucher.startDate) || now > new Date(voucher.endDate)) {
            console.log('[VOUCHER-VALIDATE] Voucher expired or not yet valid');
            return res.status(400).json({ error: 'Voucher is expired or not yet valid' });
        }

        console.log('[VOUCHER-VALIDATE] Voucher valid:', voucher.code);
        return res.status(200).json(voucher);

    } catch (error) {
        console.error('[VOUCHER-VALIDATE] Error:', error);

        return res.status(500).json({
            error: 'Voucher validation failed',
            message: error instanceof Error ? error.message : String(error),
            type: error instanceof Error ? error.constructor.name : typeof error
        });
    } finally {
        await prisma.$disconnect();
    }
}
