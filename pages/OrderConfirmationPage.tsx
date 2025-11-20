import React from 'react';
import { Page } from '../types';
import { useTranslations } from '../hooks/useTranslations';

interface OrderConfirmationPageProps {
    orderId: string;
    paymentMethod: string | null;
    total: number;
    onNavigate: (page: Page) => void;
}

const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({ orderId, paymentMethod, total, onNavigate }) => {
    const { t } = useTranslations();

    const handleWhatsAppConfirm = () => {
        const message = `Halo, saya ingin konfirmasi pesanan dengan Order ID: ${orderId}. Saya sudah melakukan pembayaran sebesar Rp ${total.toLocaleString('id-ID')}.`;
        const url = `https://wa.me/6285880231697?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div className="bg-white p-8 sm:p-12 rounded-lg shadow-xl max-w-2xl mx-auto">
                <svg className="w-16 h-16 mx-auto text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h1 className="text-3xl font-serif font-bold text-brand-dark mb-2">{t('orderConfirmation.title')}</h1>
                <p className="text-lg text-gray-600 mb-6">{t('orderConfirmation.subtitle')}</p>

                <div className="bg-brand-light p-4 rounded-lg text-left mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-gray-700">{t('orderConfirmation.orderNumberLabel')}</p>
                        <p className="font-mono font-bold text-brand-primary text-lg tracking-wider">{orderId}</p>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-200 pt-2">
                        <p className="text-sm text-gray-700 font-semibold">Total Pembayaran</p>
                        <p className="font-bold text-brand-dark text-xl">Rp {total.toLocaleString('id-ID')}</p>
                    </div>
                </div>

                {paymentMethod === 'bank' && (
                    <div className="bg-gray-50 p-6 rounded-lg text-left mb-6 border border-gray-200">
                        <h3 className="font-bold text-lg mb-3 text-brand-dark">Instruksi Pembayaran</h3>
                        <p className="text-gray-700 mb-2">Silakan transfer ke rekening berikut:</p>
                        <div className="bg-white p-4 rounded border border-gray-300 mb-4">
                            <p className="font-bold text-lg">BRI</p>
                            <p className="text-xl font-mono my-1">0069 0102 6224 535</p>
                            <p className="text-gray-600">a.n. Haris Musafa</p>
                        </div>
                        <p className="text-sm text-red-600 italic">*Harap transfer sesuai dengan total tagihan.</p>
                    </div>
                )}

                {paymentMethod === 'qris' && (
                    <div className="bg-gray-50 p-6 rounded-lg text-center mb-6 border border-gray-200">
                        <h3 className="font-bold text-lg mb-3 text-brand-dark">Scan QRIS</h3>
                        <p className="text-gray-700 mb-4">Silakan scan kode QRIS di bawah ini untuk membayar:</p>
                        <div className="flex justify-center mb-4">
                            <img src="https://files.catbox.moe/wwq5y2.png" alt="QRIS Payment" className="max-w-[250px] rounded-lg shadow-md" />
                        </div>
                    </div>
                )}

                {(paymentMethod === 'bank' || paymentMethod === 'qris') && (
                    <div className="mb-8">
                        <p className="text-gray-700 mb-4">Setelah melakukan pembayaran, mohon konfirmasi pesanan Anda melalui WhatsApp agar segera diproses.</p>
                        <button
                            onClick={handleWhatsAppConfirm}
                            className="inline-flex items-center bg-green-500 text-white font-bold py-3 px-6 rounded-full hover:bg-green-600 transition-colors shadow-lg"
                        >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                            Konfirmasi Pembayaran via WhatsApp
                        </button>
                    </div>
                )}

                <p className="text-sm text-gray-500 mt-6">{t('orderConfirmation.nextSteps')}</p>
                <button
                    onClick={() => onNavigate('home')}
                    className="mt-8 bg-brand-primary text-white font-bold py-3 px-8 rounded-full hover:bg-brand-dark transition-colors"
                >
                    {t('orderConfirmation.backButton')}
                </button>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;