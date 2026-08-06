import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { setSecurityHeaders, verifyAuthToken, getTokenFromCookie, safeErrorResponse, sanitizeInput } from '../lib/security';

const prisma = new PrismaClient();

async function authenticate(req: VercelRequest, res: VercelResponse) {
  const cookieToken = getTokenFromCookie(req.headers.cookie);
  const header = req.headers.authorization || '';
  const bearerToken = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const token = cookieToken || bearerToken;
  const payload = token ? verifyAuthToken(token) : null;
  if (!payload) return null;
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  return user || null;
}

function ownsOrAdmin(user: any, targetUserId: unknown): boolean {
  if (!user) return false;
  if (user.isAdmin) return true;
  return user.id === Number(targetUserId);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setSecurityHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      const user = await authenticate(req, res);
      if (!user) return safeErrorResponse(res, 401, 'Unauthorized - silakan masuk kembali');

      const { userId, items, total, shippingCost, shippingCourier, province, city, district, village, fullAddress } = req.body || {};

      if (!ownsOrAdmin(user, userId)) {
        return safeErrorResponse(res, 403, 'Forbidden');
      }

      const numUserId = Number(user.id);
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
          province: province ? sanitizeInput(String(province), 100) : undefined,
          city: city ? sanitizeInput(String(city), 100) : undefined,
          district: district ? sanitizeInput(String(district), 100) : undefined,
          village: village ? sanitizeInput(String(village), 100) : undefined,
          fullAddress: fullAddress ? sanitizeInput(String(fullAddress), 500) : undefined,
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
                select: { id: true, name: true, imageUrls: true, price: true }
              }
            }
          }
        }
      });

      return res.status(201).json(order);
    }

    if (req.method === 'GET') {
      const user = await authenticate(req, res);
      const queryUserId = req.query.userId ? Number(req.query.userId) : null;

      if (queryUserId && !isNaN(queryUserId)) {
        if (!user) return safeErrorResponse(res, 401, 'Unauthorized');
        if (!ownsOrAdmin(user, queryUserId)) {
          return safeErrorResponse(res, 403, 'Forbidden');
        }
        const orders = await prisma.order.findMany({
          where: { userId: queryUserId },
          include: { items: { include: { product: { select: { id: true, name: true, imageUrls: true, price: true } } } } },
          orderBy: { createdAt: 'desc' },
        });
        return res.status(200).json(orders);
      }

      if (!user || !user.isAdmin) {
        return safeErrorResponse(res, 403, 'Forbidden - hanya admin');
      }

      const orders = await prisma.order.findMany({
        include: { user: { select: { id: true, name: true, email: true } }, items: { include: { product: { select: { id: true, name: true, imageUrls: true, price: true } } } } },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(orders);
    }

    if (req.method === 'PUT') {
      const user = await authenticate(req, res);
      if (!user || !user.isAdmin) {
        return safeErrorResponse(res, 403, 'Forbidden - hanya admin');
      }

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
