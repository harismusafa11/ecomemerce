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
        // GET /api/cart?userId=X - Get user's cart
        if (req.method === 'GET' && userId) {
            console.log('[CART] Fetching cart for user:', userId);

            const cart = await prisma.cart.findUnique({
                where: { userId }
            });

            if (!cart) {
                console.log('[CART] No cart found for user:', userId);
                return res.status(200).json([]);
            }

            // Get cart items with product info
            const cartItems = await prisma.cartItem.findMany({
                where: { cartId: cart.id },
                select: {
                    id: true,
                    cartId: true,
                    productId: true,
                    quantity: true,
                    createdAt: true,
                    // Get product data separately
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

            console.log('[CART] Found', cartItems.length, 'items');
            return res.status(200).json(cartItems);
        }

        // POST /api/cart - Add item to cart
        if (req.method === 'POST') {
            const { userId, productId, quantity } = req.body;

            console.log('[CART] Adding to cart - User:', userId, 'Product:', productId, 'Qty:', quantity);

            if (!userId || !productId || !quantity) {
                return res.status(400).json({ error: 'userId, productId, and quantity required' });
            }

            // Ensure cart exists
            let cart = await prisma.cart.findUnique({ where: { userId } });
            if (!cart) {
                cart = await prisma.cart.create({ data: { userId } });
                console.log('[CART] Created new cart:', cart.id);
            }

            // Upsert cart item
            const cartItem = await prisma.cartItem.upsert({
                where: {
                    cartId_productId: {
                        cartId: cart.id,
                        productId: productId,
                    },
                },
                update: {
                    quantity: { increment: quantity },
                },
                create: {
                    cartId: cart.id,
                    productId: productId,
                    quantity: quantity,
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

            console.log('[CART] Item added/updated:', cartItem.id);
            return res.status(200).json(cartItem);
        }

        // DELETE /api/cart?userId=X&productId=Y - Remove item
        if (req.method === 'DELETE' && userId) {
            const productId = req.query.productId ? Number(req.query.productId) : null;

            if (!productId) {
                return res.status(400).json({ error: 'productId required' });
            }

            console.log('[CART] Removing from cart - User:', userId, 'Product:', productId);

            const cart = await prisma.cart.findUnique({ where: { userId } });
            if (!cart) {
                return res.status(404).json({ error: 'Cart not found' });
            }

            await prisma.cartItem.delete({
                where: {
                    cartId_productId: {
                        cartId: cart.id,
                        productId: productId,
                    },
                },
            });

            console.log('[CART] Item removed');
            return res.status(200).json({ message: 'Item removed from cart' });
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('[CART] Error:', error);

        return res.status(500).json({
            error: 'Cart operation failed',
            message: error instanceof Error ? error.message : String(error),
            type: error instanceof Error ? error.constructor.name : typeof error
        });
    } finally {
        await prisma.$disconnect();
    }
}
