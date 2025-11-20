import React from 'react';
import { useTranslations } from '../hooks/useTranslations';

const AboutPage: React.FC = () => {
    const { t } = useTranslations();
    return (
        <div className="bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark">{t('about.title')}</h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t('about.subtitle')}</p>
                </div>

                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="bg-brand-light p-8 rounded-lg shadow-lg border-l-4 border-brand-gold">
                        <h2 className="text-3xl font-serif font-semibold text-brand-primary mb-4">{t('about.aboutUsTitle')}</h2>
                        <p className="text-gray-700 leading-relaxed">
                            {t('about.aboutUsContent')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-brand-light p-8 rounded-lg shadow-lg">
                            <h2 className="text-3xl font-serif font-semibold text-brand-primary mb-4">{t('about.visionTitle')}</h2>
                            <p className="text-gray-700 leading-relaxed">
                                {t('about.visionContent')}
                            </p>
                        </div>
                         <div className="bg-brand-light p-8 rounded-lg shadow-lg">
                            <h2 className="text-3xl font-serif font-semibold text-brand-primary mb-4">{t('about.missionTitle')}</h2>
                            <ul className="list-disc list-inside text-gray-700 space-y-2 leading-relaxed">
                                <li>{t('about.missionItem1')}</li>
                                <li>{t('about.missionItem2')}</li>
                                <li>{t('about.missionItem3')}</li>
                                <li>{t('about.missionItem4')}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;