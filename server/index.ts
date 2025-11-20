import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './db';

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
    ? ['https://tapakpamungkas.com', 'https://www.tapakpamungkas.com']
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

app.use(express.json({ limit: '10mb' }));

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
        const products = await prisma.product.findMany();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products', details: error instanceof Error ? error.message : String(error) });
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

app.put('/api/products/:id', async (req, res) => {
    try {
        const { name, description, price, imageUrls, category, stock } = req.body;
        const product = await prisma.product.update({
            where: { id: Number(req.params.id) },
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
        res.status(500).json({ error: 'Failed to update product' });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await prisma.product.delete({
            where: { id: Number(req.params.id) },
        });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// --- USERS ---
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        console.log('Login attempt for:', email);

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            console.log('User not found:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        if (user.password !== password) {
            console.log('Password mismatch for:', email);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log('Login successful for:', email);
        res.json(user);
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Login failed',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password, // In real app, hash this
                isAdmin: false,
            },
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const { name, email, isAdmin } = req.body;
        const user = await prisma.user.update({
            where: { id: Number(req.params.id) },
            data: { name, email, isAdmin: Boolean(isAdmin) },
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        await prisma.user.delete({
            where: { id: Number(req.params.id) },
        });
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// --- ORDERS ---
app.post('/api/orders', async (req, res) => {
    try {
        const { userId, items, total } = req.body;
        // items should be array of { productId, quantity, price }

        const order = await prisma.order.create({
            data: {
                userId,
                total,
                status: 'Pending Payment',
                items: {
                    create: items.map((item: any) => ({
                        productId: item.id,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
            include: { items: true },
        });
        res.json(order);
    } catch (error) {
        console.error(error);
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
        const vouchers = await prisma.voucher.findMany();
        res.json(vouchers);
    } catch (error) {
        console.error('Vouchers fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch vouchers', details: error instanceof Error ? error.message : String(error) });
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

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

export default app;
