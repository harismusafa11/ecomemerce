import React, { useState, useRef, memo } from 'react';
import { Product } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { motion } from 'framer-motion';

interface ProductCardProps {
    product: Product;
    onClick: () => void;
    onAddToCart: (product: Product, startRect: DOMRect) => void;
    isInWishlist: boolean;
    onToggleWishlist: (productId: number) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onAddToCart, isInWishlist, onToggleWishlist }) => {
    const [isAdded, setIsAdded] = useState(false);
    const imageRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslations();

    const handleAddToCartClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card's onClick from firing
        if (imageRef.current) {
            const rect = imageRef.current.getBoundingClientRect();
            onAddToCart(product, rect);
        }
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000); // Reset after 2 seconds
    };
    
    const handleWishlistClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleWishlist(product.id);
    };

    return (
        <motion.div
            onClick={onClick}
            className="relative group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer overflow-hidden flex flex-col"
            whileHover={{ y: -5 }}
            layout
        >
            {/* Neon Glow Effect (subtle) */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-gold via-brand-secondary to-brand-primary rounded-xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>

            <div className="relative z-10 flex flex-col h-full bg-white rounded-xl">
                 {/* Image Section */}
                <div ref={imageRef} className="relative aspect-square w-full bg-brand-dark rounded-t-xl overflow-hidden p-4">
                    <motion.img
                        src={product.imageUrls[0]}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-500"
                        whileHover={{ scale: 1.1 }}
                        loading="lazy"
                        decoding="async"
                    />
                    {/* Wishlist icon */}
                    <button 
                        onClick={handleWishlistClick}
                        className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm p-2 rounded-full text-white hover:bg-black/50 transition-colors z-20"
                        aria-label="Toggle Wishlist"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" fill={isInWishlist ? 'currentColor' : 'none'} >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.662l1.318-1.344a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                        </svg>
                    </button>
                </div>

                {/* Details Section */}
                <div className="p-5 flex-grow flex flex-col">
                    <h3 className="text-xl font-serif font-bold text-brand-dark mb-1 h-16 line-clamp-2">{product.name}</h3>
                    <div className="flex gap-2 mb-3">
                         <span className="text-xs font-semibold bg-brand-accent text-brand-primary px-2 py-1 rounded-full">{t(`categories.${product.category.replace(' ', '').toLowerCase()}`)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">{product.description}</p>
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                        <div>
                            <p className="text-xs text-gray-500">{t('productCard.price')}</p>
                            <p className="text-lg font-bold text-brand-primary">Rp {product.price.toLocaleString('id-ID')}</p>
                        </div>
                        <motion.button
                            onClick={handleAddToCartClick}
                            disabled={isAdded}
                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 ease-in-out ${
                                isAdded 
                                ? 'bg-green-500 text-white' 
                                : 'bg-brand-primary text-white'
                            }`}
                            whileHover={{ scale: 1.05, backgroundColor: '#211c18' }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isAdded ? t('productCard.added') : t('productCard.addToCart')}
                        </motion.button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default memo(ProductCard);