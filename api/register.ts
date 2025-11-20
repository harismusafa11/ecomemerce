import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { name, email, password } = req.body;

        console.log('[REGISTER] Attempt for:', email);

        // Validation
        if (!name || !email || !password) {
            console.log('[REGISTER] Missing fields');
            return res.status(400).json({ error: 'Name, email, and password required' });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true }
        });

        if (existingUser) {
            console.log('[REGISTER] Email already exists:', email);
            return res.status(409).json({ error: 'Email already registered' });
        }

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password, // In production, hash this with bcrypt!
                isAdmin: false
            },
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

        console.log('[REGISTER] Success! New user ID:', newUser.id);

        // Return new user data
        return res.status(201).json(newUser);

    } catch (error) {
        console.error('[REGISTER] Error:', error);

        return res.status(500).json({
            error: 'Registration failed',
            message: error instanceof Error ? error.message : String(error),
            type: error instanceof Error ? error.constructor.name : typeof error
        });
    } finally {
        await prisma.$disconnect();
    }
}
