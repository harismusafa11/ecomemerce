import React from 'react';
import { Product } from '../types';
import { useTranslations } from '../hooks/useTranslations';

interface CartItem extends Product {
    quantity: number;
}

interface CartPageProps {
    cartItems: CartItem[];
    onRemoveFromCart: (productId: number) => void;
    onCheckout: () => void;
}

const CartPage: React.FC<CartPageProps> = ({ cartItems, onRemoveFromCart, onCheckout }) => {
    const { t } = useTranslations();

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-serif font-bold text-brand-dark mb-8">{t('cart.title')}</h1>
            {cartItems.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow-md">
                    <p className="text-gray-600 text-lg">{t('cart.empty')}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                        <div className="space-y-6">
                            {cartItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between border-b border-gray-200 pb-6 last:border-b-0">
                                    <div className="flex items-center space-x-4">
                                        {/* Fix: Use the first image from the imageUrls array. */}
                                        <img src={item.imageUrls[0]} alt={item.name} className="w-24 h-24 object-cover rounded-md" loading="lazy" decoding="async" />
                                        <div>
                                            <h3 className="font-semibold text-brand-dark text-lg">{item.name}</h3>
                                            <p className="text-sm text-gray-500">Rp {item.price.toLocaleString('id-ID')}</p>
                                            <button onClick={() => onRemoveFromCart(item.id)} className="text-red-500 hover:text-red-700 text-sm mt-2 font-semibold">{t('cart.remove')}</button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <p className="text-gray-600">{t('cart.quantity', { count: item.quantity })}</p>
                                        <p className="font-bold text-brand-primary text-lg mt-1">Rp {(item.price * item.quantity).toLocaleString('id-ID')}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md sticky top-28">
                        <h2 className="text-xl font-semibold mb-4 text-brand-dark">{t('cart.summaryTitle')}</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between text-gray-600">
                                <span>{t('cart.subtotal')}</span>
                                <span>Rp {total.toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>{t('cart.shipping')}</span>
                                <span>{t('cart.shippingFree')}</span>
                            </div>
                        </div>
                        <div className="flex justify-between font-bold text-lg border-t pt-4 mt-4">
                            <span>{t('cart.total')}</span>
                            <span>Rp {total.toLocaleString('id-ID')}</span>
                        </div>
                        <button onClick={onCheckout} className="w-full mt-6 bg-brand-primary text-white py-3 rounded-lg hover:bg-brand-dark transition-colors font-bold text-lg">
                            {t('cart.checkoutButton')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CartPage;