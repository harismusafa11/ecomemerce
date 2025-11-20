import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const userId = req.query.userId ? Number(req.query.userId) : null;

    try {
        // GET /api/wishlist?userId=X - Get user's wishlist
        if (req.method === 'GET' && userId) {
            console.log('[WISHLIST] Fetching for user:', userId);

            const wishlist = await prisma.wishlist.findUnique({
                where: { userId }
            });

            if (!wishlist) {
                console.log('[WISHLIST] No wishlist found for user:', userId);
                return res.status(200).json([]);
            }

            // Get wishlist items with product info
            const wishlistItems = await prisma.wishlistItem.findMany({
                where: { wishlistId: wishlist.id },
                select: {
                    id: true,
                    wishlistId: true,
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
                            imageUrls: true,
                            createdAt: true,
                            updatedAt: true
                        }
                    }
                }
            });

            console.log('[WISHLIST] Found', wishlistItems.length, 'items');
            return res.status(200).json(wishlistItems);
        }

        // POST /api/wishlist - Add item to wishlist
        if (req.method === 'POST') {
            const { userId, productId } = req.body;

            console.log('[WISHLIST] Adding - User:', userId, 'Product:', productId);

            if (!userId || !productId) {
                return res.status(400).json({ error: 'userId and productId required' });
            }

            // Ensure wishlist exists
            let wishlist = await prisma.wishlist.findUnique({ where: { userId } });
            if (!wishlist) {
                wishlist = await prisma.wishlist.create({ data: { userId } });
                console.log('[WISHLIST] Created new wishlist:', wishlist.id);
            }

            // Add item to wishlist (ignore if already exists)
            const wishlistItem = await prisma.wishlistItem.upsert({
                where: {
                    wishlistId_productId: {
                        wishlistId: wishlist.id,
                        productId: productId,
                    },
                },
                update: {},
                create: {
                    wishlistId: wishlist.id,
                    productId: productId,
                },
                select: {
                    id: true,
                    wishlistId: true,
                    productId: true,
                    createdAt: true
                }
            });

            console.log('[WISHLIST] Item added:', wishlistItem.id);
            return res.status(200).json(wishlistItem);
        }

        // DELETE /api/wishlist?userId=X&productId=Y - Remove item
        if (req.method === 'DELETE' && userId) {
            const productId = req.query.productId ? Number(req.query.productId) : null;

            if (!productId) {
                return res.status(400).json({ error: 'productId required' });
            }

            console.log('[WISHLIST] Removing - User:', userId, 'Product:', productId);

            const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
            if (!wishlist) {
                return res.status(404).json({ error: 'Wishlist not found' });
            }

            await prisma.wishlistItem.delete({
                where: {
                    wishlistId_productId: {
                        wishlistId: wishlist.id,
                        productId: productId,
                    },
                },
            });

            console.log('[WISHLIST] Item removed');
            return res.status(200).json({ message: 'Item removed from wishlist' });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('[WISHLIST] Error:', error);

        return res.status(500).json({
            error: 'Wishlist operation failed',
            message: error instanceof Error ? error.message : String(error),
            type: error instanceof Error ? error.constructor.name : typeof error
        });
    } finally {
        await prisma.$disconnect();
    }
}
