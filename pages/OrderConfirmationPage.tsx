import React, { useState } from 'react';
import { Page } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { CheckCircle2, Copy, Check, MessageCircle, ArrowRight, ShieldCheck, QrCode, Building2, PackageCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface OrderConfirmationPageProps {
    orderId: string;
    paymentMethod: string | null;
    total: number;
    onNavigate: (page: Page) => void;
}

const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ orderId, paymentMethod, total, onNavigate }) => {
    const { t } = useTranslations();
    const [copiedAccount, setCopiedAccount] = useState(false);
    const [copiedOrderId, setCopiedOrderId] = useState(false);

    const handleWhatsAppConfirm = () => {
        const courierText = sessionStorage.getItem('cart_shipping_courier') || 'Pengiriman Standar';
        const methodText = paymentMethod === 'qris' ? 'QRIS All Payment' : 'Transfer Bank BCA (8830-1928-44)';
        const message = `Salam Rahayu, Pengasuh Tapak Pamungkas. Saya ingin konfirmasi pemaharan:\n\n*ID Pesanan*: ${orderId || 'ORD-TP'}\n*Pengiriman*: ${courierText} (Dari Ulujami, Pemalang)\n*Metode Pembayaran*: ${methodText}\n*Total Tagihan (Mahar + Ongkir)*: Rp ${total.toLocaleString('id-ID')}\n\nSaya telah menyelesaikan pembayaran. Mohon pesanan saya diproses. Terimakasih.`;
        const url = `https://wa.me/6285880231697?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    const copyToClipboard = (text: string, type: 'account' | 'orderId') => {
        navigator.clipboard.writeText(text);
        if (type === 'account') {
            setCopiedAccount(true);
            setTimeout(() => setCopiedAccount(false), 2000);
        } else {
            setCopiedOrderId(true);
            setTimeout(() => setCopiedOrderId(false), 2000);
        }
    };

    const isQris = paymentMethod === 'qris';

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 py-12 flex items-center justify-center">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="glass-panel p-6 sm:p-10 rounded-3xl border border-amber-500/30 text-center shadow-2xl space-y-8"
                >
                    {/* Success Icon */}
                    <div className="relative inline-block">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 gold-glow">
                            <CheckCircle2 className="w-12 h-12" />
                        </div>
                    </div>

                    <div>
                        <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 text-[11px] font-mono uppercase tracking-wider">
                            Pesanan Diterima & Menunggu Verifikasi
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-amber-400 mt-3">
                            {t('orderConfirmation.title') || 'Terima Kasih, Pemaharan Berhasil Initiated'}
                        </h1>
                        <p className="text-xs sm:text-sm text-stone-300 max-w-xl mx-auto mt-2 font-mono">
                            {t('orderConfirmation.subtitle') || 'Pesanan Anda telah dicatat dalam sistem Tapak Pamungkas. Silakan selesaikan pembayaran untuk memproses pengiriman.'}
                        </p>
                    </div>

                    {/* Order ID & Total Invoice Card */}
                    <div className="bg-stone-900/90 border border-amber-500/20 p-5 rounded-2xl text-left space-y-3 font-mono text-xs">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-stone-800">
                            <div>
                                <span className="text-[10px] text-stone-400 uppercase block">Nomor ID Pesanan</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-amber-400 text-base">{orderId || 'ORD-TP'}</span>
                                    <button
                                        onClick={() => copyToClipboard(orderId || 'ORD-TP', 'orderId')}
                                        className="p-1 rounded bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-stone-300 transition-colors"
                                        title="Salin ID Pesanan"
                                    >
                                        {copiedOrderId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>
                            <div className="sm:text-right">
                                <span className="text-[10px] text-stone-400 uppercase block">Total Pembayaran Mahar</span>
                                <span className="font-bold gold-gradient-text text-xl">
                                    Rp {total.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-stone-300">
                            <span>Status Pesanan:</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold">
                                Menunggu Transfer / Upload Bukti
                            </span>
                        </div>
                    </div>

                    {/* Payment Details / Instructions */}
                    <div className="bg-stone-900/60 border border-stone-800 p-6 rounded-2xl text-left space-y-4">
                        <h3 className="font-serif font-bold text-stone-100 text-sm flex items-center gap-2 border-b border-stone-800 pb-3">
                            {isQris ? <QrCode className="w-5 h-5 text-amber-400" /> : <Building2 className="w-5 h-5 text-amber-400" />}
                            {isQris ? 'Instruksi Pembayaran QRIS' : 'Instruksi Transfer Bank Official'}
                        </h3>

                        {!isQris ? (
                            <div className="space-y-3">
                                <p className="text-xs text-stone-300 font-mono">
                                    Silakan lakukan transfer nominal persis ke rekening resmi Sanggar Tapak Pamungkas:
                                </p>
                                <div className="p-4 bg-stone-950 rounded-xl border border-amber-500/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                    <div>
                                        <span className="text-[10px] text-stone-400 font-mono block">BANK JAGO</span>
                                        <span className="text-lg font-bold font-mono text-amber-400 tracking-wider">1039 6559 7312</span>
                                        <span className="text-xs text-stone-300 block">a.n. Haris Musafa</span>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard('103965597312', 'account')}
                                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all"
                                    >
                                        {copiedAccount ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                                        {copiedAccount ? 'Nomor Rekening Tersalin!' : 'Salin No. Rekening'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-4">
                                <p className="text-xs text-stone-300 font-mono">
                                    Scan QRIS resmi di bawah ini menggunakan BCA Mobile, GoPay, OVO, Dana, ShopeePay, atau Mobile Banking:
                                </p>
                                <div className="flex justify-center">
                                    <div className="p-3 bg-white rounded-2xl shadow-xl inline-block border-2 border-amber-400">
                                        <img
                                            src="https://files.catbox.moe/wwq5y2.png"
                                            alt="QRIS Official Tapak Pamungkas"
                                            className="w-56 h-56 object-contain"
                                        />
                                    </div>
                                </div>
                                <p className="text-[11px] font-mono text-amber-400">
                                    Atas nama: <strong>TAPAK PAMUNGKAS OFFICIAL</strong>
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Direct WhatsApp Call To Action */}
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-stone-900 to-emerald-950/40 border border-emerald-500/30 space-y-4">
                        <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm">
                            <MessageCircle className="w-5 h-5" />
                            <span>Konfirmasi Cepat via WhatsApp Official</span>
                        </div>
                        <p className="text-xs text-stone-300 font-mono max-w-md mx-auto">
                            Kirimkan foto resi/bukti transfer beserta ID Pesanan ke WhatsApp Official kami untuk mempercepat proses pengiriman.
                        </p>
                        <button
                            onClick={handleWhatsAppConfirm}
                            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mx-auto gold-glow"
                        >
                            <MessageCircle className="w-4 h-4" />
                            Konfirmasi Pembayaran via WhatsApp
                        </button>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => onNavigate('orderHistory')}
                            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 border border-amber-500/20 text-xs font-bold font-mono transition-all flex items-center justify-center gap-2"
                        >
                            <PackageCheck className="w-4 h-4" />
                            Lihat Riwayat Pesanan Saya
                        </button>
                        <button
                            onClick={() => onNavigate('allProducts')}
                            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-bold font-mono transition-all flex items-center justify-center gap-2"
                        >
                            Kembali Ke Katalog
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400 font-mono">
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        Pengiriman menggunakan packing aman kayu/bubble wrap berlapis dengan jaminan garansi.
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;