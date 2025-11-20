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
        const { email, password } = req.body;

        console.log('[LOGIN] Attempt for:', email);

        // Validation
        if (!email || !password) {
            console.log('[LOGIN] Missing credentials');
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                isAdmin: true,
                createdAt: true,
                updatedAt: true
                // Exclude relations
            }
        });

        if (!user) {
            console.log('[LOGIN] User not found:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password (in production, use bcrypt!)
        if (user.password !== password) {
            console.log('[LOGIN] Password mismatch for:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('[LOGIN] Success for:', email, 'isAdmin:', user.isAdmin);

        // Return user data
        return res.status(200).json(user);

    } catch (error) {
        console.error('[LOGIN] Error:', error);

        return res.status(500).json({
            error: 'Login failed',
            message: error instanceof Error ? error.message : String(error),
            type: error instanceof Error ? error.constructor.name : typeof error
        });
    } finally {
        await prisma.$disconnect();
    }
}
