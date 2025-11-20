import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // GET /api/vouchers - Get all vouchers
        if (req.method === 'GET') {
            console.log('[VOUCHERS] Fetching all vouchers');

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
        }

        // POST /api/vouchers - Create new voucher
        if (req.method === 'POST') {
            const { code, discountPercentage, startDate, endDate, productId } = req.body;

            console.log('[VOUCHERS] Creating voucher:', code);

            if (!code || !discountPercentage || !startDate || !endDate) {
                return res.status(400).json({ error: 'code, discountPercentage, startDate, and endDate required' });
            }

            const voucher = await prisma.voucher.create({
                data: {
                    code,
                    discountPercentage: Number(discountPercentage),
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    productId: productId || null,
                },
                select: {
                    id: true,
                    code: true,
                    discountPercentage: true,
                    startDate: true,
                    endDate: true,
                    productId: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            console.log('[VOUCHERS] Voucher created:', voucher.id);
            return res.status(201).json(voucher);
        }

        // PUT /api/vouchers?id=X - Update voucher
        if (req.method === 'PUT') {
            const voucherId = req.query.id ? Number(req.query.id) : null;
            const { code, discountPercentage, startDate, endDate, productId } = req.body;

            if (!voucherId) {
                return res.status(400).json({ error: 'Voucher ID required' });
            }

            console.log('[VOUCHERS] Updating voucher:', voucherId);

            const voucher = await prisma.voucher.update({
                where: { id: voucherId },
                data: {
                    code: code || undefined,
                    discountPercentage: discountPercentage ? Number(discountPercentage) : undefined,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                    productId: productId !== undefined ? productId : undefined,
                },
                select: {
                    id: true,
                    code: true,
                    discountPercentage: true,
                    startDate: true,
                    endDate: true,
                    productId: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            console.log('[VOUCHERS] Voucher updated:', voucher.id);
            return res.status(200).json(voucher);
        }

        // DELETE /api/vouchers?id=X - Delete voucher
        if (req.method === 'DELETE') {
            const voucherId = req.query.id ? Number(req.query.id) : null;

            if (!voucherId) {
                return res.status(400).json({ error: 'Voucher ID required' });
            }

            console.log('[VOUCHERS] Deleting voucher:', voucherId);

            await prisma.voucher.delete({
                where: { id: voucherId }
            });

            console.log('[VOUCHERS] Voucher deleted:', voucherId);
            return res.status(200).json({ message: 'Voucher deleted successfully' });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('[VOUCHERS] Error:', error);

        return res.status(500).json({
            error: 'Voucher operation failed',
            message: error instanceof Error ? error.message : String(error),
            type: error instanceof Error ? error.constructor.name : typeof error
        });
    } finally {
        await prisma.$disconnect();
    }
}
