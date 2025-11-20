import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,DELETE,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // GET /api/users - Get all users
        // GET /api/users?id=X - Get single user
        if (req.method === 'GET') {
            const userId = req.query.id ? Number(req.query.id) : null;

            if (userId) {
                console.log('[USERS] Fetching user:', userId);
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
                    return res.status(404).json({ error: 'User not found' });
                }

                return res.status(200).json(user);
            }

            console.log('[USERS] Fetching all users');
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

            if (!userId) {
                return res.status(400).json({ error: 'User ID required' });
            }

            console.log('[USERS] Deleting user:', userId);

            await prisma.user.delete({
                where: { id: userId }
            });

            console.log('[USERS] User deleted:', userId);
            return res.status(200).json({ message: 'User deleted successfully' });
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('[USERS] Error:', error);
        res.status(500).json({
            error: 'Failed to process request',
            details: error instanceof Error ? error.message : String(error),
            type: error instanceof Error ? error.constructor.name : typeof error
        });
    } finally {
        await prisma.$disconnect();
    }
}
