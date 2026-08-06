import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { setSecurityHeaders, verifyAuthToken, getTokenFromCookie, safeErrorResponse, sanitizeInput } from '../lib/security';

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
      const productId = req.query.id ? Number(req.query.id) : null;

      if (productId && !isNaN(productId)) {
        const product = await prisma.product.findUnique({ where: { id: productId } });
        if (!product) return safeErrorResponse(res, 404, 'Produk tidak ditemukan');
        return res.status(200).json(product);
      }

      const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
      return res.status(200).json(products);
    }

    if (req.method === 'POST') {
      const user = await authenticate(req);
      if (!user || !user.isAdmin) return safeErrorResponse(res, 403, 'Forbidden - hanya admin');

      const { name, description, price, imageUrls, category, stock } = req.body || {};
      if (!name || price === undefined || price === null || isNaN(Number(price))) {
        return safeErrorResponse(res, 400, 'Nama produk dan harga yang valid wajib diisi');
      }

      const product = await prisma.product.create({
        data: {
          name: sanitizeInput(String(name), 200),
          description: sanitizeInput(description || '', 5000),
          price: Math.max(0, Number(price)),
          imageUrls: Array.isArray(imageUrls) ? imageUrls.map((u: any) => String(u).slice(0, 500)) : [],
          category: sanitizeInput(category || 'Semua', 100),
          stock: stock !== undefined ? Math.max(0, Number(stock) || 0) : 10,
        },
      });
      return res.status(201).json(product);
    }

    if (req.method === 'PUT') {
      const user = await authenticate(req);
      if (!user || !user.isAdmin) return safeErrorResponse(res, 403, 'Forbidden - hanya admin');

      const productId = req.query.id ? Number(req.query.id) : null;
      const { name, description, price, imageUrls, category, stock } = req.body || {};

      if (!productId || isNaN(productId)) {
        return safeErrorResponse(res, 400, 'ID Produk wajib diisi');
      }

      const product = await prisma.product.update({
        where: { id: productId },
        data: {
          name: name ? sanitizeInput(String(name), 200) : undefined,
          description: description !== undefined ? sanitizeInput(String(description), 5000) : undefined,
          price: price !== undefined ? Math.max(0, Number(price)) : undefined,
          imageUrls: Array.isArray(imageUrls) ? imageUrls.map((u: any) => String(u).slice(0, 500)) : undefined,
          category: category ? sanitizeInput(String(category), 100) : undefined,
          stock: stock !== undefined ? Math.max(0, Number(stock) || 0) : undefined,
        },
      });
      return res.status(200).json(product);
    }

    if (req.method === 'DELETE') {
      const user = await authenticate(req);
      if (!user || !user.isAdmin) return safeErrorResponse(res, 403, 'Forbidden - hanya admin');

      const productId = req.query.id ? Number(req.query.id) : null;
      if (!productId || isNaN(productId)) {
        return safeErrorResponse(res, 400, 'ID Produk wajib diisi');
      }
      await prisma.product.delete({ where: { id: productId } });
      return res.status(200).json({ message: 'Produk berhasil dihapus' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return safeErrorResponse(res, 500, 'Gagal memproses data produk', error);
  } finally {
    await prisma.$disconnect();
  }
}
