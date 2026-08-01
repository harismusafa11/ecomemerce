import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, Truck, MapPin, Calculator, Check, Loader2, Edit3, ListFilter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { wilayahService, ALL_34_PROVINCES, Province, Regency, District, Village } from '../services/wilayahService';
import { ALL_514_REGENCIES } from '../services/wilayahData';
import { ALL_EMSIFA_DISTRICTS } from '../services/districtsData';
import { ALL_EMSIFA_VILLAGES } from '../services/villagesData';
import { api } from '../services/api';

interface CartItem extends Product {
    quantity: number;
}

interface CartPageProps {
    cartItems: CartItem[];
    onRemoveFromCart: (productId: number) => void;
    onCheckout: () => void;
}

interface ShippingOption {
    code: string;
    courierName: string;
    service: string;
    description: string;
    cost: number;
    etd: string;
    isFallback?: boolean;
}

const CartPage: React.FC<CartPageProps> = ({ cartItems, onRemoveFromCart, onCheckout }) => {
    const { t } = useTranslations();

    // Mode Input: 'dropdown' (Emsifa API 4-Tier) or 'manual'
    const [inputMode, setInputMode] = useState<'dropdown' | 'manual'>('dropdown');

    // Emsifa API Wilayah State (Provinsi, Kota/Kab, Kecamatan, Kelurahan/Desa) - 100% Instant Synchronous Preloaded!
    const [provinces] = useState<Province[]>(ALL_34_PROVINCES);
    const [regencies, setRegencies] = useState<Regency[]>(() => ALL_514_REGENCIES['33'] || []);
    const [districts, setDistricts] = useState<District[]>(() => ALL_EMSIFA_DISTRICTS['3327'] || []);
    const [villages, setVillages] = useState<Village[]>(() => ALL_EMSIFA_VILLAGES['3327010'] || []);

    const [loadingRegencies] = useState(false);
    const [loadingDistricts] = useState(false);
    const [loadingVillages] = useState(false);

    // Selected Emsifa IDs & Names
    const [selectedProvinceId, setSelectedProvinceId] = useState<string>(() => sessionStorage.getItem('cart_dest_prov_id') || '33');
    const [selectedProvinceName, setSelectedProvinceName] = useState<string>(() => sessionStorage.getItem('cart_dest_prov_name') || 'JAWA TENGAH');
    
    const [selectedRegencyId, setSelectedRegencyId] = useState<string>(() => sessionStorage.getItem('cart_dest_city_id') || '3327');
    const [selectedRegencyName, setSelectedRegencyName] = useState<string>(() => sessionStorage.getItem('cart_dest_city_name') || 'KABUPATEN PEMALANG');

    const [selectedDistrictId, setSelectedDistrictId] = useState<string>(() => sessionStorage.getItem('cart_dest_dist_id') || '3327010');
    const [selectedDistrictName, setSelectedDistrictName] = useState<string>(() => sessionStorage.getItem('cart_dest_dist_name') || 'ULUJAMI');

    const [selectedVillageId, setSelectedVillageId] = useState<string>(() => sessionStorage.getItem('cart_dest_village_id') || '3327010001');
    const [selectedVillageName, setSelectedVillageName] = useState<string>(() => sessionStorage.getItem('cart_dest_village_name') || 'PLAKARAN');

    // Manual text input fallbacks
    const [manualProvince, setManualProvince] = useState<string>(() => sessionStorage.getItem('cart_dest_prov_name') || 'Jawa Tengah');
    const [manualCity, setManualCity] = useState<string>(() => sessionStorage.getItem('cart_dest_city_name') || 'Kabupaten Pemalang');
    const [manualDistrict, setManualDistrict] = useState<string>(() => sessionStorage.getItem('cart_dest_dist_name') || 'Ulujami');
    const [manualVillage, setManualVillage] = useState<string>(() => sessionStorage.getItem('cart_dest_village_name') || 'Plakaran');

    // Shipping calculations state
    const [loadingOngkir, setLoadingOngkir] = useState(false);
    const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
    const [selectedCourier, setSelectedCourier] = useState<ShippingOption | null>(() => {
        const savedCost = sessionStorage.getItem('cart_shipping_cost');
        const savedName = sessionStorage.getItem('cart_shipping_courier');
        if (savedCost && savedName) {
            return {
                code: 'saved',
                courierName: savedName,
                service: 'Pilihan Pengiriman',
                description: 'Telah dipilih',
                cost: Number(savedCost),
                etd: '1-3 Hari'
            };
        }
        return null;
    });

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalWeightGrams = cartItems.reduce((sum, item) => sum + (item.quantity * 1000), 0);
    const shippingCost = selectedCourier ? selectedCourier.cost : 0;
    const grandTotal = subtotal + shippingCost;

    // Load Regencies when Province changes
    useEffect(() => {
        if (!selectedProvinceId) return;
        const regs = ALL_514_REGENCIES[selectedProvinceId] || [];
        setRegencies(regs);
    }, [selectedProvinceId]);

    // Load Districts when Regency changes
    useEffect(() => {
        if (!selectedRegencyId) return;
        const dists = ALL_EMSIFA_DISTRICTS[selectedRegencyId] || [];
        setDistricts(dists);
    }, [selectedRegencyId]);

    // Load Villages when District changes (0ms Instant!)
    useEffect(() => {
        if (!selectedDistrictId) return;
        const vils = ALL_EMSIFA_VILLAGES[selectedDistrictId] || [];
        setVillages(vils);
        if (vils.length > 0 && (!selectedVillageId || !vils.some(v => v.id === selectedVillageId))) {
            setSelectedVillageId(vils[0].id);
            setSelectedVillageName(vils[0].name);
            setManualVillage(vils[0].name);
        }
    }, [selectedDistrictId]);

    // Handle Province Selection
    const handleProvinceChange = (provId: string) => {
        const provObj = provinces.find(p => p.id === provId);
        const provName = provObj ? provObj.name : '';
        
        setSelectedProvinceId(provId);
        setSelectedProvinceName(provName);
        setManualProvince(provName);
        sessionStorage.setItem('cart_dest_prov_id', provId);
        sessionStorage.setItem('cart_dest_prov_name', provName);

        // Load regencies for selected province and auto-select first city
        const regData = ALL_514_REGENCIES[provId] || [];
        setRegencies(regData);

        if (regData.length > 0) {
            const firstReg = regData[0];
            setSelectedRegencyId(firstReg.id);
            setSelectedRegencyName(firstReg.name);
            setManualCity(firstReg.name);
            sessionStorage.setItem('cart_dest_city_id', firstReg.id);
            sessionStorage.setItem('cart_dest_city_name', firstReg.name);

            // Load districts for first city
            const distData = ALL_EMSIFA_DISTRICTS[firstReg.id] || [];
            setDistricts(distData);

            if (distData.length > 0) {
                const firstDist = distData[0];
                setSelectedDistrictId(firstDist.id);
                setSelectedDistrictName(firstDist.name);
                setManualDistrict(firstDist.name);
                sessionStorage.setItem('cart_dest_dist_id', firstDist.id);
                sessionStorage.setItem('cart_dest_dist_name', firstDist.name);

                // Load villages for first district
                const vilData = ALL_EMSIFA_VILLAGES[firstDist.id] || [];
                setVillages(vilData);
                if (vilData.length > 0) {
                    setSelectedVillageId(vilData[0].id);
                    setSelectedVillageName(vilData[0].name);
                    setManualVillage(vilData[0].name);
                    sessionStorage.setItem('cart_dest_village_id', vilData[0].id);
                    sessionStorage.setItem('cart_dest_village_name', vilData[0].name);
                }
            }
        }
    };

    // Handle Regency Selection
    const handleRegencyChange = (regId: string) => {
        const regObj = regencies.find(r => r.id === regId);
        const regName = regObj ? regObj.name : '';

        setSelectedRegencyId(regId);
        setSelectedRegencyName(regName);
        setManualCity(regName);
        sessionStorage.setItem('cart_dest_city_id', regId);
        sessionStorage.setItem('cart_dest_city_name', regName);

        // Load districts for selected regency and auto-select first district
        const distData = ALL_EMSIFA_DISTRICTS[regId] || [];
        setDistricts(distData);

        if (distData.length > 0) {
            const firstDist = distData[0];
            setSelectedDistrictId(firstDist.id);
            setSelectedDistrictName(firstDist.name);
            setManualDistrict(firstDist.name);
            sessionStorage.setItem('cart_dest_dist_id', firstDist.id);
            sessionStorage.setItem('cart_dest_dist_name', firstDist.name);

            // Load villages for first district
            const vilData = ALL_EMSIFA_VILLAGES[firstDist.id] || [];
            setVillages(vilData);
            if (vilData.length > 0) {
                setSelectedVillageId(vilData[0].id);
                setSelectedVillageName(vilData[0].name);
                setManualVillage(vilData[0].name);
                sessionStorage.setItem('cart_dest_village_id', vilData[0].id);
                sessionStorage.setItem('cart_dest_village_name', vilData[0].name);
            }
        }
    };

    // Handle District Selection
    const handleDistrictChange = (distId: string) => {
        const distObj = districts.find(d => d.id === distId);
        const distName = distObj ? distObj.name : '';

        setSelectedDistrictId(distId);
        setSelectedDistrictName(distName);
        setManualDistrict(distName);
        sessionStorage.setItem('cart_dest_dist_id', distId);
        sessionStorage.setItem('cart_dest_dist_name', distName);

        // Load villages for selected district and auto-select first village
        const vilData = ALL_EMSIFA_VILLAGES[distId] || [];
        setVillages(vilData);
        if (vilData.length > 0) {
            const firstVil = vilData[0];
            setSelectedVillageId(firstVil.id);
            setSelectedVillageName(firstVil.name);
            setManualVillage(firstVil.name);
            sessionStorage.setItem('cart_dest_village_id', firstVil.id);
            sessionStorage.setItem('cart_dest_village_name', firstVil.name);
        }
    };

    // Handle Village Selection
    const handleVillageChange = (vilId: string) => {
        const vilObj = villages.find(v => v.id === vilId);
        const vilName = vilObj ? vilObj.name : '';

        setSelectedVillageId(vilId);
        setSelectedVillageName(vilName);
        setManualVillage(vilName);
        sessionStorage.setItem('cart_dest_village_id', vilId);
        sessionStorage.setItem('cart_dest_village_name', vilName);
    };

    // Calculate Ongkir
    const handleCalculateOngkir = async () => {
        const finalProv = inputMode === 'manual' ? manualProvince : selectedProvinceName;
        const finalCity = inputMode === 'manual' ? manualCity : selectedRegencyName;
        const finalDist = inputMode === 'manual' ? manualDistrict : selectedDistrictName;

        if (!finalProv || !finalCity) {
            alert('Silakan isi Provinsi dan Kota/Kabupaten tujuan terlebih dahulu');
            return;
        }

        setLoadingOngkir(true);
        try {
            const result = await api.getOngkir({
                province: finalProv,
                city: finalCity,
                district: finalDist,
                weight: totalWeightGrams
            });

            if (result && result.options) {
                setShippingOptions(result.options);
                if (result.options.length > 0) {
                    handleSelectCourier(result.options[0]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch shipping fee:', error);
            alert('Gagal menghitung ongkos kirim. Menggunakan tarif standar.');
        } finally {
            setLoadingOngkir(false);
        }
    };

    const handleSelectCourier = (option: ShippingOption) => {
        const finalProv = inputMode === 'manual' ? manualProvince : selectedProvinceName;
        const finalCity = inputMode === 'manual' ? manualCity : selectedRegencyName;
        const finalDist = inputMode === 'manual' ? manualDistrict : selectedDistrictName;
        const finalVil = inputMode === 'manual' ? manualVillage : selectedVillageName;

        setSelectedCourier(option);
        sessionStorage.setItem('cart_shipping_cost', String(option.cost));
        sessionStorage.setItem('cart_shipping_courier', `${option.courierName} (${option.service})`);
        sessionStorage.setItem('cart_dest_prov_name', finalProv);
        sessionStorage.setItem('cart_dest_city_name', finalCity);
        sessionStorage.setItem('cart_dest_dist_name', finalDist);
        sessionStorage.setItem('cart_dest_village_name', finalVil);
    };

    const handleProceedCheckout = () => {
        const finalProv = inputMode === 'manual' ? manualProvince : selectedProvinceName;
        const finalCity = inputMode === 'manual' ? manualCity : selectedRegencyName;
        const finalDist = inputMode === 'manual' ? manualDistrict : selectedDistrictName;
        const finalVil = inputMode === 'manual' ? manualVillage : selectedVillageName;

        if (selectedCourier) {
            sessionStorage.setItem('cart_shipping_cost', String(selectedCourier.cost));
            sessionStorage.setItem('cart_shipping_courier', `${selectedCourier.courierName} (${selectedCourier.service})`);
        }
        if (finalProv) sessionStorage.setItem('cart_dest_prov_name', finalProv);
        if (finalCity) sessionStorage.setItem('cart_dest_city_name', finalCity);
        if (finalDist) sessionStorage.setItem('cart_dest_dist_name', finalDist);
        if (finalVil) sessionStorage.setItem('cart_dest_village_name', finalVil);
        
        onCheckout();
    };

    const inputClass = "w-full px-3 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-amber-300 font-medium text-xs focus:outline-none focus:border-amber-500 transition-all cursor-pointer";
    const optionClass = "bg-stone-900 text-stone-100 py-1.5 font-sans";
    const labelClass = "block text-[11px] font-mono text-stone-400 mb-1";

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <h1 className="text-3xl sm:text-4xl font-serif font-bold text-amber-400 mb-2 flex items-center gap-3">
                        <ShoppingBag className="w-8 h-8" /> {t('cart.title')}
                    </h1>
                    <p className="text-xs font-mono text-stone-400 mb-8 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-400" />
                        Pengiriman Resmi dari <strong>Sanggar Tapak Pamungkas (Kec. Ulujami, Kab. Pemalang, Jawa Tengah)</strong>
                    </p>

                    {cartItems.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20 glass-panel rounded-3xl border border-stone-800"
                        >
                            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4">
                                <ShoppingBag className="w-8 h-8" />
                            </div>
                            <p className="text-stone-300 text-lg font-serif mb-4">{t('cart.empty')}</p>
                            <p className="text-xs text-stone-400 font-mono mb-6 max-w-sm mx-auto">
                                Keranjang Anda masih kosong. Silakan jelajahi katalog pusaka kami.
                            </p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* Left Column: Items List & Cek Ongkir Widget (7 Cols) */}
                            <div className="lg:col-span-7 space-y-6">
                                <div className="space-y-4">
                                    <h2 className="text-lg font-serif font-bold text-stone-100 border-b border-stone-800 pb-2">
                                        Daftar Pusaka & Media Bertuah
                                    </h2>
                                    <AnimatePresence>
                                        {cartItems.map(item => (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -20 }}
                                                className="glass-panel p-4 rounded-2xl border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4"
                                            >
                                                <div className="flex items-center gap-4 w-full sm:w-auto">
                                                    <img
                                                        src={item.imageUrls[0] || 'https://via.placeholder.com/100'}
                                                        alt={item.name}
                                                        className="w-20 h-20 object-cover rounded-xl bg-stone-950 border border-stone-800 flex-shrink-0"
                                                    />
                                                    <div>
                                                        <span className="text-[10px] font-mono text-amber-400/90 uppercase">{item.category}</span>
                                                        <h3 className="font-serif font-bold text-stone-100 text-base line-clamp-1">{item.name}</h3>
                                                        <p className="text-xs font-bold gold-gradient-text mt-1">
                                                            Rp {item.price.toLocaleString('id-ID')}
                                                        </p>
                                                        <button
                                                            onClick={() => onRemoveFromCart(item.id)}
                                                            className="text-rose-400 hover:text-rose-300 text-xs font-mono mt-2 flex items-center gap-1 transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" /> Hapus Item
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-800">
                                                    <div className="text-right">
                                                        <span className="text-[10px] font-mono text-stone-400 block">Kuantitas</span>
                                                        <span className="font-mono font-bold text-stone-200 text-sm">x{item.quantity}</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-[10px] font-mono text-stone-400 block">Subtotal</span>
                                                        <span className="font-bold text-amber-400 text-base font-mono">
                                                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {/* Cek & Pilih Ongkir Widget (Powered by EMSIFA API Wilayah Indonesia 100% Real Official Names) */}
                                <div className="glass-panel p-6 rounded-3xl border border-amber-500/20 space-y-4">
                                    <div className="flex items-center justify-between border-b border-stone-800 pb-3 flex-wrap gap-2">
                                        <h3 className="font-serif font-bold text-stone-100 text-base flex items-center gap-2">
                                            <Truck className="w-5 h-5 text-amber-400" />
                                            Cek Ongkir (API Wilayah Indonesia ⭐)
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={() => setInputMode(prev => prev === 'dropdown' ? 'manual' : 'dropdown')}
                                            className="px-2.5 py-1 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold rounded-lg transition-all flex items-center gap-1"
                                        >
                                            {inputMode === 'dropdown' ? <Edit3 className="w-3 h-3" /> : <ListFilter className="w-3 h-3" />}
                                            {inputMode === 'dropdown' ? 'Ketik Manual' : 'Pilih Dropdown EMSIFA'}
                                        </button>
                                    </div>

                                    {inputMode === 'dropdown' ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {/* 1. Provinsi */}
                                            <div>
                                                <label className={labelClass}>Provinsi Tujuan</label>
                                                <select
                                                    value={selectedProvinceId}
                                                    onChange={(e) => handleProvinceChange(e.target.value)}
                                                    className={inputClass}
                                                >
                                                    <option value="" className={optionClass}>-- Pilih Provinsi --</option>
                                                    {provinces.map(p => (
                                                        <option key={p.id} value={p.id} className={optionClass}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* 2. Kota / Kabupaten */}
                                            <div>
                                                <label className={labelClass}>
                                                    Kota / Kabupaten {loadingRegencies && <Loader2 className="w-3 h-3 inline animate-spin text-amber-400" />}
                                                </label>
                                                <select
                                                    value={selectedRegencyId}
                                                    onChange={(e) => handleRegencyChange(e.target.value)}
                                                    disabled={loadingRegencies}
                                                    className={inputClass}
                                                >
                                                    <option value="" className={optionClass}>-- Pilih Kota/Kabupaten --</option>
                                                    {regencies.map(r => (
                                                        <option key={r.id} value={r.id} className={optionClass}>{r.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* 3. Kecamatan */}
                                            <div>
                                                <label className={labelClass}>
                                                    Kecamatan {loadingDistricts && <Loader2 className="w-3 h-3 inline animate-spin text-amber-400" />}
                                                </label>
                                                <select
                                                    value={selectedDistrictId}
                                                    onChange={(e) => handleDistrictChange(e.target.value)}
                                                    disabled={loadingDistricts}
                                                    className={inputClass}
                                                >
                                                    <option value="" className={optionClass}>-- Pilih Kecamatan --</option>
                                                    {districts.map(d => (
                                                        <option key={d.id} value={d.id} className={optionClass}>{d.name}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* 4. Kelurahan / Desa (100% Nama Asli Resmi!) */}
                                            <div>
                                                <label className={labelClass}>
                                                    Kelurahan / Desa {loadingVillages && <Loader2 className="w-3 h-3 inline animate-spin text-amber-400" />}
                                                </label>
                                                <select
                                                    value={selectedVillageId}
                                                    onChange={(e) => handleVillageChange(e.target.value)}
                                                    disabled={loadingVillages}
                                                    className={inputClass}
                                                >
                                                    <option value="" className={optionClass}>-- Pilih Kelurahan/Desa --</option>
                                                    {villages.map(v => (
                                                        <option key={v.id} value={v.id} className={optionClass}>{v.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className={labelClass}>Provinsi Tujuan</label>
                                                <input
                                                    type="text"
                                                    value={manualProvince}
                                                    onChange={(e) => setManualProvince(e.target.value)}
                                                    placeholder="Contoh: Jawa Tengah"
                                                    className={inputClass}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Kota / Kabupaten</label>
                                                <input
                                                    type="text"
                                                    value={manualCity}
                                                    onChange={(e) => setManualCity(e.target.value)}
                                                    placeholder="Contoh: Kabupaten Pemalang"
                                                    className={inputClass}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Kecamatan</label>
                                                <input
                                                    type="text"
                                                    value={manualDistrict}
                                                    onChange={(e) => setManualDistrict(e.target.value)}
                                                    placeholder="Contoh: Ulujami"
                                                    className={inputClass}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Kelurahan / Desa</label>
                                                <input
                                                    type="text"
                                                    value={manualVillage}
                                                    onChange={(e) => setManualVillage(e.target.value)}
                                                    placeholder="Contoh: Plakaran / Mandiraja / Semanan"
                                                    className={inputClass}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleCalculateOngkir}
                                        disabled={loadingOngkir}
                                        className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold font-mono rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 mt-2"
                                    >
                                        {loadingOngkir ? <Loader2 className="w-4 h-4 animate-spin text-stone-950" /> : <Calculator className="w-4 h-4" />}
                                        {loadingOngkir ? 'Menghitung Tarif Ongkir EMSIFA...' : 'Hitung Tarip Ongkir'}
                                    </button>

                                    {/* Courier Options Selection List */}
                                    {shippingOptions.length > 0 && (
                                        <div className="space-y-2 pt-3 border-t border-stone-800">
                                            <span className="text-[11px] font-mono text-stone-400 block">
                                                Pilih Ekspedisi Pengiriman dari Ulujami, Pemalang:
                                            </span>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {shippingOptions.map((opt, idx) => {
                                                    const isSelected = selectedCourier?.courierName === `${opt.courierName} (${opt.service})` || selectedCourier?.cost === opt.cost;
                                                    return (
                                                        <div
                                                            key={idx}
                                                            onClick={() => handleSelectCourier(opt)}
                                                            className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                                                isSelected
                                                                    ? 'bg-amber-500/15 border-amber-400 text-amber-400 shadow-md'
                                                                    : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700'
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between text-xs font-bold">
                                                                <span className="flex items-center gap-1.5">
                                                                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                                                    {opt.courierName}
                                                                </span>
                                                                <span className="font-mono text-amber-400">Rp {opt.cost.toLocaleString('id-ID')}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 mt-1">
                                                                <span>{opt.service}</span>
                                                                <span>{opt.etd}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column: Order Summary (5 Cols) */}
                            <div className="lg:col-span-5 glass-panel p-6 rounded-3xl border border-amber-500/30 sticky top-28 space-y-6">
                                <h2 className="text-xl font-serif font-bold text-stone-100 border-b border-stone-800 pb-3 flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5 text-amber-400" /> Ringkasan Pemaharan
                                </h2>

                                <div className="space-y-3 text-xs font-mono text-stone-300">
                                    <div className="flex justify-between">
                                        <span>Total Mahar Produk</span>
                                        <span className="font-bold text-stone-100">Rp {subtotal.toLocaleString('id-ID')}</span>
                                    </div>

                                    <div className="flex justify-between items-center border-t border-stone-800/80 pt-2">
                                        <div>
                                            <span className="block">Ongkos Kirim</span>
                                            <span className="text-[10px] text-amber-400/90 block">
                                                {selectedCourier ? selectedCourier.courierName : 'Belum Dipilih'}
                                            </span>
                                        </div>
                                        <span className={`font-bold ${shippingCost > 0 ? 'text-amber-400' : 'text-stone-500'}`}>
                                            {shippingCost > 0 ? `Rp ${shippingCost.toLocaleString('id-ID')}` : 'Rp 0'}
                                        </span>
                                    </div>

                                    {(inputMode === 'manual' ? manualCity : selectedRegencyName) && (
                                        <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-[10px] text-stone-400 space-y-0.5">
                                            <div>Tujuan Pengiriman:</div>
                                            <strong className="text-stone-200 block text-xs">
                                                {(inputMode === 'manual' ? manualVillage : selectedVillageName) ? `${inputMode === 'manual' ? manualVillage : selectedVillageName}, ` : ''}
                                                {(inputMode === 'manual' ? manualDistrict : selectedDistrictName) ? `${inputMode === 'manual' ? manualDistrict : selectedDistrictName}, ` : ''}
                                                {inputMode === 'manual' ? manualCity : selectedRegencyName}, {inputMode === 'manual' ? manualProvince : selectedProvinceName}
                                            </strong>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-stone-800 pt-4 flex justify-between items-center">
                                    <div>
                                        <span className="text-xs font-serif font-bold text-stone-100 block">Total Tagihan</span>
                                        <span className="text-[10px] font-mono text-stone-400">Mahar + Ongkir</span>
                                    </div>
                                    <span className="text-2xl font-bold gold-gradient-text">
                                        Rp {grandTotal.toLocaleString('id-ID')}
                                    </span>
                                </div>

                                <button
                                    onClick={handleProceedCheckout}
                                    className="w-full py-4 px-6 rounded-xl font-bold text-stone-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 transition-all shadow-xl gold-glow text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                                >
                                    <span>Lanjut Ke Checkout</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>

                                <div className="flex items-center justify-center gap-2 text-[10px] text-stone-400 font-mono text-center pt-2">
                                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                                    Transaksi Terjamin Aman & Privasi Terjaga 100%
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CartPage;