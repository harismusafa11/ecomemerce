import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircle, ShieldCheck, Truck } from 'lucide-react';
import { WHATSAPP_NUMBER } from '../constants';

interface FaqItem {
    question: string;
    answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
    {
        question: 'Apakah semua pusaka & media yang dijual asli?',
        answer: 'Ya. Seluruh pusaka keris sepuh, azimat, dan media bertuah yang kami maharkan 100% asli, telah melalui proses pembersihan spiritual dan memiliki riwayat yang jelas. Kami sertakan garansi keaslian pada setiap transaksi.',
    },
    {
        question: 'Bagaimana cara melakukan pembayaran?',
        answer: 'Pembayaran dilakukan melalui Transfer Bank (Bank Jago) atau QRIS All Payment. Detail rekening ditampilkan pada halaman checkout dan konfirmasi pesanan. Setelah transfer, kirimkan bukti pembayaran melalui WhatsApp official kami.',
    },
    {
        question: 'Apakah saya perlu memiliki akun untuk berbelanja?',
        answer: 'Ya. Untuk keamanan transaksi dan agar admin dapat memverifikasi pesanan Anda, setiap pelanggan wajib memiliki akun dan masuk (login) sebelum melakukan pemaharan. Pendaftaran akun gratis dan hanya membutuhkan nama, email, serta kata sandi.',
    },
    {
        question: 'Bagaimana proses pengiriman pusaka dilakukan?',
        answer: 'Setiap pusaka dikemas khusus dengan peti/kotak pengaman agar aman selama perjalanan ke seluruh Nusantara. Kami menggunakan jasa ekspedisi terpercaya (JNE, J&T, SiCepat, POS) dengan asuransi. Nomor resi dikirim otomatis melalui WhatsApp setelah paket dikirim.',
    },
    {
        question: 'Apakah ada garansi jika paket rusak atau hilang?',
        answer: 'Ya. Kami memberikan garansi 100% uang kembali jika paket rusak dalam perjalanan atau tidak sampai sesuai kesepakatan. Silakan hubungi admin segera dengan nomor resi untuk proses klaim.',
    },
    {
        question: 'Bagaimana cara merawat pusaka setelah diterima?',
        answer: 'Setiap pembelian disertai panduan perawatan. Secara umum, oleskan minyak wangi non-alkohol (cendana/jasmine) secara berkala, simpan di tempat kering, dan hindari tempat lembab. Untuk keris sepuh, penjamasan disarankan pada malam 1 Suro.',
    },
    {
        question: 'Apakah admin menyediakan konsultasi setelah pembelian?',
        answer: 'Tentu. Konsultasi pasca-pemaharan bersifat gratis dan dapat dilakukan kapan saja melalui WhatsApp official kami. Kami mendampingi Anda dalam penggunaan dan perawatan media yang tepat.',
    },
    {
        question: 'Bagaimana jika saya ingin meminta pusaka atau media khusus?',
        answer: 'Silakan konsultasikan kebutuhan spesifik Anda kepada admin. Kami dapat membantu mencarikan atau menahbiskan media sesuai hajat, dengan proses dan mahar yang disepakati bersama.',
    },
];

const FaqItemRow: React.FC<{ item: FaqItem; index: number }> = ({ item, index }) => {
    const [open, setOpen] = useState(index === 0);

    return (
        <div className="glass-panel rounded-2xl border border-amber-500/20 overflow-hidden">
            <button
                onClick={() => setOpen(prev => !prev)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-stone-900/40 transition-colors"
            >
                <span className="text-sm font-serif font-semibold text-stone-100 leading-snug">
                    {item.question}
                </span>
                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center"
                >
                    <ChevronDown className="w-4 h-4" />
                </motion.span>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                    >
                        <p className="px-5 pb-5 text-xs sm:text-sm text-stone-300 leading-relaxed">
                            {item.answer}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const FAQPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 py-12 sm:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                        Pusat Bantuan
                    </span>
                    <h1 className="text-4xl sm:text-5xl font-serif font-bold text-stone-100 mt-4 mb-4">
                        Pertanyaan yang Sering Diajukan
                    </h1>
                    <p className="text-stone-400 text-sm sm:text-base leading-relaxed">
                        Temukan jawaban seputar keaslian, pembayaran, pengiriman, hingga perawatan pusaka Tapak Pamungkas.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto space-y-3">
                    {FAQ_ITEMS.map((item, idx) => (
                        <FaqItemRow key={idx} item={item} index={idx} />
                    ))}
                </div>

                <div className="max-w-3xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a
                        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Halo Admin Tapak Pamungkas, saya memiliki pertanyaan.')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-panel p-5 rounded-2xl border border-emerald-500/30 flex items-center gap-4 hover:border-emerald-500/60 transition-all group"
                    >
                        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 flex-shrink-0">
                            <MessageCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-serif font-bold text-stone-100 text-sm">Tanya via WhatsApp</h4>
                            <p className="text-[11px] text-stone-400 mt-0.5">Respon cepat setiap hari 08.00 - 21.00 WIB</p>
                        </div>
                    </a>
                    <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 flex-shrink-0">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-serif font-bold text-stone-100 text-sm">Jaminan Keaslian</h4>
                            <p className="text-[11px] text-stone-400 mt-0.5">100% asli & terjamin seluruh pusaka</p>
                        </div>
                    </div>
                </div>

                <p className="text-center text-[11px] font-mono text-stone-500 mt-8 flex items-center justify-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-amber-400" />
                    Pengiriman aman ke seluruh Nusantara dengan packing khusus & asuransi.
                </p>
            </div>
        </div>
    );
};

export default FAQPage;
