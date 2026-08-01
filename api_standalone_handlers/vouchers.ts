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
            const vouchers = await prisma.voucher.findMany({
                select: {
                    id: true,
                    code: true,
                    discountPercentage: true,
                    startDate: true,
                    endDate: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return res.status(200).json(vouchers);
        }

        // POST /api/vouchers - Create new voucher
        if (req.method === 'POST') {
            const { code, discountPercentage, startDate, endDate } = req.body || {};

            if (!code || !discountPercentage || !startDate || !endDate) {
                return res.status(400).json({ error: 'code, discountPercentage, startDate, and endDate required' });
            }

            const voucher = await prisma.voucher.create({
                data: {
                    code: String(code).trim().toUpperCase(),
                    discountPercentage: Number(discountPercentage),
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                },
                select: {
                    id: true,
                    code: true,
                    discountPercentage: true,
                    startDate: true,
                    endDate: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            return res.status(201).json(voucher);
        }

        // PUT /api/vouchers?id=X - Update voucher
        if (req.method === 'PUT') {
            const voucherId = req.query.id ? Number(req.query.id) : (req.body?.id ? Number(req.body.id) : null);
            const { code, discountPercentage, startDate, endDate } = req.body || {};

            if (!voucherId || isNaN(voucherId)) {
                return res.status(400).json({ error: 'Voucher ID required' });
            }

            const voucher = await prisma.voucher.update({
                where: { id: voucherId },
                data: {
                    code: code ? String(code).trim().toUpperCase() : undefined,
                    discountPercentage: discountPercentage ? Number(discountPercentage) : undefined,
                    startDate: startDate ? new Date(startDate) : undefined,
                    endDate: endDate ? new Date(endDate) : undefined,
                },
                select: {
                    id: true,
                    code: true,
                    discountPercentage: true,
                    startDate: true,
                    endDate: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            return res.status(200).json(voucher);
        }

        // DELETE /api/vouchers?id=X - Delete voucher
        if (req.method === 'DELETE') {
            const voucherId = req.query.id ? Number(req.query.id) : null;

            if (!voucherId || isNaN(voucherId)) {
                return res.status(400).json({ error: 'Voucher ID required' });
            }

            await prisma.voucher.delete({
                where: { id: voucherId }
            });

            return res.status(200).json({ message: 'Voucher deleted successfully' });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('[VOUCHERS ERROR]', error);
        return res.status(500).json({ error: 'Internal server error', details: String(error) });
    } finally {
        await prisma.$disconnect();
    }
}
