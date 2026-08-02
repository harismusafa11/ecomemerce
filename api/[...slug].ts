import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../server/index.ts';

// Vercel native catch-all handler for /api/* routes
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const slug = req.query.slug;
        if (slug) {
            const subpath = Array.isArray(slug) ? slug.join('/') : slug;
            req.url = `/api/${subpath}`;
        }
        return app(req as any, res as any);
    } catch (error) {
        console.error('Vercel catch-all handler error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error instanceof Error ? error.message : String(error)
        });
    }
}
