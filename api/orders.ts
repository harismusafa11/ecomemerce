import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // POST /api/orders - Create new order
        if (req.method === 'POST') {
            const { userId, items, total } = req.body;

            console.log('[ORDERS] Creating order - User:', userId, 'Items:', items?.length, 'Total:', total);

            if (!userId || !items || !total) {
                return res.status(400).json({ error: 'userId, items, and total required' });
            }

            // Create order with items
            const order = await prisma.order.create({
                data: {
                    userId,
                    total,
                    status: 'Pending Payment',
                    items: {
                        create: items.map((item: any) => ({
                            productId: item.id || item.productId,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                    },
                },
                select: {
                    id: true,
                    userId: true,
                    total: true,
                    status: true,
                    trackingNumber: true,
                    createdAt: true,
                    updatedAt: true,
                    items: {
                        select: {
                            id: true,
                            productId: true,
                            quantity: true,
                            price: true,
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    imageUrls: true
                                }
                            }
                        }
                    }
                }
            });

            console.log('[ORDERS] Order created:', order.id);

            // Clear user's cart after successful order
            try {
                const cart = await prisma.cart.findUnique({ where: { userId } });
                if (cart) {
                    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
                    console.log('[ORDERS] Cart cleared for user:', userId);
                }
            } catch (err) {
                console.error('[ORDERS] Failed to clear cart:', err);
                // Don't fail the order if cart clear fails
            }

            return res.status(201).json(order);
        }

        // GET /api/orders?userId=X - Get user's orders
        if (req.method === 'GET') {
            const userId = req.query.userId ? Number(req.query.userId) : null;

            if (userId) {
                console.log('[ORDERS] Fetching orders for user:', userId);

                const orders = await prisma.order.findMany({
                    where: { userId },
                    select: {
                        id: true,
                        userId: true,
                        total: true,
                        status: true,
                        trackingNumber: true,
                        createdAt: true,
                        updatedAt: true,
                        items: {
                            select: {
                                id: true,
                                productId: true,
                                quantity: true,
                                price: true,
                                product: {
                                    select: {
                                        id: true,
                                        name: true,
                                        imageUrls: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                });

                console.log('[ORDERS] Found', orders.length, 'orders');
                return res.status(200).json(orders);
            } else {
                // Get all orders (for admin)
                console.log('[ORDERS] Fetching all orders');

                const orders = await prisma.order.findMany({
                    select: {
                        id: true,
                        userId: true,
                        total: true,
                        status: true,
                        trackingNumber: true,
                        createdAt: true,
                        updatedAt: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        },
                        items: {
                            select: {
                                id: true,
                                productId: true,
                                quantity: true,
                                price: true,
                                product: {
                                    select: {
                                        id: true,
                                        name: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' },
                });

                console.log('[ORDERS] Found', orders.length, 'total orders');
                return res.status(200).json(orders);
            }
        }

        // PUT /api/orders?id=X - Update order status
        if (req.method === 'PUT') {
            const orderId = req.query.id ? String(req.query.id) : null;
            const { status, trackingNumber } = req.body;

            if (!orderId) {
                return res.status(400).json({ error: 'Order ID required' });
            }

            console.log('[ORDERS] Updating order:', orderId, 'Status:', status);

            const order = await prisma.order.update({
                where: { id: Number(orderId) },
                data: {
                    status: status || undefined,
                    trackingNumber: trackingNumber || undefined,
                },
                select: {
                    id: true,
                    status: true,
                    trackingNumber: true,
                    updatedAt: true
                }
            });

            console.log('[ORDERS] Order updated:', order.id);
            return res.status(200).json(order);
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        console.error('[ORDERS] Error:', error);

        return res.status(500).json({
            error: 'Order operation failed',
            message: error instanceof Error ? error.message : String(error),
            type: error instanceof Error ? error.constructor.name : typeof error
        });
    } finally {
        await prisma.$disconnect();
    }
}
