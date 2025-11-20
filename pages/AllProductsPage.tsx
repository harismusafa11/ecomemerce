import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { CATEGORIES } from '../constants';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/ui/Pagination';
import { useTranslations } from '../hooks/useTranslations';
import { motion, AnimatePresence, Variants } from 'framer-motion';

const ALL_CATEGORIES_KEYS = ['Semua', ...CATEGORIES];
const ITEMS_PER_PAGE = 9; // Adjusted for new layout

interface AllProductsPageProps {
    products: Product[];
    onProductClick: (product: Product) => void;
    onAddToCart: (product: Product, startRect: DOMRect) => void;
    wishlistItems: number[];
    onToggleWishlist: (productId: number) => void;
    searchQuery?: string;
    onClearSearch: () => void;
}

const gridContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08
        }
    }
};

const gridItemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            duration: 0.4,
            ease: 'easeOut'
        }
    }
};

const AllProductsPage: React.FC<AllProductsPageProps> = ({ products, onProductClick, onAddToCart, wishlistItems, onToggleWishlist, searchQuery, onClearSearch }) => {
    const [activeCategory, setActiveCategory] = useState('Semua');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortOption, setSortOption] = useState('default');
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [appliedPriceRange, setAppliedPriceRange] = useState<{ min: number | null, max: number | null }>({ min: null, max: null });
    const { t } = useTranslations();

    const filteredAndSortedProducts = useMemo(() => {
        let filteredProducts = searchQuery
            ? products.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
            : [...products];

        filteredProducts = activeCategory === 'Semua'
            ? filteredProducts
            : filteredProducts.filter(p => p.category === activeCategory);

        if (appliedPriceRange.min !== null) {
            filteredProducts = filteredProducts.filter(p => p.price >= appliedPriceRange.min!);
        }
        if (appliedPriceRange.max !== null) {
            filteredProducts = filteredProducts.filter(p => p.price <= appliedPriceRange.max!);
        }

        switch (sortOption) {
            case 'price-asc':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'newest':
                filteredProducts.sort((a, b) => b.id - a.id);
                break;
            default:
                break;
        }

        return filteredProducts;
    }, [searchQuery, activeCategory, sortOption, appliedPriceRange, products]);


    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeCategory, appliedPriceRange, sortOption, searchQuery]);

    const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE);
    const currentProducts = filteredAndSortedProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleCategoryChange = (category: string) => {
        setActiveCategory(category);
    };

    const handleApplyPriceFilter = () => {
        const min = priceRange.min === '' ? null : parseInt(priceRange.min, 10);
        const max = priceRange.max === '' ? null : parseInt(priceRange.max, 10);
        setAppliedPriceRange({
            min: !isNaN(min!) ? min : null,
            max: !isNaN(max!) ? max : null,
        });
    };

    const handleResetFilters = () => {
        setSortOption('default');
        setPriceRange({ min: '', max: '' });
        setAppliedPriceRange({ min: null, max: null });
    }

    return (
        <div className="bg-brand-light">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark">{t('allProducts.title')}</h1>
                    <p className="mt-4 text-lg text-gray-600">{t('allProducts.subtitle')}</p>
                </div>

                {searchQuery && (
                    <div className="mb-10 text-center bg-brand-accent/50 p-4 rounded-lg border border-brand-secondary/30">
                        <p className="text-lg text-brand-dark">{t('allProducts.showingResultsFor', { query: searchQuery })}</p>
                        <button
                            onClick={onClearSearch}
                            className="mt-2 text-sm font-semibold text-brand-primary hover:text-brand-dark transition-colors"
                        >
                            {t('allProducts.clearSearch')}
                        </button>
                    </div>
                )}

                <div className="flex justify-center flex-wrap gap-2 sm:gap-4 mb-8">
                    {ALL_CATEGORIES_KEYS.map(categoryKey => (
                        <button
                            key={categoryKey}
                            onClick={() => handleCategoryChange(categoryKey)}
                            className={`px-4 sm:px-6 py-2 rounded-full font-semibold text-sm sm:text-base transition-colors duration-300 ${activeCategory === categoryKey
                                    ? 'bg-brand-primary text-white shadow-md'
                                    : 'bg-white text-brand-primary hover:bg-brand-accent'
                                }`}
                        >
                            {t(`categories.${categoryKey.replace(' ', '').toLowerCase()}`)}
                        </button>
                    ))}
                </div>

                <div className="lg:grid lg:grid-cols-4 lg:gap-8 lg:items-start">
                    {/* Filters Sidebar */}
                    <aside className="lg:col-span-1 mb-8 lg:mb-0">
                        <div className="sticky top-28 bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold text-brand-dark border-b pb-3 mb-4">{t('filters.filtersTitle')}</h3>
                            <div className="space-y-6">
                                {/* Sort By */}
                                <div>
                                    <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">{t('filters.sortBy')}</label>
                                    <select
                                        id="sort"
                                        value={sortOption}
                                        onChange={(e) => setSortOption(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-gold text-sm"
                                    >
                                        <option value="default">{t('filters.default')}</option>
                                        <option value="newest">{t('filters.newest')}</option>
                                        <option value="price-asc">{t('filters.priceLowHigh')}</option>
                                        <option value="price-desc">{t('filters.priceHighLow')}</option>
                                        <option value="name-asc">{t('filters.nameAZ')}</option>
                                        <option value="name-desc">{t('filters.nameZA')}</option>
                                    </select>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('filters.priceRange')}</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            placeholder={t('filters.minPrice')}
                                            value={priceRange.min}
                                            onChange={(e) => setPriceRange(p => ({ ...p, min: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-gold text-sm"
                                        />
                                        <span className="text-gray-500">-</span>
                                        <input
                                            type="number"
                                            placeholder={t('filters.maxPrice')}
                                            value={priceRange.max}
                                            onChange={(e) => setPriceRange(p => ({ ...p, max: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-gold text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                                    <button onClick={handleApplyPriceFilter} className="w-full px-4 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-primary transition-colors font-semibold text-sm">{t('filters.apply')}</button>
                                    <button onClick={handleResetFilters} className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm">{t('filters.resetFilters')}</button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Content: Products Grid */}
                    <main className="lg:col-span-3">
                        <motion.div
                            layout
                            variants={gridContainerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 min-h-[500px]"
                        >
                            <AnimatePresence>
                                {currentProducts.map(product => (
                                    <motion.div key={product.id} variants={gridItemVariants} layout>
                                        <ProductCard
                                            product={product}
                                            onClick={() => onProductClick(product)}
                                            onAddToCart={onAddToCart}
                                            isInWishlist={wishlistItems.includes(product.id)}
                                            onToggleWishlist={onToggleWishlist}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                        {filteredAndSortedProducts.length === 0 && (
                            <div className="col-span-full text-center py-16 bg-white rounded-lg shadow-md">
                                <p className="text-gray-600 text-lg">{t('allProducts.noProducts')}</p>
                            </div>
                        )}

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AllProductsPage;