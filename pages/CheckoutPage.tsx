import React, { useState } from 'react';
import { Product, Voucher } from '../types';
import { useTranslations } from '../hooks/useTranslations';

interface CartItem extends Product {
    quantity: number;
}

import { api } from '../services/api';

interface CheckoutPageProps {
    cartItems: Product[];
    onPlaceOrder: (orderDetails: any) => void;
    onBack: () => void;
    userId?: number;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ cartItems, onPlaceOrder, onBack, userId }) => {
    const [paymentMethod, setPaymentMethod] = useState('bank');
    const [shippingInfo, setShippingInfo] = useState({
        name: '',
        address: '',
        city: '',
        postalCode: '',
        phone: '',
    });
    const [voucherCode, setVoucherCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [appliedVoucherCode, setAppliedVoucherCode] = useState('');
    const [voucherMessage, setVoucherMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
    const { t } = useTranslations();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyVoucher = async () => {
        if (!userId) {
            setVoucherMessage({ text: t('checkout.voucherError'), type: 'error' });
            return;
        }

        try {
            const voucher = await api.validateVoucher(userId, voucherCode);

            if (voucher.productId) {
                const isProductInCart = cartItems.some(item => item.id === voucher.productId);
                if (!isProductInCart) {
                    setAppliedDiscount(0);
                    setAppliedVoucherCode('');
                    setAppliedVoucher(null);
                    setVoucherMessage({ text: t('checkout.voucherErrorProductSpecific'), type: 'error' });
                    return;
                }
            }

            setAppliedDiscount(voucher.discountPercentage);
            setAppliedVoucherCode(voucher.code);
            setAppliedVoucher(voucher);
            setVoucherMessage({ text: t('checkout.voucherSuccess', { code: voucher.code }), type: 'success' });
        } catch (error: any) {
            setAppliedDiscount(0);
            setAppliedVoucherCode('');
            setAppliedVoucher(null);
            setVoucherMessage({ text: error.message || t('checkout.voucherError'), type: 'error' });
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simple validation
        if (Object.values(shippingInfo).some(val => val === '')) {
            alert(t('checkout.alertFillShipping'));
            return;
        }
        onPlaceOrder({ shippingInfo, paymentMethod });
    };

    const aggregatedCart = cartItems.reduce((acc, item) => {
        const existingItem = acc.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            acc.push({ ...item, quantity: 1 });
        }
        return acc;
    }, [] as CartItem[]);

    const subtotal = aggregatedCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    let discountAmount = 0;

    if (appliedVoucher) {
        if (appliedVoucher.productId) {
            const applicableItem = aggregatedCart.find(item => item.id === appliedVoucher.productId);
            if (applicableItem) {
                const itemTotal = applicableItem.price * applicableItem.quantity;
                discountAmount = (itemTotal * appliedVoucher.discountPercentage) / 100;
            }
        } else { // Store-wide voucher
            discountAmount = (subtotal * appliedDiscount) / 100;
        }
    }

    const shippingCost = 0; // Free shipping for now
    const total = subtotal - discountAmount + shippingCost;

    const commonInputClass = "w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-gold";
    const commonLabelClass = "block text-sm font-medium text-gray-700 mb-1";


    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button onClick={onBack} className="mb-6 inline-flex items-center gap-2 text-brand-primary hover:text-brand-dark font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                {t('checkout.backToCart')}
            </button>
            <h1 className="text-3xl font-serif font-bold text-brand-dark mb-4">{t('checkout.title')}</h1>

            {/* Checkout Steps Guide */}
            <div className="bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 border border-brand-gold/30 rounded-lg p-6 mb-8">
                <h2 className="text-lg font-semibold text-brand-dark mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-primary" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {t('checkout.guideTitle')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center font-bold">1</div>
                        <div>
                            <h3 className="font-semibold text-brand-dark text-sm">{t('checkout.step1Title')}</h3>
                            <p className="text-xs text-gray-600 mt-1">{t('checkout.step1Desc')}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center font-bold">2</div>
                        <div>
                            <h3 className="font-semibold text-brand-dark text-sm">{t('checkout.step2Title')}</h3>
                            <p className="text-xs text-gray-600 mt-1">{t('checkout.step2Desc')}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center font-bold">3</div>
                        <div>
                            <h3 className="font-semibold text-brand-dark text-sm">{t('checkout.step3Title')}</h3>
                            <p className="text-xs text-gray-600 mt-1">{t('checkout.step3Desc')}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center font-bold">4</div>
                        <div>
                            <h3 className="font-semibold text-brand-dark text-sm">{t('checkout.step4Title')}</h3>
                            <p className="text-xs text-gray-600 mt-1">{t('checkout.step4Desc')}</p>
                        </div>
                    </div>
                </div>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Left side: Shipping and Payment */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Shipping Details */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4 text-brand-dark border-b pb-3">{t('checkout.shippingTitle')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label htmlFor="name" className={commonLabelClass}>{t('checkout.labelName')}</label>
                                    <input type="text" id="name" name="name" onChange={handleInputChange} className={commonInputClass} required />
                                </div>
                                <div>
                                    <label htmlFor="phone" className={commonLabelClass}>{t('checkout.labelPhone')}</label>
                                    <input type="tel" id="phone" name="phone" onChange={handleInputChange} className={commonInputClass} required />
                                </div>
                                <div className="md:col-span-2">
                                    <label htmlFor="address" className={commonLabelClass}>{t('checkout.labelAddress')}</label>
                                    <input type="text" id="address" name="address" onChange={handleInputChange} className={commonInputClass} required />
                                </div>
                                <div>
                                    <label htmlFor="city" className={commonLabelClass}>{t('checkout.labelCity')}</label>
                                    <input type="text" id="city" name="city" onChange={handleInputChange} className={commonInputClass} required />
                                </div>
                                <div>
                                    <label htmlFor="postalCode" className={commonLabelClass}>{t('checkout.labelPostalCode')}</label>
                                    <input type="text" id="postalCode" name="postalCode" onChange={handleInputChange} className={commonInputClass} required />
                                </div>
                            </div>
                        </div>

                        {/* Voucher Code */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4 text-brand-dark border-b pb-3">{t('checkout.voucherTitle')}</h2>
                            <div className="flex items-center gap-2 mt-4">
                                <input
                                    type="text"
                                    value={voucherCode}
                                    onChange={(e) => setVoucherCode(e.target.value)}
                                    placeholder={t('checkout.voucherPlaceholder')}
                                    className={commonInputClass}
                                />
                                <button
                                    type="button"
                                    onClick={handleApplyVoucher}
                                    className="px-6 py-2 bg-brand-secondary text-white rounded-lg hover:bg-brand-primary transition-colors font-semibold whitespace-nowrap"
                                >
                                    {t('checkout.voucherApplyButton')}
                                </button>
                            </div>
                            {voucherMessage && (
                                <p className={`mt-2 text-sm ${voucherMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                    {voucherMessage.text}
                                </p>
                            )}
                        </div>


                        {/* Payment Method */}
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h2 className="text-xl font-semibold mb-4 text-brand-dark border-b pb-3">{t('checkout.paymentTitle')}</h2>
                            <div className="space-y-4 mt-4">
                                <label className="flex items-center p-4 border rounded-lg cursor-pointer has-[:checked]:bg-brand-accent has-[:checked]:border-brand-primary">
                                    <input type="radio" name="paymentMethod" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} className="h-4 w-4 text-brand-primary focus:ring-brand-gold" />
                                    <span className="ml-3 font-medium">{t('checkout.paymentBank')}</span>
                                </label>
                                {paymentMethod === 'bank' && (
                                    <div className="pl-8 py-2 text-sm text-gray-600">
                                        <p>{t('checkout.paymentBankInstruction')}</p>
                                    </div>
                                )}

                                <label className="flex items-center p-4 border rounded-lg cursor-pointer has-[:checked]:bg-brand-accent has-[:checked]:border-brand-primary">
                                    <input type="radio" name="paymentMethod" value="qris" checked={paymentMethod === 'qris'} onChange={() => setPaymentMethod('qris')} className="h-4 w-4 text-brand-primary focus:ring-brand-gold" />
                                    <span className="ml-3 font-medium">QRIS</span>
                                </label>
                                {paymentMethod === 'qris' && (
                                    <div className="pl-8 py-2 text-sm text-gray-600">
                                        <p>Scan QRIS code on the next page to pay.</p>
                                    </div>
                                )}

                                <label className="flex items-center p-4 border rounded-lg cursor-pointer has-[:checked]:bg-brand-accent has-[:checked]:border-brand-primary">
                                    <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="h-4 w-4 text-brand-primary focus:ring-brand-gold" />
                                    <span className="ml-3 font-medium">{t('checkout.paymentCOD')}</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Right side: Order Summary */}
                    <div className="bg-white p-6 rounded-lg shadow-md sticky top-28">
                        <h2 className="text-xl font-semibold mb-4 text-brand-dark border-b pb-3">{t('cart.summaryTitle')}</h2>
                        <div className="space-y-4 mt-4 max-h-64 overflow-y-auto pr-2">
                            {aggregatedCart.map(item => (
                                <div key={item.id} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center">
                                        {/* Fix: Use the first image from the imageUrls array. */}
                                        <img src={item.imageUrls[0]} alt={item.name} className="w-12 h-12 object-cover rounded-md mr-3" loading="lazy" decoding="async" />
                                        <div>
                                            <p className="font-semibold text-brand-dark">{item.name}</p>
                                            <p className="text-gray-500">{t('cart.quantity', { count: item.quantity })}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-700">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-2 border-t pt-4 mt-4">
                            <div className="flex justify-between text-gray-600">
                                <span>{t('cart.subtotal')}</span>
                                <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                            </div>
                            {appliedDiscount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>{t('checkout.discount')} ({appliedDiscount}%)</span>
                                    <span>- Rp {discountAmount.toLocaleString('id-ID')}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-gray-600">
                                <span>{t('cart.shipping')}</span>
                                <span>{t('cart.shippingFree')}</span>
                            </div>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-4 mt-4">
                            <span>{t('cart.total')}</span>
                            <span>Rp {total.toLocaleString('id-ID')}</span>
                        </div>
                        <button type="submit" className="w-full mt-6 bg-brand-primary text-white py-3 rounded-lg hover:bg-brand-dark transition-colors font-bold text-lg">
                            {t('checkout.confirmButton')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CheckoutPage;