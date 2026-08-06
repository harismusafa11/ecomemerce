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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const user = await authenticate(req);
    if (!user || !user.isAdmin) return safeErrorResponse(res, 403, 'Forbidden - hanya admin');

    const vouchers = await prisma.voucher.findMany({
      select: { id: true, code: true, discountPercentage: true, startDate: true, endDate: true, productId: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(vouchers);
  } catch (error) {
    return safeErrorResponse(res, 500, 'Gagal mengambil data voucher', error);
  } finally {
    await prisma.$disconnect();
  }
}
