import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, Page } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { api } from '../services/api';
import { ShoppingBag, Eye, X, Truck, CheckCircle2, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderHistoryPageProps {
    userId: number;
    onNavigate: (page: Page) => void;
}

const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.PendingPayment:
            return 'bg-amber-500/15 text-amber-400 border border-amber-500/30';
        case OrderStatus.Processing:
            return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
        case OrderStatus.Shipped:
            return 'bg-purple-500/15 text-purple-400 border border-purple-500/30';
        case OrderStatus.Delivered:
            return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
        case OrderStatus.Cancelled:
            return 'bg-rose-500/15 text-rose-400 border border-rose-500/30';
        default:
            return 'bg-stone-800 text-stone-300';
    }
};

const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ userId, onNavigate }) => {
    const { t } = useTranslations();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await api.getUserOrders(userId);
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch user orders", error);
            } finally {
                setLoading(false);
            }
        };
        if (userId) {
            fetchOrders();
        }
    }, [userId]);

    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
    };

    const closeModal = () => {
        setSelectedOrder(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[70vh] bg-stone-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-semibold">Riwayat Belanja</span>
                        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-stone-100 mt-2 mb-3">
                            {t('orderHistory.title')}
                        </h1>
                        <p className="text-stone-400 text-sm">
                            {t('orderHistory.subtitle')}
                        </p>
                    </div>

                    {orders.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-20 glass-panel rounded-3xl border border-stone-800"
                        >
                            <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mx-auto mb-4">
                                <ShoppingBag className="w-8 h-8" />
                            </div>
                            <p className="text-stone-300 text-lg font-serif mb-4">{t('orderHistory.empty')}</p>
                            <button
                                onClick={() => onNavigate('allProducts')}
                                className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold rounded-full text-xs uppercase tracking-wider gold-glow"
                            >
                                {t('orderHistory.startShopping')}
                            </button>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            {orders.map(order => (
                                <motion.div
                                    key={order.id}
                                    whileHover={{ y: -2 }}
                                    className="glass-panel p-6 rounded-2xl border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-mono font-bold text-amber-400">
                                                Order #{order.id}
                                            </span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${getStatusBadgeStyle(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="text-xs text-stone-400 font-mono">
                                            Tanggal: {new Date(order.orderDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </div>
                                        {order.trackingNumber && (
                                            <div className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                                                <Truck className="w-3.5 h-3.5" /> Resi: {order.trackingNumber}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-stone-800">
                                        <div className="text-left sm:text-right">
                                            <span className="text-[10px] font-mono text-stone-500 block">Total Mahar</span>
                                            <span className="text-base font-bold gold-gradient-text">
                                                Rp {order.total.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => handleViewDetails(order)}
                                            className="px-4 py-2 bg-stone-900 hover:bg-amber-500 hover:text-stone-950 border border-stone-800 text-stone-300 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all"
                                        >
                                            <Eye className="w-3.5 h-3.5" /> Detail
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Order Details Lightbox Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-panel border border-amber-500/30 rounded-3xl max-w-lg w-full overflow-hidden p-6 text-stone-100 space-y-5"
                        >
                            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
                                <div>
                                    <h3 className="text-lg font-serif font-bold text-amber-400">Detail Pesanan #{selectedOrder.id}</h3>
                                    <span className="text-[10px] font-mono text-stone-400">{new Date(selectedOrder.orderDate).toLocaleString('id-ID')}</span>
                                </div>
                                <button onClick={closeModal} className="p-1 rounded-full bg-stone-900 text-stone-400 hover:text-stone-200">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                                {selectedOrder.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-stone-900/60 border border-stone-800">
                                        <div className="flex items-center gap-2.5">
                                            <img src={item.imageUrls[0]} alt="" className="w-8 h-8 rounded-lg object-cover bg-stone-950" />
                                            <div>
                                                <p className="font-semibold text-stone-200 line-clamp-1">{item.name}</p>
                                                <span className="text-[10px] text-stone-400 font-mono">x{item.quantity}</span>
                                            </div>
                                        </div>
                                        <span className="font-mono font-bold text-amber-400">
                                            Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-stone-800 pt-3 space-y-1.5 text-xs font-mono">
                                <div className="flex justify-between">
                                    <span className="text-stone-400">Status Pesanan</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${getStatusBadgeStyle(selectedOrder.status)}`}>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                                {selectedOrder.trackingNumber && (
                                    <div className="flex justify-between text-emerald-400">
                                        <span>Nomor Resi</span>
                                        <span>{selectedOrder.trackingNumber}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 text-sm font-bold border-t border-stone-800">
                                    <span className="font-serif">Total Pemaharan</span>
                                    <span className="gold-gradient-text">Rp {selectedOrder.total.toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <div className="pt-2 text-right">
                                <button
                                    onClick={closeModal}
                                    className="px-5 py-2 bg-amber-500 text-stone-950 text-xs font-bold rounded-xl"
                                >
                                    Tutup
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrderHistoryPage;