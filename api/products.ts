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
        // GET /api/products - Get all products
        // GET /api/products?id=X - Get single product
        if (req.method === 'GET') {
            const productId = req.query.id ? Number(req.query.id) : null;

            if (productId) {
                console.log('[PRODUCTS] Fetching product:', productId);
                const product = await prisma.product.findUnique({
                    where: { id: productId }
                });

                if (!product) {
                    return res.status(404).json({ error: 'Product not found' });
                }

                return res.status(200).json(product);
            }

            console.log('[PRODUCTS] Fetching all products');
            const products = await prisma.product.findMany({
                orderBy: { createdAt: 'desc' }
            });
            return res.status(200).json(products);
        }

        // POST /api/products - Create new product
        if (req.method === 'POST') {
            const { name, description, price, imageUrls, category, stock } = req.body;

            console.log('[PRODUCTS] Creating product:', name);

            if (!name || !price) {
                return res.status(400).json({ error: 'Name and price are required' });
            }

            const product = await prisma.product.create({
                data: {
                    name,
                    description: description || '',
                    price: Number(price),
                    imageUrls: imageUrls || [],
                    category: category || 'Semua',
                    stock: Number(stock) || 0,
                },
            });

            console.log('[PRODUCTS] Product created:', product.id);
            return res.status(201).json(product);
        }

        // PUT /api/products?id=X - Update product
        if (req.method === 'PUT') {
            const productId = req.query.id ? Number(req.query.id) : null;
            const { name, description, price, imageUrls, category, stock } = req.body;

            if (!productId) {
                return res.status(400).json({ error: 'Product ID required' });
            }

            console.log('[PRODUCTS] Updating product:', productId);

            const product = await prisma.product.update({
                where: { id: productId },
                data: {
                    name: name || undefined,
                    description: description !== undefined ? description : undefined,
                    price: price ? Number(price) : undefined,
                    imageUrls: imageUrls || undefined,
                    category: category || undefined,
                    stock: stock !== undefined ? Number(stock) : undefined,
                },
            });

            console.log('[PRODUCTS] Product updated:', product.id);
            return res.status(200).json(product);
        }

        // DELETE /api/products?id=X - Delete product
        if (req.method === 'DELETE') {
            const productId = req.query.id ? Number(req.query.id) : null;

            if (!productId) {
                return res.status(400).json({ error: 'Product ID required' });
            }

            console.log('[PRODUCTS] Deleting product:', productId);

            await prisma.product.delete({
                where: { id: productId }
            });

            console.log('[PRODUCTS] Product deleted:', productId);
            return res.status(200).json({ message: 'Product deleted successfully' });
        }

        res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('[PRODUCTS] Error:', error);
        res.status(500).json({
            error: 'Failed to process request',
            details: error instanceof Error ? error.message : String(error),
            type: error instanceof Error ? error.constructor.name : typeof error
        });
    } finally {
        await prisma.$disconnect();
    }
}
