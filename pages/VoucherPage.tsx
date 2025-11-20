import React from 'react';
import { Voucher, Product } from '../types';
import VoucherCard from '../components/VoucherCard';
import { useTranslations } from '../hooks/useTranslations';


interface VoucherPageProps {
    allVouchers: Voucher[];
    allProducts: Product[];
    claimedVouchers: number[];
    onClaimVoucher: (voucherId: number) => void;
}

const VoucherPage: React.FC<VoucherPageProps> = ({ allVouchers, allProducts, claimedVouchers, onClaimVoucher }) => {
    const { t } = useTranslations();

    return (
        <div className="bg-brand-light min-h-[70vh]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark">{t('vouchers.title')}</h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">{t('vouchers.subtitle')}</p>
                </div>

                {allVouchers.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-lg shadow-md">
                        <p className="text-gray-600 text-lg">{t('vouchers.empty')}</p>
                    </div>
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
