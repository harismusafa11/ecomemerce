import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './db';
import { hashPassword, verifyPassword, sanitizeUser, isValidEmail } from '../lib/security';

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

// CORS configuration
const allowedOrigins = process.env.NODE_ENV === 'production'
    ? ['https://tapakpamungkas.my.id', 'https://www.tapakpamungkas.my.id', 'https://tapakpamungkas.com', 'https://www.tapakpamungkas.com']
    : ['http://localhost:5173', 'http://localhost:3000'];

// Allow all origins in production for Vercel preview/deployments if not matching specific domains
// Or better yet, just rely on the fact that we are using rewrites so it's same-origin.
// But to be safe, let's allow the Vercel app domain if you know it, or just allow all for this debugging phase.
// Let's make it dynamic to allow any vercel.app domain.
const allowVercel = (origin: string | undefined) => {
    if (!origin) return true;
    if (allowedOrigins.includes(origin)) return true;
    if (origin.endsWith('.vercel.app')) return true;
    return false;
};

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc)
        if (!origin) return callback(null, true);

        if (allowVercel(origin)) {
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
import { auth } from '../lib/auth';

app.use(express.json({ limit: '10mb' }));

// Better Auth Router
app.all('/api/auth/*', toNodeHandler(auth));

// Rate limiting (simple implementation)
const requestCounts = new Map();
app.use((req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 100; // max requests per window

    if (!requestCounts.has(ip)) {
        requestCounts.set(ip, []);
    }

    const requests = requestCounts.get(ip).filter((time: number) => now - time < windowMs);
    requests.push(now);
    requestCounts.set(ip, requests);

    if (requests.length > maxRequests) {
        return res.status(429).json({ error: 'Too many requests' });
    }

    next();
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- PRODUCTS ---
app.get('/api/products', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            orderBy: { id: 'asc' }
        });
        return res.json(products);
    } catch (error) {
        console.error('Error fetching products from database:', error);
        return res.status(500).json({
            error: 'Failed to fetch products from database',
            details: error instanceof Error ? error.message : String(error)
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

app.post('/api/products', async (req, res) => {
    try {
        const { name, description, price, imageUrls, category, stock } = req.body;
        const product = await prisma.product.create({
            data: {
                name,
                description,
                price: Number(price),
                imageUrls,
                category,
                stock: Number(stock),
            },
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
});

const handleProductUpdate = async (req: express.Request, res: express.Response) => {
    try {
        const productId = Number(req.params.id || req.query.id);
        if (isNaN(productId)) {
            return res.status(400).json({ error: 'Invalid product ID' });
        }
        const { name, description, price, imageUrls, category, stock } = req.body;
        const product = await prisma.product.update({
            where: { id: productId },
            data: {
                name: name ? String(name).trim() : undefined,
                description: description ? String(description).trim() : undefined,
                price: price !== undefined ? Number(price) : undefined,
                imageUrls: Array.isArray(imageUrls) ? imageUrls : undefined,
                category: category ? String(category).trim() : undefined,
                stock: stock !== undefined ? Number(stock) : undefined,
            },
        });
        res.json(product);
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Failed to update product', details: error instanceof Error ? error.message : String(error) });
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

app.put('/api/products/:id', handleProductUpdate);
app.put('/api/products', handleProductUpdate);
app.delete('/api/products/:id', handleProductDelete);
app.delete('/api/products', handleProductDelete);

// --- USERS ---
// --- USERS & AUTHENTICATION ---
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};

        if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ error: 'Email and password required' });
        }

        const trimmedEmail = email.trim().toLowerCase();

        if (!isValidEmail(trimmedEmail)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const user = await prisma.user.findUnique({
            where: { email: trimmedEmail },
        });

        if (!user || !user.password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isPasswordValid = verifyPassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        return res.json(sanitizeUser(user));
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Login failed' });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body || {};

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password required' });
        }

        const trimmedName = String(name).trim();
        const trimmedEmail = String(email).trim().toLowerCase();

        if (!isValidEmail(trimmedEmail)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        if (String(password).length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email: trimmedEmail },
            select: { id: true }
        });

        if (existingUser) {
            return res.status(409).json({ error: 'Email already registered' });
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

        return res.status(201).json(sanitizeUser(user));
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Registration failed' });
    }
});

app.get('/api/users', async (req, res) => {
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

app.put('/api/users/:id', async (req, res) => {
    try {
        const userId = Number(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
        }
        const { name, email, isAdmin } = req.body || {};
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

app.delete('/api/users/:id', async (req, res) => {
    try {
        const userId = Number(req.params.id);
        if (isNaN(userId)) {
            return res.status(400).json({ error: 'Invalid user ID' });
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
        const BINDERBYTE_API_KEY = process.env.BINDERBYTE_API_KEY || '61af8cfe84f6a0cebbe7ff3c37d5839c1a2341e8969c3d20d9137bb98434578b';
        const searchTerm = String(req.query.search || req.body?.search || '').trim();

        if (searchTerm) {
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
app.get('/api/addresses/:userId', async (req, res) => {
    try {
        const addresses = await prisma.userAddress.findMany({
            where: { userId: Number(req.params.userId) },
            orderBy: { isPrimary: 'desc' },
        });
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user addresses' });
    }
});

app.post('/api/addresses', async (req, res) => {
    try {
        const { userId, recipientName, phone, province, city, district, village, postalCode, fullAddress, isPrimary } = req.body;

        if (isPrimary) {
            await prisma.userAddress.updateMany({
                where: { userId: Number(userId) },
                data: { isPrimary: false },
            });
        }

        const address = await prisma.userAddress.create({
            data: {
                userId: Number(userId),
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

app.delete('/api/addresses/:id', async (req, res) => {
    try {
        await prisma.userAddress.delete({
            where: { id: Number(req.params.id) },
        });
        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete address' });
    }
});

// --- ORDERS ---
app.post('/api/orders', async (req, res) => {
    try {
        const { userId, items, total, shippingCost, shippingCourier, province, city, district, village, fullAddress } = req.body;

        const order = await prisma.order.create({
            data: {
                userId: Number(userId),
                total: Number(total),
                shippingCost: Number(shippingCost || 0),
                shippingCourier: shippingCourier ? String(shippingCourier) : undefined,
                province: province ? String(province) : undefined,
                city: city ? String(city) : undefined,
                district: district ? String(district) : undefined,
                village: village ? String(village) : undefined,
                fullAddress: fullAddress ? String(fullAddress) : undefined,
                status: 'Pending Payment',
                items: {
                    create: items.map((item: any) => ({
                        productId: Number(item.id || item.productId),
                        quantity: Number(item.quantity),
                        price: Number(item.price),
                    })),
                },
            },
            include: { items: true },
        });
        res.json(order);
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

app.get('/api/orders', async (req, res) => {
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

app.get('/api/orders/user/:userId', async (req, res) => {
    try {
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

app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { status, trackingNumber } = req.body;
        const order = await prisma.order.update({
            where: { id: req.params.id },
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
app.get('/api/cart/:userId', async (req, res) => {
    try {
        const cart = await prisma.cart.findUnique({
            where: { userId: Number(req.params.userId) },
            include: { items: { include: { product: true } } },
        });
        res.json(cart ? cart.items : []);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

app.post('/api/cart', async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

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
                    productId: productId,
                },
            },
            update: {
                quantity: { increment: quantity },
            },
            create: {
                cartId: cart.id,
                productId: productId,
                quantity: quantity,
            },
            include: { product: true },
        });

        res.json(cartItem);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add to cart' });
    }
});

app.delete('/api/cart/:userId/item/:productId', async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const cart = await prisma.cart.findUnique({ where: { userId: Number(userId) } });
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

app.delete('/api/cart/:userId', async (req, res) => {
    try {
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
app.get('/api/wishlist/:userId', async (req, res) => {
    try {
        const wishlist = await prisma.wishlist.findUnique({
            where: { userId: Number(req.params.userId) },
            include: { items: { include: { product: true } } },
        });
        // Return array of product IDs to match frontend expectation, or full objects?
        // Frontend currently expects number[]. Let's stick to that for now or update frontend.
        // Actually, let's return the full items and update frontend to handle it, or map it here.
        // For now, let's return the items and let frontend decide.
        res.json(wishlist ? wishlist.items : []);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
});

app.post('/api/wishlist', async (req, res) => {
    try {
        const { userId, productId } = req.body;

        let wishlist = await prisma.wishlist.findUnique({ where: { userId } });
        if (!wishlist) {
            wishlist = await prisma.wishlist.create({ data: { userId } });
        }

        await prisma.wishlistItem.create({
            data: {
                wishlistId: wishlist.id,
                productId: productId,
            },
        });

        res.json({ message: 'Added to wishlist' });
    } catch (error) {
        // Ignore duplicate errors
        res.json({ message: 'Already in wishlist' });
    }
});

app.delete('/api/wishlist/:userId/item/:productId', async (req, res) => {
    try {
        const { userId, productId } = req.params;
        const wishlist = await prisma.wishlist.findUnique({ where: { userId: Number(userId) } });
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
        console.error('Vouchers fetch error:', error);
        res.status(500).json({
            error: 'Failed to fetch vouchers',
            details: error instanceof Error ? error.message : String(error),
            stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
        });
    }
});

app.post('/api/vouchers/claim', async (req, res) => {
    try {
        const { userId, voucherId } = req.body;
        await prisma.user.update({
            where: { id: userId },
            data: {
                claimedVouchers: {
                    connect: { id: voucherId }
                }
            }
        });
        res.json({ message: 'Voucher claimed' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to claim voucher' });
    }
});

app.get('/api/vouchers/user/:userId', async (req, res) => {
    try {
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
        console.error('User vouchers fetch error:', error);
        res.status(500).json({
            error: 'Failed to fetch user vouchers',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

app.post('/api/vouchers/validate', async (req, res) => {
    try {
        const { userId, code } = req.body;

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
            where: { id: Number(userId) },
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

app.post('/api/vouchers', async (req, res) => {
    try {
        const { code, discountPercentage, startDate, endDate } = req.body;
        const voucher = await prisma.voucher.create({
            data: {
                code,
                discountPercentage: Number(discountPercentage),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            },
        });
        res.json(voucher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create voucher' });
    }
});

app.put('/api/vouchers/:id', async (req, res) => {
    try {
        const { code, discountPercentage, startDate, endDate } = req.body;
        const voucher = await prisma.voucher.update({
            where: { id: Number(req.params.id) },
            data: {
                code,
                discountPercentage: Number(discountPercentage),
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            },
        });
        res.json(voucher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update voucher' });
    }
});

app.delete('/api/vouchers/:id', async (req, res) => {
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
            select: { id: true, name: true, updatedAt: true, imageUrls: true }
        });

        const slugifyLocal = (text: string) => text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');

        const staticPages = [
            { url: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
            { url: `${baseUrl}/#/katalog`, priority: '0.9', changefreq: 'daily' },
            { url: `${baseUrl}/#/tentang-kami`, priority: '0.8', changefreq: 'weekly' },
            { url: `${baseUrl}/#/kontak`, priority: '0.8', changefreq: 'weekly' },
            { url: `${baseUrl}/#/kupon`, priority: '0.7', changefreq: 'weekly' },
        ];

        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

        for (const page of staticPages) {
            xml += `  <url>\n`;
            xml += `    <loc>${page.url}</loc>\n`;
            xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
            xml += `    <priority>${page.priority}</priority>\n`;
            xml += `  </url>\n`;
        }

        for (const product of products) {
            const slug = slugifyLocal(product.name);
            const productUrl = `${baseUrl}/#/produk/${slug}`;
            const lastMod = product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString();
            const mainImg = product.imageUrls && product.imageUrls[0] ? product.imageUrls[0] : '';

            xml += `  <url>\n`;
            xml += `    <loc>${productUrl}</loc>\n`;
            xml += `    <lastmod>${lastMod}</lastmod>\n`;
            xml += `    <changefreq>daily</changefreq>\n`;
            xml += `    <priority>0.9</priority>\n`;
            if (mainImg) {
                xml += `    <image:image>\n`;
                xml += `      <image:loc>${mainImg}</image:loc>\n`;
                xml += `      <image:title>${product.name.replace(/&/g, '&amp;')}</image:title>\n`;
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
    const robots = `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /admin\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
    res.header('Content-Type', 'text/plain');
    res.send(robots);
});

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

export default app;
