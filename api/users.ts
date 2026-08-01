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
        // GET /api/users - Get all users or single user (without password exposure)
        if (req.method === 'GET') {
            const userId = req.query.id ? Number(req.query.id) : null;

            if (userId && !isNaN(userId)) {
                const user = await prisma.user.findUnique({
                    where: { id: userId },
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        isAdmin: true,
                        createdAt: true,
                        updatedAt: true,
                    }
                });

                if (!user) {
                    return safeErrorResponse(res, 404, 'Pengguna tidak ditemukan');
                }

                return res.status(200).json(user);
            }

            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    isAdmin: true,
                    createdAt: true,
                    updatedAt: true,
                },
                orderBy: { createdAt: 'desc' }
            });
            return res.status(200).json(users);
        }

        // DELETE /api/users?id=X - Delete user
        if (req.method === 'DELETE') {
            const userId = req.query.id ? Number(req.query.id) : null;

            if (!userId || isNaN(userId)) {
                return safeErrorResponse(res, 400, 'ID Pengguna wajib diisi');
            }

            await prisma.user.delete({
                where: { id: userId }
            });

            return res.status(200).json({ message: 'Pengguna berhasil dihapus' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        return safeErrorResponse(res, 500, 'Gagal memproses data pengguna', error);
    } finally {
        await prisma.$disconnect();
    }
}
