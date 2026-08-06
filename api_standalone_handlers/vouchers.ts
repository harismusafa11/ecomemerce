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
      const vouchers = await prisma.voucher.findMany({
        select: { id: true, code: true, discountPercentage: true, startDate: true, endDate: true, createdAt: true, updatedAt: true },
        orderBy: { createdAt: 'desc' }
      });
      return res.status(200).json(vouchers);
    }

    if (req.method === 'POST') {
      const user = await authenticate(req);
      if (!user || !user.isAdmin) return safeErrorResponse(res, 403, 'Forbidden - hanya admin');

      const { code, discountPercentage, startDate, endDate } = req.body || {};
      if (!code || discountPercentage === undefined || !startDate || !endDate) {
        return safeErrorResponse(res, 400, 'Semua field wajib diisi');
      }

      const voucher = await prisma.voucher.create({
        data: {
          code: sanitizeInput(code, 50).toUpperCase(),
          discountPercentage: Math.min(100, Math.max(0, Number(discountPercentage))),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
        },
        select: { id: true, code: true, discountPercentage: true, startDate: true, endDate: true, createdAt: true, updatedAt: true }
      });
      return res.status(201).json(voucher);
    }

    if (req.method === 'PUT') {
      const user = await authenticate(req);
      if (!user || !user.isAdmin) return safeErrorResponse(res, 403, 'Forbidden - hanya admin');

      const voucherId = req.query.id ? Number(req.query.id) : (req.body?.id ? Number(req.body.id) : null);
      const { code, discountPercentage, startDate, endDate } = req.body || {};

      if (!voucherId || isNaN(voucherId)) {
        return safeErrorResponse(res, 400, 'Voucher ID wajib diisi');
      }

      const voucher = await prisma.voucher.update({
        where: { id: voucherId },
        data: {
          code: code ? sanitizeInput(code, 50).toUpperCase() : undefined,
          discountPercentage: discountPercentage !== undefined ? Math.min(100, Math.max(0, Number(discountPercentage))) : undefined,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
        },
        select: { id: true, code: true, discountPercentage: true, startDate: true, endDate: true, createdAt: true, updatedAt: true }
      });
      return res.status(200).json(voucher);
    }

    if (req.method === 'DELETE') {
      const user = await authenticate(req);
      if (!user || !user.isAdmin) return safeErrorResponse(res, 403, 'Forbidden - hanya admin');

      const voucherId = req.query.id ? Number(req.query.id) : null;
      if (!voucherId || isNaN(voucherId)) {
        return safeErrorResponse(res, 400, 'Voucher ID wajib diisi');
      }
      await prisma.voucher.delete({ where: { id: voucherId } });
      return res.status(200).json({ message: 'Voucher berhasil dihapus' });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    return safeErrorResponse(res, 500, 'Gagal memproses data voucher', error);
  } finally {
    await prisma.$disconnect();
  }
}
