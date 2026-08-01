import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { setSecurityHeaders, verifyPassword, sanitizeUser, isValidEmail, safeErrorResponse } from '../lib/security';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setSecurityHeaders(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body || {};

        if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
            return safeErrorResponse(res, 400, 'Email dan password wajib diisi');
        }

        const trimmedEmail = email.trim().toLowerCase();

        if (!isValidEmail(trimmedEmail)) {
            return safeErrorResponse(res, 400, 'Format email tidak valid');
        }

        const user = await prisma.user.findUnique({
            where: { email: trimmedEmail },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                isAdmin: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user || !user.password) {
            return safeErrorResponse(res, 401, 'Email atau password salah');
        }

        const isPasswordValid = verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return safeErrorResponse(res, 401, 'Email atau password salah');
        }

        // Return sanitized user (without password)
        const safeUser = sanitizeUser(user);
        return res.status(200).json(safeUser);

    } catch (error) {
        return safeErrorResponse(res, 500, 'Gagal melakukan login', error);
    } finally {
        await prisma.$disconnect();
    }
}
