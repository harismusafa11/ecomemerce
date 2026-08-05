import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WHATSAPP_NUMBER } from '../constants';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-7 h-7" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

const WhatsAppWidget: React.FC = () => {
    const [open, setOpen] = useState(false);

    const openChat = () => {
        const message = encodeURIComponent('Halo Admin Tapak Pamungkas, saya ingin bertanya & berkonsultasi.');
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
    };

    return (
        <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="w-72 glass-panel rounded-2xl border border-emerald-500/30 shadow-2xl overflow-hidden"
                    >
                        <div className="p-4 bg-emerald-600/90 text-white flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                                <WhatsAppIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-serif font-bold text-sm">Konsultasi Tapak Pamungkas</h4>
                                <span className="text-[10px] font-mono text-emerald-100">Respon cepat setiap hari 08.00 - 21.00 WIB</span>
                            </div>
                        </div>
                        <div className="p-4 text-center space-y-3">
                            <p className="text-xs text-stone-300 leading-relaxed">
                                Konsultasikan pemaharan pusaka, keris sepuh, dan media bertuah langsung dengan admin & pengasuh sanggar.
                            </p>
                            <button
                                onClick={openChat}
                                className="w-full py-3 px-4 rounded-xl font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                            >
                                <WhatsAppIcon className="w-4 h-4" />
                                Chat Sekarang
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setOpen(prev => !prev)}
                aria-label={open ? 'Tutup chat WhatsApp' : 'Buka chat WhatsApp'}
                className="relative p-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95"
            >
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-stone-950 animate-pulse"></span>
                {open ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <WhatsAppIcon className="w-7 h-7" />
                )}
            </button>
        </div>
    );
};

export default WhatsAppWidget;
