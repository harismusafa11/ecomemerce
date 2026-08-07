import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../server/index.js';

// Wrap Express app for Vercel serverless with dynamic path restoration
export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Restore target API route URL from Vercel rewrite query parameter or matched path
        if (req.query && req.query.path) {
            const rawPath = req.query.path;
            const subpath = Array.isArray(rawPath) ? rawPath.join('/') : rawPath;
            if (subpath === 'sitemap.xml' || subpath === 'robots.txt' || subpath.endsWith('.txt')) {
                req.url = `/${subpath}`;
            } else {
                req.url = `/api/${subpath}`;
            }
        } else if (req.headers['x-matched-path'] && typeof req.headers['x-matched-path'] === 'string') {
            const matched = req.headers['x-matched-path'];
            if (matched !== '/api/index') {
                req.url = matched;
            }
        }

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
