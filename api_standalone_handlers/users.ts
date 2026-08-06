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
    const user = await authenticate(req);
    if (!user || !user.isAdmin) {
      return safeErrorResponse(res, 403, 'Forbidden - hanya admin');
    }

    if (req.method === 'GET') {
      const userId = req.query.id ? Number(req.query.id) : null;

      if (userId && !isNaN(userId)) {
        const found = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, email: true, isAdmin: true, createdAt: true, updatedAt: true }
        });
        if (!found) return safeErrorResponse(res, 404, 'Pengguna tidak ditemukan');
        return res.status(200).json(found);
      }

      const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, isAdmin: true, createdAt: true, updatedAt: true },
        orderBy: { createdAt: 'desc' }
      });
      return res.status(200).json(users);
    }

    if (req.method === 'DELETE') {
      const userId = req.query.id ? Number(req.query.id) : null;
      if (!userId || isNaN(userId)) {
        return safeErrorResponse(res, 400, 'ID Pengguna wajib diisi');
      }
      if (user.id === userId) {
        return safeErrorResponse(res, 400, 'Tidak dapat menghapus akun sendiri');
      }
      await prisma.user.delete({ where: { id: userId } });
      return res.status(200).json({ message: 'Pengguna berhasil dihapus' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return safeErrorResponse(res, 500, 'Gagal memproses data pengguna', error);
  } finally {
    await prisma.$disconnect();
  }
}
