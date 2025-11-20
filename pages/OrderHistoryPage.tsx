import React, { useState, useEffect } from 'react';
import { Order, OrderStatus, Page } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { api } from '../services/api';

interface OrderHistoryPageProps {
    userId: number;
    onNavigate: (page: Page) => void;
}

const getStatusBadgeColor = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.PendingPayment: return 'bg-yellow-100 text-yellow-800';
        case OrderStatus.Processing: return 'bg-blue-100 text-blue-800';
        case OrderStatus.Shipped: return 'bg-purple-100 text-purple-800';
        case OrderStatus.Delivered: return 'bg-green-100 text-green-800';
        case OrderStatus.Cancelled: return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
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
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-dark">{t('orderHistory.title')}</h1>
                <p className="mt-4 text-lg text-gray-600">{t('orderHistory.subtitle')}</p>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-lg shadow-md">
                    <p className="text-gray-600 text-lg mb-4">{t('orderHistory.empty')}</p>
                    <button
                        onClick={() => onNavigate('allProducts')}
                        className="bg-brand-primary text-white font-bold py-3 px-6 rounded-full hover:bg-brand-dark transition-colors"
                    >
                        {t('orderHistory.startShopping')}
                    </button>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('orderHistory.colId')}</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('orderHistory.colDate')}</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('orderHistory.colTotal')}</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('orderHistory.colStatus')}</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t('orderHistory.colActions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {orders.map(order => (
                                        <tr key={order.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-brand-dark">{order.id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.orderDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Rp {order.total.toLocaleString('id-ID')}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                                {order.trackingNumber && (
                                                    <div className="mt-1 text-xs text-gray-500">
                                                        Resi: <span className="font-mono font-medium text-brand-dark">{order.trackingNumber}</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button onClick={() => handleViewDetails(order)} className="text-brand-primary hover:text-brand-dark transition-colors">{t('orderHistory.viewDetails')}</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white rounded-lg shadow-md p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">{t('orderHistory.colId')}</p>
                                        <p className="text-sm font-bold text-brand-dark">{order.id}</p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">{t('orderHistory.colDate')}</p>
                                        <p className="text-sm font-medium text-gray-700">{new Date(order.orderDate).toLocaleDateString('id-ID')}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase">{t('orderHistory.colTotal')}</p>
                                        <p className="text-sm font-bold text-brand-primary">Rp {order.total.toLocaleString('id-ID')}</p>
                                    </div>
                                </div>

                                {order.trackingNumber && (
                                    <div className="mb-3 p-2 bg-gray-50 rounded">
                                        <p className="text-xs text-gray-500">Nomor Resi:</p>
                                        <p className="text-sm font-mono font-medium text-brand-dark">{order.trackingNumber}</p>
                                    </div>
                                )}

                                <button
                                    onClick={() => handleViewDetails(order)}
                                    className="w-full bg-brand-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-dark transition-colors"
                                >
                                    {t('orderHistory.viewDetails')}
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Order Details Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={closeModal}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
                            <h3 className="text-2xl font-serif font-bold text-brand-dark">Detail Pesanan</h3>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Order ID</p>
                                    <p className="font-bold text-brand-dark">{selectedOrder.id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Tanggal</p>
                                    <p className="font-medium">{new Date(selectedOrder.orderDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(selectedOrder.status)}`}>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Total</p>
                                    <p className="font-bold text-brand-primary text-lg">Rp {selectedOrder.total.toLocaleString('id-ID')}</p>
                                </div>
                            </div>

                            {selectedOrder.trackingNumber && (
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-1">Nomor Resi Pengiriman:</p>
                                    <p className="font-mono font-bold text-brand-dark text-lg">{selectedOrder.trackingNumber}</p>
                                </div>
                            )}

                            <div>
                                <h4 className="font-bold text-brand-dark mb-3">Item Pesanan:</h4>
                                <div className="space-y-3">
                                    {selectedOrder.items?.map((item: any, index: number) => (
                                        <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                            {item.product?.imageUrls?.[0] && (
                                                <img src={item.product.imageUrls[0]} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
                                            )}
                                            <div className="flex-1">
                                                <p className="font-medium text-brand-dark">{item.product?.name || 'Product'}</p>
                                                <p className="text-sm text-gray-500">Qty: {item.quantity} × Rp {item.price.toLocaleString('id-ID')}</p>
                                            </div>
                                            <p className="font-bold text-brand-primary">Rp {(item.quantity * item.price).toLocaleString('id-ID')}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-200">
                            <button onClick={closeModal} className="w-full bg-brand-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-dark transition-colors">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderHistoryPage;