import React, { useState } from 'react';
import { Product, Voucher } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { api } from '../services/api';
import { ArrowLeft, CheckCircle2, CreditCard, ShieldCheck, Ticket, QrCode, Building2, Truck, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface CartItem extends Product {
    quantity: number;
}

interface CheckoutPageProps {
    cartItems: Product[];
    onPlaceOrder: (orderDetails: any) => void;
    onBack: () => void;
    userId?: number;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ cartItems, onPlaceOrder, onBack, userId }) => {
    const [paymentMethod, setPaymentMethod] = useState('bank');
    
    // Read carried-over shipping details from Cart Page
    const [savedShippingCost] = useState<number>(() => Number(sessionStorage.getItem('cart_shipping_cost')) || 0);
    const [savedCourierName] = useState<string>(() => sessionStorage.getItem('cart_shipping_courier') || '');
    const [savedCity] = useState<string>(() => {
        const dist = sessionStorage.getItem('cart_dest_dist_name') || '';
        const city = sessionStorage.getItem('cart_dest_city_name') || '';
        const prov = sessionStorage.getItem('cart_dest_prov_name') || '';
        if (city && prov) return `${dist ? dist + ', ' : ''}${city}, ${prov}`;
        return '';
    });

    const [shippingInfo, setShippingInfo] = useState({
        name: '',
        address: '',
        city: savedCity,
        postalCode: '',
        phone: '',
    });

    const [voucherCode, setVoucherCode] = useState('');
    const [appliedDiscount, setAppliedDiscount] = useState(0);
    const [appliedVoucherCode, setAppliedVoucherCode] = useState('');
    const [voucherMessage, setVoucherMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
    const [copiedAccount, setCopiedAccount] = useState(false);
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
        if (Object.values(shippingInfo).some(val => val.trim() === '')) {
            alert(t('checkout.alertFillShipping'));
            return;
        }
        onPlaceOrder({
            shippingInfo,
            paymentMethod,
            appliedVoucherCode,
            discountAmount,
            shippingCost: savedShippingCost,
            courierName: savedCourierName
        });
    };

    const aggregatedCart = cartItems.reduce((acc, item) => {
        const existingItem = acc.find(i => i.id === item.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            acc.push({ ...item, quantity: item.quantity || 1 });
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
        } else {
            discountAmount = (subtotal * appliedDiscount) / 100;
        }
    }

    const shippingCost = savedShippingCost;
    const total = subtotal - discountAmount + shippingCost;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedAccount(true);
        setTimeout(() => setCopiedAccount(false), 2000);
    };

    const inputClass = "w-full px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500 transition-all";
    const labelClass = "block text-xs font-mono text-stone-400 mb-1";

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 py-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={onBack}
                    className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-stone-800 text-stone-300 hover:text-amber-400 text-xs font-mono transition-all"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('checkout.backToCart')}
                </button>

                <h1 className="text-3xl sm:text-4xl font-serif font-bold text-amber-400 mb-6">
                    {t('checkout.title')}
                </h1>

                {/* Checkout Steps Indicator */}
                <div className="glass-panel p-6 rounded-3xl border border-amber-500/20 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center flex-shrink-0">1</div>
                            <div>
                                <h4 className="font-bold text-stone-100">Alamat Pengiriman</h4>
                                <span className="text-[10px] text-stone-400">Isi data tujuan</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center flex-shrink-0">2</div>
                            <div>
                                <h4 className="font-bold text-stone-100">Metode Pembayaran</h4>
                                <span className="text-[10px] text-stone-400">Pilih Bank / QRIS</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center flex-shrink-0">3</div>
                            <div>
                                <h4 className="font-bold text-stone-100">Verifikasi Kupon</h4>
                                <span className="text-[10px] text-stone-400">Potongan diskon</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center flex-shrink-0">4</div>
                            <div>
                                <h4 className="font-bold text-stone-100">Konfirmasi Mahar</h4>
                                <span className="text-[10px] text-stone-400">Kirim & upload resi</span>
                            </div>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        {/* Form Inputs */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Shipping Information */}
                            <div className="glass-panel p-6 rounded-3xl border border-amber-500/20">
                                <h2 className="text-lg font-serif font-bold text-stone-100 border-b border-stone-800 pb-3 mb-4 flex items-center gap-2">
                                    <Truck className="w-5 h-5 text-amber-400" /> {t('checkout.shippingTitle')}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelClass}>{t('checkout.labelName')}</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={shippingInfo.name}
                                            onChange={handleInputChange}
                                            className={inputClass}
                                            required
                                            placeholder="Nama Penerima"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>{t('checkout.labelPhone')}</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={shippingInfo.phone}
                                            onChange={handleInputChange}
                                            className={inputClass}
                                            required
                                            placeholder="08123456789"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>{t('checkout.labelAddress')}</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={shippingInfo.address}
                                            onChange={handleInputChange}
                                            className={inputClass}
                                            required
                                            placeholder="Alamat Lengkap (Jalan, RT/RW, No. Rumah)"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>{t('checkout.labelCity')}</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={shippingInfo.city}
                                            onChange={handleInputChange}
                                            className={inputClass}
                                            required
                                            placeholder="Kota / Kabupaten"
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>{t('checkout.labelPostalCode')}</label>
                                        <input
                                            type="text"
                                            name="postalCode"
                                            value={shippingInfo.postalCode}
                                            onChange={handleInputChange}
                                            className={inputClass}
                                            required
                                            placeholder="Kode Pos"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Voucher Application */}
                            <div className="glass-panel p-6 rounded-3xl border border-amber-500/20">
                                <h2 className="text-lg font-serif font-bold text-stone-100 border-b border-stone-800 pb-3 mb-4 flex items-center gap-2">
                                    <Ticket className="w-5 h-5 text-amber-400" /> {t('checkout.voucherTitle')}
                                </h2>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={voucherCode}
                                        onChange={(e) => setVoucherCode(e.target.value)}
                                        placeholder={t('checkout.voucherPlaceholder')}
                                        className={inputClass}
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyVoucher}
                                        className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-md whitespace-nowrap"
                                    >
                                        Gunakan Kupon
                                    </button>
                                </div>
                                {voucherMessage && (
                                    <p className={`mt-2 text-xs font-mono ${voucherMessage.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {voucherMessage.text}
                                    </p>
                                )}
                            </div>

                            {/* Payment Options */}
                            <div className="glass-panel p-6 rounded-3xl border border-amber-500/20">
                                <h2 className="text-lg font-serif font-bold text-stone-100 border-b border-stone-800 pb-3 mb-4 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-amber-400" /> Metodologi Pembayaran
                                </h2>

                                <div className="space-y-3">
                                    {/* Bank Transfer Option */}
                                    <label className={`flex flex-col p-4 rounded-2xl border cursor-pointer transition-all ${
                                        paymentMethod === 'bank'
                                            ? 'bg-amber-500/10 border-amber-500 shadow-md'
                                            : 'bg-stone-900/60 border-stone-800'
                                    }`}>
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="bank"
                                                checked={paymentMethod === 'bank'}
                                                onChange={() => setPaymentMethod('bank')}
                                                className="h-4 w-4 text-amber-500"
                                            />
                                            <Building2 className="w-5 h-5 ml-3 text-amber-400" />
                                            <span className="ml-2 font-bold text-xs text-stone-100">Transfer Bank (Bank Jago)</span>
                                        </div>
                                        {paymentMethod === 'bank' && (
                                            <div className="mt-4 pt-3 border-t border-stone-800 text-xs font-mono text-stone-300 space-y-2">
                                                <div className="flex justify-between items-center p-2 rounded-lg bg-stone-950 border border-stone-800">
                                                    <div>
                                                        <span className="text-[10px] text-stone-400 block">Bank Jago</span>
                                                        <span className="font-bold text-amber-400">1039 6559 7312</span>
                                                        <span className="text-[10px] text-stone-400 block">a.n. Haris Musafa</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => copyToClipboard('103965597312')}
                                                        className="px-2.5 py-1 bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1"
                                                    >
                                                        {copiedAccount ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                                        {copiedAccount ? 'Tersalin' : 'Salin No. Rek'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </label>

                                    {/* QRIS Option */}
                                    <label className={`flex flex-col p-4 rounded-2xl border cursor-pointer transition-all ${
                                        paymentMethod === 'qris'
                                            ? 'bg-amber-500/10 border-amber-500 shadow-md'
                                            : 'bg-stone-900/60 border-stone-800'
                                    }`}>
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="qris"
                                                checked={paymentMethod === 'qris'}
                                                onChange={() => setPaymentMethod('qris')}
                                                className="h-4 w-4 text-amber-500"
                                            />
                                            <QrCode className="w-5 h-5 ml-3 text-amber-400" />
                                            <span className="ml-2 font-bold text-xs text-stone-100">QRIS All Payment (Gopay, OVO, Dana, ShopeePay)</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Order Summary Right Panel */}
                        <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 sticky top-28 space-y-6">
                            <h3 className="text-lg font-serif font-bold text-stone-100 border-b border-stone-800 pb-3">
                                Ringkasan Mahar
                            </h3>

                            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                                {aggregatedCart.map(item => (
                                    <div key={item.id} className="flex justify-between items-center text-xs">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-amber-400 font-bold">x{item.quantity}</span>
                                            <span className="text-stone-200 line-clamp-1">{item.name}</span>
                                        </div>
                                        <span className="font-mono font-bold text-stone-300">
                                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-stone-800 pt-4 space-y-2 text-xs font-mono">
                                <div className="flex justify-between text-stone-400">
                                    <span>Subtotal</span>
                                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-emerald-400 font-bold">
                                        <span>Potongan Kupon</span>
                                        <span>- Rp {discountAmount.toLocaleString('id-ID')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-stone-400">
                                    <div>
                                        <span>Ongkos Kirim</span>
                                        {savedCourierName && (
                                            <span className="block text-[10px] text-amber-400/90">{savedCourierName}</span>
                                        )}
                                    </div>
                                    <span className={shippingCost > 0 ? "font-bold text-amber-400" : "text-emerald-400 font-bold"}>
                                        {shippingCost > 0 ? `Rp ${shippingCost.toLocaleString('id-ID')}` : 'GRATIS'}
                                    </span>
                                </div>
                            </div>

                            <div className="border-t border-stone-800 pt-4 flex justify-between items-center">
                                <span className="text-sm font-serif font-bold text-stone-100">Total Pembayaran</span>
                                <span className="text-xl font-bold gold-gradient-text">
                                    Rp {total.toLocaleString('id-ID')}
                                </span>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 px-6 rounded-xl font-bold text-stone-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 transition-all shadow-xl gold-glow text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Konfirmasi & Buat Pesanan
                            </button>

                            <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400 font-mono text-center pt-2">
                                <ShieldCheck className="w-4 h-4 text-amber-400" />
                                Garansi Layanan & Privasi Terjamin 100%
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;