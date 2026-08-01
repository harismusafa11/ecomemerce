import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Page, User, Product } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, ShoppingBag, Heart, User as UserIconLucide, Menu, X, Search, ShieldCheck, ArrowRight, Package } from 'lucide-react';
import LazyImage from './ui/LazyImage';

interface HeaderProps {
    cartItemCount: number;
    wishlistItemCount: number;
    onNavigate: (page: Page) => void;
    currentUser: User | null;
    onLogout: () => void;
    onCartClick: () => void;
    onWishlistClick: () => void;
    onCartIconRef: (node: HTMLButtonElement | null) => void;
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    onSearchSubmit: (query: string) => void;
    products?: Product[];
    onProductClick?: (product: Product) => void;
}

const Header: React.FC<HeaderProps> = ({
    cartItemCount,
    wishlistItemCount,
    onNavigate,
    currentUser,
    onLogout,
    onCartClick,
    onWishlistClick,
    onCartIconRef,
    searchQuery,
    onSearchQueryChange,
    onSearchSubmit,
    products = [],
    onProductClick
}) => {
    const { t, locale, setLocale } = useTranslations();
    const { theme, toggleTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const userMenuRef = useRef<HTMLDivElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsSearchFocused(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Live search filtered suggestions
    const searchResults = useMemo(() => {
        if (!searchQuery || searchQuery.trim().length < 1) return [];
        const q = searchQuery.trim().toLowerCase();
        return products.filter(p =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        ).slice(0, 5);
    }, [searchQuery, products]);

    const navLinks = [
        { page: 'home', label: t('header.home') },
        { page: 'allProducts', label: t('header.products') },
        { page: 'vouchers', label: t('header.vouchers') },
        { page: 'about', label: t('header.about') },
        { page: 'contact', label: t('header.contact') },
    ];

    const handleSearchSubmit = useCallback((e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (searchQuery.trim()) {
            onSearchSubmit(searchQuery.trim());
            setIsSearchFocused(false);
            setIsMenuOpen(false);
        }
    }, [searchQuery, onSearchSubmit]);

    const handleSelectResult = (product: Product) => {
        setIsSearchFocused(false);
        setIsMenuOpen(false);
        if (onProductClick) {
            onProductClick(product);
        } else {
            onSearchSubmit(product.name);
        }
    };

    const handleClearSearch = () => {
        onSearchQueryChange('');
        if (searchInputRef.current) {
            searchInputRef.current.focus();
        }
    };

    return (
        <header className={`sticky top-0 z-50 transition-all duration-300 ${
            scrolled
                ? 'glass-panel shadow-2xl py-3 border-b border-amber-500/20'
                : 'bg-stone-950/90 py-4 border-b border-stone-800/80 text-stone-100'
        }`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-4">
                    {/* Brand Logo */}
                    <div className="flex-shrink-0">
                        <a onClick={() => onNavigate('home')} className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-700 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-500"></div>
                                <img src="https://files.catbox.moe/z44d2s.png" alt="Tapak Pamungkas" className="relative h-10 w-10 object-contain rounded-full border border-amber-500/30" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-serif font-bold gold-gradient-text tracking-wide group-hover:scale-[1.02] transition-transform">
                                    Tapak Pamungkas
                                </span>
                                <span className="text-[10px] text-amber-400/80 uppercase tracking-widest font-mono">Warisan Nusantara</span>
                            </div>
                        </a>
                    </div>

                    {/* Navigation Links */}
                    <nav className="hidden lg:flex items-center space-x-6">
                        {navLinks.map(link => (
                            <a
                                key={link.page}
                                onClick={() => onNavigate(link.page as Page)}
                                className="relative text-xs font-mono font-semibold uppercase tracking-wider transition-all duration-300 hover:text-amber-400 cursor-pointer group py-1 text-stone-200 whitespace-nowrap"
                            >
                                {link.label}
                                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300 group-hover:w-full"></span>
                            </a>
                        ))}
                        {currentUser?.isAdmin && (
                            <a
                                onClick={() => onNavigate('adminPanel')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-mono font-semibold hover:bg-amber-500 hover:text-stone-900 transition-all duration-300 cursor-pointer whitespace-nowrap"
                            >
                                <ShieldCheck className="w-4 h-4" />
                                Admin Panel
                            </a>
                        )}
                    </nav>

                    {/* Search Bar & Action Tools */}
                    <div className="flex items-center space-x-3 md:space-x-4 flex-1 lg:flex-none justify-end">
                        
                        {/* INLINE PERMANENT SEARCH BAR (NO UNMOUNTING OR FOCUS LOSS) */}
                        <div ref={searchContainerRef} className="relative w-full max-w-[280px] hidden sm:block">
                            <form onSubmit={handleSearchSubmit} className="relative w-full">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onChange={(e) => onSearchQueryChange(e.target.value)}
                                    placeholder={t('header.searchPlaceholder')}
                                    className="w-full bg-stone-900 border border-stone-800 focus:border-amber-500/80 rounded-full py-2 pl-4 pr-16 text-stone-100 placeholder-stone-400 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/50 shadow-md transition-all"
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={handleClearSearch}
                                            className="p-1 text-stone-400 hover:text-stone-200 rounded-full hover:bg-stone-800 transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        aria-label="Search"
                                        className="p-1 text-amber-400 hover:text-amber-300 rounded-full hover:bg-stone-800 transition-colors"
                                    >
                                        <Search className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>

                            {/* LIVE AUTOCOMPLETE SUGGESTIONS OVERLAY */}
                            <AnimatePresence>
                                {isSearchFocused && searchQuery.trim().length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                        className="absolute left-0 right-0 top-full mt-2 bg-stone-900/98 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden z-50 backdrop-blur-xl max-h-[380px] overflow-y-auto divide-y divide-stone-800/60"
                                    >
                                        {searchResults.length > 0 ? (
                                            <>
                                                <div className="px-4 py-2 bg-stone-950/80 text-[10px] font-mono text-stone-400 flex justify-between items-center">
                                                    <span>Saran Produk ({searchResults.length})</span>
                                                    <span className="text-amber-400">Tekan Enter</span>
                                                </div>

                                                {searchResults.map(product => (
                                                    <div
                                                        key={product.id}
                                                        onMouseDown={(e) => {
                                                            e.preventDefault(); // Prevent input blur before click registered
                                                            handleSelectResult(product);
                                                        }}
                                                        className="p-3 hover:bg-stone-800/80 cursor-pointer flex items-center gap-3 transition-colors group"
                                                    >
                                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-950 border border-stone-800 flex-shrink-0">
                                                            <LazyImage src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-xs font-serif font-semibold text-stone-200 group-hover:text-amber-400 truncate transition-colors">
                                                                {product.name}
                                                            </h4>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                                                                    {product.category}
                                                                </span>
                                                                <span className="text-[11px] font-mono text-stone-300">
                                                                    Rp {product.price.toLocaleString('id-ID')}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                                                    </div>
                                                ))}

                                                <div
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        handleSearchSubmit();
                                                    }}
                                                    className="p-3 bg-stone-950 hover:bg-amber-500/10 text-center text-xs font-mono font-bold text-amber-400 cursor-pointer transition-colors flex items-center justify-center gap-2 border-t border-stone-800"
                                                >
                                                    <span>Lihat Semua Hasil untuk "{searchQuery}"</span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="p-6 text-center text-stone-400 space-y-2">
                                                <Package className="w-8 h-8 mx-auto text-stone-600" />
                                                <p className="text-xs font-mono">Tidak ada produk cocok dengan "{searchQuery}"</p>
                                                <button
                                                    type="button"
                                                    onMouseDown={(e) => {
                                                        e.preventDefault();
                                                        handleSearchSubmit();
                                                    }}
                                                    className="text-[11px] font-mono text-amber-400 hover:underline"
                                                >
                                                    Cari di Katalog Produk →
                                                </button>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 text-amber-400 hover:text-amber-300 transition-transform duration-300 hover:rotate-12 rounded-full hover:bg-amber-500/10"
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5 text-stone-300" />}
                        </button>

                        {/* Language Selector */}
                        <div className="flex items-center space-x-1.5 text-xs font-mono bg-stone-900/60 border border-stone-800 rounded-full px-2.5 py-1">
                            <button onClick={() => setLocale('id')} className={`transition-colors ${locale === 'id' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'}`}>ID</button>
                            <span className="text-stone-600">|</span>
                            <button onClick={() => setLocale('en')} className={`transition-colors ${locale === 'en' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'}`}>EN</button>
                        </div>

                        {/* Wishlist */}
                        <button onClick={onWishlistClick} className="relative p-2 text-stone-300 hover:text-rose-400 transition-colors rounded-full hover:bg-stone-800/50">
                            <Heart className="w-5 h-5" />
                            {wishlistItemCount > 0 && (
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center border border-stone-900">
                                    {wishlistItemCount}
                                </motion.span>
                            )}
                        </button>

                        {/* Cart */}
                        <button ref={onCartIconRef} onClick={onCartClick} className="relative p-2 text-stone-300 hover:text-amber-400 transition-colors rounded-full hover:bg-stone-800/50">
                            <ShoppingBag className="w-5 h-5" />
                            {cartItemCount > 0 && (
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold text-[10px] rounded-full h-4 w-4 flex items-center justify-center border border-stone-900 gold-glow">
                                    {cartItemCount}
                                </motion.span>
                            )}
                        </button>

                        {/* User Account / Login */}
                        <div ref={userMenuRef} className="relative">
                            {currentUser ? (
                                <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-stone-800/50 transition-colors border border-stone-800">
                                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-stone-950 font-bold text-xs flex items-center justify-center uppercase">
                                        {currentUser.name.charAt(0)}
                                    </div>
                                </button>
                            ) : (
                                <button onClick={() => onNavigate('login')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900 hover:bg-amber-500/20 text-stone-200 hover:text-amber-400 border border-stone-800 hover:border-amber-500/40 text-xs font-mono font-medium transition-all">
                                    <UserIconLucide className="w-4 h-4 text-amber-400" />
                                    <span>{t('header.login')}</span>
                                </button>
                            )}

                            {/* User Dropdown Menu */}
                            <AnimatePresence>
                                {isUserMenuOpen && currentUser && (
                                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="absolute right-0 mt-2 w-48 bg-stone-900 border border-amber-500/30 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden">
                                        <div className="px-4 py-2 border-b border-stone-800">
                                            <p className="text-xs font-serif font-bold text-stone-200">{currentUser.name}</p>
                                            <p className="text-[10px] font-mono text-stone-400 truncate">{currentUser.email}</p>
                                        </div>
                                        <button onClick={() => { onNavigate('profile'); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-xs text-stone-300 hover:bg-stone-800 hover:text-amber-400">Profil Saya</button>
                                        <button onClick={() => { onNavigate('orderHistory'); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-xs text-stone-300 hover:bg-stone-800 hover:text-amber-400">Riwayat Pesanan</button>
                                        <button onClick={() => { onLogout(); setIsUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10">Keluar</button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-stone-300 hover:text-amber-400 transition-colors">
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden mt-4 pb-4 border-t border-stone-800 overflow-hidden">
                            <div className="pt-4 px-4 mb-2">
                                <form onSubmit={handleSearchSubmit} className="relative w-full">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => onSearchQueryChange(e.target.value)}
                                        placeholder={t('header.searchPlaceholder')}
                                        className="w-full bg-stone-900 border border-stone-800 rounded-full py-2.5 pl-4 pr-10 text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                                    />
                                    <button type="submit" className="absolute right-3 top-2.5 text-amber-400">
                                        <Search className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>

                            <div className="flex flex-col space-y-3 p-4">
                                {navLinks.map(link => (
                                    <a
                                        key={link.page}
                                        onClick={() => { onNavigate(link.page as Page); setIsMenuOpen(false); }}
                                        className="text-xs font-mono font-semibold uppercase tracking-wider text-stone-200 hover:text-amber-400 py-1"
                                    >
                                        {link.label}
                                    </a>
                                ))}
                                {currentUser?.isAdmin && (
                                    <a
                                        onClick={() => { onNavigate('adminPanel'); setIsMenuOpen(false); }}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 text-amber-400 text-xs font-mono font-semibold"
                                    >
                                        <ShieldCheck className="w-4 h-4" />
                                        Admin Panel
                                    </a>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </header>
    );
};

export default Header;