import React, { memo } from 'react';
import { SOCIAL_LINKS } from '../constants';
import { Page } from '../types';
import { useTranslations } from '../hooks/useTranslations';

interface FooterProps {
    onAdminTrigger: () => void;
    onNavigate: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ onAdminTrigger, onNavigate }) => {
    const { t } = useTranslations();

    return (
        <footer className="bg-stone-950 text-stone-400 border-t border-amber-500/20 pt-16 pb-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Brand Info */}
                    <div className="lg:col-span-5 space-y-4">
                        <div className="flex items-center gap-3">
                            <img src="https://files.catbox.moe/z44d2s.png" alt="Tapak Pamungkas" className="h-10 w-10 rounded-full border border-amber-500/40" />
                            <div className="flex flex-col">
                                <span className="text-xl font-serif font-bold gold-gradient-text">Tapak Pamungkas</span>
                            </div>
                        </div>
                        <p className="text-xs text-stone-400 max-w-sm leading-relaxed">
                            {t('footer.tagline')}
                        </p>
                    </div>

                    {/* Quick Navigation */}
                    <div className="lg:col-span-3">
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-4">Navigasi Utama</h3>
                        <ul className="space-y-2.5 text-xs">
                            <li><a onClick={() => onNavigate('allProducts')} className="cursor-pointer hover:text-amber-400 transition-colors">{t('footer.shopProducts')}</a></li>
                            <li><a onClick={() => onNavigate('vouchers')} className="cursor-pointer hover:text-amber-400 transition-colors">Kupon Promo</a></li>
                            <li><a onClick={() => onNavigate('blog')} className="cursor-pointer hover:text-amber-400 transition-colors">Blog & Wawasan</a></li>
                            <li><a onClick={() => onNavigate('faq')} className="cursor-pointer hover:text-amber-400 transition-colors">FAQ / Pusat Bantuan</a></li>
                            <li><a onClick={() => onNavigate('about')} className="cursor-pointer hover:text-amber-400 transition-colors">{t('footer.shopAbout')}</a></li>
                            <li><a onClick={() => onNavigate('contact')} className="cursor-pointer hover:text-amber-400 transition-colors">{t('footer.shopContact')}</a></li>
                        </ul>
                    </div>

                    {/* Social Media & Admin Shortcut */}
                    <div className="lg:col-span-4 lg:text-right space-y-4">
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-4">{t('footer.socialTitle')}</h3>
                        <div className="flex lg:justify-end gap-3">
                            {SOCIAL_LINKS.slice(0, 4).map(link => (
                                <a
                                    key={link.name}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2.5 rounded-full bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-400 hover:border-amber-500/40 transition-all"
                                    aria-label={link.name}
                                >
                                    <link.icon className="h-4 w-4" />
                                </a>
                            ))}
                        </div>
                        <p className="text-xs text-stone-400">{t('footer.socialTagline')}</p>
                    </div>
                </div>

                <div className="mt-12 border-t border-stone-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-stone-400 gap-4">
                    <p onClick={onAdminTrigger} className="cursor-pointer hover:text-amber-400 transition-colors" title="Secret Admin Access">
                        &copy; {new Date().getFullYear()} Tapak Pamungkas. {t('footer.copyright')}.
                    </p>
                    <div className="flex gap-4 text-[11px]">
                        <a onClick={() => onNavigate('privasi')} className="cursor-pointer hover:text-amber-400 transition-colors">Privasi & Keamanan</a>
                        <span>•</span>
                        <a onClick={() => onNavigate('syarat')} className="cursor-pointer hover:text-amber-400 transition-colors">Syarat & Ketentuan</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default memo(Footer);