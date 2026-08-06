import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { setSecurityHeaders, verifyAuthToken, getTokenFromCookie, safeErrorResponse } from '../lib/security';

const prisma = new PrismaClient();

async function authenticate(req: VercelRequest) {
  const cookieToken = getTokenFromCookie(req.headers.cookie);
  const header = req.headers.authorization || '';
  const bearerToken = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  const token = cookieToken || bearerToken;
  const payload = token ? verifyAuthToken(token) : null;
  if (!payload) return null;
  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  return user || null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setSecurityHeaders(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const user = await authenticate(req);
      if (!user) return safeErrorResponse(res, 401, 'Unauthorized');

      const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
      if (!cart) return res.status(200).json([]);

      const cartItems = await prisma.cartItem.findMany({
        where: { cartId: cart.id },
        select: {
          id: true, cartId: true, productId: true, quantity: true, createdAt: true,
          product: { select: { id: true, name: true, description: true, price: true, stock: true, category: true, imageUrls: true, createdAt: true, updatedAt: true } }
        }
      });
      return res.status(200).json(cartItems);
    }

    if (req.method === 'POST') {
      const user = await authenticate(req);
      if (!user) return safeErrorResponse(res, 401, 'Unauthorized');

      const { productId, quantity } = req.body || {};
      const numProductId = Number(productId);
      const numQty = Math.max(1, Number(quantity) || 1);

      if (!numProductId || isNaN(numProductId)) {
        return safeErrorResponse(res, 400, 'productId wajib diisi dengan benar');
      }

      let cart = await prisma.cart.findUnique({ where: { userId: user.id } });
      if (!cart) cart = await prisma.cart.create({ data: { userId: user.id } });

      const cartItem = await prisma.cartItem.upsert({
        where: { cartId_productId: { cartId: cart.id, productId: numProductId } },
        update: { quantity: { increment: numQty } },
        create: { cartId: cart.id, productId: numProductId, quantity: numQty },
        select: { id: true, cartId: true, productId: true, quantity: true, createdAt: true, product: { select: { id: true, name: true, price: true, imageUrls: true } } }
      });
      return res.status(200).json(cartItem);
    }

    if (req.method === 'DELETE') {
      const user = await authenticate(req);
      if (!user) return safeErrorResponse(res, 401, 'Unauthorized');

      const cart = await prisma.cart.findUnique({ where: { userId: user.id } });
      if (!cart) return res.status(200).json({ message: 'Keranjang kosong' });

      const productId = req.query.productId ? Number(req.query.productId) : null;

      if (productId && !isNaN(productId)) {
        await prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
        return res.status(200).json({ message: 'Item berhasil dihapus dari keranjang' });
      }

      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      return res.status(200).json({ message: 'Keranjang berhasil dikosongkan' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    return safeErrorResponse(res, 500, 'Gagal memproses keranjang', error);
  } finally {
    await prisma.$disconnect();
  }
}
