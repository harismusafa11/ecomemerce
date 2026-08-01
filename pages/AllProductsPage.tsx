import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import { CATEGORIES } from '../constants';
import ProductCard from '../components/ProductCard';
import QuickViewModal from '../components/QuickViewModal';
import Pagination from '../components/ui/Pagination';
import { useTranslations } from '../hooks/useTranslations';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Filter, SlidersHorizontal, RefreshCw, Search, X } from 'lucide-react';

const ALL_CATEGORIES_KEYS = ['Semua', ...CATEGORIES];
const ITEMS_PER_PAGE = 9;

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

const AllProductsPage: React.FC<AllProductsPageProps> = ({
    products,
    onProductClick,
    onAddToCart,
    wishlistItems,
    onToggleWishlist,
    searchQuery,
    onClearSearch
}) => {
    const [activeCategory, setActiveCategory] = useState(() => {
        return sessionStorage.getItem('catalog_category') || 'Semua';
    });
    const [currentPage, setCurrentPage] = useState(() => {
        const saved = sessionStorage.getItem('catalog_current_page');
        return saved ? Math.max(1, parseInt(saved, 10)) : 1;
    });
    const [sortOption, setSortOption] = useState(() => {
        return sessionStorage.getItem('catalog_sort') || 'default';
    });
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [appliedPriceRange, setAppliedPriceRange] = useState<{ min: number | null, max: number | null }>({ min: null, max: null });
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
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

    const totalPages = Math.ceil(filteredAndSortedProducts.length / ITEMS_PER_PAGE) || 1;

    // Ensure valid page number if total pages shrinks
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
            sessionStorage.setItem('catalog_current_page', String(totalPages));
        }
    }, [currentPage, totalPages]);

    const currentProducts = filteredAndSortedProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        sessionStorage.setItem('catalog_current_page', String(page));
        window.scrollTo({ top: 300, behavior: 'smooth' });
    };

    const handleCategoryChange = (category: string) => {
        setActiveCategory(category);
        setCurrentPage(1);
        sessionStorage.setItem('catalog_category', category);
        sessionStorage.setItem('catalog_current_page', '1');
    };

    const handleSortChange = (sort: string) => {
        setSortOption(sort);
        setCurrentPage(1);
        sessionStorage.setItem('catalog_sort', sort);
        sessionStorage.setItem('catalog_current_page', '1');
    };

    const handleApplyPriceFilter = () => {
        const min = priceRange.min === '' ? null : parseInt(priceRange.min, 10);
        const max = priceRange.max === '' ? null : parseInt(priceRange.max, 10);
        setAppliedPriceRange({
            min: !isNaN(min!) ? min : null,
            max: !isNaN(max!) ? max : null,
        });
        setCurrentPage(1);
        sessionStorage.setItem('catalog_current_page', '1');
    };

    const handleResetFilters = () => {
        setSortOption('default');
        setPriceRange({ min: '', max: '' });
        setAppliedPriceRange({ min: null, max: null });
        setActiveCategory('Semua');
        setCurrentPage(1);
        sessionStorage.removeItem('catalog_category');
        sessionStorage.removeItem('catalog_sort');
        sessionStorage.setItem('catalog_current_page', '1');
    };

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
                {/* Title Section */}
                <div className="text-center max-w-2xl mx-auto mb-10">
                    <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">Katalog Lengkap</span>
                    <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-100 mt-2 mb-3">
                        Koleksi & Pusaka Nusantara
                    </h1>
                    <p className="text-stone-400 text-sm">
                        Jelajah dan temukan pusaka bertuah, media spiritual, serta ramuan herbal otentik.
                    </p>
                </div>

                {/* Active Search Highlight */}
                {searchQuery && (
                    <div className="mb-8 p-4 glass-panel rounded-2xl border border-amber-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Search className="w-5 h-5 text-amber-400" />
                            <span className="text-sm text-stone-200">
                                Menampilkan hasil pencarian untuk: <strong className="text-amber-400">"{searchQuery}"</strong>
                            </span>
                        </div>
                        <button
                            onClick={onClearSearch}
                            className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-xs text-rose-400 flex items-center gap-1 border border-stone-700"
                        >
                            <X className="w-3.5 h-3.5" /> Hapus Pencarian
                        </button>
                    </div>
                )}

                {/* Category Pills */}
                <div className="flex justify-center flex-wrap gap-2 mb-10">
                    {ALL_CATEGORIES_KEYS.map(categoryKey => (
                        <button
                            key={categoryKey}
                            onClick={() => handleCategoryChange(categoryKey)}
                            className={`px-5 py-2.5 rounded-full font-mono font-medium text-xs transition-all ${
                                activeCategory === categoryKey
                                    ? 'bg-amber-500 text-stone-950 font-bold gold-glow'
                                    : 'glass-panel text-stone-300 hover:text-amber-400 border border-stone-800'
                            }`}
                        >
                            {t(`categories.${categoryKey.replace(' ', '').toLowerCase()}`)}
                        </button>
                    ))}
                </div>

                {/* Main Content Layout */}
                <div className="lg:grid lg:grid-cols-4 lg:gap-8 lg:items-start">
                    {/* Filters Sidebar */}
                    <aside className="lg:col-span-1 mb-8 lg:mb-0">
                        <div className="sticky top-28 glass-panel p-6 rounded-2xl border border-amber-500/20 shadow-xl">
                            <h3 className="text-base font-serif font-bold text-amber-400 border-b border-stone-800 pb-3 mb-5 flex items-center gap-2">
                                <SlidersHorizontal className="w-4 h-4" /> Filter & Pengurutan
                            </h3>

                            <div className="space-y-5">
                                {/* Sort By */}
                                <div>
                                    <label className="block text-xs font-mono text-stone-400 mb-1.5">Urutkan Berdasarkan</label>
                                    <select
                                        value={sortOption}
                                        onChange={(e) => setSortOption(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                                    >
                                        <option value="default">Default (Rekomendasi)</option>
                                        <option value="newest">Terbaru</option>
                                        <option value="price-asc">Harga: Rendah ke Tinggi</option>
                                        <option value="price-desc">Harga: Tinggi ke Rendah</option>
                                        <option value="name-asc">Nama: A - Z</option>
                                        <option value="name-desc">Nama: Z - A</option>
                                    </select>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <label className="block text-xs font-mono text-stone-400 mb-1.5">Rentang Harga Tuah (Rp)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={priceRange.min}
                                            onChange={(e) => setPriceRange(p => ({ ...p, min: e.target.value }))}
                                            className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                                        />
                                        <span className="text-stone-600">-</span>
                                        <input
                                            type="number"
                                            placeholder="Maks"
                                            value={priceRange.max}
                                            onChange={(e) => setPriceRange(p => ({ ...p, max: e.target.value }))}
                                            className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                                        />
                                    </div>
                                </div>

                                {/* Filter Buttons */}
                                <div className="flex flex-col gap-2 pt-4 border-t border-stone-800">
                                    <button
                                        onClick={handleApplyPriceFilter}
                                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-md gold-glow transition-all"
                                    >
                                        Terapkan Filter
                                    </button>
                                    <button
                                        onClick={handleResetFilters}
                                        className="w-full py-2 text-stone-400 hover:text-stone-200 text-xs flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" /> Reset Semua Filter
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <main className="lg:col-span-3">
                        <motion.div
                            layout
                            variants={gridContainerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 min-h-[500px]"
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
                                            onQuickView={(prod) => setQuickViewProduct(prod)}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {filteredAndSortedProducts.length === 0 && (
                            <div className="text-center py-20 glass-panel rounded-2xl border border-stone-800">
                                <p className="text-stone-400 text-base mb-4">Tidak ada produk yang cocok dengan kriteria filter.</p>
                                <button
                                    onClick={handleResetFilters}
                                    className="px-6 py-2.5 bg-amber-500 text-stone-950 text-xs font-bold rounded-full"
                                >
                                    Reset Filter
                                </button>
                            </div>
                        )}

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AllProductsPage;