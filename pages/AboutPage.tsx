import React from 'react';
import { useTranslations } from '../hooks/useTranslations';
import { ShieldCheck, Award, Compass, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const AboutPage: React.FC = () => {
    const { t } = useTranslations();
    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">Tentang Kami</span>
                    <h1 className="text-4xl sm:text-6xl font-serif font-bold text-stone-100 mt-2 mb-4">
                        {t('about.title')}
                    </h1>
                    <p className="text-stone-400 text-base leading-relaxed">
                        {t('about.subtitle')}
                    </p>
                </div>

                <div className="max-w-4xl mx-auto space-y-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="glass-panel p-8 sm:p-10 rounded-3xl border border-amber-500/30 shadow-2xl relative"
                    >
                        <ShieldCheck className="w-8 h-8 text-amber-400 mb-4" />
                        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-400 mb-4">{t('about.aboutUsTitle')}</h2>
                        <p className="text-stone-300 leading-relaxed text-sm sm:text-base">
                            {t('about.aboutUsContent')}
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="glass-panel p-8 rounded-3xl border border-amber-500/20 shadow-xl"
                        >
                            <Compass className="w-8 h-8 text-amber-400 mb-4" />
                            <h2 className="text-2xl font-serif font-bold text-stone-100 mb-4">{t('about.visionTitle')}</h2>
                            <p className="text-stone-300 leading-relaxed text-sm">
                                {t('about.visionContent')}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="glass-panel p-8 rounded-3xl border border-amber-500/20 shadow-xl"
                        >
                            <Award className="w-8 h-8 text-amber-400 mb-4" />
                            <h2 className="text-2xl font-serif font-bold text-stone-100 mb-4">{t('about.missionTitle')}</h2>
                            <ul className="space-y-3 text-stone-300 text-sm font-mono">
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400 font-bold">•</span>
                                    <span>{t('about.missionItem1')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400 font-bold">•</span>
                                    <span>{t('about.missionItem2')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400 font-bold">•</span>
                                    <span>{t('about.missionItem3')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-400 font-bold">•</span>
                                    <span>{t('about.missionItem4')}</span>
                                </li>
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;