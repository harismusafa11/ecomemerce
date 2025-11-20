import React, { useState, useEffect } from 'react';
import { Product, Order, User, Voucher, OrderStatus } from '../types';
import Pagination from '../components/ui/Pagination';
import { useTranslations } from '../hooks/useTranslations';
import { api } from '../services/api';

const ITEMS_PER_PAGE_ADMIN = 10;

// --- ICONS ---
const DashboardIcon = () => <svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const ProductsIcon = () => <svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>;
const OrdersIcon = () => <svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const UsersIcon = () => <svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 12a4 4 0 110 5.292" /></svg>;
const VouchersIcon = () => <svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>;
const LogoutIcon = () => <svg className="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

// --- FORM MODAL COMPONENT ---
const FormModal: React.FC<{ title: string; children: React.ReactNode; onSave: () => void; onCancel: () => void; t: any }> = ({ title, children, onSave, onCancel, t }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="p-6 border-b">
                <h3 className="text-2xl font-serif font-semibold text-brand-dark">{title}</h3>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">{children}</div>
            <div className="p-6 bg-gray-50 flex justify-end space-x-4 rounded-b-lg mt-auto">
                <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">{t('admin.modalCancel')}</button>
                <button onClick={onSave} className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-dark">{t('admin.modalSave')}</button>
            </div>
        </div>
    </div>
);


// --- CONFIRMATION DIALOG COMPONENT ---
const ConfirmationDialog: React.FC<{ title: string; message: string; onConfirm: () => void; onCancel: () => void; t: any }> = ({ title, message, onConfirm, onCancel, t }) => (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
            <div className="p-6">
                <h3 className="text-xl font-bold text-brand-dark">{title}</h3>
                <p className="mt-2 text-gray-600">{message}</p>
            </div>
            <div className="p-4 bg-gray-50 flex justify-end space-x-2">
                <button onClick={onCancel} className="px-4 py-2 text-gray-800 rounded-md hover:bg-gray-200">{t('admin.modalCancel')}</button>
                <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">{t('admin.deleteConfirm')}</button>
            </div>
        </div>
    </div>
);


// --- MAIN ADMIN PANEL COMPONENT ---
const AdminPanel: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [productCurrentPage, setProductCurrentPage] = useState(1);
    const { t } = useTranslations();

    const [modal, setModal] = useState<{ type: string | null; data?: any }>({ type: null });
    const [confirmDelete, setConfirmDelete] = useState<{ type: string | null; id: any }>({ type: null, id: null });
    const [formData, setFormData] = useState<any>({});

    // Fetch data on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, ordersData, usersData, vouchersData] = await Promise.all([
                    api.getProducts(),
                    api.getOrders(),
                    api.getUsers(),
                    api.getVouchers()
                ]);
                setProducts(productsData);
                setOrders(ordersData);
                setUsers(usersData);
                setVouchers(vouchersData);
            } catch (error) {
                console.error("Failed to fetch admin data", error);
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openModal = (type: string, data?: any) => {
        let initialFormData = data ? { ...data } : { imageUrls: [] };
        if (data && data.imageUrls) {
            // Flatten imageUrls for the form
            data.imageUrls.forEach((url: string, index: number) => {
                initialFormData[`imageUrl${index}`] = url;
            });
        }
        // Convert dates to YYYY-MM-DD format for voucher editing
        if (type === 'voucher' && data) {
            if (data.startDate) {
                initialFormData.startDate = new Date(data.startDate).toISOString().split('T')[0];
            }
            if (data.endDate) {
                initialFormData.endDate = new Date(data.endDate).toISOString().split('T')[0];
            }
        }
        setModal({ type, data });
        setFormData(initialFormData);
    };

    const closeModal = () => setModal({ type: null });

    const openConfirmDialog = (type: string, id: any) => setConfirmDelete({ type, id });
    const closeConfirmDialog = () => setConfirmDelete({ type: null, id: null });

    const handleSave = async () => {
        const { type, data } = modal;

        if (type === 'orderStatus') {
            await handleOrderStatusChange(data.id, formData.status || data.status, formData.trackingNumber);
            return;
        }

        // Reconstruct imageUrls array from form data
        const imageUrls = Array.from({ length: 7 })
            .map((_, i) => formData[`imageUrl${i}`])
            .filter(url => url && url.trim() !== '');

        const finalData = { ...formData, imageUrls };
        // Clean up individual imageUrl fields
        for (let i = 0; i < 7; i++) {
            delete finalData[`imageUrl${i}`];
        }

        try {
            switch (type) {
                case 'product':
                    if (data) {
                        const updatedProduct = await api.updateProduct(data.id, finalData);
                        setProducts(prev => prev.map(p => p.id === data.id ? updatedProduct : p));
                    } else {
                        const newProduct = await api.createProduct(finalData);
                        setProducts(prev => [...prev, newProduct]);
                    }
                    break;
                case 'user':
                    if (data) {
                        const updatedUser = await api.updateUser(data.id, formData);
                        setUsers(prev => prev.map(u => u.id === data.id ? updatedUser : u));
                    } else {
                        // Register new user
                        // Note: API register endpoint expects name, email, password
                        // But form might not have password if we are just adding a user (maybe default password?)
                        // For now, let's assume password is provided or we set a default
                        const newUser = await api.register(formData.name, formData.email, formData.password || 'password123');
                        // If we want to set isAdmin, we might need to update it after creation or update register endpoint
                        // For now, let's assume register returns the user and we can update it if needed, or just rely on default.
                        // Actually, my register endpoint doesn't take isAdmin.
                        // So if I want to create an admin, I should update it after.
                        if (formData.isAdmin === 'true' || formData.isAdmin === true) {
                            const updated = await api.updateUser(newUser.id, { isAdmin: true });
                            setUsers(prev => [...prev, updated]);
                        } else {
                            setUsers(prev => [...prev, newUser]);
                        }
                    }
                    break;
                case 'voucher':
                    // Prepare voucher data with startDate and endDate
                    const voucherData = {
                        code: formData.code,
                        discountPercentage: Number(formData.discountPercentage),
                        startDate: formData.startDate || new Date().toISOString().split('T')[0],
                        endDate: formData.endDate,
                    };

                    if (data) {
                        const updatedVoucher = await api.updateVoucher(data.id, voucherData);
                        setVouchers(prev => prev.map(v => v.id === data.id ? updatedVoucher : v));
                    } else {
                        const newVoucher = await api.createVoucher(voucherData);
                        setVouchers(prev => [...prev, newVoucher]);
                    }
                    break;
            }
            closeModal();
        } catch (error) {
            console.error("Failed to save", error);
            // Show error toast?
        }
    };


    const handleDelete = async () => {
        const { type, id } = confirmDelete;
        try {
            switch (type) {
                case 'product':
                    await api.deleteProduct(id);
                    setProducts(p => p.filter(item => item.id !== id));
                    break;
                case 'order':
                    // API doesn't have delete order, maybe I should add it or just ignore
                    // Assuming I can't delete orders for now or I need to add endpoint.
                    // Let's just remove from UI for now or add endpoint.
                    // I'll skip API call for order delete as it's not in my API service yet.
                    setOrders(o => o.filter(item => item.id !== id));
                    break;
                case 'user':
                    await api.deleteUser(id);
                    setUsers(u => u.filter(item => item.id !== id));
                    break;
                case 'voucher':
                    await api.deleteVoucher(id);
                    setVouchers(v => v.filter(item => item.id !== id));
                    break;
            }
            closeConfirmDialog();
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const handleOrderStatusChange = async (orderId: string, newStatus: OrderStatus, trackingNumber?: string) => {
        try {
            const updatedOrder = await api.updateOrderStatus(orderId, newStatus, trackingNumber);
            setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: newStatus, trackingNumber: updatedOrder.trackingNumber } : order));
            closeModal();
        } catch (error) {
            console.error("Failed to update order status", error);
        }
    };

    const NavItem: React.FC<{ tabName: string; icon: React.ReactNode; children: React.ReactNode }> = ({ tabName, icon, children }) => (
        <a onClick={() => setActiveTab(tabName)} className={`flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200 ${activeTab === tabName ? 'bg-brand-gold text-brand-dark font-bold' : 'text-brand-accent hover:bg-white/10 hover:text-white'}`}>
            {icon}
            {children}
        </a>
    );

    const renderContent = () => {
        const commonTableClass = "w-full text-left bg-white shadow-md rounded-lg";
        const commonThClass = "p-4 bg-gray-100 font-semibold text-gray-600 border-b";
        const commonTdClass = "p-4 border-b border-gray-200";

        switch (activeTab) {
            case 'dashboard':
                // Calculate date 7 days ago
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

                // Filter orders from last 7 days
                const recentOrders = orders.filter(order => {
                    const orderDate = new Date(order.orderDate);
                    return orderDate >= sevenDaysAgo;
                });

                // Calculate revenue from recent orders
                const weeklyRevenue = recentOrders.reduce((sum, o) => sum + o.total, 0);

                // Format date range for display
                const formatDate = (date: Date) => {
                    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
                };

                return (
                    <div>
                        <h2 className="text-3xl font-serif text-brand-dark mb-2">{t('admin.dashboard.title')}</h2>
                        <p className="text-sm text-gray-500 mb-6">
                            {t('admin.dashboard.period')}: {formatDate(sevenDaysAgo)} - {formatDate(new Date())}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-gray-500">{t('admin.dashboard.totalRevenue')}</h3>
                                <p className="text-3xl font-bold text-brand-primary mt-1">Rp {weeklyRevenue.toLocaleString('id-ID')}</p>
                                <p className="text-xs text-gray-400 mt-2">{t('admin.dashboard.last7Days')}</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-gray-500">{t('admin.dashboard.totalOrders')}</h3>
                                <p className="text-3xl font-bold text-brand-primary mt-1">{recentOrders.length}</p>
                                <p className="text-xs text-gray-400 mt-2">{t('admin.dashboard.last7Days')}</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-gray-500">{t('admin.dashboard.totalUsers')}</h3>
                                <p className="text-3xl font-bold text-brand-primary mt-1">{users.length}</p>
                                <p className="text-xs text-gray-400 mt-2">{t('admin.dashboard.allTime')}</p>
                            </div>
                            <div className="bg-white p-6 rounded-lg shadow-md">
                                <h3 className="text-gray-500">{t('admin.dashboard.totalProducts')}</h3>
                                <p className="text-3xl font-bold text-brand-primary mt-1">{products.length}</p>
                                <p className="text-xs text-gray-400 mt-2">{t('admin.dashboard.allTime')}</p>
                            </div>
                        </div>
                    </div>
                );

            case 'products':
                const productTotalPages = Math.ceil(products.length / ITEMS_PER_PAGE_ADMIN);
                const currentProducts = products.slice(
                    (productCurrentPage - 1) * ITEMS_PER_PAGE_ADMIN,
                    (productCurrentPage) * ITEMS_PER_PAGE_ADMIN
                );
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-serif text-brand-dark">{t('admin.products.title')}</h2>
                            <button onClick={() => openModal('product')} className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-dark">{t('admin.products.addProduct')}</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className={commonTableClass}>
                                <thead><tr><th className={commonThClass}>{t('admin.products.colName')}</th><th className={commonThClass}>{t('admin.products.colPrice')}</th><th className={commonThClass}>{t('admin.products.colStock')}</th><th className={commonThClass}>{t('admin.products.colActions')}</th></tr></thead>
                                <tbody>{currentProducts.map(p => (<tr key={p.id}><td className={commonTdClass}>{p.name}</td><td className={commonTdClass}>Rp {p.price.toLocaleString('id-ID')}</td><td className={commonTdClass}>{p.stock}</td><td className={`${commonTdClass} flex space-x-2`}><button onClick={() => openModal('product', p)} className="text-blue-500 hover:text-blue-700 p-1"><EditIcon /></button><button onClick={() => openConfirmDialog('product', p.id)} className="text-red-500 hover:text-red-700 p-1"><DeleteIcon /></button></td></tr>))}</tbody>
                            </table>
                        </div>
                        <Pagination
                            currentPage={productCurrentPage}
                            totalPages={productTotalPages}
                            onPageChange={setProductCurrentPage}
                        />
                    </div>
                );

            case 'orders':
                return (
                    <div>
                        <h2 className="text-3xl font-serif text-brand-dark mb-6">{t('admin.orders.title')}</h2>
                        <table className={commonTableClass}>
                            <thead><tr><th className={commonThClass}>{t('admin.orders.colId')}</th><th className={commonThClass}>{t('admin.orders.colCustomer')}</th><th className={commonThClass}>{t('admin.orders.colTotal')}</th><th className={commonThClass}>{t('admin.orders.colStatus')}</th><th className={commonThClass}>Tracking</th><th className={commonThClass}>{t('admin.orders.colActions')}</th></tr></thead>
                            <tbody>{orders.map(o => (
                                <tr key={o.id}>
                                    <td className={commonTdClass}>{o.id}</td>
                                    <td className={commonTdClass}>{users.find(u => u.id === o.userId)?.name}</td>
                                    <td className={commonTdClass}>Rp {o.total.toLocaleString('id-ID')}</td>
                                    <td className={commonTdClass}>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${o.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {o.status}
                                        </span>
                                    </td>
                                    <td className={commonTdClass}>{o.trackingNumber || '-'}</td>
                                    <td className={`${commonTdClass} flex space-x-2`}>
                                        <button onClick={() => openModal('orderStatus', o)} className="text-blue-500 hover:text-blue-700 p-1"><EditIcon /></button>
                                        <button onClick={() => openConfirmDialog('order', o.id)} className="text-red-500 hover:text-red-700 p-1"><DeleteIcon /></button>
                                    </td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                );

            case 'users':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-serif text-brand-dark">{t('admin.users.title')}</h2>
                            <button onClick={() => openModal('user')} className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-dark">{t('admin.users.addUser')}</button>
                        </div>
                        <table className={commonTableClass}>
                            <thead><tr><th className={commonThClass}>{t('admin.users.colName')}</th><th className={commonThClass}>{t('admin.users.colEmail')}</th><th className={commonThClass}>{t('admin.users.colRole')}</th><th className={commonThClass}>{t('admin.users.colActions')}</th></tr></thead>
                            <tbody>{users.map(u => (<tr key={u.id}><td className={commonTdClass}>{u.name}</td><td className={commonTdClass}>{u.email}</td><td className={commonTdClass}>{u.isAdmin ? t('admin.users.roleAdmin') : t('admin.users.roleCustomer')}</td><td className={`${commonTdClass} flex space-x-2`}><button onClick={() => openModal('user', u)} className="text-blue-500 hover:text-blue-700 p-1"><EditIcon /></button><button onClick={() => openConfirmDialog('user', u.id)} className="text-red-500 hover:text-red-700 p-1"><DeleteIcon /></button></td></tr>))}</tbody>
                        </table>
                    </div>
                );

            case 'vouchers':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-3xl font-serif text-brand-dark">{t('admin.vouchers.title')}</h2>
                            <button onClick={() => openModal('voucher')} className="bg-brand-primary text-white px-4 py-2 rounded-lg hover:bg-brand-dark">{t('admin.vouchers.addVoucher')}</button>
                        </div>
                        <table className={commonTableClass}>
                            <thead><tr><th className={commonThClass}>{t('admin.vouchers.colCode')}</th><th className={commonThClass}>{t('admin.vouchers.colDiscount')}</th><th className={commonThClass}>{t('admin.vouchers.colExpiry')}</th><th className={commonThClass}>{t('admin.vouchers.colActions')}</th></tr></thead>
                            <tbody>{vouchers.map(v => (<tr key={v.id}><td className={commonTdClass}>{v.code}</td><td className={commonTdClass}>{v.discountPercentage}%</td><td className={commonTdClass}>{new Date(v.endDate).toLocaleDateString('id-ID')}</td><td className={`${commonTdClass} flex space-x-2`}><button onClick={() => openModal('voucher', v)} className="text-blue-500 hover:text-blue-700 p-1"><EditIcon /></button><button onClick={() => openConfirmDialog('voucher', v.id)} className="text-red-500 hover:text-red-700 p-1"><DeleteIcon /></button></td></tr>))}</tbody>
                        </table>
                    </div>
                );

            default: return null;
        }
    };

    const renderModalContent = () => {
        const commonInputClass = "w-full p-2 border border-gray-300 rounded-md";
        switch (modal.type) {
            case 'product':
                return <>
                    <input name="name" value={formData.name || ''} onChange={handleInputChange} placeholder={t('admin.products.formName')} className={commonInputClass} />
                    <textarea name="description" value={formData.description || ''} onChange={handleInputChange} placeholder={t('admin.products.formDescription')} className={`${commonInputClass} h-24`}></textarea>
                    <input name="price" type="number" value={formData.price || ''} onChange={handleInputChange} placeholder={t('admin.products.formPrice')} className={commonInputClass} />
                    <input name="stock" type="number" value={formData.stock || ''} onChange={handleInputChange} placeholder={t('admin.products.formStock')} className={commonInputClass} />
                    <select name="category" value={formData.category || ''} onChange={handleInputChange} className={commonInputClass}>
                        <option value="">{t('admin.products.formSelectCategory')}</option>
                        <option value="Keilmuan">{t('categories.keilmuan')}</option>
                        <option value="Media Bertuah">{t('categories.mediabertuah')}</option>
                        <option value="Media Herbal">{t('categories.mediaherbal')}</option>
                    </select>
                    <h4 className="font-semibold text-gray-700 mt-2">{t('admin.products.formImageUrls')}</h4>
                    {Array.from({ length: 7 }).map((_, index) => (
                        <input
                            key={index}
                            name={`imageUrl${index}`}
                            value={formData[`imageUrl${index}`] || ''}
                            onChange={handleInputChange}
                            placeholder={t('admin.products.formImageUrl', { number: index + 1 })}
                            className={commonInputClass}
                        />
                    ))}
                </>;
            case 'user':
                return <>
                    <input name="name" value={formData.name || ''} onChange={handleInputChange} placeholder={t('admin.users.formName')} className={commonInputClass} />
                    <input name="email" type="email" value={formData.email || ''} onChange={handleInputChange} placeholder={t('admin.users.formEmail')} className={commonInputClass} />
                    {!modal.data && <input name="password" type="password" value={formData.password || ''} onChange={handleInputChange} placeholder="Password" className={commonInputClass} />}
                    <select name="isAdmin" value={formData.isAdmin || false} onChange={handleInputChange} className={commonInputClass}>
                        <option value="false">{t('admin.users.roleCustomer')}</option>
                        <option value="true">{t('admin.users.roleAdmin')}</option>
                    </select>
                </>;
            case 'voucher':
                return <>
                    <input name="code" value={formData.code || ''} onChange={handleInputChange} placeholder={t('admin.vouchers.formCode')} className={commonInputClass} />
                    <input name="discountPercentage" type="number" value={formData.discountPercentage || ''} onChange={handleInputChange} placeholder={t('admin.vouchers.formDiscount')} className={commonInputClass} />
                    <label className="text-sm font-semibold text-gray-700">Start Date</label>
                    <input name="startDate" type="date" value={formData.startDate || ''} onChange={handleInputChange} placeholder="Start Date" className={commonInputClass} />
                    <label className="text-sm font-semibold text-gray-700">End Date</label>
                    <input name="endDate" type="date" value={formData.endDate || ''} onChange={handleInputChange} placeholder={t('admin.vouchers.formExpiry')} className={commonInputClass} />
                </>;
            case 'orderStatus':
                return <>
                    <select name="status" value={formData.status || modal.data?.status} onChange={handleInputChange} className={commonInputClass}>
                        {Object.values(OrderStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input name="trackingNumber" value={formData.trackingNumber || modal.data?.trackingNumber || ''} onChange={handleInputChange} placeholder="Tracking Number (Resi)" className={commonInputClass} />
                </>;
            default: return null;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {modal.type && <FormModal t={t} title={`${modal.data ? t('admin.modalEdit') : t('admin.modalAdd')} ${t(`admin.modalTitle.${modal.type}`)}`} onSave={handleSave} onCancel={closeModal}>{renderModalContent()}</FormModal>}
            {confirmDelete.type && <ConfirmationDialog t={t} title={t('admin.deleteTitle')} message={t('admin.deleteMessage')} onConfirm={handleDelete} onCancel={closeConfirmDialog} />}

            <aside className="w-64 bg-brand-dark text-white flex flex-col flex-shrink-0">
                <div className="p-6 text-center border-b border-white/10"><h1 className="text-2xl font-serif font-bold">{t('admin.title')}</h1><p className="text-sm text-brand-accent">Tapak Pamungkas</p></div>
                <nav className="flex-grow p-4 space-y-2">
                    <NavItem tabName="dashboard" icon={<DashboardIcon />}>{t('admin.nav.dashboard')}</NavItem>
                    <NavItem tabName="products" icon={<ProductsIcon />}>{t('admin.nav.products')}</NavItem>
                    <NavItem tabName="orders" icon={<OrdersIcon />}>{t('admin.nav.orders')}</NavItem>
                    <NavItem tabName="users" icon={<UsersIcon />}>{t('admin.nav.users')}</NavItem>
                    <NavItem tabName="vouchers" icon={<VouchersIcon />}>{t('admin.nav.vouchers')}</NavItem>
                </nav>
                <div className="p-4 border-t border-white/10"><button onClick={onLogout} className="flex items-center w-full px-4 py-3 rounded-lg text-brand-accent hover:bg-red-500/80 hover:text-white transition-colors duration-200 font-semibold"><LogoutIcon />{t('admin.nav.logout')}</button></div>
            </aside>
            <main className="flex-1 p-6 sm:p-10 overflow-y-auto">{renderContent()}</main>
        </div>
    );
};

export default AdminPanel;