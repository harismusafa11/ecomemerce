import React from 'react';
import { Voucher, Product } from '../types';
import VoucherCard from '../components/VoucherCard';
import { useTranslations } from '../hooks/useTranslations';
import { Ticket } from 'lucide-react';
import { motion } from 'framer-motion';

interface VoucherPageProps {
    allVouchers: Voucher[];
    allProducts: Product[];
    claimedVouchers: number[];
    onClaimVoucher: (voucherId: number) => void;
}

const VoucherPage: React.FC<VoucherPageProps> = ({ allVouchers, allProducts, claimedVouchers, onClaimVoucher }) => {
    const { t } = useTranslations();

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <div className="w-12 h-12 rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center mx-auto mb-3">
                        <Ticket className="w-6 h-6 animate-pulse" />
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-100 mb-3">
                        {t('vouchers.title')}
                    </h1>
                    <p className="text-stone-400 text-sm">
                        {t('vouchers.subtitle')}
                    </p>
                </div>

                {allVouchers.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20 glass-panel rounded-3xl border border-stone-800 max-w-xl mx-auto"
                    >
                        <Ticket className="w-12 h-12 text-stone-600 mx-auto mb-4" />
                        <p className="text-stone-300 text-lg font-serif mb-2">{t('vouchers.empty')}</p>
                        <p className="text-xs text-stone-400 font-mono">
                            Belum ada kupon promo aktif saat ini. Silakan cek kembali nanti.
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        {allVouchers.map(voucher => {
                            const isClaimed = claimedVouchers.includes(voucher.id);
                            const productName = voucher.productId
                                ? allProducts.find(p => p.id === voucher.productId)?.name
                                : undefined;

                            return (
                                <VoucherCard
                                    key={voucher.id}
                                    voucher={voucher}
                                    isClaimed={isClaimed}
                                    onClaim={onClaimVoucher}
                                    productName={productName}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VoucherPage;
