import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { setSecurityHeaders, safeErrorResponse } from '../lib/security';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setSecurityHeaders(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // POST /api/orders - Create new order
        if (req.method === 'POST') {
            const { userId, items, total } = req.body || {};

            if (!userId || !items || !Array.isArray(items) || items.length === 0 || total === undefined) {
                return safeErrorResponse(res, 400, 'userId, items (minimal 1 item), dan total wajib diisi');
            }

            const numUserId = Number(userId);
            const numTotal = Number(total);

            if (isNaN(numUserId) || isNaN(numTotal) || numTotal < 0) {
                return safeErrorResponse(res, 400, 'Data userId dan total tidak valid');
            }

            // Validate order items payload
            const validatedItems = items.map((item: any) => {
                const pId = Number(item.productId || item.id);
                const qty = Math.max(1, Number(item.quantity) || 1);
                const price = Math.max(0, Number(item.price) || 0);

                if (isNaN(pId)) {
                    throw new Error('ID produk tidak valid dalam pesanan');
                }

                return {
                    productId: pId,
                    quantity: qty,
                    price: price
                };
            });

            // Create order with items
            const order = await prisma.order.create({
                data: {
                    userId: numUserId,
                    total: numTotal,
                    status: 'Pending Payment',
                    items: {
                        create: validatedItems,
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

            // Clear user's cart after successful order
            try {
                const cart = await prisma.cart.findUnique({ where: { userId: numUserId } });
                if (cart) {
                    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
                }
            } catch (err) {
                console.error('[ORDERS] Remote cart clear error:', err);
            }

            return res.status(201).json(order);
        }

        // GET /api/orders - Get orders (for user or all)
        if (req.method === 'GET') {
            const userId = req.query.userId ? Number(req.query.userId) : null;

            if (userId && !isNaN(userId)) {
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
                                        imageUrls: true,
                                        category: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                });
                return res.status(200).json(orders);
            }

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
                                    name: true,
                                    imageUrls: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            return res.status(200).json(orders);
        }

        // PUT /api/orders?id=X - Update order status
        if (req.method === 'PUT') {
            const orderId = req.query.id ? Number(req.query.id) : null;
            const { status, trackingNumber } = req.body || {};

            if (!orderId || isNaN(orderId)) {
                return safeErrorResponse(res, 400, 'ID Pesanan wajib diisi');
            }

            const updatedOrder = await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: status ? String(status).trim() : undefined,
                    trackingNumber: trackingNumber !== undefined ? String(trackingNumber).trim() : undefined,
                },
            });

            return res.status(200).json(updatedOrder);
        }

        return res.status(405).json({ error: 'Method not allowed' });

    } catch (error) {
        return safeErrorResponse(res, 500, 'Gagal memproses data pesanan', error);
    } finally {
        await prisma.$disconnect();
    }
}
