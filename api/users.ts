import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        if (req.method === 'GET') {
            const users = await prisma.user.findMany({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    isAdmin: true,
                    createdAt: true,
                    updatedAt: true,
                    // Exclude password from response
                },
                orderBy: { createdAt: 'desc' }
            });
            return res.status(200).json(users);
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Error in users API:', error);
        res.status(500).json({
            error: 'Failed to fetch users',
            details: error instanceof Error ? error.message : String(error)
        });
    } finally {
        await prisma.$disconnect();
    }
}
