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

      const wishlist = await prisma.wishlist.findUnique({
        where: { userId: user.id },
        include: {
          items: {
            include: {
              product: {
                select: { id: true, name: true, description: true, price: true, stock: true, category: true, imageUrls: true }
              }
            }
          }
        }
      });
      return res.status(200).json(wishlist ? wishlist.items : []);
    }

    if (req.method === 'POST') {
      const user = await authenticate(req);
      if (!user) return safeErrorResponse(res, 401, 'Unauthorized');

      const { productId } = req.body || {};
      const numProductId = Number(productId);

      if (!numProductId || isNaN(numProductId)) {
        return safeErrorResponse(res, 400, 'productId wajib diisi');
      }

      let wishlist = await prisma.wishlist.findUnique({ where: { userId: user.id } });
      if (!wishlist) wishlist = await prisma.wishlist.create({ data: { userId: user.id } });

      await prisma.wishlistItem.upsert({
        where: { wishlistId_productId: { wishlistId: wishlist.id, productId: numProductId } },
        update: {},
        create: { wishlistId: wishlist.id, productId: numProductId },
      });

      return res.status(200).json({ message: 'Berhasil ditambahkan ke wishlist' });
    }

    if (req.method === 'DELETE') {
      const user = await authenticate(req);
      if (!user) return safeErrorResponse(res, 401, 'Unauthorized');

      const numProductId = req.query.productId ? Number(req.query.productId) : null;
      if (!numProductId || isNaN(numProductId)) {
        return safeErrorResponse(res, 400, 'productId wajib diisi');
      }

      const wishlist = await prisma.wishlist.findUnique({ where: { userId: user.id } });
      if (wishlist) {
        await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id, productId: numProductId } });
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
