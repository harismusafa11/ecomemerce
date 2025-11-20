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
        <footer className="bg-brand-dark text-brand-accent">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 mb-4 lg:mb-0">
                        <div className="flex items-center gap-3 mb-4">
                            <img src="https://files.catbox.moe/z44d2s.png" alt="Tapak Pamungkas Logo" className="h-12" loading="lazy" decoding="async" />
                            <div className="border border-brand-accent/80 rounded-md px-3 py-1">
                                <span className="text-xl font-serif font-bold text-white">Tapak Pamungkas</span>
                            </div>
                        </div>
                        <p className="text-sm max-w-sm">{t('footer.tagline')}</p>
                    </div>

                    <div className="lg:col-span-2">
                         <h3 className="text-lg font-semibold text-white mb-4">{t('footer.shopTitle')}</h3>
                         <ul className="space-y-2 text-sm">
                            <li><a onClick={() => onNavigate('allProducts')} className="cursor-pointer hover:text-white transition-colors">{t('footer.shopProducts')}</a></li>
                            <li><a onClick={() => onNavigate('about')} className="cursor-pointer hover:text-white transition-colors">{t('footer.shopAbout')}</a></li>
                            <li><a onClick={() => onNavigate('contact')} className="cursor-pointer hover:text-white transition-colors">{t('footer.shopContact')}</a></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                        <h3 className="text-lg font-semibold text-white mb-4">{t('footer.helpTitle')}</h3>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">{t('footer.helpPrivacy')}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{t('footer.helpTerms')}</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">{t('footer.helpFAQ')}</a></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-4 lg:text-right">
                         <h3 className="text-lg font-semibold text-white mb-4">{t('footer.socialTitle')}</h3>
                         <div className="flex lg:justify-end space-x-4 mb-4">
                            {SOCIAL_LINKS.slice(0, 4).map(link => (
                                <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" className="text-brand-accent hover:text-white transition-colors" aria-label={link.name}>
                                    <link.icon className="h-6 w-6" />
                                </a>
                            ))}
                        </div>
                        <p className="text-sm">{t('footer.socialTagline')}</p>
                    </div>
                </div>

                <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm">
                    <p onClick={onAdminTrigger} className="cursor-pointer" title="Secret Admin Access">
                        &copy; {new Date().getFullYear()} Tapak Pamungkas. {t('footer.copyright')}.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default memo(Footer);