import React from 'react';
import { Voucher } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { motion } from 'framer-motion';
import { Ticket, CheckCircle2 } from 'lucide-react';

interface VoucherCardProps {
    voucher: Voucher;
    isClaimed: boolean;
    onClaim: (voucherId: number) => void;
    productName?: string;
}

const VoucherCard: React.FC<VoucherCardProps> = ({ voucher, isClaimed, onClaim, productName }) => {
    const { t } = useTranslations();

    const description = voucher.productId && productName
        ? t('vouchers.productSpecific', { productName })
        : t('vouchers.storeWide');

    return (
        <motion.div
            className="glass-panel rounded-2xl border border-amber-500/20 overflow-hidden flex flex-col sm:flex-row w-full max-w-lg shadow-xl"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
        >
            {/* Left side: Discount badge */}
            <div className="sm:w-1/3 bg-stone-950 p-6 flex flex-col items-center justify-center text-center relative border-b sm:border-b-0 sm:border-r border-amber-500/20">
                <p className="font-serif font-black text-4xl lg:text-5xl gold-gradient-text">{voucher.discountPercentage}%</p>
                <p className="font-mono font-bold text-xs text-amber-400 tracking-widest mt-1">POTONGAN</p>
            </div>

            {/* Right side: Voucher details */}
            <div className="sm:w-2/3 p-5 flex flex-col justify-between space-y-4">
                <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                        {voucher.code}
                    </span>
                    <h3 className="font-serif font-bold text-base text-stone-100 mt-2">{voucher.code}</h3>
                    <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">{description}</p>
                </div>

                <div className="pt-3 border-t border-stone-800 flex items-center justify-between gap-2">
                    <p className="text-[10px] font-mono text-stone-500">
                        Berlaku s.d {new Date(voucher.endDate).toLocaleDateString('id-ID')}
                    </p>
                    <button
                        onClick={() => onClaim(voucher.id)}
                        disabled={isClaimed}
                        className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                            isClaimed
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed'
                                : 'bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 hover:from-amber-300 hover:to-amber-400 gold-glow'
                        }`}
                    >
                        {isClaimed ? (
                            <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Terklaim</span>
                            </>
                        ) : (
                            <>
                                <Ticket className="w-3.5 h-3.5" />
                                <span>Klaim Kupon</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default VoucherCard;
