import React, { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react';
import { Page, Product, User, Order, Voucher, CartItem } from './types';
import { motion, AnimatePresence, Transition } from 'framer-motion';
import { LocaleProvider } from './context/LocaleContext';
import { useTranslations } from './hooks/useTranslations';
import { api } from './services/api';

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
                showToast("Failed to load products", 'error');
            }

            try {
                const vouchersData = await api.getVouchers();
                setAllVouchers(vouchersData);
            } catch (error) {
                console.error("Failed to fetch vouchers", error);
                // Don't show toast for vouchers to avoid annoyance if feature is disabled/broken
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

    // --- NAVIGATION ---
    const handleNavigate = useCallback((page: Page) => {
        setCurrentPage(page);
    }, []);

    useEffect(() => {
        if (currentPage === 'adminPanel' && currentUser && currentUser.email !== ADMIN_EMAIL) {
            handleNavigate('adminLogin');
            showToast(t('toasts.adminAccessDenied'), 'error');
        }
    }, [currentPage, currentUser, t, handleNavigate]);

    const handleProductClick = useCallback((product: Product) => {
        setSelectedProduct(product);
        setCurrentPage('product');
    }, []);

    const handleBackToProducts = useCallback(() => {
        setSelectedProduct(null);
        setCurrentPage('allProducts');
    }, [])

    // --- SEARCH LOGIC ---
    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        handleNavigate('allProducts');
    }, [handleNavigate]);

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
            setCurrentUser(user);
            localStorage.setItem('currentUser', JSON.stringify(user));

            // Fetch user data
            const cartItemsData = await api.getCart(user.id);
            setCartItems(cartItemsData.map((i: any) => ({ ...i.product, quantity: i.quantity })));

            const wishlist = await api.getWishlist(user.id);
            setWishlistItems(wishlist.map((i: any) => i.productId));

            const vouchers = await api.getUserVouchers(user.id);
            setClaimedVouchers(vouchers.map((v: any) => v.id));

            handleNavigate(user.isAdmin ? 'adminPanel' : 'home');
            showToast(t('toasts.welcome', { name: user.name }), 'success');
            return user;
        } catch (error) {
            showToast(t('toasts.loginFailed'), 'error');
            return null;
        }
    }, [t, handleNavigate]);

    const handleAdminLogin = useCallback(async (email: string, pass: string): Promise<User | null> => {
        try {
            const user = await api.login(email, pass);
            if (user.email === ADMIN_EMAIL) {
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
            showToast(t('toasts.loginFailed'), 'error');
            return null;
        }
    }, [t, handleNavigate]);


    const handleLogout = useCallback(() => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
        setCartItems([]);
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

    // --- ORDER PLACEMENT ---
    const handlePlaceOrder = useCallback(async (orderDetails: any) => {
        if (!currentUser) return;

        // Calculate items map for API
        // orderDetails might need to be adjusted based on what CheckoutPage passes
        // Assuming cartItems is used here or passed in orderDetails

        // We need to group cart items by ID to get quantity
        const items = cartItems.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price
        }));

        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        try {
            const order = await api.createOrder({
                userId: currentUser.id,
                items,
                total
            });
            setLastOrderId(order.id);
            setLastPaymentMethod(orderDetails.paymentMethod);
            setLastOrderTotal(total);

            // Clear cart in database and local state
            await api.clearCart(currentUser.id);
            setCartItems([]);

            setCurrentPage('orderConfirmation');
        } catch (error) {
            showToast("Failed to place order", 'error');
        }
    }, [currentUser, cartItems]);

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
        <div className="flex flex-col min-h-screen font-sans bg-brand-light">
            {showLayout && <Header
                cartItemCount={cartItems.length}
                wishlistItemCount={wishlistItems.length}
                onNavigate={handleNavigate}
                currentUser={currentUser}
                onLogout={handleLogout}
                onCartClick={() => handleNavigate('cart')}
                onWishlistClick={() => handleNavigate('wishlist')}
                onCartIconRef={cartIconRefCallback}
                onSearch={handleSearch}
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
        <LocaleProvider>
            <AppContent />
        </LocaleProvider>
    )
}

export default App;