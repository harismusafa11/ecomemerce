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
        // GET /api/wishlist?userId=X - Get user's wishlist items
        if (req.method === 'GET') {
            if (!userId || isNaN(userId)) {
                return safeErrorResponse(res, 400, 'userId valid wajib diisi');
            }

            const wishlist = await prisma.wishlist.findUnique({
                where: { userId },
                include: {
                    items: {
                        include: {
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
                    }
                }
            });

            return res.status(200).json(wishlist ? wishlist.items : []);
        }

        // POST /api/wishlist - Add item to wishlist
        if (req.method === 'POST') {
            const { userId: bodyUserId, productId } = req.body || {};

            const numUserId = Number(bodyUserId);
            const numProductId = Number(productId);

            if (!numUserId || isNaN(numUserId) || !numProductId || isNaN(numProductId)) {
                return safeErrorResponse(res, 400, 'userId dan productId wajib diisi');
            }

            let wishlist = await prisma.wishlist.findUnique({ where: { userId: numUserId } });
            if (!wishlist) {
                wishlist = await prisma.wishlist.create({ data: { userId: numUserId } });
            }

            const wishlistItem = await prisma.wishlistItem.upsert({
                where: {
                    wishlistId_productId: {
                        wishlistId: wishlist.id,
                        productId: numProductId,
                    },
                },
                update: {},
                create: {
                    wishlistId: wishlist.id,
                    productId: numProductId,
                },
                include: {
                    product: {
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            imageUrls: true
                        }
                    }
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

            const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
            if (wishlist) {
                await prisma.wishlistItem.deleteMany({
                    where: {
                        wishlistId: wishlist.id,
                        productId: numProductId,
                    },
                });
            }

            return res.status(200).json({ message: 'Item berhasil dihapus dari wishlist' });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        return safeErrorResponse(res, 500, 'Gagal memproses data wishlist', error);
    } finally {
        await prisma.$disconnect();
    }
}
