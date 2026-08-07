import React, { useState, useRef, memo, useEffect } from 'react';
import { Product } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { motion } from 'framer-motion';
import { Eye, Heart, ShoppingBag, CheckCircle, Flame, Zap } from 'lucide-react';
import LazyImage from './ui/LazyImage';

interface ProductCardProps {
    product: Product;
    onClick: () => void;
    onAddToCart: (product: Product, startRect: DOMRect) => void;
    isInWishlist: boolean;
    onToggleWishlist: (productId: number) => void;
    onQuickView?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onClick,
    onAddToCart,
    isInWishlist,
    onToggleWishlist,
    onQuickView
}) => {
    const [isAdded, setIsAdded] = useState(false);
    const [flashTimeLeft, setFlashTimeLeft] = useState<string>('');
    const imageRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslations();

    useEffect(() => {
        if (!product.isFlashSale || !product.flashSaleEnd) return;
        
        const updateTimer = () => {
            const end = new Date(product.flashSaleEnd!).getTime();
            const now = Date.now();
            const diff = end - now;
            
            if (diff <= 0) {
                setFlashTimeLeft('Berakhir');
                return;
            }
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setFlashTimeLeft(`${hours}j ${minutes}m ${seconds}d`);
        };
        
        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [product.isFlashSale, product.flashSaleEnd]);

    const isLowStock = product.stock > 0 && product.stock <= 5;
    const isOutOfStock = product.stock <= 0;
    const flashDiscount = product.flashSalePrice && product.price > product.flashSalePrice 
        ? Math.round((1 - product.flashSalePrice / product.price) * 100)
        : 0;

    const handleAddToCartClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (imageRef.current) {
            const rect = imageRef.current.getBoundingClientRect();
            onAddToCart(product, rect);
        }
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleWishlistClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleWishlist(product.id);
    };

    const handleQuickViewClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onQuickView) onQuickView(product);
        else onClick();
    };

    return (
        <motion.div
            onClick={onClick}
            className="product-card-3d relative group glass-panel rounded-2xl overflow-hidden cursor-pointer flex flex-col h-full border border-amber-500/20 hover:border-amber-500/50 shadow-xl transition-all duration-300"
            whileHover={{ y: -6 }}
            layout
        >
            {/* Ambient Backlight on Hover */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-600/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col h-full">
                {/* Image Showcase */}
                <div ref={imageRef} className="relative aspect-square w-full bg-stone-950/80 overflow-hidden p-4 flex items-center justify-center">
                    <LazyImage
                        src={product.imageUrls[0]}
                        alt={`Foto Asli ${product.name} - ${product.category} Tapak Pamungkas`}
                        title={`${product.name} | Mahar ${product.category} Otentik Tapak Pamungkas`}
                        className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Flash Sale Badge */}
                    {product.isFlashSale && flashTimeLeft && (
                        <div className="absolute top-3 left-3 z-20">
                            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-rose-600 to-orange-500 text-white border border-rose-400/50 flex items-center gap-1 shadow-lg animate-pulse">
                                <Zap className="w-3 h-3" />
                                FLASH SALE {flashTimeLeft}
                            </span>
                        </div>
                    )}

                    {/* Stock Status Badge */}
                    {!product.isFlashSale && (
                        <div className="absolute top-3 left-3 z-20">
                            {isOutOfStock ? (
                                <span className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-full bg-rose-950/80 backdrop-blur-md text-rose-400 border border-rose-500/30">
                                    Habis
                                </span>
                            ) : isLowStock ? (
                                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-orange-950/80 backdrop-blur-md text-orange-400 border border-orange-500/50 flex items-center gap-1 animate-pulse">
                                    <Flame className="w-3 h-3" />
                                    Sisa {product.stock}!
                                </span>
                            ) : (
                                <span className="text-[10px] font-mono font-medium px-2.5 py-1 rounded-full bg-stone-900/80 backdrop-blur-md text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                    Stok {product.stock}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Floating Action Buttons */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
                        <button
                            onClick={handleWishlistClick}
                            className={`p-2 rounded-full backdrop-blur-md border transition-all ${
                                isInWishlist
                                    ? 'bg-rose-600/90 text-white border-rose-500 shadow-md'
                                    : 'bg-stone-900/70 text-stone-300 border-stone-700 hover:text-rose-400 hover:border-rose-500/50'
                            }`}
                            aria-label="Wishlist"
                        >
                            <Heart className="w-4 h-4" fill={isInWishlist ? 'currentColor' : 'none'} />
                        </button>
                        <button
                            onClick={handleQuickViewClick}
                            className="p-2 rounded-full bg-stone-900/70 text-stone-300 border border-stone-700 hover:text-amber-400 hover:border-amber-500/50 backdrop-blur-md transition-all"
                            title="Quick Preview"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Details Section */}
                <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-[11px] font-mono font-medium text-amber-400/90 uppercase tracking-wider bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                                {product.category}
                            </span>
                        </div>
                        <h3 className="text-base font-serif font-bold text-stone-100 group-hover:text-amber-300 transition-colors line-clamp-1 mb-1">
                            {product.name}
                        </h3>
                        <p className="text-xs text-stone-400 line-clamp-2 mb-4 leading-relaxed">
                            {product.description}
                        </p>
                    </div>

                    <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between mt-auto">
                        <div>
                            {product.isFlashSale && product.flashSalePrice ? (
                                <>
                                    <span className="text-[10px] uppercase font-mono text-stone-500 block line-through">
                                        Rp {product.price.toLocaleString('id-ID')}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-base font-bold text-rose-400">
                                            Rp {product.flashSalePrice.toLocaleString('id-ID')}
                                        </span>
                                        {flashDiscount > 0 && (
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                                -{flashDiscount}%
                                            </span>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <span className="text-[10px] uppercase font-mono text-stone-500 block">Harga Tuah</span>
                                    <span className="text-base font-bold gold-gradient-text">
                                        Rp {product.price.toLocaleString('id-ID')}
                                    </span>
                                </>
                            )}
                        </div>

                        <motion.button
                            onClick={handleAddToCartClick}
                            disabled={isAdded || product.stock <= 0}
                            className={`p-2.5 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 ${
                                isAdded
                                    ? 'bg-emerald-500 text-stone-950 font-bold'
                                    : product.isFlashSale && product.stock > 0
                                    ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white font-bold hover:from-rose-400 hover:to-orange-400 shadow-lg'
                                    : product.stock > 0
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500 hover:text-stone-950 gold-glow-hover'
                                    : 'bg-stone-800 text-stone-600 cursor-not-allowed border border-stone-800'
                            }`}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isAdded ? (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    <span>Tersimpan</span>
                                </>
                            ) : (
                                <>
                                    <ShoppingBag className="w-4 h-4" />
                                    <span className="hidden sm:inline">Beli</span>
                                </>
                            )}
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default memo(ProductCard);