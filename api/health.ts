import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`;

        // Get database info
        const userCount = await prisma.user.count();
        const productCount = await prisma.product.count();

        return res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            database: 'connected',
            environment: process.env.NODE_ENV || 'development',
            databaseUrl: process.env.DATABASE_URL ? 'Set (hidden)' : 'NOT SET',
            stats: {
                users: userCount,
                products: productCount
            }
        });
    } catch (error) {
        console.error('Health check error:', error);
        return res.status(503).json({
            status: 'error',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            databaseUrl: process.env.DATABASE_URL ? 'Set (hidden)' : 'NOT SET',
            error: error instanceof Error ? error.message : String(error),
            stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
        });
    } finally {
        await prisma.$disconnect();
    }
}
