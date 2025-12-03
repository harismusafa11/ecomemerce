import React, { useState, useEffect, useRef } from 'react';
import { Product, Voucher } from '../types';
import Carousel from '../components/ui/carousel';
import ProductCard from '../components/ProductCard';
import VoucherCard from '../components/VoucherCard';
import ImageLightbox from '../components/ui/ImageLightbox';
import { useTranslations } from '../hooks/useTranslations';

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
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ product, allProducts, onAddToCart, onProductClick, onBack, wishlistItems, onToggleWishlist, vouchers, claimedVouchers, onClaimVoucher }) => {
    const [isAdded, setIsAdded] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const imageContainerRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslations();

    useEffect(() => {
        setIsAdded(false); // Reset button state when product changes
        setIsLightboxOpen(false); // Close lightbox when product changes
    }, [product]);

    if (!product) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
                <h2 className="text-2xl font-bold">{t('productDetail.notFound')}</h2>
                <button onClick={onBack} className="mt-4 bg-brand-primary text-white font-bold py-2 px-6 rounded-full hover:bg-brand-dark transition-colors">
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
            setTimeout(() => setIsAdded(false), 2000); // Reset after 2 seconds
        }
    };

    const handleImageClick = (index: number) => {
        setLightboxIndex(index);
        setIsLightboxOpen(true);
    };

    const isInWishlist = wishlistItems.includes(product.id);

    const relatedProducts = allProducts
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4);

    const recommendedProducts = allProducts
        .filter(p => p.category !== product.category && p.id !== product.id)
        .slice(0, 4);

    const applicableVouchers = vouchers.filter(v => !v.productId || v.productId === product.id);

    return (
        <div className="bg-brand-light">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-brand-primary hover:text-brand-dark font-semibold">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    {t('productDetail.backButton')}
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white p-8 rounded-lg shadow-lg">
                    {/* Image Carousel */}
                    <div ref={imageContainerRef} className="aspect-square">
                        <Carousel imageUrls={product.imageUrls} onImageClick={handleImageClick} />
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-brand-primary uppercase tracking-wider">{t(`categories.${product.category.replace(' ', '').toLowerCase()}`)}</span>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark my-2">{product.name}</h1>
                        <p className="text-3xl font-bold text-brand-secondary mb-4">Rp {product.price.toLocaleString('id-ID')}</p>

                        <div className="prose max-w-none text-gray-600 mb-6 flex-grow">
                            <p>{product.description}</p>
                        </div>

                        <div className="mt-auto pt-6 border-t border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-gray-600">{t('productDetail.stockAvailable')}:</span>
                                <span className="font-bold text-brand-dark">{product.stock}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.stock === 0 || isAdded}
                                    className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg flex items-center justify-center gap-2
                                        ${isAdded ? 'bg-green-500 text-white' : ''}
                                        ${product.stock > 0 && !isAdded ? 'bg-brand-primary text-white hover:bg-brand-dark' : ''}
                                        ${product.stock === 0 ? 'bg-gray-400 text-gray-700 cursor-not-allowed' : ''}
                                    `}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                    </svg>
                                    <span>{product.stock === 0 ? t('productDetail.outOfStock') : (isAdded ? t('productCard.added') : t('productCard.addToCart'))}</span>
                                </button>
                                <button
                                    onClick={() => onToggleWishlist(product.id)}
                                    className="p-3.5 rounded-lg bg-brand-accent hover:bg-brand-secondary/50 transition-colors"
                                    aria-label="Toggle Wishlist"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-primary" viewBox="0 0 24 24" stroke="currentColor" fill={isInWishlist ? 'currentColor' : 'none'} >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.662l1.318-1.344a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Applicable Vouchers Section */}
                {applicableVouchers.length > 0 && (
                    <div className="mt-12 bg-white p-8 rounded-lg shadow-lg">
                        <h3 className="text-2xl font-serif font-bold text-brand-dark mb-6">Available Vouchers for this Product</h3>
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
            </div>

            {/* Related Products Section */}
            {relatedProducts.length > 0 && (
                <section className="py-16">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-serif font-bold text-center text-brand-dark mb-10">{t('productDetail.relatedProducts')}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
                    </div>
                </section>
            )}

            {/* Recommendations Section */}
            {recommendedProducts.length > 0 && (
                <section className="py-16 bg-brand-accent/40">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-serif font-bold text-center text-brand-dark mb-10">{t('productDetail.recommendations')}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {recommendedProducts.map(recProduct => (
                                <ProductCard
                                    key={recProduct.id}
                                    product={recProduct}
                                    onClick={() => onProductClick(recProduct)}
                                    onAddToCart={onAddToCart}
                                    isInWishlist={wishlistItems.includes(recProduct.id)}
                                    onToggleWishlist={onToggleWishlist}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Image Lightbox */}
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