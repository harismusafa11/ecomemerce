import React from 'react';
import { Voucher } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { motion } from 'framer-motion';

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
            className="flex w-full max-w-lg rounded-xl bg-white shadow-lg overflow-hidden"
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            {/* Left side with discount */}
            <div className="w-1/3 bg-brand-dark p-4 flex flex-col items-center justify-center text-center text-white relative">
                <p className="font-black text-4xl lg:text-5xl text-brand-gold">{voucher.discountPercentage}%</p>
                <p className="font-semibold text-lg">OFF</p>
                <div className="absolute top-0 -right-[1px] h-full w-px bg-repeat-y bg-[length:1px_10px]" style={{backgroundImage: 'linear-gradient(to bottom, #faf8f6 50%, transparent 50%)'}}></div>
            </div>

            {/* Right side with details */}
            <div className="w-2/3 p-4 flex flex-col justify-between bg-brand-light">
                <div>
                    <p className="text-xs font-semibold text-brand-secondary uppercase tracking-wider">{t('vouchers.storeWide')}</p>
                    <h3 className="font-bold text-xl text-brand-dark mt-1">{voucher.code}</h3>
                    <p className="text-sm text-gray-600 mt-2">{description}</p>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                     <p className="text-xs text-gray-500">{t('vouchers.expiresOn', { date: voucher.endDate })}</p>
                    <button
                        onClick={() => onClaim(voucher.id)}
                        disabled={isClaimed}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors duration-300 w-full sm:w-auto
                            ${isClaimed
                                ? 'bg-green-200 text-green-800 cursor-not-allowed'
                                : 'bg-brand-primary text-white hover:bg-brand-dark'
                            }`}
                    >
                        {isClaimed ? t('vouchers.claimedButton') : t('vouchers.claimButton')}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default VoucherCard;
