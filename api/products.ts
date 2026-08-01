import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PrismaClient } from '@prisma/client';
import { setSecurityHeaders, safeErrorResponse } from '../lib/security';

const prisma = new PrismaClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
    setSecurityHeaders(res);

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // GET /api/products - Get all products or single product
        if (req.method === 'GET') {
            const productId = req.query.id ? Number(req.query.id) : null;

            if (productId && !isNaN(productId)) {
                const product = await prisma.product.findUnique({
                    where: { id: productId }
                });

                if (!product) {
                    return safeErrorResponse(res, 404, 'Produk tidak ditemukan');
                }

                return res.status(200).json(product);
            }

            const products = await prisma.product.findMany({
                orderBy: { createdAt: 'desc' }
            });
            return res.status(200).json(products);
        }

        // POST /api/products - Create new product
        if (req.method === 'POST') {
            const { name, description, price, imageUrls, category, stock } = req.body || {};

            if (!name || price === undefined || price === null || isNaN(Number(price))) {
                return safeErrorResponse(res, 400, 'Nama produk dan harga yang valid wajib diisi');
            }

            const numPrice = Number(price);
            if (numPrice < 0) {
                return safeErrorResponse(res, 400, 'Harga produk tidak boleh negatif');
            }

            const product = await prisma.product.create({
                data: {
                    name: String(name).trim(),
                    description: description ? String(description).trim() : '',
                    price: numPrice,
                    imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
                    category: category ? String(category).trim() : 'Semua',
                    stock: stock !== undefined && !isNaN(Number(stock)) ? Math.max(0, Number(stock)) : 10,
                },
            });

            return res.status(201).json(product);
        }

        // PUT /api/products?id=X - Update product
        if (req.method === 'PUT') {
            const productId = req.query.id ? Number(req.query.id) : null;
            const { name, description, price, imageUrls, category, stock } = req.body || {};

            if (!productId || isNaN(productId)) {
                return safeErrorResponse(res, 400, 'ID Produk wajib diisi');
            }

            const numPrice = price !== undefined ? Number(price) : undefined;
            if (numPrice !== undefined && (isNaN(numPrice) || numPrice < 0)) {
                return safeErrorResponse(res, 400, 'Harga produk tidak valid');
            }

            const product = await prisma.product.update({
                where: { id: productId },
                data: {
                    name: name ? String(name).trim() : undefined,
                    description: description !== undefined ? String(description).trim() : undefined,
                    price: numPrice,
                    imageUrls: Array.isArray(imageUrls) ? imageUrls : undefined,
                    category: category ? String(category).trim() : undefined,
                    stock: stock !== undefined && !isNaN(Number(stock)) ? Math.max(0, Number(stock)) : undefined,
                },
            });

            return res.status(200).json(product);
        }

        // DELETE /api/products?id=X - Delete product
        if (req.method === 'DELETE') {
            const productId = req.query.id ? Number(req.query.id) : null;

            if (!productId || isNaN(productId)) {
                return safeErrorResponse(res, 400, 'ID Produk wajib diisi');
            }

            await prisma.product.delete({
                where: { id: productId }
            });

            return res.status(200).json({ message: 'Produk berhasil dihapus' });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        return safeErrorResponse(res, 500, 'Gagal memproses data produk', error);
    } finally {
        await prisma.$disconnect();
    }
}
