import React, { useState, useMemo, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { Product, Page } from '../types';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import { FallingPattern } from '../components/ui/falling-pattern';
import { useTranslations } from '../hooks/useTranslations';
import { ShieldCheck, Truck, Award, ArrowRight, Quote, MessageCircle, Ticket, Eye, Crown, Flame, Zap } from 'lucide-react';
import { api } from '../services/api';

interface HomePageProps {
    products: Product[];
    onProductClick: (product: Product) => void;
    onNavigate: (page: Page) => void;
    onAddToCart: (product: Product, startRect: DOMRect) => void;
    wishlistItems: number[];
    onToggleWishlist: (productId: number) => void;
}

const HomePage: React.FC<HomePageProps> = ({
    products,
    onProductClick,
    onNavigate,
    onAddToCart,
    wishlistItems,
    onToggleWishlist
}) => {
    const { t } = useTranslations();
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [bestSellers, setBestSellers] = useState<Product[]>([]);
    const [loadingBestSellers, setLoadingBestSellers] = useState(true);

    const categories = [
        { id: 'all', name: 'Semua Koleksi' },
        { id: 'Keilmuan', name: 'Keilmuan' },
        { id: 'Media Bertuah', name: 'Media Bertuah' },
        { id: 'Media Herbal', name: 'Media Herbal' },
        { id: 'Pusaka & Keris', name: 'Pusaka & Keris' },
        { id: 'Herbal & Keilmuan', name: 'Herbal & Keilmuan' },
    ];

    const filteredProducts = useMemo(() => {
        if (selectedCategory === 'all') return products;
        return products.filter(p => p.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    }, [products, selectedCategory]);

    const featuredTopProducts = useMemo(() => {
        return products.slice(0, 2);
    }, [products]);

    const flashSaleProducts = useMemo(() => {
        return products.filter(p => p.isFlashSale && p.flashSaleEnd && new Date(p.flashSaleEnd) > new Date());
    }, [products]);

    const sectionVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
        }
    };

    useEffect(() => {
        const loadBestSellers = async () => {
            try {
                setLoadingBestSellers(true);
                const sellers = await api.getBestSellers(4);
                setBestSellers(sellers);
            } catch (e) {
                console.warn('Failed to load best sellers:', e);
            } finally {
                setLoadingBestSellers(false);
            }
        };
        loadBestSellers();
    }, []);

    const testimonialItems = [
        {
            user: "Rudi Santoso - Surakarta",
            quote: "Keris Pusaka yang saya maharkan memiliki keotentikan luar biasa. Energinya terasa dan pengerjaannya sangat halus.",
            tag: "Kolektor Pusaka"
        },
        {
            user: "Bambang Wijaya - Jakarta",
            quote: "Pelayanan dari admin Tapak Pamungkas sangat profesional dan membimbing. Pengiriman aman dengan packing kayu.",
            tag: "Pencinta Warisan"
        },
        {
            user: "Ki Haryo - Yogyakarta",
            quote: "Rekomendasi utama untuk sarana spiritual dan benda bertuah nusantara yang terjamin keasliannya.",
            tag: "Pemerhati Budaya"
        }
    ];

    return (
        <div className="relative bg-stone-950 text-stone-100 overflow-hidden">
            {/* Quick View Modal */}
            <QuickViewModal
                product={quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
                onAddToCart={onAddToCart}
                isInWishlist={quickViewProduct ? wishlistItems.includes(quickViewProduct.id) : false}
                onToggleWishlist={onToggleWishlist}
            />

            {/* 1. Symmetrical Center-Aligned Luxury Hero */}
            <section className="relative min-h-[85vh] py-20 flex flex-col items-center justify-center text-center overflow-hidden bg-stone-950 border-b border-stone-800/80">
                {/* Background Pattern absolutely positioned & isolated */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <FallingPattern
                        className="opacity-30"
                        color="#d4af37"
                        backgroundColor="#0a0908"
                        blurIntensity="0.5em"
                        density={0.8}
                    />
                </div>

                {/* Centered Ambient Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none z-0"></div>

                {/* Hero Content Container - Strictly Centered */}
                <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center justify-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-mono font-medium uppercase tracking-widest mb-6 gold-glow"
                    >
                        <Crown className="w-4 h-4 text-amber-400" />
                        Galeri Pusaka & Media Bertuah Nusantara
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="text-4xl sm:text-6xl md:text-7xl font-serif font-extrabold tracking-tight mb-6 leading-tight text-center"
                    >
                        {t('home.heroWelcome')} <br />
                        <span className="gold-gradient-text">{t('home.heroTitle')}</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                        className="text-stone-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-light text-center"
                    >
                        {t('home.heroSubtitle')}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 25 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.6 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md mx-auto"
                    >
                        <button
                            onClick={() => onNavigate('allProducts')}
                            className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-stone-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 transition-all shadow-xl gold-glow text-xs uppercase tracking-wider flex items-center justify-center gap-2 group"
                        >
                            <span>Jelajahi Katalog Pusaka</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => onNavigate('vouchers')}
                            className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-amber-400 glass-panel border border-amber-500/30 hover:bg-amber-500/10 transition-all text-xs flex items-center justify-center gap-2"
                        >
                            <Ticket className="w-4 h-4" />
                            <span>Klaim Kupon Pemaharan</span>
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Straight Divider Line */}
            <div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>

            {/* 2. Value Guarantees Banner */}
            <section className="py-10 bg-stone-950 border-b border-stone-800/80">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 border border-amber-500/20">
                            <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400 flex-shrink-0">
                                <ShieldCheck className="w-7 h-7" />
                            </div>
                            <div>
                                <h4 className="font-serif font-bold text-stone-100 text-sm sm:text-base">100% Otentik & Terjamin</h4>
                                <p className="text-xs text-stone-400 mt-1">Setiap item melewati verifikasi energi dan keaslian fisik.</p>
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 border border-amber-500/20">
                            <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400 flex-shrink-0">
                                <Truck className="w-7 h-7" />
                            </div>
                            <div>
                                <h4 className="font-serif font-bold text-stone-100 text-sm sm:text-base">Pengiriman Khusus & Safe</h4>
                                <p className="text-xs text-stone-400 mt-1">Dikemas rapi dan aman dengan perlakuan khusus ke seluruh nusantara.</p>
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 border border-amber-500/20">
                            <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-400 flex-shrink-0">
                                <Award className="w-7 h-7" />
                            </div>
                            <div>
                                <h4 className="font-serif font-bold text-stone-100 text-sm sm:text-base">Bimbingan Pemaharan</h4>
                                <p className="text-xs text-stone-400 mt-1">Konsultasi tata cara perawatan & penggunaan pusaka.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Featured Products Highlight Banner */}
            {featuredTopProducts.length > 0 && (
                <section className="py-16 bg-stone-900/60 border-b border-stone-800">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                            <div>
                                <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">Pilihan Utama</span>
                                <h2 className="text-3xl font-serif font-bold text-stone-100 mt-1">Pusaka Masterpiece Terbaik</h2>
                            </div>
                            <button
                                onClick={() => onNavigate('allProducts')}
                                className="text-xs font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                            >
                                Lihat Selengkapnya &rarr;
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {featuredTopProducts.map(prod => (
                                <motion.div
                                    key={prod.id}
                                    whileHover={{ y: -4 }}
                                    className="glass-panel p-6 rounded-3xl border border-amber-500/30 flex flex-col sm:flex-row gap-6 items-center shadow-2xl"
                                >
                                    <div className="w-full sm:w-48 aspect-square rounded-2xl bg-stone-950 overflow-hidden flex-shrink-0 p-3 border border-stone-800 flex items-center justify-center">
                                        <img src={prod.imageUrls[0]} alt={prod.name} className="w-full h-full object-contain filter drop-shadow-md" />
                                    </div>
                                    <div className="flex flex-col justify-between space-y-3 w-full">
                                        <div>
                                            <span className="text-[10px] font-mono text-amber-400 uppercase bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                                                {prod.category}
                                            </span>
                                            <h3 className="font-serif font-bold text-xl text-stone-100 mt-2 line-clamp-1">{prod.name}</h3>
                                            <p className="text-xs text-stone-400 line-clamp-2 mt-1 leading-relaxed">{prod.description}</p>
                                        </div>

                                        <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                                            <span className="text-base font-bold gold-gradient-text">
                                                Rp {prod.price.toLocaleString('id-ID')}
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setQuickViewProduct(prod)}
                                                    className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-400 transition-all"
                                                    title="Pratinjau Cepat"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onProductClick(prod)}
                                                    className="px-4 py-2.5 rounded-xl bg-amber-500 text-stone-950 text-xs font-bold hover:bg-amber-400 transition-all"
                                                >
                                                    Detail Mahar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 4. Best Sellers Section */}
            {bestSellers.length > 0 && !loadingBestSellers && (
                <section className="py-20 bg-gradient-to-b from-stone-900/40 to-stone-950 border-t border-amber-500/20">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Zap className="w-5 h-5 text-amber-400" />
                                    <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">Terlaris</span>
                                </div>
                                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-100">
                                    Produk Terlaris Minggu Ini
                                </h2>
                            </div>
                            <button
                                onClick={() => onNavigate('allProducts')}
                                className="text-xs font-mono font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                            >
                                Lihat Semua &rarr;
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {bestSellers.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onClick={() => onProductClick(product)}
                                    onAddToCart={onAddToCart}
                                    isInWishlist={wishlistItems.includes(product.id)}
                                    onToggleWishlist={onToggleWishlist}
                                    onQuickView={(prod) => setQuickViewProduct(prod)}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 5. Flash Sale Section */}
            {flashSaleProducts.length > 0 && (
                <section className="py-20 bg-stone-950 border-t border-stone-800">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center max-w-3xl mx-auto mb-12">
                            <div className="inline-block px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-500/20 via-orange-500/20 to-rose-500/20 border border-rose-500/30 mb-3">
                                <span className="text-xs font-mono uppercase tracking-widest text-rose-400 font-bold flex items-center justify-center gap-2">
                                    <Flame className="w-4 h-4 animate-pulse" />
                                    Flash Sale Berlangsung
                                </span>
                            </div>
                            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-stone-100">
                                Diskon Spesial dengan Harga Terbatas
                            </h2>
                            <p className="text-stone-400 text-sm mt-3">
                                Ambil kesempatan sebelum harga kembali normal!
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {flashSaleProducts.map(product => (
                                <ProductCard
                                    key={product.id}
                                    product={{ ...product, isFlashSale: true }}
                                    onClick={() => onProductClick(product)}
                                    onAddToCart={onAddToCart}
                                    isInWishlist={wishlistItems.includes(product.id)}
                                    onToggleWishlist={onToggleWishlist}
                                    onQuickView={(prod) => setQuickViewProduct(prod)}
                                />
                            ))}
                        </div>
                        {flashSaleProducts.length < 4 && (
                            <div className="text-center mt-8">
                                <p className="text-stone-500 text-sm">Masih banyak produk lain yang tersedia!</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* 6. Full Catalog Showcase with Category Pills */}
            <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.1 }}
                className="py-20 bg-stone-950 relative"
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-12">
                        <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">Koleksi Lengkap</span>
                        <h2 className="text-3xl sm:text-5xl font-serif font-bold text-stone-100 mt-2 mb-4">
                            Katalog Produk & Media Bertuah
                        </h2>
                        <p className="text-stone-400 text-sm">
                            Pilih kategori pusaka yang sesuai dengan hajat dan ketertarikan Anda.
                        </p>

                        {/* Category Filter Pills */}
                        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`px-5 py-2.5 rounded-full text-xs font-mono font-medium transition-all ${
                                        selectedCategory === cat.id
                                            ? 'bg-amber-500 text-stone-950 font-bold gold-glow'
                                            : 'glass-panel text-stone-300 hover:text-amber-400 border border-stone-800'
                                    }`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredProducts.slice(0, 8).map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onClick={() => onProductClick(product)}
                                onAddToCart={onAddToCart}
                                isInWishlist={wishlistItems.includes(product.id)}
                                onToggleWishlist={onToggleWishlist}
                                onQuickView={(prod) => setQuickViewProduct(prod)}
                            />
                        ))}
                    </div>

                    <div className="text-center mt-12">
                        <button
                            onClick={() => onNavigate('allProducts')}
                            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full glass-panel border border-amber-500/40 text-amber-400 font-bold hover:bg-amber-500 hover:text-stone-950 transition-all text-xs uppercase tracking-wider gold-glow-hover"
                        >
                            <span>Lihat Semua Katalog ({products.length} Item)</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </motion.section>

            {/* 5. Promo Voucher Callout Banner */}
            <section className="py-12 bg-stone-900/80 border-t border-b border-amber-500/20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="glass-panel p-8 rounded-3xl border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0">
                                <Ticket className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-serif font-bold text-xl text-stone-100">Klaim Kupon Diskon Pemaharan Spesial</h3>
                                <p className="text-xs font-mono text-stone-400 mt-1">Dapatkan potongan khusus untuk setiap pemaharan item pilihan.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => onNavigate('vouchers')}
                            className="w-full md:w-auto px-8 py-3.5 rounded-xl font-bold text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 whitespace-nowrap gold-glow"
                        >
                            <Ticket className="w-4 h-4" /> Cek Kupon Promo
                        </button>
                    </div>
                </div>
            </section>

            {/* 6. Testimonials & Social Proof */}
            <motion.section
                variants={sectionVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="py-20 bg-stone-950"
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-14">
                        <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">Testimoni Pemahar</span>
                        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-100 mt-2">
                            Pengalaman Para Kolektor
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonialItems.map((item, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -6 }}
                                className="glass-panel p-8 rounded-2xl border border-amber-500/20 relative flex flex-col justify-between"
                            >
                                <div>
                                    <Quote className="w-8 h-8 text-amber-500/30 mb-4" />
                                    <p className="text-stone-300 text-sm italic leading-relaxed mb-6">
                                        "{item.quote}"
                                    </p>
                                </div>
                                <div className="border-t border-stone-800 pt-4 flex items-center justify-between">
                                    <div>
                                        <h5 className="font-serif font-bold text-stone-100 text-sm">{item.user}</h5>
                                        <span className="text-[11px] font-mono text-amber-400">{item.tag}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* 7. Live Purchase Notifications (Social Proof) */}
            <section className="py-12 bg-gradient-to-b from-stone-950 to-stone-900/40 border-t border-amber-500/10">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">Aktivitas Terbaru</span>
                        <h2 className="text-2xl font-serif font-bold text-stone-100 mt-1">Pemahar yang Baru Saja Membeli</h2>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
                                transition={{ 
                                    duration: 3, 
                                    repeat: Infinity, 
                                    delay: i * 0.3,
                                    ease: "easeInOut"
                                }}
                                className="px-4 py-2 rounded-full bg-stone-900/80 backdrop-blur-md border border-emerald-500/20 flex items-center gap-2 text-xs"
                            >
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                <span className="text-stone-300 font-medium">
                                    <span className="text-amber-400 font-bold">User****{Math.floor(Math.random() * 9000 + 1000)}</span> 
                                    berhasil memahar <span className="text-emerald-400">Keris</span>
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;