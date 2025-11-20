import React from 'react';
import { Product, Page } from '../types';
import ProductCard from '../components/ProductCard';
import { useTranslations } from '../hooks/useTranslations';

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
    const wishedProducts = allProducts.filter(product => wishlistItems.includes(product.id));

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark">{t('wishlist.title')}</h1>
                <p className="mt-4 text-lg text-gray-600">{t('wishlist.subtitle')}</p>
            </div>

            {wishedProducts.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow-md">
                    <p className="text-gray-600 text-lg mb-4">{t('wishlist.empty')}</p>
                    <button 
                        onClick={() => onNavigate('allProducts')}
                        className="bg-brand-primary text-white font-bold py-3 px-6 rounded-full hover:bg-brand-dark transition-colors"
                    >
                        {t('wishlist.startShopping')}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {wishedProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onClick={() => onProductClick(product)}
                            onAddToCart={onAddToCart}
                            isInWishlist={true} // It's always in wishlist on this page
                            onToggleWishlist={onToggleWishlist}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default WishlistPage;