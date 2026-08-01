import React, { useState } from 'react';
import { Product, Page } from '../types';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import { useTranslations } from '../hooks/useTranslations';
import { Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

interface WishlistPageProps {
    wishlistItems: number[];
    allProducts: Product[];
    onProductClick: (product: Product) => void;
    onAddToCart: (product: Product, startRect: DOMRect) => void;
    onToggleWishlist: (productId: number) => void;
    onNavigate: (page: Page) => void;
}

const WishlistPage: React.FC<WishlistPageProps> = ({
    wishlistItems,
    allProducts,
    onProductClick,
    onAddToCart,
    onToggleWishlist,
    onNavigate,
}) => {
    const { t } = useTranslations();
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
    const wishedProducts = allProducts.filter(product => wishlistItems.includes(product.id));

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 py-12">
            {/* Quick View Modal */}
            <QuickViewModal
                product={quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
                onAddToCart={onAddToCart}
                isInWishlist={quickViewProduct ? wishlistItems.includes(quickViewProduct.id) : false}
                onToggleWishlist={onToggleWishlist}
            />

            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <div className="w-12 h-12 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center mx-auto mb-3">
                        <Heart className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-100 mb-3">
                        {t('wishlist.title')}
                    </h1>
                    <p className="text-stone-400 text-sm">
                        {t('wishlist.subtitle')}
                    </p>
                </div>

                {wishedProducts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20 glass-panel rounded-3xl border border-stone-800 max-w-xl mx-auto"
                    >
                        <Heart className="w-12 h-12 text-stone-600 mx-auto mb-4" />
                        <p className="text-stone-300 text-lg font-serif mb-4">{t('wishlist.empty')}</p>
                        <button
                            onClick={() => onNavigate('allProducts')}
                            className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold rounded-full text-xs uppercase tracking-wider gold-glow"
                        >
                            {t('wishlist.startShopping')}
                        </button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishedProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onClick={() => onProductClick(product)}
                                onAddToCart={onAddToCart}
                                isInWishlist={true}
                                onToggleWishlist={onToggleWishlist}
                                onQuickView={(prod) => setQuickViewProduct(prod)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;