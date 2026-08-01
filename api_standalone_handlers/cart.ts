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
        // GET /api/cart?userId=X - Get user's cart
        if (req.method === 'GET') {
            if (!userId || isNaN(userId)) {
                return safeErrorResponse(res, 400, 'userId valid wajib diisi');
            }

            const cart = await prisma.cart.findUnique({
                where: { userId }
            });

            if (!cart) {
                return res.status(200).json([]);
            }

            const cartItems = await prisma.cartItem.findMany({
                where: { cartId: cart.id },
                select: {
                    id: true,
                    cartId: true,
                    productId: true,
                    quantity: true,
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

            return res.status(200).json(cartItems);
        }

        // POST /api/cart - Add item to cart
        if (req.method === 'POST') {
            const { userId: bodyUserId, productId, quantity } = req.body || {};

            const numUserId = Number(bodyUserId);
            const numProductId = Number(productId);
            const numQty = Math.max(1, Number(quantity) || 1);

            if (!numUserId || isNaN(numUserId) || !numProductId || isNaN(numProductId)) {
                return safeErrorResponse(res, 400, 'userId dan productId wajib diisi dengan benar');
            }

            let cart = await prisma.cart.findUnique({ where: { userId: numUserId } });
            if (!cart) {
                cart = await prisma.cart.create({ data: { userId: numUserId } });
            }

            const cartItem = await prisma.cartItem.upsert({
                where: {
                    cartId_productId: {
                        cartId: cart.id,
                        productId: numProductId,
                    },
                },
                update: {
                    quantity: { increment: numQty },
                },
                create: {
                    cartId: cart.id,
                    productId: numProductId,
                    quantity: numQty,
                },
                select: {
                    id: true,
                    cartId: true,
                    productId: true,
                    quantity: true,
                    createdAt: true,
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

            return res.status(200).json(cartItem);
        }

        // DELETE /api/cart?userId=X&productId=Y - Remove item or clear cart
        if (req.method === 'DELETE') {
            if (!userId || isNaN(userId)) {
                return safeErrorResponse(res, 400, 'userId valid wajib diisi');
            }

            const cart = await prisma.cart.findUnique({ where: { userId } });
            if (!cart) {
                return res.status(200).json({ message: 'Cart already empty' });
            }

            const productId = req.query.productId ? Number(req.query.productId) : null;

            if (productId && !isNaN(productId)) {
                await prisma.cartItem.deleteMany({
                    where: {
                        cartId: cart.id,
                        productId: productId,
                    },
                });
                return res.status(200).json({ message: 'Item berhasil dihapus dari keranjang' });
            }

            // Clear all items in cart
            await prisma.cartItem.deleteMany({
                where: { cartId: cart.id }
            });

            return res.status(200).json({ message: 'Keranjang berhasil dikosongkan' });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        return safeErrorResponse(res, 500, 'Gagal memproses keranjang', error);
    } finally {
        await prisma.$disconnect();
    }
}
