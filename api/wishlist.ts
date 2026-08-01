import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { setSecurityHeaders, safeErrorResponse } from '../lib/security';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setSecurityHeaders(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const userId = req.query.userId ? Number(req.query.userId) : null;

    try {
        // GET /api/wishlist?userId=X - Get user's wishlist
        if (req.method === 'GET') {
            if (!userId || isNaN(userId)) {
                return safeErrorResponse(res, 400, 'userId valid wajib diisi');
            }

            const wishlistItems = await prisma.wishlist.findMany({
                where: { userId },
                select: {
                    id: true,
                    userId: true,
                    productId: true,
                    createdAt: true,
                    product: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            price: true,
                            stock: true,
                            category: true,
                            imageUrls: true
                        }
                    }
                }
            });

            return res.status(200).json(wishlistItems);
        }

        // POST /api/wishlist - Add item to wishlist
        if (req.method === 'POST') {
            const { userId: bodyUserId, productId } = req.body || {};

            const numUserId = Number(bodyUserId);
            const numProductId = Number(productId);

            if (!numUserId || isNaN(numUserId) || !numProductId || isNaN(numProductId)) {
                return safeErrorResponse(res, 400, 'userId dan productId wajib diisi');
            }

            const wishlistItem = await prisma.wishlist.upsert({
                where: {
                    userId_productId: {
                        userId: numUserId,
                        productId: numProductId,
                    },
                },
                update: {},
                create: {
                    userId: numUserId,
                    productId: numProductId,
                },
                select: {
                    id: true,
                    userId: true,
                    productId: true,
                    createdAt: true
                }
            });

            return res.status(200).json(wishlistItem);
        }

        // DELETE /api/wishlist?userId=X&productId=Y - Remove item
        if (req.method === 'DELETE') {
            const numProductId = req.query.productId ? Number(req.query.productId) : null;

            if (!userId || isNaN(userId) || !numProductId || isNaN(numProductId)) {
                return safeErrorResponse(res, 400, 'userId dan productId wajib diisi');
            }

            await prisma.wishlist.deleteMany({
                where: {
                    userId: userId,
                    productId: numProductId,
                },
            });

            return res.status(200).json({ message: 'Item berhasil dihapus dari wishlist' });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        return safeErrorResponse(res, 500, 'Gagal memproses wishlist', error);
    } finally {
        await prisma.$disconnect();
    }
}
