import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { setSecurityHeaders, hashPassword, sanitizeUser, isValidEmail, generateAuthToken, setAuthCookie, safeErrorResponse, sanitizeInput, isValidPassword } from '../lib/security';

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
        const { name, email, password } = req.body || {};

        if (!name || !email || !password) {
            return safeErrorResponse(res, 400, 'Nama, email, dan password wajib diisi');
        }

        const trimmedName = sanitizeInput(String(name), 100);
        const trimmedEmail = String(email).trim().toLowerCase();

        if (!trimmedName) {
            return safeErrorResponse(res, 400, 'Nama wajib diisi');
        }

        if (!isValidEmail(trimmedEmail)) {
            return safeErrorResponse(res, 400, 'Format email tidak valid');
        }

        const passwordCheck = isValidPassword(String(password));
        if (!passwordCheck.valid) {
            return safeErrorResponse(res, 400, passwordCheck.message);
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: trimmedEmail },
            select: { id: true }
        });

        if (existingUser) {
            return safeErrorResponse(res, 409, 'Email sudah terdaftar. Silakan gunakan email lain atau login');
        }

        const hashedPassword = hashPassword(String(password));

        const newUser = await prisma.user.create({
            data: {
                name: trimmedName,
                email: trimmedEmail,
                password: hashedPassword,
                isAdmin: false
            },
            select: {
                id: true,
                name: true,
                email: true,
                isAdmin: true,
                createdAt: true,
                updatedAt: true
            }
        });

        const token = generateAuthToken(newUser.id);
        setAuthCookie(res, token);

        const safeUser = sanitizeUser(newUser);
        return res.status(201).json({ user: safeUser, token });

    } catch (error) {
        return safeErrorResponse(res, 500, 'Gagal melakukan pendaftaran akun', error);
    } finally {
        await prisma.$disconnect();
    }
}
