import React from 'react';
import { SOCIAL_LINKS } from '../constants';
import { useTranslations } from '../hooks/useTranslations';

const ContactPage: React.FC = () => {
    const { t } = useTranslations();
    return (
        <div className="bg-brand-light">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark">{t('contact.title')}</h1>
                    <p className="mt-4 text-lg text-gray-600">{t('contact.subtitle')}</p>
                </div>
                
                <div className="max-w-4xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {SOCIAL_LINKS.map((link) => (
                        <a 
                            key={link.name} 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-b-4 border-transparent hover:border-brand-gold"
                        >
                            <div className="text-brand-primary group-hover:text-brand-secondary transition-colors duration-300 mb-3 flex items-center justify-center h-10">
                                <link.icon className="h-10 w-10" />
                            </div>
                            <h3 className="text-md font-semibold text-brand-dark">{link.name}</h3>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ContactPage;