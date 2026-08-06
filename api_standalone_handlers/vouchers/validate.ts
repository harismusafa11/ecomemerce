import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { setSecurityHeaders, verifyAuthToken, getTokenFromCookie, safeErrorResponse } from '../../lib/security';

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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await authenticate(req);
    if (!user) return safeErrorResponse(res, 401, 'Unauthorized');

    const { code } = req.body || {};
    if (!code) {
      return safeErrorResponse(res, 400, 'Kode voucher wajib diisi');
    }

    const voucher = await prisma.voucher.findFirst({
      where: { code: String(code).trim().toUpperCase() },
      select: { id: true, code: true, discountPercentage: true, startDate: true, endDate: true, productId: true },
    });

    if (!voucher) {
      return safeErrorResponse(res, 404, 'Voucher tidak ditemukan');
    }

    const now = new Date();
    if (now < new Date(voucher.startDate) || now > new Date(voucher.endDate)) {
      return safeErrorResponse(res, 400, 'Voucher sudah kadaluwarsa atau belum aktif');
    }

    return res.status(200).json(voucher);

  } catch (error) {
    return safeErrorResponse(res, 500, 'Gagal validasi voucher', error);
  } finally {
    await prisma.$disconnect();
  }
}
