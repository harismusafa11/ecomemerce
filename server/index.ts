import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import prisma from './db.js';
import { hashPassword, verifyPassword, sanitizeUser, isValidEmail, generateAuthToken, verifyAuthToken, setAuthCookie, clearAuthCookie, getTokenFromCookie, safeErrorResponse, sanitizeInput, isValidPassword } from '../lib/security.js';

// Prisma Postgres Database Integration - Connected
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security Headers Middleware
app.use((req, res, next) => {
    // HTTPS redirect in production
    if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }

    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    next();
});

// CORS configuration - strict allowlist from env in production
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? (process.env.ALLOWED_ORIGINS || 'https://tapakpamungkas.my.id,https://www.tapakpamungkas.my.id,https://tapakpamungkas.com,https://www.tapakpamungkas.com')
        .split(',').map(o => o.trim()).filter(Boolean)
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, same-origin rewrites)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

import { toNodeHandler } from 'better-auth/node';
import { auth } from '../lib/auth.js';

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.optimole.com https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https: blob:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.binderbyte.com https://generativelanguage.googleapis.com; frame-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'");
    next();
});

// Better Auth Router
app.use('/api/auth', toNodeHandler(auth));

// Rate limiting (simple implementation)
const requestCounts = new Map<string, { count: number; resetAt: number }>();
app.use((req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = 60000;
    const maxRequests = 100;

    let entry = requestCounts.get(ip);
    if (!entry || now > entry.resetAt) {
        entry = { count: 0, resetAt: now + windowMs };
    }
    entry.count++;
    requestCounts.set(ip, entry);

    const path = req.path.toLowerCase();
    const isAuthEndpoint = path.includes('/login') || path.includes('/register');
    const authLimit = 10;
    if (isAuthEndpoint && entry.count > authLimit) {
        return res.status(429).json({ error: 'Terlalu banyak percobaan. Coba lagi nanti.' });
    }
    if (entry.count > maxRequests) {
        return res.status(429).json({ error: 'Too many requests' });
    }

    next();
});

// --- AUTHENTICATION MIDDLEWARE ---
// Attaches the fresh user from DB to req.user when a valid Bearer token is present.
const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const cookieToken = getTokenFromCookie(req.headers.cookie);
        const header = req.headers.authorization || '';
        const bearerToken = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
        const token = cookieToken || bearerToken;
        const payload = token ? verifyAuthToken(token) : null;
        if (!payload) {
            return res.status(401).json({ error: 'Unauthorized - silakan masuk kembali' });
        }
        const user = await prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user) {
            return res.status(401).json({ error: 'Unauthorized - akun tidak ditemukan' });
        }
        (req as any).user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error instanceof Error ? error.message : error);
        return res.status(401).json({ error: 'Unauthorized' });
    }
};

const requireAdmin = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await requireAuth(req, res, () => {
        const user = (req as any).user;
        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: 'Forbidden - hanya admin yang dapat mengakses' });
        }
        next();
    });
};

// Returns true when the request user owns the requested userId OR is an admin.
const ownsOrAdmin = (req: express.Request, targetUserId: unknown): boolean => {
    const user = (req as any).user;
    if (!user) return false;
    if (user.isAdmin) return true;
    return user.id === Number(targetUserId);
};

// Health check endpoint (with real database connectivity test)
const handleHealth = async (req: express.Request, res: express.Response) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({
            status: 'ok',
            database: 'connected',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Health check error:', error instanceof Error ? error.message : error);
        res.status(500).json({
            status: 'error',
            database: 'disconnected',
            error: 'Database connection failed',
        });
    }
};
app.get('/health', handleHealth);
app.get('/api/health', handleHealth);

// --- GEMINI CHATBOT (server-side, key never exposed to client) ---
const getChatSystemInstruction = (locale: string) => {
    if (locale === 'en') {
        return `You are a friendly and helpful customer service assistant for an e-commerce store called "Tapak Pamungkas". 
    This store sells traditional and mystical items from Indonesian culture, like 'Pusaka' (heirlooms/keris), accessories, ritual oils, and traditional clothing. 
    Your role is to answer customer questions about products, the store, and policies. Be concise, polite, and knowledgeable about the store's theme. 
    Do not answer questions that are not related to "Tapak Pamungkas" or its products. Respond in English.`;
    }
    return `You are a friendly and helpful customer service assistant for an e-commerce store called "Tapak Pamungkas". 
    This store sells traditional and mystical items from Indonesian culture, like 'Pusaka' (heirlooms/keris), accessories, ritual oils, and traditional clothing. 
    Your role is to answer customer questions about products, the store, and policies. Be concise, polite, and knowledgeable about the store's theme. 
    Do not answer questions that are not related to "Tapak Pamungkas" or its products. Respond in Indonesian.`;
};

app.post('/api/chat', async (req, res) => {
    try {
        const { message, locale } = req.body || {};
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({ error: 'Invalid message' });
        }
        if (!process.env.GEMINI_API_KEY) {
            return res.status(503).json({ error: 'Chat service unavailable' });
        }
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: getChatSystemInstruction(locale === 'en' ? 'en' : 'id'),
            },
        });
        const response = await chat.sendMessage({ message: String(message).slice(0, 2000) });
        res.json({ text: response.text });
    } catch (error) {
        console.error('Gemini chat error:', error instanceof Error ? error.message : error);
        res.status(500).json({ error: 'Chat service error' });
    }
});

// --- PRODUCTS ---
app.get('/api/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { id: 'asc' }
        });
        return res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error instanceof Error ? error.message : error);
        return res.status(500).json({
            error: 'Gagal mengambil data produk'
        });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await prisma.product.findUnique({
            where: { id: Number(req.params.id) },
        });
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

app.post('/api/products', requireAdmin, async (req, res) => {
    try {
        const { name, slug, keywords, description, price, imageUrls, category, stock, isFlashSale, flashSalePrice, flashSaleEnd } = req.body;
        const productData: any = {
            name: sanitizeInput(name, 200),
            description: sanitizeInput(description || '', 5000),
            price: Number(price),
            imageUrls: Array.isArray(imageUrls) ? imageUrls.map((u: any) => String(u).slice(0, 500)) : [],
            category: sanitizeInput(category || '', 100),
            stock: Math.max(0, Number(stock) || 0),
            isFlashSale: Boolean(isFlashSale),
            flashSalePrice: flashSalePrice ? Number(flashSalePrice) : null,
            flashSaleEnd: flashSaleEnd ? new Date(flashSaleEnd) : null,
        };
        if (slug) productData.slug = sanitizeInput(String(slug), 200);
        if (keywords) productData.keywords = sanitizeInput(String(keywords), 500);

        const product = await prisma.product.create({
            data: productData,
        });

        // Trigger IndexNow notification for new product URL asynchronously
        const slugifyLocal = (t: string) => t.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
        const prodSlug = product.slug || slugifyLocal(product.name);
        submitToIndexNow([`/produk/${prodSlug}`]).catch(() => {});

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Gagal membuat produk' });
    }
});

const handleProductUpdate = async (req: express.Request, res: express.Response) => {
    try {
        const productId = Number(req.params.id || req.query.id);
        if (isNaN(productId)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }
        const { name, slug, keywords, description, price, imageUrls, category, stock, isFlashSale, flashSalePrice, flashSaleEnd } = req.body;
        const updateData: any = {};
        if (name !== undefined) updateData.name = sanitizeInput(String(name), 200);
        if (slug !== undefined) updateData.slug = slug ? sanitizeInput(String(slug), 200) : null;
        if (keywords !== undefined) updateData.keywords = keywords ? sanitizeInput(String(keywords), 500) : null;
        if (description !== undefined) updateData.description = sanitizeInput(String(description), 5000);
        if (price !== undefined) updateData.price = Number(price);
        if (imageUrls !== undefined) updateData.imageUrls = Array.isArray(imageUrls) ? imageUrls.map((u: any) => String(u).slice(0, 500)) : undefined;
        if (category !== undefined) updateData.category = sanitizeInput(String(category), 100);
        if (stock !== undefined) updateData.stock = Math.max(0, Number(stock));
        if (isFlashSale !== undefined) updateData.isFlashSale = Boolean(isFlashSale);
        if (flashSalePrice !== undefined) updateData.flashSalePrice = flashSalePrice ? Number(flashSalePrice) : null;
        if (flashSaleEnd !== undefined) updateData.flashSaleEnd = flashSaleEnd ? new Date(flashSaleEnd) : null;
        const product = await prisma.product.update({
            where: { id: productId },
            data: updateData,
        });

        // Trigger IndexNow notification for updated product URL
        const slugifyLocal = (t: string) => t.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
        const prodSlug = product.slug || slugifyLocal(product.name);
        submitToIndexNow([`/produk/${prodSlug}`]).catch(() => {});

        res.json(product);
    } catch (error) {
        console.error('Update product error:', error instanceof Error ? error.message : error);
        res.status(500).json({ error: 'Gagal memperbarui produk' });
    }
};

const handleProductDelete = async (req: express.Request, res: express.Response) => {
    try {
        const productId = Number(req.params.id || req.query.id);
        if (isNaN(productId)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }
        await prisma.product.delete({
            where: { id: productId },
        });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
};

app.put('/api/products/:id', requireAdmin, handleProductUpdate);
app.put('/api/products', requireAdmin, handleProductUpdate);
app.delete('/api/products/:id', requireAdmin, handleProductDelete);
app.delete('/api/products', requireAdmin, handleProductDelete);

// --- PRODUCT VIEWS (analytics) ---
app.post('/api/product-views', async (req, res) => {
    try {
        const { productId, userId } = req.body || {};
        const id = Number(productId);
        if (isNaN(id)) return res.status(400).json({ error: 'Invalid product ID' });

        const forwarded = req.headers['x-forwarded-for'];
        const ip = req.ip || (forwarded ? String(forwarded).split(',')[0].trim() : null);

        await prisma.productView.create({
            data: {
                productId: id,
                userId: userId ? Number(userId) : null,
                ip: ip ? String(ip).slice(0, 45) : null,
                userAgent: req.headers['user-agent'] ? String(req.headers['user-agent']).slice(0, 300) : null,
            },
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Product view tracking error:', error);
        res.status(500).json({ error: 'Failed to track product view' });
    }
});

app.get('/api/products/popular', async (req, res) => {
    try {
        const limit = Math.min(Number(req.query.limit) || 10, 50);
        const popular = await prisma.productView.groupBy({
            by: ['productId'],
            _count: { productId: true },
            orderBy: { _count: { productId: 'desc' } },
            take: limit,
        });
        const productIds = popular.map(p => p.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
        });
        const productsById = new Map(products.map(p => [p.id, p]));
        const result = popular
            .map(p => ({ product: productsById.get(p.productId), views: p._count.productId }))
            .filter(p => p.product);
        res.json(result);
    } catch (error) {
        console.error('Popular products error:', error);
        res.status(500).json({ error: 'Failed to fetch popular products' });
    }
});

app.get('/api/products/best-sellers', async (req, res) => {
    try {
        const limit = Math.min(Number(req.query.limit) || 8, 50);
        const bestSellers = await prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: limit,
        });
        const productIds = bestSellers.map(p => p.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds }, stock: { gt: 0 } },
        });
        const productsById = new Map(products.map(p => [p.id, p]));
        const result = bestSellers
            .map(p => productsById.get(p.productId))
            .filter(Boolean);
        res.json(result);
    } catch (error) {
        console.error('Best sellers error:', error);
        res.status(500).json({ error: 'Failed to fetch best sellers' });
    }
});

app.get('/api/products/related', async (req, res) => {
    try {
        const productId = Number(req.query.productId);
        const category = String(req.query.category || '');
        const limit = Math.min(Number(req.query.limit) || 4, 12);
        
        if (!productId || !category) {
            return res.status(400).json({ error: 'productId and category required' });
        }
        
        const related = await prisma.product.findMany({
            where: {
                id: { not: productId },
                category: { contains: category, mode: 'insensitive' },
                stock: { gt: 0 }
            },
            take: limit,
            orderBy: { createdAt: 'desc' }
        });
        
        if (related.length < limit) {
            const additional = await prisma.product.findMany({
                where: {
                    id: { not: productId, notIn: related.map(p => p.id) },
                    stock: { gt: 0 }
                },
                take: limit - related.length,
                orderBy: { createdAt: 'desc' }
            });
            related.push(...additional);
        }
        
        res.json(related);
    } catch (error) {
        console.error('Related products error:', error);
        res.status(500).json({ error: 'Failed to fetch related products' });
    }
});

// --- SEARCH LOGS (analytics) ---
app.post('/api/search-logs', async (req, res) => {
    try {
        const { query, resultCount, userId } = req.body || {};
        if (!query || !String(query).trim()) return res.status(400).json({ error: 'Query required' });
        await prisma.searchLog.create({
            data: {
                query: String(query).trim().slice(0, 200),
                resultCount: Number(resultCount) || 0,
                userId: userId ? Number(userId) : null,
            },
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Search log error:', error);
        res.status(500).json({ error: 'Failed to log search' });
    }
});

// --- REVIEWS ---
app.get('/api/reviews/product/:productId', async (req, res) => {
    try {
        const productId = Number(req.params.productId);
        if (isNaN(productId)) return res.status(400).json({ error: 'Invalid product ID' });
        const reviews = await prisma.review.findMany({
            where: { productId },
            include: { user: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        });
        const count = await prisma.review.count({ where: { productId } });
        const avg = count > 0
            ? (await prisma.review.aggregate({ where: { productId }, _avg: { rating: true } }))._avg.rating
            : 0;
        res.json({ reviews, averageRating: avg ? Math.round(avg * 10) / 10 : 0, totalReviews: count });
    } catch (error) {
        console.error('Fetch reviews error:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

app.post('/api/reviews', requireAuth, async (req, res) => {
    try {
        const authUser = (req as any).user;
        const { productId, rating, comment } = req.body || {};
        const id = Number(productId);
        const uid = Number(authUser.id); // always use the authenticated user
        const rate = Number(rating);
        if (isNaN(id) || isNaN(uid) || isNaN(rate)) {
            return res.status(400).json({ error: 'productId, userId, and rating are required' });
        }
        if (rate < 1 || rate > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) return res.status(404).json({ error: 'Product not found' });

        const existing = await prisma.review.findUnique({
            where: { productId_userId: { productId: id, userId: uid } },
        });
        const review = existing
            ? await prisma.review.update({
                where: { id: existing.id },
                data: {
                    rating: rate,
                    comment: comment ? String(comment).trim().slice(0, 1000) : null,
                },
            })
            : await prisma.review.create({
                data: {
                    productId: id,
                    userId: uid,
                    rating: rate,
                    comment: comment ? String(comment).trim().slice(0, 1000) : null,
                },
            });

        res.json(review);
    } catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ error: 'Failed to save review' });
    }
});

// --- USERS ---
// --- USERS & AUTHENTICATION ---
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ error: 'Email dan password wajib diisi' });
        }

        const trimmedEmail = email.trim().toLowerCase();

        if (!isValidEmail(trimmedEmail)) {
            return res.status(400).json({ error: 'Format email tidak valid' });
        }

        const user = await prisma.user.findUnique({
            where: { email: trimmedEmail },
        });

        if (!user || !user.password) {
            return res.status(401).json({ error: 'Email atau password salah' });
        }

        const isPasswordValid = verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Email atau password salah' });
        }

        const token = generateAuthToken(user.id);
        setAuthCookie(res, token);
        return res.json({ user: sanitizeUser(user), token });
    } catch (error) {
        console.error('Login error:', error instanceof Error ? error.message : error);
        return res.status(500).json({ error: 'Login gagal' });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body || {};

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Nama, email, dan password wajib diisi' });
        }

        const trimmedName = sanitizeInput(String(name), 100);
        const trimmedEmail = String(email).trim().toLowerCase();

        if (!trimmedName) {
            return res.status(400).json({ error: 'Nama wajib diisi' });
        }

        if (!isValidEmail(trimmedEmail)) {
            return res.status(400).json({ error: 'Format email tidak valid' });
        }

        const passwordCheck = isValidPassword(String(password));
        if (!passwordCheck.valid) {
            return res.status(400).json({ error: passwordCheck.message });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: trimmedEmail },
            select: { id: true }
        });

        if (existingUser) {
            return res.status(409).json({ error: 'Email sudah terdaftar' });
        }

        const hashedPassword = hashPassword(String(password));

        const user = await prisma.user.create({
            data: {
                name: trimmedName,
                email: trimmedEmail,
                password: hashedPassword,
                isAdmin: false,
            },
        });

        const token = generateAuthToken(user.id);
        setAuthCookie(res, token);
        return res.status(201).json({ user: sanitizeUser(user), token });
    } catch (error) {
        console.error('Registration error:', error instanceof Error ? error.message : error);
        return res.status(500).json({ error: 'Registrasi gagal' });
    }
});

app.get('/api/users', requireAdmin, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                isAdmin: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return res.json(users);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.put('/api/users/:id', requireAdmin, async (req, res) => {
    try {
        const userId = Number(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const { name, email, isAdmin } = req.body || {};

        // Prevent an admin from demoting their own account (avoid lockout)
        const requester = (req as any).user;
        if (requester && requester.id === userId && isAdmin !== undefined && Boolean(isAdmin) === false) {
            return res.status(400).json({ error: 'Tidak dapat menghapus hak admin pada akun sendiri' });
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                name: name ? String(name).trim() : undefined,
                email: email ? String(email).trim().toLowerCase() : undefined,
                isAdmin: isAdmin !== undefined ? Boolean(isAdmin) : undefined
            },
            select: {
                id: true,
                name: true,
                email: true,
                isAdmin: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return res.json(sanitizeUser(user));
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update user' });
    }
});

app.delete('/api/users/:id', requireAdmin, async (req, res) => {
    try {
        const userId = Number(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }

        // Prevent an admin from deleting their own account
        const requester = (req as any).user;
        if (requester && requester.id === userId) {
            return res.status(400).json({ error: 'Tidak dapat menghapus akun sendiri' });
        }

        await prisma.user.delete({
            where: { id: userId },
        });
        return res.json({ message: 'User deleted successfully' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete user' });
    }
});

// --- ONGKIR / SHIPPING CALCULATOR ---
app.all('/api/ongkir', async (req, res) => {
    try {
        const BINDERBYTE_API_KEY = process.env.BINDERBYTE_API_KEY || '';
        const searchTerm = String(req.query.search || req.body?.search || '').trim();

        if (searchTerm) {
            if (!BINDERBYTE_API_KEY) {
                return res.json({ status: 200, data: [] });
            }
            try {
                const url = `https://api.binderbyte.com/v1/locations?search=${encodeURIComponent(searchTerm)}&api_key=${BINDERBYTE_API_KEY}`;
                const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
                if (response.ok) {
                    const data = await response.json();
                    if (data && data.data && Array.isArray(data.data)) {
                        return res.json({ status: 200, data: data.data });
                    }
                }
            } catch (err) {
                console.error('[BINDERBYTE LOCATIONS SEARCH ERROR]:', err);
            }
            return res.json({ status: 200, data: [] });
        }

        const destinationProvince = String(req.query.province || req.body?.province || '').trim();
        const destinationCity = String(req.query.city || req.body?.city || '').trim();
        const destinationDistrict = String(req.query.district || req.body?.district || '').trim();
        const weightGrams = Math.max(100, Number(req.query.weight || req.body?.weight || 1000));
        const weightKg = Math.ceil(weightGrams / 1000);

        if (!destinationProvince || !destinationCity) {
            return res.status(400).json({ error: 'Provinsi dan Kota/Kabupaten tujuan wajib diisi' });
        }

        const ORIGIN_KECAMATAN = process.env.DEFAULT_ORIGIN_KECAMATAN || 'Ulujami';
        const ORIGIN_KOTA = process.env.DEFAULT_ORIGIN_KOTA || 'Pemalang';
        const ORIGIN_PROVINSI = process.env.DEFAULT_ORIGIN_PROVINSI || 'Jawa Tengah';

        // Fallback tariff matrix
        const provUpper = destinationProvince.toUpperCase();
        let jneBase = 14000;
        let jntBase = 15000;
        let sicepatBase = 14500;
        let posBase = 13000;
        let etdJne = '1-2 Hari';
        let etdPos = '2-3 Hari';

        if (provUpper.includes('JAWA TENGAH') || provUpper.includes('YOGYAKARTA')) {
            jneBase = 10000; jntBase = 11000; sicepatBase = 10500; posBase = 9000;
        } else if (provUpper.includes('JAKARTA') || provUpper.includes('BANTEN') || provUpper.includes('JAWA BARAT')) {
            jneBase = 13000; jntBase = 14000; sicepatBase = 13500; posBase = 12000;
        } else if (provUpper.includes('JAWA TIMUR')) {
            jneBase = 14000; jntBase = 15000; sicepatBase = 14500; posBase = 13000;
        } else if (provUpper.includes('SUMATERA') || provUpper.includes('SUMATRA') || provUpper.includes('ACEH') || provUpper.includes('RIAU') || provUpper.includes('LAMPUNG')) {
            jneBase = 24000; jntBase = 26000; sicepatBase = 25000; posBase = 22000; etdJne = '2-4 Hari'; etdPos = '3-5 Hari';
        } else if (provUpper.includes('BALI') || provUpper.includes('NUSA TENGGARA')) {
            jneBase = 26000; jntBase = 28000; sicepatBase = 27000; posBase = 24000; etdJne = '2-4 Hari'; etdPos = '3-5 Hari';
        } else if (provUpper.includes('KALIMANTAN')) {
            jneBase = 32000; jntBase = 35000; sicepatBase = 34000; posBase = 30000; etdJne = '3-5 Hari'; etdPos = '4-6 Hari';
        } else if (provUpper.includes('SULAWESI')) {
            jneBase = 35000; jntBase = 38000; sicepatBase = 36000; posBase = 33000; etdJne = '3-5 Hari'; etdPos = '4-6 Hari';
        } else if (provUpper.includes('PAPUA') || provUpper.includes('MALUKU')) {
            jneBase = 75000; jntBase = 82000; sicepatBase = 78000; posBase = 70000; etdJne = '4-7 Hari'; etdPos = '5-8 Hari';
        }

        const multiplier = Math.max(1, weightKg);
        const options = [
            { code: 'jne', courierName: 'JNE Express', service: 'REG (Reguler)', description: `Dari ${ORIGIN_KECAMATAN}, ${ORIGIN_KOTA}`, cost: Math.round(jneBase * multiplier), etd: etdJne },
            { code: 'jnt', courierName: 'J&T Express', service: 'EZ (Standard)', description: `Dari ${ORIGIN_KECAMATAN}, ${ORIGIN_KOTA}`, cost: Math.round(jntBase * multiplier), etd: etdJne },
            { code: 'sicepat', courierName: 'SiCepat Express', service: 'REG (Reguler)', description: `Dari ${ORIGIN_KECAMATAN}, ${ORIGIN_KOTA}`, cost: Math.round(sicepatBase * multiplier), etd: etdJne },
            { code: 'pos', courierName: 'POS Indonesia', service: 'Kilat Khusus', description: `Dari ${ORIGIN_KECAMATAN}, ${ORIGIN_KOTA}`, cost: Math.round(posBase * multiplier), etd: etdPos }
        ];

        return res.json({
            origin: { kecamatan: ORIGIN_KECAMATAN, kota: ORIGIN_KOTA, provinsi: ORIGIN_PROVINSI },
            destination: { district: destinationDistrict, city: destinationCity, province: destinationProvince },
            weightKg,
            source: 'smart_tariff_matrix',
            options
        });
    } catch (error) {
        return res.status(500).json({ error: 'Gagal menghitung ongkir' });
    }
});

// --- USER ADDRESSES ---
app.get('/api/addresses/:userId', requireAuth, async (req, res) => {
    try {
        if (!ownsOrAdmin(req, req.params.userId)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const addresses = await prisma.userAddress.findMany({
            where: { userId: Number(req.params.userId) },
            orderBy: { isPrimary: 'desc' },
        });
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user addresses' });
    }
});

app.post('/api/addresses', requireAuth, async (req, res) => {
    try {
        const authUser = (req as any).user;
        const { recipientName, phone, province, city, district, village, postalCode, fullAddress, isPrimary } = req.body;
        const userId = Number(authUser.id); // always use the authenticated user

        if (isPrimary) {
            await prisma.userAddress.updateMany({
                where: { userId },
                data: { isPrimary: false },
            });
        }

        const address = await prisma.userAddress.create({
            data: {
                userId,
                recipientName: String(recipientName),
                phone: String(phone),
                province: String(province),
                city: String(city),
                district: String(district),
                village: village ? String(village) : null,
                postalCode: postalCode ? String(postalCode) : null,
                fullAddress: String(fullAddress),
                isPrimary: isPrimary !== undefined ? Boolean(isPrimary) : true,
            },
        });
        res.json(address);
    } catch (error) {
        console.error('Error saving address:', error);
        res.status(500).json({ error: 'Failed to save address' });
    }
});

app.delete('/api/addresses/:id', requireAuth, async (req, res) => {
    try {
        const addressId = Number(req.params.id);
        const address = await prisma.userAddress.findUnique({ where: { id: addressId } });
        if (!address) return res.status(404).json({ error: 'Address not found' });
        if (!ownsOrAdmin(req, address.userId)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        await prisma.userAddress.delete({
            where: { id: addressId },
        });
        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete address' });
    }
});

// --- ORDERS ---
app.post('/api/orders', requireAuth, async (req, res) => {
    try {
        const authUser = (req as any).user;
        const { items, shippingCost, shippingCourier, province, city, district, village, fullAddress, discountAmount } = req.body || {};

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Items required' });
        }

        const productIds = [...new Set(items.map((i: any) => Number(i.id ?? i.productId)))].filter(n => !isNaN(n));
        const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
        const productMap = new Map(products.map(p => [p.id, p]));

        let subtotal = 0;
        const orderItemRows: { productId: number; quantity: number; price: number }[] = [];
        for (const item of items) {
            const productId = Number(item.id ?? item.productId);
            const qty = Math.max(1, Math.floor(Number(item.quantity) || 1));
            const product = productMap.get(productId);
            if (!product) return res.status(400).json({ error: `Produk tidak ditemukan: #${productId}` });
            if (product.stock < qty) return res.status(409).json({ error: `Stok "${product.name}" tidak mencukupi (tersisa ${product.stock})` });
            subtotal += product.price * qty;
            orderItemRows.push({ productId, quantity: qty, price: product.price });
        }

        const shipping = Math.max(0, Number(shippingCost) || 0);
        const discount = Math.min(Math.max(0, Number(discountAmount) || 0), subtotal);
        const total = Math.max(0, subtotal - discount + shipping);

        const order = await prisma.order.create({
            data: {
                userId: authUser.id,
                total,
                shippingCost: shipping,
                shippingCourier: shippingCourier ? String(shippingCourier) : undefined,
                province: province ? String(province) : undefined,
                city: city ? String(city) : undefined,
                district: district ? String(district) : undefined,
                village: village ? String(village) : undefined,
                fullAddress: fullAddress ? String(fullAddress) : undefined,
                status: 'Pending Payment',
                items: {
                    create: orderItemRows,
                },
            },
            include: { items: true },
        });

        // Decrement stock with guarded updates; rollback order + stock if any fails
        const decremented: { productId: number; quantity: number }[] = [];
        for (const row of orderItemRows) {
            const result = await prisma.product.updateMany({
                where: { id: row.productId, stock: { gte: row.quantity } },
                data: { stock: { decrement: row.quantity } },
            });
            if (result.count === 0) {
                for (const d of decremented) {
                    await prisma.product.updateMany({
                        where: { id: d.productId },
                        data: { stock: { increment: d.quantity } },
                    });
                }
                await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
                await prisma.order.delete({ where: { id: order.id } });
                const product = productMap.get(row.productId);
                return res.status(409).json({ error: `Stok "${product?.name}" tidak mencukupi` });
            }
            decremented.push({ productId: row.productId, quantity: row.quantity });
        }

        res.json(order);
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

app.get('/api/orders', requireAdmin, async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: { user: true, items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

app.get('/api/orders/user/:userId', requireAuth, async (req, res) => {
    try {
        if (!ownsOrAdmin(req, req.params.userId)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const orders = await prisma.order.findMany({
            where: { userId: Number(req.params.userId) },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' },
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user orders' });
    }
});

app.put('/api/orders/:id/status', requireAdmin, async (req, res) => {
    try {
        const { status, trackingNumber } = req.body;
        const order = await prisma.order.update({
            where: { id: String(req.params.id) },
            data: {
                status,
                trackingNumber: trackingNumber || undefined
            },
        });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

// --- CART ---
app.get('/api/cart/:userId', requireAuth, async (req, res) => {
    try {
        if (!ownsOrAdmin(req, req.params.userId)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const cart = await prisma.cart.findUnique({
            where: { userId: Number(req.params.userId) },
            include: { items: { include: { product: true } } },
        });
        res.json(cart ? cart.items : []);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

app.post('/api/cart', requireAuth, async (req, res) => {
    try {
        const authUser = (req as any).user;
        const { productId, quantity } = req.body;
        const userId = Number(authUser.id); // always use the authenticated user

        // Ensure cart exists
        let cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = await prisma.cart.create({ data: { userId } });
        }

        // Upsert cart item
        const cartItem = await prisma.cartItem.upsert({
            where: {
                cartId_productId: {
                    cartId: cart.id,
                    productId: Number(productId),
                },
            },
            update: {
                quantity: { increment: Number(quantity) },
            },
            create: {
                cartId: cart.id,
                productId: Number(productId),
                quantity: Number(quantity),
            },
            include: { product: true },
        });

        res.json(cartItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add to cart' });
    }
});

app.delete('/api/cart/:userId/item/:productId', requireAuth, async (req, res) => {
    try {
        const { productId } = req.params;
        if (!ownsOrAdmin(req, req.params.userId)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const cart = await prisma.cart.findUnique({ where: { userId: Number(req.params.userId) } });
        if (cart) {
            await prisma.cartItem.delete({
                where: {
                    cartId_productId: {
                        cartId: cart.id,
                        productId: Number(productId),
                    },
                },
            });
        }
        res.json({ message: 'Item removed' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove item' });
    }
});

app.delete('/api/cart/:userId', requireAuth, async (req, res) => {
    try {
        if (!ownsOrAdmin(req, req.params.userId)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const { userId } = req.params;
        const cart = await prisma.cart.findUnique({ where: { userId: Number(userId) } });
        if (cart) {
            await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
        }
        res.json({ message: 'Cart cleared' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

// --- WISHLIST ---
app.get('/api/wishlist/:userId', requireAuth, async (req, res) => {
    try {
        if (!ownsOrAdmin(req, req.params.userId)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const wishlist = await prisma.wishlist.findUnique({
            where: { userId: Number(req.params.userId) },
            include: { items: { include: { product: true } } },
        });
        res.json(wishlist ? wishlist.items : []);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
});

app.post('/api/wishlist', requireAuth, async (req, res) => {
    try {
        const authUser = (req as any).user;
        const { productId } = req.body;
        const userId = Number(authUser.id); // always use the authenticated user

        let wishlist = await prisma.wishlist.findUnique({ where: { userId } });
        if (!wishlist) {
            wishlist = await prisma.wishlist.create({ data: { userId } });
        }

        await prisma.wishlistItem.create({
            data: {
                wishlistId: wishlist.id,
                productId: Number(productId),
            },
        });

        res.json({ message: 'Added to wishlist' });
    } catch (error) {
        // Ignore duplicate errors
        res.json({ message: 'Already in wishlist' });
    }
});

app.delete('/api/wishlist/:userId/item/:productId', requireAuth, async (req, res) => {
    try {
        const { productId } = req.params;
        if (!ownsOrAdmin(req, req.params.userId)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const wishlist = await prisma.wishlist.findUnique({ where: { userId: Number(req.params.userId) } });
        if (wishlist) {
            await prisma.wishlistItem.delete({
                where: {
                    wishlistId_productId: {
                        wishlistId: wishlist.id,
                        productId: Number(productId),
                    },
                },
            });
        }
        res.json({ message: 'Removed from wishlist' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
});

// --- VOUCHERS ---
app.get('/api/vouchers', async (req, res) => {
    try {
        // Explicit select to exclude claimedBy relation
        const vouchers = await prisma.voucher.findMany({
            select: {
                id: true,
                code: true,
                discountPercentage: true,
                startDate: true,
                endDate: true,
                productId: true,
                createdAt: true,
                updatedAt: true
                // Note: claimedBy relation explicitly excluded
            }
        });
        res.json(vouchers);
    } catch (error) {
        console.error('Vouchers fetch error:', error instanceof Error ? error.message : error);
        res.status(500).json({
            error: 'Gagal mengambil data voucher'
        });
    }
});

app.post('/api/vouchers/claim', requireAuth, async (req, res) => {
    try {
        const authUser = (req as any).user;
        const { voucherId } = req.body;
        const userId = Number(authUser.id); // always use the authenticated user
        await prisma.user.update({
            where: { id: userId },
            data: {
                claimedVouchers: {
                    connect: { id: Number(voucherId) }
                }
            }
        });
        res.json({ message: 'Voucher claimed' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to claim voucher' });
    }
});

app.get('/api/vouchers/user/:userId', requireAuth, async (req, res) => {
    try {
        if (!ownsOrAdmin(req, req.params.userId)) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const userId = Number(req.params.userId);

        // Get vouchers claimed by this user
        const vouchers = await prisma.voucher.findMany({
            where: {
                claimedBy: {
                    some: {
                        id: userId
                    }
                }
            }
        });

        res.json(vouchers);
    } catch (error) {
        console.error('User vouchers fetch error:', error instanceof Error ? error.message : error);
        res.status(500).json({
            error: 'Gagal mengambil data voucher pengguna'
        });
    }
});

app.post('/api/vouchers/validate', requireAuth, async (req, res) => {
    try {
        const authUser = (req as any).user;
        const { code } = req.body;
        const userId = Number(authUser.id); // always use the authenticated user

        // First, find the voucher
        const voucher = await prisma.voucher.findUnique({
            where: { code }
        });

        if (!voucher) {
            return res.status(404).json({ error: 'Voucher not found' });
        }

        // Check if expired
        const now = new Date();
        if (now < voucher.startDate || now > voucher.endDate) {
            return res.status(400).json({ error: 'Voucher is expired or not yet active' });
        }

        // Check if user has claimed this voucher
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                claimedVouchers: {
                    where: { id: voucher.id }
                }
            }
        });

        if (!user || user.claimedVouchers.length === 0) {
            return res.status(400).json({ error: 'You have not claimed this voucher' });
        }

        res.json(voucher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to validate voucher' });
    }
});

app.post('/api/vouchers', requireAdmin, async (req, res) => {
    try {
        const { code, discountPercentage, startDate, endDate } = req.body;
        const voucher = await prisma.voucher.create({
            data: {
                code: sanitizeInput(code, 50).toUpperCase(),
                discountPercentage: Math.min(100, Math.max(0, Number(discountPercentage) || 0)),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            },
        });
        res.json(voucher);
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        res.status(500).json({ error: 'Gagal membuat voucher' });
    }
});

app.put('/api/vouchers/:id', requireAdmin, async (req, res) => {
    try {
        const { code, discountPercentage, startDate, endDate } = req.body;
        const voucher = await prisma.voucher.update({
            where: { id: Number(req.params.id) },
            data: {
                code: code ? sanitizeInput(code, 50).toUpperCase() : undefined,
                discountPercentage: discountPercentage !== undefined ? Math.min(100, Math.max(0, Number(discountPercentage))) : undefined,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            },
        });
        res.json(voucher);
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        res.status(500).json({ error: 'Gagal memperbarui voucher' });
    }
});

app.delete('/api/vouchers/:id', requireAdmin, async (req, res) => {
    try {
        await prisma.voucher.delete({
            where: { id: Number(req.params.id) },
        });
        res.json({ message: 'Voucher deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete voucher' });
    }
});

// --- SEO SITEMAP & ROBOTS.TXT FOR GOOGLEBOT / BINGBOT ---
app.get('/sitemap.xml', async (req, res) => {
    try {
        const baseUrl = process.env.BETTER_AUTH_URL || 'https://tapakpamungkas.my.id';
        const products = await prisma.product.findMany({
            select: { id: true, name: true, updatedAt: true, imageUrls: true, category: true }
        });

        const slugifyLocal = (text: string) => text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
        const xmlEscape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

        const lastmodNow = new Date().toISOString();

        const staticPages = [
            { url: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
            { url: `${baseUrl}/katalog`, priority: '0.9', changefreq: 'daily' },
            { url: `${baseUrl}/tentang-kami`, priority: '0.8', changefreq: 'weekly' },
            { url: `${baseUrl}/kontak`, priority: '0.8', changefreq: 'weekly' },
            { url: `${baseUrl}/kupon`, priority: '0.7', changefreq: 'weekly' },
            { url: `${baseUrl}/blog`, priority: '0.8', changefreq: 'weekly' },
            { url: `${baseUrl}/faq`, priority: '0.6', changefreq: 'monthly' },
            { url: `${baseUrl}/privasi`, priority: '0.3', changefreq: 'monthly' },
            { url: `${baseUrl}/syarat-ketentuan`, priority: '0.3', changefreq: 'monthly' },
        ];

        const blogSlugs = [
            'perawatan-keris-pusaka-sepuh',
            'mengenal-media-bertuah',
            'tips-memilih-pusaka-pemula',
            'peran-ruwatan-keilmuan',
        ];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

        for (const page of staticPages) {
            xml += `  <url>\n`;
            xml += `    <loc>${page.url}</loc>\n`;
            xml += `    <lastmod>${lastmodNow}</lastmod>\n`;
            xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
            xml += `    <priority>${page.priority}</priority>\n`;
            xml += `  </url>\n`;
        }

        for (const slug of blogSlugs) {
            xml += `  <url>\n`;
            xml += `    <loc>${xmlEscape(`${baseUrl}/blog/${slug}`)}</loc>\n`;
            xml += `    <lastmod>${lastmodNow}</lastmod>\n`;
            xml += `    <changefreq>monthly</changefreq>\n`;
            xml += `    <priority>0.6</priority>\n`;
            xml += `  </url>\n`;
        }

        for (const product of products) {
            const slug = slugifyLocal(product.name);
            const productUrl = `${baseUrl}/produk/${slug}`;
            const lastMod = product.updatedAt ? new Date(product.updatedAt).toISOString() : lastmodNow;
            const mainImg = product.imageUrls && product.imageUrls[0] ? product.imageUrls[0] : '';
            const productName = xmlEscape(product.name);

            xml += `  <url>\n`;
            xml += `    <loc>${xmlEscape(productUrl)}</loc>\n`;
            xml += `    <lastmod>${lastMod}</lastmod>\n`;
            xml += `    <changefreq>daily</changefreq>\n`;
            xml += `    <priority>0.9</priority>\n`;
            if (mainImg) {
                xml += `    <image:image>\n`;
                xml += `      <image:loc>${xmlEscape(mainImg)}</image:loc>\n`;
                xml += `      <image:title>${productName}</image:title>\n`;
                xml += `      <image:caption>Pusaka & Benda Bertuah ${xmlEscape(product.category || 'Nusantara')} - Tapak Pamungkas</image:caption>\n`;
                xml += `    </image:image>\n`;
            }
            xml += `  </url>\n`;
        }

        xml += `</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.header('Cache-Control', 'public, max-age=3600');
        res.send(xml);
    } catch (error) {
        console.error('Sitemap generation error:', error);
        res.status(500).send('Error generating sitemap');
    }
});

app.get('/robots.txt', (req, res) => {
    const baseUrl = process.env.BETTER_AUTH_URL || 'https://tapakpamungkas.my.id';
    const robots = `User-agent: *
Allow: /
Allow: /katalog
Allow: /produk/
Allow: /tentang-kami
Allow: /kontak
Allow: /kupon
Allow: /blog
Allow: /faq
Allow: /privasi
Allow: /syarat-ketentuan
Disallow: /api/
Disallow: /admin
Disallow: /masuk
Disallow: /daftar
Disallow: /keranjang
Disallow: /checkout
Disallow: /konfirmasi-pesanan
Disallow: /wishlist
Disallow: /riwayat-pesanan
Disallow: /profil
Disallow: /katalog?q=

Sitemap: ${baseUrl}/sitemap.xml
`;
    res.header('Content-Type', 'text/plain');
    res.send(robots);
});

// --- INDEXNOW PROTOCOL FOR BING, YANDEX, SEZNAM, NAVER INSTANT INDEXING ---
const INDEXNOW_KEY = '4a8f9b2c3d4e5f6a7b8c9d0e1f2a3b4c';

app.get(`/${INDEXNOW_KEY}.txt`, (req, res) => {
    res.header('Content-Type', 'text/plain');
    res.send(INDEXNOW_KEY);
});

async function submitToIndexNow(urls: string[]) {
    if (!urls || urls.length === 0) return { success: false, count: 0 };
    const baseUrl = process.env.BETTER_AUTH_URL || 'https://tapakpamungkas.my.id';
    const cleanHost = baseUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    
    const formattedUrls = urls.map(u => u.startsWith('http') ? u : `${baseUrl}${u.startsWith('/') ? '' : '/'}${u}`);
    const payload = {
        host: cleanHost,
        key: INDEXNOW_KEY,
        keyLocation: `${baseUrl}/${INDEXNOW_KEY}.txt`,
        urlList: formattedUrls
    };

    const endpoints = [
        'https://api.indexnow.org/indexnow',
        'https://www.bing.com/indexnow',
        'https://yandex.com/indexnow'
    ];

    let successCount = 0;
    for (const endpoint of endpoints) {
        try {
            const resp = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body: JSON.stringify(payload)
            });
            if (resp.ok || resp.status === 200 || resp.status === 202) {
                successCount++;
            }
        } catch (e) {
            console.warn(`IndexNow submission error for ${endpoint}:`, e);
        }
    }
    return { success: successCount > 0, count: formattedUrls.length };
}

app.post('/api/indexnow/submit', requireAdmin, async (req, res) => {
    try {
        const { urls } = req.body || {};
        let urlsToSubmit: string[] = [];

        if (Array.isArray(urls) && urls.length > 0) {
            urlsToSubmit = urls;
        } else {
            const baseUrl = process.env.BETTER_AUTH_URL || 'https://tapakpamungkas.my.id';
            const products = await prisma.product.findMany({ select: { name: true, slug: true } });
            
            const staticPages = [
                `${baseUrl}/`,
                `${baseUrl}/katalog`,
                `${baseUrl}/tentang-kami`,
                `${baseUrl}/kontak`,
                `${baseUrl}/kupon`,
                `${baseUrl}/blog`,
                `${baseUrl}/faq`
            ];

            const slugifyLocal = (text: string) => text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
            const productPages = products.map(p => `${baseUrl}/produk/${p.slug || slugifyLocal(p.name)}`);
            urlsToSubmit = [...staticPages, ...productPages];
        }

        const result = await submitToIndexNow(urlsToSubmit);
        res.json({
            message: 'IndexNow submission processed successfully',
            submittedUrlsCount: result.count,
            result
        });
    } catch (error) {
        console.error('IndexNow error:', error);
        res.status(500).json({ error: 'Failed to submit IndexNow request' });
    }
});

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

export default app;
