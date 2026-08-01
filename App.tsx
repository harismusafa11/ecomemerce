import React, { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react';
import { Page, Product, User, Order, Voucher, CartItem } from './types';
import { motion, AnimatePresence, Transition } from 'framer-motion';
import { LocaleProvider } from './context/LocaleContext';
import { ThemeProvider } from './context/ThemeContext';
import { useTranslations } from './hooks/useTranslations';
import { api } from './services/api';
import { getProductSlug, updateSEO, generateProductSchema } from './lib/seo';

// Import Components
import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/ui/Toast';

// Lazy load Pages for performance optimization
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const AllProductsPage = lazy(() => import('./pages/AllProductsPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const VoucherPage = lazy(() => import('./pages/VoucherPage'));
const OrderHistoryPage = lazy(() => import('./pages/OrderHistoryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));


type ToastState = {
    message: string;
    type: 'success' | 'error';
} | null;

interface FlyingAnimState {
    id: number;
    src: string;
    startRect: DOMRect;
}

const pageVariants = {
    initial: { opacity: 0, x: "1.5rem", filter: "blur(4px)" },
    animate: { opacity: 1, x: "0rem", filter: "blur(0px)" },
    exit: { opacity: 0, x: "-1.5rem", filter: "blur(4px)" },
};

const pageTransition: Transition = {
    duration: 0.5,
    ease: [0.22, 1, 0.36, 1], // Quintic Out ease
};

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-full w-full absolute inset-0 bg-brand-light">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-primary"></div>
    </div>
);


const AppContent: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [wishlistItems, setWishlistItems] = useState<number[]>([]);
    const [claimedVouchers, setClaimedVouchers] = useState<number[]>([]);
    const [allVouchers, setAllVouchers] = useState<Voucher[]>([]);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [lastOrderId, setLastOrderId] = useState<string | null>(null);
    const [lastPaymentMethod, setLastPaymentMethod] = useState<string | null>(null);
    const [lastOrderTotal, setLastOrderTotal] = useState<number>(0);
    const [toast, setToast] = useState<ToastState>(null);
    const [cartIconRect, setCartIconRect] = useState<DOMRect | null>(null);
    const [flyingAnim, setFlyingAnim] = useState<FlyingAnimState | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { t } = useTranslations();

    const ADMIN_EMAIL = 'admin@tapakpamungkas.com';

    // --- EFFECTS ---
    // Fetch products on mount
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const productsData = await api.getProducts();
                setProducts(productsData);
            } catch (error) {
                console.error("Failed to fetch products", error);
            }

            try {
                const vouchersData = await api.getVouchers();
                setAllVouchers(vouchersData);
            } catch (error) {
                console.error("Failed to fetch vouchers", error);
            }
        };
        fetchInitialData();

        // Check for persisted user
        const storedUser = localStorage.getItem('currentUser');

        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                setCurrentUser(user);

                // Fetch user data
                // Use separate try-catch blocks to prevent logout on data fetch failure
                api.getCart(user.id)
                    .then(items => {
                        // items from API are CartItem[] (with product info merged in backend or here)
                        // The backend returns { ...cartItem, product: { ... } }
                        // We need to map it to CartItem structure: { ...product, quantity }
                        const mappedItems = items.map((i: any) => ({
                            ...i.product,
                            quantity: i.quantity
                        }));
                        setCartItems(mappedItems);
                    })
                    .catch(e => console.error("Failed to fetch cart", e));

                api.getWishlist(user.id)
                    .then(items => setWishlistItems(items.map((i: any) => i.productId)))
                    .catch(e => console.error("Failed to fetch wishlist", e));

                api.getUserVouchers(user.id)
                    .then(vouchers => setClaimedVouchers(vouchers.map((v: any) => v.id)))
                    .catch(e => console.error("Failed to fetch vouchers", e));

            } catch (e) {
                console.error("Failed to parse stored user", e);
                localStorage.removeItem('currentUser');
            }
        }
    }, []);

    // Refresh vouchers when navigating to vouchers page or product page
    useEffect(() => {
        if (currentPage === 'vouchers' || currentPage === 'product') {
            const refreshVouchers = async () => {
                try {
                    const vouchersData = await api.getVouchers();
                    setAllVouchers(vouchersData);
                } catch (error) {
                    console.error("Failed to refresh vouchers", error);
                }
            };
            refreshVouchers();
        }
    }, [currentPage]);

    // Scroll to top on page change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [currentPage, selectedProduct]);

    // --- TOAST NOTIFICATION HANDLER ---
    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    // --- CALLBACK REFS ---
    const cartIconRefCallback = useCallback((node: HTMLButtonElement | null) => {
        if (node) {
            // Use a timeout to ensure layout is stable
            setTimeout(() => setCartIconRect(node.getBoundingClientRect()), 0);
        }
    }, []);

    // --- PAGE SLUGS & HASH ROUTING ---
    const PAGE_TO_HASH: Record<Page, string> = {
        home: '#/',
        allProducts: '#/katalog',
        about: '#/tentang-kami',
        contact: '#/kontak',
        cart: '#/keranjang',
        checkout: '#/checkout',
        wishlist: '#/wishlist',
        vouchers: '#/kupon',
        orderHistory: '#/riwayat-pesanan',
        profile: '#/profil',
        login: '#/masuk',
        register: '#/daftar',
        adminLogin: '#/admin-login',
        adminPanel: '#/admin',
        orderConfirmation: '#/konfirmasi-pesanan',
        product: '#/produk',
    };

    const HASH_TO_PAGE: Record<string, Page> = {
        '#/': 'home',
        '#': 'home',
        '': 'home',
        '#/katalog': 'allProducts',
        '#/tentang-kami': 'about',
        '#/kontak': 'contact',
        '#/keranjang': 'cart',
        '#/checkout': 'checkout',
        '#/wishlist': 'wishlist',
        '#/kupon': 'vouchers',
        '#/riwayat-pesanan': 'orderHistory',
        '#/profil': 'profile',
        '#/masuk': 'login',
        '#/daftar': 'register',
        '#/admin-login': 'adminLogin',
        '#/admin': 'adminPanel',
        '#/konfirmasi-pesanan': 'orderConfirmation',
    };

    // --- NAVIGATION WITH SLUG & HASH UPDATES ---
    const handleNavigate = useCallback((page: Page, product?: Product) => {
        setCurrentPage(page);
        if (page === 'product' && product) {
            setSelectedProduct(product);
            const slug = getProductSlug(product);
            window.location.hash = `#/produk/${slug}`;
        } else {
            const hash = PAGE_TO_HASH[page] || '#/';
            window.location.hash = hash;
        }
    }, []);

    // Listen to URL Hash changes for slug routing & deep linking
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash || '#/';
            if (hash.startsWith('#/produk/')) {
                const slugParam = hash.replace('#/produk/', '');
                if (products.length > 0) {
                    const matched = products.find(p => getProductSlug(p) === slugParam || p.id === Number(slugParam));
                    if (matched) {
                        setSelectedProduct(matched);
                        setCurrentPage('product');
                        return;
                    }
                }
            } else if (HASH_TO_PAGE[hash]) {
                setCurrentPage(HASH_TO_PAGE[hash]);
            }
        };

        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [products]);

    // DYNAMIC SEO & SCHEMA.ORG META UPDATES
    useEffect(() => {
        if (currentPage === 'product' && selectedProduct) {
            updateSEO({
                title: `${selectedProduct.name} - Mahar & Detail Pusaka`,
                description: `${selectedProduct.name}: ${selectedProduct.description.slice(0, 150)}...`,
                image: selectedProduct.imageUrls[0],
                type: 'product',
                jsonLd: generateProductSchema(selectedProduct)
            });
        } else if (currentPage === 'allProducts') {
            updateSEO({
                title: 'Katalog Produk & Pusaka Bertuah - Tapak Pamungkas',
                description: 'Jelajahi seluruh keris pusaka sepuh, azimat bertuah, media spiritual, dan jamu herbal nusantara Tapak Pamungkas.'
            });
        } else if (currentPage === 'about') {
            updateSEO({
                title: 'Tentang Kami - Tapak Pamungkas',
                description: 'Pusat Warisan Budaya & Benda Bertuah Nusantara. Melayani pemaharan pusaka, sarana spiritual, dan keilmuan.'
            });
        } else if (currentPage === 'contact') {
            updateSEO({
                title: 'Kontak & Konsultasi - Tapak Pamungkas',
                description: 'Hubungi admin & pengasuh Tapak Pamungkas untuk konsultasi spiritual atau pemaharan pusaka.'
            });
        } else if (currentPage === 'vouchers') {
            updateSEO({
                title: 'Kupon Diskon Pemaharan - Tapak Pamungkas',
                description: 'Klaim kupon promo potongan nilai mahar khusus untuk pemaharan piranti & pusaka pilihan.'
            });
        } else if (currentPage === 'home') {
            updateSEO({
                title: 'Tapak Pamungkas - Pusat Benda Bertuah & Keris Pusaka Nusantara',
                description: 'Pusat Benda Bertuah, Keris Pusaka, Layanan Spiritual & Herbal Nusantara.'
            });
        }
    }, [currentPage, selectedProduct]);

    useEffect(() => {
        if (currentPage === 'adminPanel' && currentUser && currentUser.email !== ADMIN_EMAIL) {
            handleNavigate('adminLogin');
            showToast(t('toasts.adminAccessDenied'), 'error');
        }
    }, [currentPage, currentUser, t, handleNavigate]);

    const handleProductClick = useCallback((product: Product) => {
        handleNavigate('product', product);
    }, [handleNavigate]);

    const handleBackToProducts = useCallback(() => {
        setSelectedProduct(null);
        handleNavigate('allProducts');
    }, [handleNavigate]);

    // --- SEARCH LOGIC ---
    const handleSearchQueryChange = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const handleSearchSubmit = useCallback((query: string) => {
        setSearchQuery(query);
        if (query.trim() && currentPage !== 'allProducts') {
            handleNavigate('allProducts');
        }
    }, [currentPage, handleNavigate]);

    const handleClearSearch = useCallback(() => {
        setSearchQuery('');
    }, []);

    // --- CART LOGIC ---
    const handleAddToCart = useCallback(async (product: Product, startRect: DOMRect) => {
        if (!currentUser) {
            showToast(t('toasts.loginToAdd'), 'error');
            handleNavigate('login');
            return;
        }

        try {
            await api.addToCart(currentUser.id, product.id, 1);

            setFlyingAnim({
                id: Date.now(),
                src: product.imageUrls[0],
                startRect,
            });

            // Update local state
            setCartItems(prev => {
                const existingItem = prev.find(item => item.id === product.id);
                if (existingItem) {
                    return prev.map(item =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                } else {
                    return [...prev, { ...product, quantity: 1 }];
                }
            });

            showToast(t('toasts.itemAddedToCart', { name: product.name }), 'success');
        } catch (error) {
            showToast("Failed to add to cart", 'error');
        }
    }, [currentUser, t, handleNavigate]);

    const handleRemoveFromCart = useCallback(async (productId: number) => {
        if (!currentUser) return;

        try {
            await api.removeFromCart(currentUser.id, productId);
            const itemToRemove = cartItems.find(item => item.id === productId);
            if (itemToRemove) {
                setCartItems(prev => prev.filter(item => item.id !== productId));
                showToast(t('toasts.itemRemovedFromCart', { name: itemToRemove.name }), 'success');
            }
        } catch (error) {
            showToast("Failed to remove from cart", 'error');
        }
    }, [cartItems, t, currentUser]);

    // --- WISHLIST LOGIC ---
    const handleToggleWishlist = useCallback(async (productId: number) => {
        if (!currentUser) {
            showToast(t('toasts.loginToWishlist'), 'error');
            handleNavigate('login');
            return;
        }

        const isInWishlist = wishlistItems.includes(productId);
        try {
            if (isInWishlist) {
                await api.removeFromWishlist(currentUser.id, productId);
                setWishlistItems(prev => prev.filter(id => id !== productId));
                showToast(t('toasts.itemRemovedFromWishlist'), 'success');
            } else {
                await api.addToWishlist(currentUser.id, productId);
                setWishlistItems(prev => [...prev, productId]);
                showToast(t('toasts.itemAddedToWishlist'), 'success');
            }
        } catch (error) {
            showToast("Failed to update wishlist", 'error');
        }
    }, [currentUser, t, handleNavigate, wishlistItems]);

    // --- ORDER/CHECKOUT LOGIC ---
    const handlePlaceOrder = useCallback(async (orderDetails: any) => {
        if (!currentUser) {
            showToast(t('toasts.loginRequired'), 'error');
            handleNavigate('login');
            return;
        }

        try {
            const aggregatedMap = new Map<number, any>();
            cartItems.forEach(item => {
                const qty = item.quantity || 1;
                if (aggregatedMap.has(item.id)) {
                    const existing = aggregatedMap.get(item.id);
                    existing.quantity += qty;
                } else {
                    aggregatedMap.set(item.id, { ...item, quantity: qty });
                }
            });

            const aggregatedList = Array.from(aggregatedMap.values());
            const orderItems = aggregatedList.map(item => ({
                id: item.id,
                productId: item.id,
                quantity: item.quantity,
                price: item.price,
            }));

            const subtotal = aggregatedList.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const discountAmount = orderDetails?.discountAmount || 0;
            const shippingCost = orderDetails?.shippingCost || 0;
            const finalTotal = Math.max(0, subtotal - discountAmount + shippingCost);

            // Pass shipping details to PostgreSQL Database
            const order = await api.createOrder({
                userId: currentUser.id,
                items: orderItems,
                total: finalTotal,
                shippingCost: shippingCost,
                shippingCourier: orderDetails?.shippingCourier || sessionStorage.getItem('cart_shipping_courier') || undefined,
                province: orderDetails?.province || sessionStorage.getItem('cart_dest_prov_name') || undefined,
                city: orderDetails?.city || sessionStorage.getItem('cart_dest_city_name') || undefined,
                district: orderDetails?.district || sessionStorage.getItem('cart_dest_dist_name') || undefined,
                village: orderDetails?.village || sessionStorage.getItem('cart_dest_village_name') || undefined,
                fullAddress: orderDetails?.fullAddress || undefined,
            });

            // Store order details for confirmation page
            const orderIdStr = String(order.id);
            setLastOrderId(orderIdStr);
            setLastPaymentMethod(orderDetails?.paymentMethod || 'bank');
            setLastOrderTotal(finalTotal);

            // Clear remote cart & local state
            try {
                await api.clearCart(currentUser.id);
            } catch (err) {
                console.error('Remote cart clear failed:', err);
            }
            setCartItems([]);

            // Navigate to confirmation page
            handleNavigate('orderConfirmation');
            showToast(t('toasts.orderPlaced') || 'Pesanan berhasil dibuat!', 'success');
        } catch (error) {
            console.error('Order creation failed:', error);
            showToast(t('toasts.orderFailed') || 'Gagal membuat pesanan', 'error');
        }
    }, [currentUser, cartItems, t, handleNavigate]);


    // --- VOUCHER LOGIC ---
    const handleClaimVoucher = useCallback(async (voucherId: number) => {
        if (!currentUser) {
            showToast(t('toasts.loginToClaim'), 'error');
            handleNavigate('login');
            return;
        }
        if (!claimedVouchers.includes(voucherId)) {
            try {
                await api.claimVoucher(currentUser.id, voucherId);
                setClaimedVouchers(prev => [...prev, voucherId]);
                showToast("Voucher claimed successfully!", 'success');
            } catch (error) {
                showToast("Failed to claim voucher", 'error');
            }
        }
    }, [currentUser, claimedVouchers, t, handleNavigate]);


    // --- AUTHENTICATION ---
    const handleLogin = useCallback(async (email: string, pass: string): Promise<User | null> => {
        try {
            const user = await api.login(email, pass);
            console.log('Login response:', user); // Debug log
            setCurrentUser(user);
            localStorage.setItem('currentUser', JSON.stringify(user));

            // Fetch user data (skip for admin to speed up login)
            if (!user.isAdmin) {
                try {
                    const cartItemsData = await api.getCart(user.id);
                    setCartItems(cartItemsData.map((i: any) => ({ ...i.product, quantity: i.quantity })));

                    const wishlist = await api.getWishlist(user.id);
                    setWishlistItems(wishlist.map((i: any) => i.productId));

                    const vouchers = await api.getUserVouchers(user.id);
                    setClaimedVouchers(vouchers.map((v: any) => v.id));
                } catch (error) {
                    console.error('Failed to fetch user data:', error);
                }
            }

            // Redirect based on admin status
            const targetPage = user.isAdmin && user.email === ADMIN_EMAIL ? 'adminPanel' : 'home';
            handleNavigate(targetPage);
            showToast(t('toasts.welcome', { name: user.name }), 'success');
            return user;
        } catch (error) {
            console.error('Login error:', error);
            showToast(t('toasts.loginFailed'), 'error');
            return null;
        }
    }, [t, handleNavigate]);

    const handleAdminLogin = useCallback(async (email: string, pass: string): Promise<User | null> => {
        try {
            const user = await api.login(email, pass);
            console.log('Admin login response:', user); // Debug log

            // Check both isAdmin flag AND email match
            if (user.isAdmin && user.email === ADMIN_EMAIL) {
                setCurrentUser(user);
                localStorage.setItem('currentUser', JSON.stringify(user));
                handleNavigate('adminPanel');
                showToast(t('toasts.welcome', { name: user.name }), 'success');
                return user;
            } else {
                showToast(t('toasts.adminAccessDenied'), 'error');
                return null;
            }
        } catch (error) {
            console.error('Admin login error:', error);
            showToast(t('toasts.loginFailed'), 'error');
            return null;
        }
    }, [t, handleNavigate]);


    const handleLogout = useCallback(() => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
        setCartItems([]); // Clear from UI only, stays in database
        setWishlistItems([]);
        setClaimedVouchers([]);
        handleNavigate('home');
        showToast(t('toasts.logoutSuccess'), 'success');
    }, [t, handleNavigate]);

    const handleRegister = useCallback(async (name: string, email: string, pass: string): Promise<User | null> => {
        try {
            const newUser = await api.register(name, email, pass);
            setCurrentUser(newUser);
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            handleNavigate('home');
            showToast(t('toasts.registerSuccess'), 'success');
            return newUser;
        } catch (error) {
            showToast(t('toasts.emailExists'), 'error'); // Simplified error handling
            return null;
        }
    }, [t, handleNavigate]);

    // --- ADMIN ACCESS ---
    const adminClickCount = useRef(0);
    const adminClickTimer = useRef<number | null>(null);
    const handleAdminTrigger = useCallback(() => {
        adminClickCount.current++;
        if (adminClickTimer.current) {
            clearTimeout(adminClickTimer.current);
        }
        adminClickTimer.current = window.setTimeout(() => {
            adminClickCount.current = 0;
        }, 1000);
        if (adminClickCount.current === 5) {
            adminClickCount.current = 0;
            setCurrentPage('adminLogin');
        }
    }, [])

    // --- PAGE RENDERING ---
    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage products={products} onProductClick={handleProductClick} onNavigate={handleNavigate} onAddToCart={handleAddToCart} wishlistItems={wishlistItems} onToggleWishlist={handleToggleWishlist} />;
            case 'allProducts':
                return <AllProductsPage
                    products={products}
                    searchQuery={searchQuery}
                    onClearSearch={handleClearSearch}
                    onProductClick={handleProductClick}
                    onAddToCart={handleAddToCart}
                    wishlistItems={wishlistItems}
                    onToggleWishlist={handleToggleWishlist}
                />;
            case 'product':
                return selectedProduct && <ProductDetailPage
                    product={selectedProduct}
                    allProducts={products}
                    onAddToCart={handleAddToCart}
                    onProductClick={handleProductClick}
                    onBack={handleBackToProducts}
                    wishlistItems={wishlistItems}
                    onToggleWishlist={handleToggleWishlist}
                    vouchers={allVouchers}
                    claimedVouchers={claimedVouchers}
                    onClaimVoucher={handleClaimVoucher}
                />;
            case 'cart':
                return <CartPage cartItems={cartItems} onRemoveFromCart={handleRemoveFromCart} onCheckout={() => handleNavigate('checkout')} />;
            case 'checkout':
                return <CheckoutPage cartItems={cartItems} onPlaceOrder={handlePlaceOrder} onBack={() => handleNavigate('cart')} userId={currentUser?.id} />;
            case 'orderConfirmation':
                return lastOrderId && <OrderConfirmationPage orderId={lastOrderId} paymentMethod={lastPaymentMethod} total={lastOrderTotal} onNavigate={handleNavigate} />;
            case 'wishlist':
                return <WishlistPage
                    wishlistItems={wishlistItems}
                    allProducts={products}
                    onProductClick={handleProductClick}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    onNavigate={handleNavigate}
                />;
            case 'orderHistory':
                if (!currentUser) {
                    handleNavigate('login');
                    return null;
                }
                // Fetch orders for user
                // For now, we might need to fetch them in the component or here.
                // Let's pass the user ID and let the component fetch, or fetch here.
                // Ideally OrderHistoryPage should fetch.
                return <OrderHistoryPage userId={currentUser.id} onNavigate={handleNavigate} />;
            case 'vouchers':
                return <VoucherPage
                    allVouchers={allVouchers}
                    allProducts={products}
                    claimedVouchers={claimedVouchers}
                    onClaimVoucher={handleClaimVoucher}
                />;
            case 'about':
                return <AboutPage />;
            case 'contact':
                return <ContactPage />;
            case 'login':
                return <LoginPage onLogin={handleLogin} onNavigate={handleNavigate} />;
            case 'register':
                return <RegisterPage onRegister={handleRegister} onNavigate={handleNavigate} />;
            case 'adminLogin':
                return <LoginPage onLogin={handleAdminLogin} onNavigate={handleNavigate} needsAdminAccess={true} />;
            case 'adminPanel':
                // Protect admin panel route
                if (currentUser?.email === ADMIN_EMAIL) {
                    return <AdminPanel onLogout={handleLogout} />;
                }
                // If not the specific admin, a top-level useEffect will handle redirection.
                return null;
            case 'profile':
                return <ProfilePage user={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} />;
            default:
                return <HomePage products={products} onProductClick={handleProductClick} onNavigate={handleNavigate} onAddToCart={handleAddToCart} wishlistItems={wishlistItems} onToggleWishlist={handleToggleWishlist} />;
        }
    };

    // Don't render header/footer for admin panel
    const showLayout = currentPage !== 'adminPanel' && currentPage !== 'adminLogin';

    return (
        <div className="flex flex-col min-h-screen w-full font-sans bg-brand-light">
            {showLayout && <Header
                cartItemCount={cartItems.length}
                wishlistItemCount={wishlistItems.length}
                onNavigate={handleNavigate}
                currentUser={currentUser}
                onLogout={handleLogout}
                onCartClick={() => handleNavigate('cart')}
                onWishlistClick={() => handleNavigate('wishlist')}
                onCartIconRef={cartIconRefCallback}
                searchQuery={searchQuery}
                onSearchQueryChange={handleSearchQueryChange}
                onSearchSubmit={handleSearchSubmit}
                products={products}
                onProductClick={handleProductClick}
            />}
            <main className="flex-grow relative">
                <Suspense fallback={<LoadingSpinner />}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPage + (selectedProduct ? selectedProduct.id : '')}
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={pageTransition}
                        >
                            {renderPage()}
                        </motion.div>
                    </AnimatePresence>
                </Suspense>
            </main>
            {showLayout && <Footer onAdminTrigger={handleAdminTrigger} onNavigate={handleNavigate} />}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <AnimatePresence>
                {flyingAnim && cartIconRect && (
                    <motion.div
                        key={flyingAnim.id}
                        initial={{
                            position: 'fixed',
                            left: flyingAnim.startRect.left,
                            top: flyingAnim.startRect.top,
                            width: flyingAnim.startRect.width,
                            height: flyingAnim.startRect.height,
                            opacity: 0.9,
                            zIndex: 9999,
                            borderRadius: '0.75rem',
                            overflow: 'hidden',
                        }}
                        animate={{
                            left: cartIconRect.left + cartIconRect.width / 2 - 10,
                            top: cartIconRect.top + cartIconRect.height / 2 - 10,
                            width: 20,
                            height: 20,
                            opacity: 0,
                            scale: 0.2,
                            rotate: 180,
                        }}
                        transition={{
                            duration: 0.9,
                            ease: [0.5, 0, 1, 0.5], // Ease-in curve
                        }}
                        onAnimationComplete={() => setFlyingAnim(null)}
                    >
                        <img
                            src={flyingAnim.src}
                            alt="flying item"
                            className="w-full h-full object-cover"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <LocaleProvider>
                <AppContent />
            </LocaleProvider>
        </ThemeProvider>
    )
}

export default App;