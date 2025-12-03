import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Page, User } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { motion, AnimatePresence } from 'framer-motion';

const CartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const WishlistIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.662l1.318-1.344a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
    </svg>
);

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SearchIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);


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
}

const Header: React.FC<HeaderProps> = ({ cartItemCount, wishlistItemCount, onNavigate, currentUser, onLogout, onCartClick, onWishlistClick, onCartIconRef, searchQuery, onSearchQueryChange, onSearchSubmit }) => {
    const { t, locale, setLocale } = useTranslations();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const userMenuRef = useRef<HTMLDivElement>(null);
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Close user menu on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close search bar on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Auto-focus search input when it opens
    useEffect(() => {
        if (isSearchOpen) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100); // Timeout to allow the element to render before focusing
        }
    }, [isSearchOpen]);

    const navLinks = [
        { page: 'home', label: t('header.home') },
        { page: 'allProducts', label: t('header.products') },
        { page: 'vouchers', label: t('header.vouchers') },
        { page: 'about', label: t('header.about') },
        { page: 'contact', label: t('header.contact') },
    ];

    const handleSearchSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onSearchSubmit(searchQuery.trim());
            setIsSearchOpen(false); // Close search after submitting
            if (isMenuOpen) {
                setIsMenuOpen(false);
            }
        }
    }, [searchQuery, onSearchSubmit, isMenuOpen]);

    const NavItems = ({ isMobile = false }) => (
        <div className={`flex ${isMobile ? 'flex-col space-y-4 p-4' : 'items-center space-x-6'}`}>
            {navLinks.map(link => (
                <a key={link.page} onClick={() => { onNavigate(link.page as Page); isMobile && setIsMenuOpen(false); }} className="text-brand-accent hover:text-white transition-colors cursor-pointer font-medium">{link.label}</a>
            ))}
        </div>
    );

    const SearchForm = ({ className }: { className?: string }) => (
        <form onSubmit={handleSearchSubmit} className={`relative w-full ${className}`}>
            <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchQueryChange(e.target.value)}
                placeholder={t('header.searchPlaceholder')}
                className="w-full bg-brand-primary/50 border border-brand-accent/30 rounded-full py-2 pl-4 pr-10 text-white placeholder-brand-accent/70 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent transition-colors"
            />
            <button type="submit" aria-label="Search" className="absolute right-0 top-0 h-full px-3 text-brand-accent hover:text-white">
                <SearchIcon />
            </button>
        </form>
    );

    return (
        <header className="bg-brand-dark text-white sticky top-0 z-40 shadow-lg">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Left: Logo */}
                    <div className="flex-shrink-0">
                        <a onClick={() => onNavigate('home')} className="flex items-center gap-3 cursor-pointer">
                            <img src="https://files.catbox.moe/z44d2s.png" alt="Tapak Pamungkas Logo" className="h-10" />
                            <div className="border border-brand-accent/80 rounded-md px-3 py-1 hidden sm:flex">
                                <span className="text-lg font-serif font-bold text-white">Tapak Pamungkas</span>
                            </div>
                        </a>
                    </div>

                    {/* Center: Desktop Navigation */}
                    <nav className="hidden lg:flex">
                        <NavItems />
                    </nav>

                    {/* Right: Icons and Auth */}
                    <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
                        {/* Expandable Desktop Search Bar */}
                        <div ref={searchContainerRef} className="hidden lg:flex items-center justify-end">
                            {isSearchOpen ? (
                                <div className="w-60 transition-all duration-300">
                                    <SearchForm />
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsSearchOpen(true)}
                                    className="p-2 text-brand-accent hover:text-white transition-colors"
                                    aria-label={t('header.searchPlaceholder')}
                                >
                                    <SearchIcon className="h-6 w-6" />
                                </button>
                            )}
                        </div>


                        <div className="flex items-center space-x-2 text-sm">
                            <button onClick={() => setLocale('id')} className={`font-semibold ${locale === 'id' ? 'text-white' : 'text-brand-accent hover:text-white'}`}>ID</button>
                            <span className="text-brand-accent">|</span>
                            <button onClick={() => setLocale('en')} className={`font-semibold ${locale === 'en' ? 'text-white' : 'text-brand-accent hover:text-white'}`}>EN</button>
                        </div>

                        {/* Wishlist */}
                        <button onClick={onWishlistClick} className="relative text-brand-accent hover:text-white transition-colors">
                            <WishlistIcon />
                            {wishlistItemCount > 0 && <span className="absolute -top-2 -right-2 bg-brand-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{wishlistItemCount}</span>}
                        </button>

                        {/* Cart */}
                        <button ref={onCartIconRef} onClick={onCartClick} className="relative text-brand-accent hover:text-white transition-colors">
                            <CartIcon />
                            {cartItemCount > 0 && <span className="absolute -top-2 -right-2 bg-brand-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartItemCount}</span>}
                        </button>

                        {/* User/Auth */}
                        <div className="hidden md:flex items-center">
                            {currentUser ? (
                                <div ref={userMenuRef} className="relative">
                                    <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center space-x-2 text-brand-accent hover:text-white transition-colors">
                                        <UserIcon />
                                        <span className="font-medium">{currentUser.name.split(' ')[0]}</span>
                                    </button>
                                    <AnimatePresence>
                                        {isUserMenuOpen && (
                                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                                <a onClick={() => { onNavigate('profile'); setIsUserMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">{t('header.myAccount')}</a>
                                                <a onClick={() => { onNavigate('orderHistory'); setIsUserMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">{t('header.orderHistory')}</a>
                                                <a onClick={() => { onNavigate('vouchers'); setIsUserMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">{t('header.vouchers')}</a>
                                                <a onClick={() => { onLogout(); setIsUserMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">{t('header.logout')}</a>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <button onClick={() => onNavigate('login')} className="text-brand-accent hover:text-white transition-colors font-medium">{t('header.login')}</button>
                                    <button onClick={() => onNavigate('register')} className="bg-brand-gold text-brand-dark font-bold py-2 px-4 rounded-md hover:bg-white transition-all duration-300 text-sm">{t('header.register')}</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="lg:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-brand-dark border-t border-white/10">
                        <div className="p-4 border-b border-white/10">
                            <SearchForm />
                        </div>
                        <nav>
                            <NavItems isMobile />
                            <div className="border-t border-white/20 mt-4 pt-4 px-4 pb-4">
                                {currentUser ? (
                                    <div className="space-y-4">
                                        <a onClick={() => { onNavigate('profile'); setIsMenuOpen(false); }} className="block text-brand-accent hover:text-white transition-colors font-medium cursor-pointer">{t('header.myAccount')}</a>
                                        <a onClick={() => { onNavigate('orderHistory'); setIsMenuOpen(false); }} className="block text-brand-accent hover:text-white transition-colors font-medium cursor-pointer">{t('header.orderHistory')}</a>
                                        <a onClick={() => { onNavigate('vouchers'); setIsMenuOpen(false); }} className="block text-brand-accent hover:text-white transition-colors font-medium cursor-pointer">{t('header.vouchers')}</a>
                                        <a onClick={() => { onLogout(); setIsMenuOpen(false); }} className="block text-brand-accent hover:text-white transition-colors font-medium cursor-pointer">{t('header.logout')}</a>
                                    </div>
                                ) : (
                                    <div className="space-y-4 md:hidden">
                                        <button onClick={() => { onNavigate('login'); setIsMenuOpen(false); }} className="block w-full text-left text-brand-accent hover:text-white transition-colors font-medium">{t('header.login')}</button>
                                        <button onClick={() => { onNavigate('register'); setIsMenuOpen(false); }} className="block w-full text-left text-brand-accent hover:text-white transition-colors font-medium">{t('header.register')}</button>
                                    </div>
                                )}
                            </div>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;