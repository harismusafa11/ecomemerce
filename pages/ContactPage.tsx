import React from 'react';
import { REAL_SOCIAL_CHANNELS, WHATSAPP_NUMBER } from '../constants';
import { useTranslations } from '../hooks/useTranslations';
import { MessageCircle, Clock, ExternalLink, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ContactPage: React.FC = () => {
    const { t } = useTranslations();

    const handleDirectWhatsApp = () => {
        const message = encodeURIComponent('Halo Admin & Pengasuh Tapak Pamungkas, saya ingin berkonsultasi mengenai pemaharan pusaka.');
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Page Title Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                        Layanan Kebatinan & Saluran Resmi
                    </span>
                    <h1 className="text-4xl sm:text-6xl font-serif font-bold text-stone-100 mt-4 mb-4">
                        Hubungi Sanggar Tapak Pamungkas
                    </h1>
                    <p className="text-stone-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                        Silakan hubungi kami melalui saluran WhatsApp resmi, media sosial, atau marketplace resmi terpercaya di bawah ini.
                    </p>
                </div>

                {/* Main WhatsApp Direct Hero Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-5xl mx-auto glass-panel p-8 sm:p-10 rounded-3xl border border-emerald-500/40 mb-16 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-20 h-20 rounded-2xl bg-stone-900 border border-emerald-500/50 flex items-center justify-center p-3 flex-shrink-0 shadow-lg">
                            {React.createElement(REAL_SOCIAL_CHANNELS[0].icon, { className: "w-12 h-12" })}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full font-bold">
                                    Respon Cepat (Fast Response)
                                </span>
                            </div>
                            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-stone-100">
                                WhatsApp Direct Consultation
                            </h2>
                            <p className="text-xs sm:text-sm text-stone-300 mt-1 font-mono">
                                +62 858-8023-1697 (Official Sanggar)
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleDirectWhatsApp}
                        className="w-full lg:w-auto px-8 py-4 rounded-xl font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 transition-all text-xs uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 whitespace-nowrap z-10"
                    >
                        <MessageCircle className="w-4 h-4" />
                        <span>Chat WhatsApp Sekarang</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </motion.div>

                {/* Social & E-Commerce Real Logos Grid */}
                <div className="max-w-5xl mx-auto mb-16">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-serif font-bold text-stone-100">Saluran Resmi & Marketplace</h2>
                        <p className="text-xs font-mono text-stone-400 mt-1">Pilih saluran yang Anda sukai untuk belanja & informasi.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {REAL_SOCIAL_CHANNELS.map((channel, idx) => (
                            <motion.a
                                key={channel.name}
                                href={channel.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ y: -6 }}
                                className="glass-panel p-6 rounded-2xl border border-amber-500/20 flex flex-col items-center text-center group hover:border-amber-500/50 transition-all shadow-xl relative overflow-hidden"
                            >
                                {/* Ambient Background Gradient */}
                                <div className={`absolute -inset-1 bg-gradient-to-br ${channel.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>

                                <div className="w-16 h-16 rounded-2xl bg-stone-900 border border-stone-800 p-3 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-amber-500/40 transition-all shadow-md z-10">
                                    <channel.icon className="w-10 h-10" />
                                </div>
                                <h3 className="text-sm font-serif font-bold text-stone-100 group-hover:text-amber-400 transition-colors z-10">
                                    {channel.name}
                                </h3>
                                <span className="text-[11px] font-mono text-amber-400/90 mt-1 font-semibold z-10">
                                    {channel.handle}
                                </span>
                                <p className="text-[11px] text-stone-400 mt-2 line-clamp-2 leading-relaxed z-10">
                                    {channel.description}
                                </p>
                                <div className="mt-4 inline-flex items-center gap-1 text-[10px] font-mono text-stone-500 group-hover:text-amber-400 transition-colors z-10">
                                    <span>Kunjungi Saluran</span>
                                    <ExternalLink className="w-3 h-3" />
                                </div>
                            </motion.a>
                        ))}
                    </div>
                </div>

                {/* Sanggar Info & Operating Hours Cards */}
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 flex-shrink-0">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-serif font-bold text-stone-100 text-base">Jam Layanan Consultation</h4>
                            <p className="text-xs text-stone-400 mt-1 font-mono">Senin - Minggu: 08:00 - 21:00 WIB</p>
                            <p className="text-[11px] text-stone-500 mt-2 leading-relaxed">
                                Layanan chat WhatsApp aktif setiap hari untuk bimbingan dan pertanyaan produk.
                            </p>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 flex-shrink-0">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-serif font-bold text-stone-100 text-base">Jaminan Keamanan & Garansi</h4>
                            <p className="text-xs text-stone-400 mt-1 font-mono">100% Asli & Terpercaya</p>
                            <p className="text-[11px] text-stone-500 mt-2 leading-relaxed">
                                Seluruh akun dan nomor di atas adalah akun resmi sanggar Tapak Pamungkas.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;