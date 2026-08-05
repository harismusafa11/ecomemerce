import React, { useState, useEffect, useRef } from 'react';
import { Product, Voucher, Review, User } from '../types';
import Carousel from '../components/ui/carousel';
import ProductCard from '../components/ProductCard';
import VoucherCard from '../components/VoucherCard';
import ImageLightbox from '../components/ui/ImageLightbox';
import { WHATSAPP_NUMBER } from '../constants';
import { useTranslations } from '../hooks/useTranslations';
import { api } from '../services/api';
import { ArrowLeft, ShoppingBag, Heart, MessageCircle, ShieldCheck, CheckCircle2, Award, Truck, ChevronRight, Share2, Info, Sparkles, Crown, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductDetailPageProps {
    product: Product;
    allProducts: Product[];
    onAddToCart: (product: Product, startRect: DOMRect) => void;
    onProductClick: (product: Product) => void;
    onBack: () => void;
    wishlistItems: number[];
    onToggleWishlist: (productId: number) => void;
    vouchers: Voucher[];
    claimedVouchers: number[];
    onClaimVoucher: (voucherId: number) => void;
    currentUser?: User | null;
    onNavigate?: (page: any) => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
    product,
    allProducts,
    onAddToCart,
    onProductClick,
    onBack,
    wishlistItems,
    onToggleWishlist,
    vouchers,
    claimedVouchers,
    onClaimVoucher,
    currentUser,
    onNavigate
}) => {
    const [isAdded, setIsAdded] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [activeTab, setActiveTab] = useState<'desc' | 'care' | 'shipping'>('desc');
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslations();

    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviewError, setReviewError] = useState('');
    const [reviewSuccess, setReviewSuccess] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        setIsAdded(false);
        setIsLightboxOpen(false);
        setActiveTab('desc');
    }, [product]);

    useEffect(() => {
        if (product && product.id) {
            api.trackProductView(product.id, currentUser?.id ?? null);
            loadReviews(product.id);
        }
    }, [product?.id]);

    const loadReviews = async (productId: number) => {
        try {
            const data = await api.getReviews(productId);
            setReviews(data.reviews);
            setAverageRating(data.averageRating);
            setTotalReviews(data.totalReviews);
        } catch (e) {
            setReviews([]);
            setAverageRating(0);
            setTotalReviews(0);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setReviewError('');
        setReviewSuccess('');
        if (!currentUser) {
            setReviewError('Silakan masuk terlebih dahulu untuk memberi ulasan.');
            return;
        }
        if (rating < 1) {
            setReviewError('Silakan pilih rating bintang terlebih dahulu.');
            return;
        }
        setIsSubmittingReview(true);
        try {
            await api.addReview(product.id, currentUser.id, rating, comment.trim());
            setReviewSuccess('Ulasan berhasil disimpan. Terima kasih!');
            setRating(0);
            setComment('');
            await loadReviews(product.id);
        } catch (err: any) {
            setReviewError(err?.message || 'Gagal menyimpan ulasan. Silakan coba lagi.');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (!product) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center text-stone-100">
                <h2 className="text-2xl font-serif font-bold mb-4">{t('productDetail.notFound')}</h2>
                <button
                    onClick={onBack}
                    className="px-6 py-2.5 bg-amber-500 text-stone-950 font-bold rounded-full text-xs uppercase"
                >
                    {t('productDetail.backButton')}
                </button>
            </div>
        );
    }

    const handleAddToCart = () => {
        if (product.stock > 0 && !isAdded && imageContainerRef.current) {
            const rect = imageContainerRef.current.getBoundingClientRect();
            onAddToCart(product, rect);
            setIsAdded(true);
            setTimeout(() => setIsAdded(false), 2000);
        }
    };

    const handleWhatsAppOrder = () => {
        const message = encodeURIComponent(
            `Halo Admin Tapak Pamungkas, saya bermaksud memaharkan produk:\n\n*${product.name}*\nHarga Mahar: Rp ${product.price.toLocaleString('id-ID')}\nKategori: ${product.category}\n\nMohon informasi ketersediaan & petunjuk penyelarasan.`
        );
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
    };

    const handleImageClick = (index: number) => {
        setLightboxIndex(index);
        setIsLightboxOpen(true);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: product.name,
                text: product.description,
                url: window.location.href,
            }).catch(() => {});
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Link produk berhasil disalin!');
        }
    };

    const isInWishlist = wishlistItems.includes(product.id);

    const relatedProducts = allProducts
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    const applicableVouchers = vouchers.filter(v => !v.productId || v.productId === product.id);

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 py-8 sm:py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb & Navigation */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-stone-800/80 pb-4">
                    <nav className="flex items-center gap-2 text-xs font-mono text-stone-400 overflow-x-auto whitespace-nowrap">
                        <span onClick={onBack} className="hover:text-amber-400 cursor-pointer transition-colors">Katalog</span>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                        <span className="text-stone-300 font-semibold">{product.category}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-stone-600" />
                        <span className="text-amber-400 truncate max-w-[200px]">{product.name}</span>
                    </nav>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleShare}
                            className="p-2 rounded-full bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-400 hover:border-amber-500/40 transition-all text-xs flex items-center gap-1.5"
                            title="Bagikan Produk"
                        >
                            <Share2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Bagikan</span>
                        </button>
                        <button
                            onClick={onBack}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full glass-panel border border-stone-800 text-stone-300 hover:text-amber-400 text-xs font-mono transition-all"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Kembali</span>
                        </button>
                    </div>
                </div>

                {/* Main Product Showcase Card */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 glass-panel p-6 sm:p-10 rounded-3xl border border-amber-500/20 shadow-2xl relative overflow-hidden">
                    {/* Ambient Glow Background */}
                    <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>

                    {/* Left Column: Image Gallery (5 Cols) */}
                    <div className="lg:col-span-6 flex flex-col space-y-4">
                        <div ref={imageContainerRef} className="aspect-square w-full rounded-2xl overflow-hidden bg-stone-950/90 p-3 border border-amber-500/20 shadow-xl relative group">
                            <Carousel
                                imageUrls={product.imageUrls}
                                onImageClick={handleImageClick}
                                title={`${product.name} | Mahar ${product.category} Otentik Tapak Pamungkas`}
                                alt={`Foto Asli ${product.name} - ${product.category} Tapak Pamungkas`}
                            />
                        </div>
                        <p className="text-[11px] font-mono text-stone-500 text-center flex items-center justify-center gap-1">
                            <Info className="w-3.5 h-3.5" /> Klik gambar untuk memperbesar foto
                        </p>
                    </div>

                    {/* Right Column: Details & Purchasing Card (7 Cols) */}
                    <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                        <div>
                            {/* Badges */}
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                                    <Crown className="w-3.5 h-3.5" /> {product.category}
                                </span>
                                {product.stock > 0 ? (
                                    <span className="text-xs font-mono font-medium px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Stok: {product.stock} Tersedia
                                    </span>
                                ) : (
                                    <span className="text-xs font-mono font-medium px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
                                        Stok Termahar / Habis
                                    </span>
                                )}
                            </div>

                            {/* Product Name */}
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-100 mb-3 leading-tight">
                                {product.name}
                            </h1>

                            {/* Price */}
                            <div className="flex items-baseline gap-3 mb-6 pb-4 border-b border-stone-800">
                                <span className="text-3xl sm:text-4xl font-bold gold-gradient-text">
                                    Rp {product.price.toLocaleString('id-ID')}
                                </span>
                                <span className="text-xs font-mono text-stone-400">/ Mahar Otentik</span>
                            </div>

                            {/* Dynamic Tabbed Info Section */}
                            <div className="mb-6">
                                <div className="flex border-b border-stone-800 gap-4 mb-4">
                                    <button
                                        onClick={() => setActiveTab('desc')}
                                        className={`pb-2.5 text-xs font-mono font-bold transition-all relative ${
                                            activeTab === 'desc' ? 'text-amber-400 border-b-2 border-amber-500' : 'text-stone-400 hover:text-stone-200'
                                        }`}
                                    >
                                        Deskripsi & Tuah
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('care')}
                                        className={`pb-2.5 text-xs font-mono font-bold transition-all relative ${
                                            activeTab === 'care' ? 'text-amber-400 border-b-2 border-amber-500' : 'text-stone-400 hover:text-stone-200'
                                        }`}
                                    >
                                        Perawatan & Etika
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('shipping')}
                                        className={`pb-2.5 text-xs font-mono font-bold transition-all relative ${
                                            activeTab === 'shipping' ? 'text-amber-400 border-b-2 border-amber-500' : 'text-stone-400 hover:text-stone-200'
                                        }`}
                                    >
                                        Pengiriman & Garansi
                                    </button>
                                </div>

                                <AnimatePresence mode="wait">
                                    {activeTab === 'desc' && (
                                        <motion.p
                                            key="desc"
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="text-stone-300 text-sm leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto pr-2"
                                        >
                                            {product.description}
                                        </motion.p>
                                    )}

                                    {activeTab === 'care' && (
                                        <motion.div
                                            key="care"
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="text-stone-300 text-xs font-mono space-y-2 leading-relaxed"
                                        >
                                            <p className="flex items-start gap-2">
                                                <span className="text-amber-400">•</span>
                                                <span>Oleskan minyak wangi non-alkohol (Cendana/Jasmine) secara berkala.</span>
                                            </p>
                                            <p className="flex items-start gap-2">
                                                <span className="text-amber-400">•</span>
                                                <span>Simpan di tempat yang bersih dan hindari tempat lembab.</span>
                                            </p>
                                            <p className="flex items-start gap-2">
                                                <span className="text-amber-400">•</span>
                                                <span>Untuk pusaka keris sepuh, penjamasan disarankan pada malam 1 Suro.</span>
                                            </p>
                                        </motion.div>
                                    )}

                                    {activeTab === 'shipping' && (
                                        <motion.div
                                            key="shipping"
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -5 }}
                                            className="text-stone-300 text-xs font-mono space-y-2 leading-relaxed"
                                        >
                                            <p className="flex items-start gap-2">
                                                <span className="text-amber-400">•</span>
                                                <span>Dikemas khusus dengan peti/kotak pengaman ke seluruh Nusantara.</span>
                                            </p>
                                            <p className="flex items-start gap-2">
                                                <span className="text-amber-400">•</span>
                                                <span>Garansi 100% uang kembali jika paket rusak dalam perjalanan.</span>
                                            </p>
                                            <p className="flex items-start gap-2">
                                                <span className="text-amber-400">•</span>
                                                <span>Resi pengiriman dikirim otomatis via WhatsApp setelah kirim.</span>
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Value Guarantees Grid */}
                        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-stone-900/80 border border-stone-800 text-center">
                            <div className="flex flex-col items-center">
                                <ShieldCheck className="w-5 h-5 text-amber-400 mb-1" />
                                <h5 className="font-bold text-stone-200 text-xs">100% Otentik</h5>
                                <span className="text-[10px] text-stone-400 font-mono">Fisik & Energi</span>
                            </div>
                            <div className="flex flex-col items-center border-x border-stone-800 px-2">
                                <Truck className="w-5 h-5 text-amber-400 mb-1" />
                                <h5 className="font-bold text-stone-200 text-xs">Pengiriman Khusus</h5>
                                <span className="text-[10px] text-stone-400 font-mono">Safe Packaging</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <Award className="w-5 h-5 text-amber-400 mb-1" />
                                <h5 className="font-bold text-stone-200 text-xs">Bimbingan</h5>
                                <span className="text-[10px] text-stone-400 font-mono">Konsultasi Gratis</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-2">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0 || isAdded}
                                    className={`flex-1 py-4 px-6 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl ${
                                        isAdded
                                            ? 'bg-emerald-500 text-stone-950 font-bold'
                                            : product.stock > 0
                                            ? 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-stone-950 hover:from-amber-300 hover:to-amber-500 gold-glow'
                                            : 'bg-stone-800 text-stone-600 cursor-not-allowed'
                                    }`}
                                >
                                    <ShoppingBag className="w-4 h-4" />
                                    <span>
                                        {product.stock === 0
                                            ? 'Stok Termahar / Habis'
                                            : isAdded
                                            ? 'Tersimpan di Keranjang'
                                            : 'Tambah Ke Keranjang Mahar'}
                                    </span>
                                </button>

                                <button
                                    onClick={() => onToggleWishlist(product.id)}
                                    className={`p-4 rounded-xl border transition-all ${
                                        isInWishlist
                                            ? 'bg-rose-600/90 text-white border-rose-500 shadow-md'
                                            : 'bg-stone-900 text-stone-300 border-stone-800 hover:text-rose-400'
                                    }`}
                                    title={isInWishlist ? 'Hapus Wishlist' : 'Tambah Wishlist'}
                                >
                                    <Heart className="w-5 h-5" fill={isInWishlist ? 'currentColor' : 'none'} />
                                </button>
                            </div>

                            <button
                                onClick={handleWhatsAppOrder}
                                className="w-full py-3.5 px-6 rounded-xl font-bold text-xs border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 flex items-center justify-center gap-2 transition-all uppercase tracking-wider"
                            >
                                <MessageCircle className="w-4 h-4 text-emerald-400" />
                                Konsultasi & Maharkan via WhatsApp Direct
                            </button>
                        </div>
                    </div>
                </div>

                {/* Applicable Vouchers */}
                {applicableVouchers.length > 0 && (
                    <div className="mt-12 glass-panel p-8 rounded-3xl border border-amber-500/20 shadow-xl">
                        <h3 className="text-xl font-serif font-bold text-amber-400 mb-6">Kupon Spesial Untuk Produk Ini</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {applicableVouchers.map(voucher => (
                                <VoucherCard
                                    key={voucher.id}
                                    voucher={voucher}
                                    isClaimed={claimedVouchers.includes(voucher.id)}
                                    onClaim={onClaimVoucher}
                                    productName={product.name}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Reviews & Ratings Section */}
                <section className="mt-16 glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/20 shadow-xl">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <h2 className="text-2xl font-serif font-bold text-stone-100">Ulasan & Pengalaman</h2>
                        {totalReviews > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <Star
                                            key={star}
                                            className={`w-4 h-4 ${star <= Math.round(averageRating) ? 'text-amber-400 fill-amber-400' : 'text-stone-700'}`}
                                        />
                                    ))}
                                </div>
                                <span className="text-xs font-mono text-stone-300">
                                    {averageRating.toFixed(1)} / 5 ({totalReviews} ulasan)
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Review Form */}
                    <div className="mb-8 p-4 rounded-2xl bg-stone-900/70 border border-stone-800">
                        {currentUser ? (
                            <form onSubmit={handleSubmitReview} className="space-y-3">
                                <div className="flex items-center gap-1">
                                    <span className="text-xs font-mono text-stone-400 mr-2">Rating:</span>
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="p-0.5 transition-transform hover:scale-125"
                                            aria-label={`${star} bintang`}
                                        >
                                            <Star
                                                className={`w-6 h-6 ${star <= (hoverRating || rating) ? 'text-amber-400 fill-amber-400' : 'text-stone-600'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Tulis pengalaman dan kesan Anda terhadap pusaka ini..."
                                    rows={3}
                                    className="w-full px-4 py-3 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500 resize-none"
                                />
                                {reviewError && (
                                    <p className="text-xs font-mono text-rose-400">{reviewError}</p>
                                )}
                                {reviewSuccess && (
                                    <p className="text-xs font-mono text-emerald-400">{reviewSuccess}</p>
                                )}
                                <button
                                    type="submit"
                                    disabled={isSubmittingReview}
                                    className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-stone-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 transition-all flex items-center gap-2"
                                >
                                    <Star className="w-3.5 h-3.5" />
                                    {isSubmittingReview ? 'Menyimpan...' : 'Kirim Ulasan'}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-xs font-mono text-stone-400 mb-3">
                                    Silakan masuk untuk berbagi pengalaman Anda memaharkan pusaka ini.
                                </p>
                                <button
                                    onClick={() => onNavigate && onNavigate('login')}
                                    className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-stone-950 bg-amber-500 hover:bg-amber-400 transition-all"
                                >
                                    Masuk untuk Beri Ulasan
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Review List */}
                    {reviews.length > 0 ? (
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {reviews.map(review => (
                                <div key={review.id} className="p-4 rounded-2xl bg-stone-900/50 border border-stone-800">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs">
                                                {(review.user?.name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-xs font-semibold text-stone-200">
                                                {review.user?.name || 'Pengguna'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star
                                                        key={star}
                                                        className={`w-3 h-3 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-stone-700'}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-mono text-stone-500">
                                                {new Date(review.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                    {review.comment && (
                                        <p className="text-xs text-stone-300 leading-relaxed">{review.comment}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-xs font-mono text-stone-500 py-6">
                            Belum ada ulasan untuk pusaka ini. Jadilah yang pertama berbagi pengalaman.
                        </p>
                    )}
                </section>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <section className="mt-16">
                        <h2 className="text-2xl font-serif font-bold text-stone-100 mb-8">Piranti & Pusaka Sejenis</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map(relatedProduct => (
                                <ProductCard
                                    key={relatedProduct.id}
                                    product={relatedProduct}
                                    onClick={() => onProductClick(relatedProduct)}
                                    onAddToCart={onAddToCart}
                                    isInWishlist={wishlistItems.includes(relatedProduct.id)}
                                    onToggleWishlist={onToggleWishlist}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            {/* Lightbox */}
            <ImageLightbox
                images={product.imageUrls}
                initialIndex={lightboxIndex}
                isOpen={isLightboxOpen}
                onClose={() => setIsLightboxOpen(false)}
            />
        </div>
    );
};

export default ProductDetailPage;