import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../server/index';

// Wrap Express app for Vercel serverless
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Pass request to Express app
        return app(req as any, res as any);
    } catch (error) {
        console.error('Vercel handler error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : String(error)
        });
    }
}
