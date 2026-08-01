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
            const {
                userId,
                items,
                total,
                shippingCost,
                shippingCourier,
                province,
                city,
                district,
                village,
                fullAddress
            } = req.body || {};

            const numUserId = Number(userId);
            const numTotal = Number(total);

            if (!numUserId || isNaN(numUserId) || !items || !Array.isArray(items) || items.length === 0) {
                return safeErrorResponse(res, 400, 'Data pesanan tidak lengkap atau invalid');
            }

            const order = await prisma.order.create({
                data: {
                    userId: numUserId,
                    total: numTotal,
                    shippingCost: Number(shippingCost || 0),
                    shippingCourier: shippingCourier ? String(shippingCourier) : undefined,
                    province: province ? String(province) : undefined,
                    city: city ? String(city) : undefined,
                    district: district ? String(district) : undefined,
                    village: village ? String(village) : undefined,
                    fullAddress: fullAddress ? String(fullAddress) : undefined,
                    status: 'Pending Payment',
                    items: {
                        create: items.map((item: any) => ({
                            productId: Number(item.id || item.productId),
                            quantity: Number(item.quantity),
                            price: Number(item.price),
                        })),
                    },
                },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    imageUrls: true,
                                    price: true
                                }
                            }
                        }
                    }
                }
            });

            return res.status(201).json(order);
        }

        // GET /api/orders?userId=X - Get user orders or all orders (admin)
        if (req.method === 'GET') {
            const userId = req.query.userId ? Number(req.query.userId) : null;

            const whereClause = userId && !isNaN(userId) ? { userId } : {};

            const orders = await prisma.order.findMany({
                where: whereClause,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    imageUrls: true,
                                    price: true
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
            const orderId = req.query.id ? String(req.query.id).trim() : (req.body?.id ? String(req.body.id).trim() : null);
            const { status, trackingNumber } = req.body || {};

            if (!orderId) {
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
