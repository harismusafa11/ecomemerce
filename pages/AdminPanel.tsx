import React, { useState, useEffect, useMemo } from 'react';
import { Product, Order, User, Voucher, OrderStatus } from '../types';
import Pagination from '../components/ui/Pagination';
import { useTranslations } from '../hooks/useTranslations';
import { api } from '../services/api';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Ticket,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  X,
  Filter,
  ShieldCheck,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ITEMS_PER_PAGE_ADMIN = 10;

// --- MULTI-IMAGE UPLOADER & PREVIEW COMPONENT ---
import { getOptimoleUrl, compressLocalImage } from '../services/optimoleService';

// --- MULTI-IMAGE UPLOADER & PREVIEW COMPONENT (LOCAL DEVICE + OPTIMOLE CDN) ---
const ImageUploaderPreview: React.FC<{
  imageUrls: string[];
  onChange: (urls: string[]) => void;
}> = ({ imageUrls, onChange }) => {
  const [newUrl, setNewUrl] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);

  const handleAddUrl = () => {
    if (newUrl.trim() && imageUrls.length < 7) {
      const optimized = getOptimoleUrl(newUrl.trim());
      onChange([...imageUrls, optimized]);
      setNewUrl('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    try {
      const newUploadedUrls: string[] = [];
      for (let i = 0; i < Math.min(files.length, 7 - imageUrls.length); i++) {
        const file = files[i];
        const compressedDataUrl = await compressLocalImage(file);
        const optimizedUrl = getOptimoleUrl(compressedDataUrl);
        newUploadedUrls.push(optimizedUrl);
      }
      onChange([...imageUrls, ...newUploadedUrls]);
    } catch (err) {
      console.error('File compression error:', err);
    } finally {
      setIsCompressing(false);
      e.target.value = '';
    }
  };

  const handleRemoveUrl = (index: number) => {
    const updated = imageUrls.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-xs font-mono font-semibold uppercase text-stone-400">
          Foto Produk ({imageUrls.length}/7 Foto)
        </label>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          ⚡ Optimole CDN WebP Active
        </span>
      </div>

      {/* Grid of uploaded thumbnail previews */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {imageUrls.map((url, idx) => (
          <div key={idx} className="relative aspect-square rounded-lg bg-stone-900 border border-stone-700 overflow-hidden group">
            <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemoveUrl(idx)}
              className="absolute top-1 right-1 p-1 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
            {idx === 0 && (
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-amber-500 text-[9px] font-bold text-stone-950">
                Sampul
              </span>
            )}
          </div>
        ))}
      </div>

      {imageUrls.length < 7 && (
        <div className="space-y-2">
          {/* File Picker from Local Device */}
          <label className="w-full py-2.5 px-4 rounded-xl bg-stone-900 border border-dashed border-amber-500/50 hover:border-amber-400 hover:bg-stone-800 transition-all text-stone-200 text-xs flex items-center justify-center gap-2 cursor-pointer group shadow-sm">
            <ImageIcon className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-amber-300">
              {isCompressing ? 'Memproses & Kompresi Gambar...' : '📁 Pilih Gambar dari Perangkat (Local Device)'}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={isCompressing}
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Paste URL Input Alternative */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="Atau Tempel URL Gambar (https://...)"
              className="flex-1 px-3 py-2 text-xs bg-stone-900 border border-stone-800 rounded-lg text-stone-100 focus:outline-none focus:border-amber-500"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-lg transition-all border border-stone-700"
            >
              Tambah URL
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- FORM MODAL COMPONENT ---
const FormModal: React.FC<{
  title: string;
  children: React.ReactNode;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  t: any;
}> = ({ title, children, onSave, onCancel, isSaving, t }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-panel border border-amber-500/30 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden text-stone-100"
    >
      <div className="p-5 border-b border-stone-800 flex justify-between items-center bg-stone-950/50">
        <h3 className="text-xl font-serif font-bold text-amber-400">{title}</h3>
        <button onClick={onCancel} disabled={isSaving} className="text-stone-400 hover:text-stone-200 p-1">
          <X className="w-5 h-5" />
        </button>
      </div>
      <div className="p-6 space-y-4 overflow-y-auto">{children}</div>
      <div className="p-5 border-t border-stone-800 bg-stone-950/80 flex justify-end space-x-3 mt-auto">
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 text-xs font-semibold text-stone-300 border border-stone-700 rounded-lg hover:bg-stone-800 disabled:opacity-50"
        >
          {t('admin.modalCancel')}
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-5 py-2 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg shadow-md gold-glow disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-stone-950 border-t-transparent rounded-full animate-spin"></div>
              <span>Menyimpan...</span>
            </>
          ) : (
            t('admin.modalSave')
          )}
        </button>
      </div>
    </motion.div>
  </div>
);

// --- CONFIRMATION DIALOG COMPONENT ---
const ConfirmationDialog: React.FC<{
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  t: any;
}> = ({ title, message, onConfirm, onCancel, t }) => (
  <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div className="glass-panel border border-rose-500/30 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden text-stone-100">
      <div className="p-6">
        <div className="w-12 h-12 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-serif font-bold text-stone-100">{title}</h3>
        <p className="mt-2 text-xs text-stone-400 leading-relaxed">{message}</p>
      </div>
      <div className="p-4 bg-stone-950/80 border-t border-stone-800 flex justify-end space-x-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-stone-300 border border-stone-700 rounded-lg hover:bg-stone-800"
        >
          {t('admin.modalCancel')}
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-md"
        >
          {t('admin.deleteConfirm')}
        </button>
      </div>
    </div>
  </div>
);

// --- PAYMENT PROOF LIGHTBOX MODAL ---
const PaymentProofModal: React.FC<{
  imageUrl: string | null;
  onClose: () => void;
  onApprove?: () => void;
}> = ({ imageUrl, onClose, onApprove }) => {
  if (!imageUrl) return null;
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="relative max-w-2xl w-full glass-panel border border-amber-500/40 rounded-2xl overflow-hidden p-6 flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-900 text-stone-300 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
        <h4 className="text-lg font-serif font-bold text-amber-400 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" /> Bukti Pembayaran Pelanggan
        </h4>
        <div className="max-h-[65vh] overflow-auto rounded-xl bg-stone-950 p-2 border border-stone-800 mb-4">
          <img src={imageUrl} alt="Bukti Transfer" className="max-w-full h-auto object-contain rounded-lg" />
        </div>
        <div className="flex gap-3 w-full justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-300 border border-stone-700 rounded-lg"
          >
            Tutup
          </button>
          {onApprove && (
            <button
              onClick={onApprove}
              className="px-5 py-2 text-xs font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg flex items-center gap-1.5 shadow-md"
            >
              <CheckCircle className="w-4 h-4" /> Verifikasi Lunas
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN ADMIN PANEL COMPONENT ---
const AdminPanel: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [productCurrentPage, setProductCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [viewPaymentProofUrl, setViewPaymentProofUrl] = useState<{ url: string; orderId: string } | null>(null);
  const [isSubmittingIndexNow, setIsSubmittingIndexNow] = useState(false);
  const [indexNowStatus, setIndexNowStatus] = useState('');

  const { t } = useTranslations();

  const [modal, setModal] = useState<{ type: string | null; data?: any }>({ type: null });
  const [confirmDelete, setConfirmDelete] = useState<{ type: string | null; id: any }>({ type: null, id: null });
  const [formData, setFormData] = useState<any>({});
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, ordersData, usersData, vouchersData] = await Promise.all([
          api.getProducts().catch(() => []),
          api.getOrders().catch(() => []),
          api.getUsers().catch(() => []),
          api.getVouchers().catch(() => [])
        ]);
        setProducts(productsData || []);
        setOrders(ordersData || []);
        setUsers(usersData || []);
        setVouchers(vouchersData || []);
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    const { name } = target;
    const value = target instanceof HTMLInputElement && target.type === 'checkbox' ? target.checked : target.value;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const openModal = (type: string, data?: any) => {
    let initialFormData = data ? { ...data } : {};
    let urls: string[] = [];

    if (data && data.imageUrls && Array.isArray(data.imageUrls)) {
      urls = [...data.imageUrls];
    } else if (data && data.imageUrls) {
      urls = [data.imageUrls];
    }

    if (type === 'product' && data && data.flashSaleEnd) {
      initialFormData.flashSaleEnd = new Date(data.flashSaleEnd).toISOString().slice(0, 16);
    }

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
    setImageUrls(urls);
  };

  const closeModal = () => setModal({ type: null });

  const openConfirmDialog = (type: string, id: any) => setConfirmDelete({ type, id });
  const closeConfirmDialog = () => setConfirmDelete({ type: null, id: null });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const showAdminToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async () => {
    const { type, data } = modal;

    if (type === 'orderStatus') {
      await handleOrderStatusChange(data.id, formData.status || data.status, formData.trackingNumber);
      return;
    }

    const finalData = { ...formData, imageUrls: imageUrls.length > 0 ? imageUrls : ['https://files.catbox.moe/z44d2s.png'] };

    setIsSaving(true);
    try {
      switch (type) {
        case 'product':
          const productPayload = {
            ...finalData,
            price: Number(finalData.price),
            stock: Number(finalData.stock),
            isFlashSale: Boolean(finalData.isFlashSale),
            flashSalePrice: finalData.flashSalePrice ? Number(finalData.flashSalePrice) : null,
            flashSaleEnd: finalData.flashSaleEnd ? new Date(finalData.flashSaleEnd).toISOString() : null
          };
          if (data) {
            const updatedProduct = await api.updateProduct(data.id, productPayload);
            setProducts(prev => prev.map(p => (p.id === data.id ? updatedProduct : p)));
            showAdminToast(`Produk "${updatedProduct.name}" berhasil diperbarui!`, 'success');
          } else {
            const newProduct = await api.createProduct(productPayload);
            setProducts(prev => [newProduct, ...prev]);
            showAdminToast(`Produk baru "${newProduct.name}" berhasil disimpan!`, 'success');
          }
          break;

        case 'user':
          if (data) {
            const updatedUser = await api.updateUser(data.id, formData);
            setUsers(prev => prev.map(u => (u.id === data.id ? updatedUser : u)));
            showAdminToast(`Data pengguna "${updatedUser.name}" berhasil disimpan!`, 'success');
          } else {
            const newUser = await api.register(formData.name, formData.email, formData.password || 'password123');
            if (formData.isAdmin === 'true' || formData.isAdmin === true) {
              const updated = await api.updateUser(newUser.id, { isAdmin: true });
              setUsers(prev => [updated, ...prev]);
            } else {
              setUsers(prev => [newUser, ...prev]);
            }
            showAdminToast(`Pengguna baru "${newUser.name}" berhasil ditambahkan!`, 'success');
          }
          break;

        case 'voucher':
          const voucherData = {
            code: formData.code,
            discountPercentage: Number(formData.discountPercentage),
            startDate: formData.startDate || new Date().toISOString().split('T')[0],
            endDate: formData.endDate,
          };

          if (data) {
            const updatedVoucher = await api.updateVoucher(data.id, voucherData);
            setVouchers(prev => prev.map(v => (v.id === data.id ? updatedVoucher : v)));
            showAdminToast(`Voucher "${updatedVoucher.code}" berhasil diperbarui!`, 'success');
          } else {
            const newVoucher = await api.createVoucher(voucherData);
            setVouchers(prev => [newVoucher, ...prev]);
            showAdminToast(`Voucher baru "${newVoucher.code}" berhasil disimpan!`, 'success');
          }
          break;
      }
      closeModal();
    } catch (error) {
      console.error("Failed to save", error);
      showAdminToast(`Gagal menyimpan data: ${error instanceof Error ? error.message : 'Kesalahan server'}`, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const { type, id } = confirmDelete;
    try {
      switch (type) {
        case 'product':
          await api.deleteProduct(id);
          setProducts(p => p.filter(item => item.id !== id));
          showAdminToast('Produk berhasil dihapus!', 'success');
          break;
        case 'order':
          setOrders(o => o.filter(item => item.id !== id));
          showAdminToast('Pesanan berhasil dihapus!', 'success');
          break;
        case 'user':
          await api.deleteUser(id);
          setUsers(u => u.filter(item => item.id !== id));
          showAdminToast('Pengguna berhasil dihapus!', 'success');
          break;
        case 'voucher':
          await api.deleteVoucher(id);
          setVouchers(v => v.filter(item => item.id !== id));
          showAdminToast('Voucher berhasil dihapus!', 'success');
          break;
      }
      closeConfirmDialog();
    } catch (error) {
      console.error("Failed to delete", error);
      showAdminToast('Gagal menghapus data', 'error');
    }
  };

  const handleOrderStatusChange = async (orderId: string, newStatus: OrderStatus, trackingNumber?: string) => {
    try {
      const updatedOrder = await api.updateOrderStatus(orderId, newStatus, trackingNumber);
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus, trackingNumber: updatedOrder.trackingNumber } : order
        )
      );
      closeModal();
    } catch (error) {
      console.error("Failed to update order status", error);
    }
  };

  const handleStockAdjust = async (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    try {
      const updated = await api.updateProduct(product.id, { stock: newStock });
      setProducts(prev => prev.map(p => (p.id === product.id ? updated : p)));
    } catch (err) {
      console.error("Failed stock adjust", err);
    }
  };

  // Nav Item Component
  const NavItem = ({ tabName, icon, label }: { tabName: string; icon: React.ReactNode; label: string }) => {
    const isActive = activeTab === tabName;
    return (
      <button
        onClick={() => setActiveTab(tabName)}
        className={`w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl font-medium text-xs tracking-wide transition-all ${
          isActive
            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold shadow-lg gold-glow'
            : 'text-stone-400 hover:bg-stone-900 hover:text-stone-200'
        }`}
      >
        {icon}
        <span className="hidden lg:inline">{label}</span>
      </button>
    );
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    if (orderStatusFilter === 'all') return orders;
    return orders.filter(o => o.status === orderStatusFilter);
  }, [orders, orderStatusFilter]);

  // Render main tab content
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
        const pendingCount = orders.filter(o => o.status === 'Pending Payment').length;
        const lowStockProducts = products.filter(p => p.stock <= 3);

        return (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-400">
                  Ringkasan Eksekutif
                </h2>
                <p className="text-xs font-mono text-stone-400 mt-1">
                  Pantau metrik penjualan, stok barang, dan aktivitas pesanan real-time.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={async () => {
                    try {
                      setIsSubmittingIndexNow(true);
                      setIndexNowStatus('Mengirim sinyal IndexNow ke Bing/Yandex...');
                      const res = await api.submitIndexNow();
                      setIndexNowStatus(`✅ Berhasil! ${res.submittedUrlsCount} URL dikirim ke IndexNow`);
                      showAdminToast(`Berhasil mengirim ${res.submittedUrlsCount} URL ke mesin pencari IndexNow!`, 'success');
                      setTimeout(() => setIndexNowStatus(''), 6000);
                    } catch (e) {
                      setIndexNowStatus('❌ Gagal mengirim IndexNow');
                      showAdminToast('Gagal mengirim sinyal IndexNow', 'error');
                      setTimeout(() => setIndexNowStatus(''), 6000);
                    } finally {
                      setIsSubmittingIndexNow(false);
                    }
                  }}
                  disabled={isSubmittingIndexNow}
                  className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 text-xs font-mono flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  title="Kirim seluruh URL sitemap & produk ke mesin pencari via IndexNow (Bing/Yandex/Seznam)"
                >
                  <TrendingUp className="w-4 h-4" />
                  {isSubmittingIndexNow ? 'Mengirim...' : '⚡ Kirim IndexNow Instant'}
                </button>
                <div className="px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Sistem Berjalan Normal
                </div>
              </div>
            </div>
            {indexNowStatus && (
              <div className="px-4 py-2 rounded-xl bg-stone-900 border border-emerald-500/30 text-xs font-mono text-emerald-400 animate-fadeIn">
                {indexNowStatus}
              </div>
            )}

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 flex flex-col justify-between">
                <div className="flex justify-between items-center text-stone-400 mb-3">
                  <span className="text-xs font-mono uppercase">Total Pendapatan</span>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold gold-gradient-text">
                    Rp {totalRevenue.toLocaleString('id-ID')}
                  </div>
                  <span className="text-[10px] text-stone-400 font-mono mt-1 block">Dari akumulasi seluruh order</span>
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 flex flex-col justify-between">
                <div className="flex justify-between items-center text-stone-400 mb-3">
                  <span className="text-xs font-mono uppercase">Total Pesanan</span>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-stone-100">
                    {orders.length} <span className="text-xs text-amber-400 font-mono font-normal">Order</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono mt-1 block">{pendingCount} menunggu konfirmasi</span>
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 flex flex-col justify-between">
                <div className="flex justify-between items-center text-stone-400 mb-3">
                  <span className="text-xs font-mono uppercase">Total Produk</span>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-stone-100">{products.length}</div>
                  <span className="text-[10px] text-rose-400 font-mono mt-1 block">{lowStockProducts.length} produk stok terbatas</span>
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 flex flex-col justify-between">
                <div className="flex justify-between items-center text-stone-400 mb-3">
                  <span className="text-xs font-mono uppercase">Total Pengguna</span>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-stone-100">{users.length}</div>
                  <span className="text-[10px] text-stone-400 font-mono mt-1 block">Pelanggan terdaftar</span>
                </div>
              </div>
            </div>

            {/* Visual Sales Graph & Low Stock Warning */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sales Chart Bar Simulation */}
              <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-amber-500/20">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base font-serif font-bold text-stone-100 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-400" /> Performa Penjualan Mingguan
                  </h3>
                  <span className="text-xs font-mono text-stone-400">7 Hari Terakhir</span>
                </div>

                <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-stone-800">
                  {['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Ming'].map((day, idx) => {
                    const heightPercent = [35, 60, 45, 80, 65, 95, 75][idx];
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                        <div className="w-full bg-stone-900 rounded-t-lg overflow-hidden relative h-full flex items-end">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            transition={{ duration: 0.8, delay: idx * 0.1 }}
                            className="w-full bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-lg group-hover:brightness-125 transition-all"
                          />
                        </div>
                        <span className="text-[10px] font-mono text-stone-400 group-hover:text-amber-400 transition-colors">
                          {day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Low Stock Warnings */}
              <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-serif font-bold text-stone-100 flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-rose-400" /> Peringatan Stok Menipis
                  </h3>

                  {lowStockProducts.length > 0 ? (
                    <div className="space-y-3">
                      {lowStockProducts.slice(0, 4).map(prod => (
                        <div key={prod.id} className="p-3 rounded-xl bg-stone-900/80 border border-stone-800 flex justify-between items-center">
                          <div className="flex items-center gap-2.5">
                            <img src={prod.imageUrls[0]} alt="" className="w-8 h-8 rounded-lg object-cover bg-stone-950" />
                            <div>
                              <p className="text-xs font-semibold text-stone-200 line-clamp-1">{prod.name}</p>
                              <span className="text-[10px] text-stone-400 font-mono">Sisa Stok: {prod.stock}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleStockAdjust(prod, 5)}
                            className="px-2.5 py-1 text-[10px] font-bold bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-stone-950 rounded-lg transition-all"
                          >
                            +5 Stok
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-emerald-400">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-80" />
                      Semua stok barang tercukupi dengan baik.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'products':
        const productTotalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE_ADMIN);
        const currentProducts = filteredProducts.slice(
          (productCurrentPage - 1) * ITEMS_PER_PAGE_ADMIN,
          productCurrentPage * ITEMS_PER_PAGE_ADMIN
        );

        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-400">
                  Manajemen Produk & Stok
                </h2>
                <p className="text-xs font-mono text-stone-400 mt-1">
                  Kelola item pusaka, update stok inline, dan atur galeri foto.
                </p>
              </div>

              <button
                onClick={() => openModal('product')}
                className="px-5 py-2.5 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg gold-glow flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" /> Tambah Produk Baru
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama produk atau kategori..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-stone-900 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Products Table */}
            <div className="glass-panel rounded-2xl overflow-hidden border border-amber-500/20">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-stone-950/80 uppercase font-mono text-[10px] text-amber-400 border-b border-stone-800">
                    <tr>
                      <th className="p-4">Produk</th>
                      <th className="p-4">Kategori</th>
                      <th className="p-4">Harga Tuah</th>
                      <th className="p-4">Stok Barang</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60">
                    {currentProducts.map(p => (
                      <tr key={p.id} className="hover:bg-stone-900/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.imageUrls[0] || 'https://via.placeholder.com/50'}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover bg-stone-950 border border-stone-800"
                            />
                            <div>
                              <p className="font-semibold text-stone-100">{p.name}</p>
                              <span className="text-[10px] text-stone-400 line-clamp-1">{p.description}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-mono text-[10px]">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-amber-300">
                          Rp {p.price.toLocaleString('id-ID')}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStockAdjust(p, -1)}
                              className="w-6 h-6 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold flex items-center justify-center text-xs"
                            >
                              -
                            </button>
                            <span className="font-mono font-bold px-2">{p.stock}</span>
                            <button
                              onClick={() => handleStockAdjust(p, 1)}
                              className="w-6 h-6 rounded bg-amber-500/20 hover:bg-amber-500 hover:text-stone-950 text-amber-400 font-bold flex items-center justify-center text-xs"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openModal('product', p)}
                              className="p-2 rounded-lg bg-stone-800 text-amber-400 hover:bg-amber-500 hover:text-stone-950 transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openConfirmDialog('product', p.id)}
                              className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-400">
                  Manajemen Pesanan & Verifikasi
                </h2>
                <p className="text-xs font-mono text-stone-400 mt-1">
                  Cek bukti transfer, ubah status pesanan, dan perbarui nomor resi pengiriman.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-stone-900 border border-stone-800">
                {['all', 'Pending Payment', 'Processing', 'Shipped', 'Delivered'].map(status => (
                  <button
                    key={status}
                    onClick={() => setOrderStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      orderStatusFilter === status
                        ? 'bg-amber-500 text-stone-950 font-bold'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {status === 'all' ? 'Semua' : status}
                  </button>
                ))}
              </div>
            </div>

            {/* Orders Table */}
            <div className="glass-panel rounded-2xl overflow-hidden border border-amber-500/20">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-stone-950/80 uppercase font-mono text-[10px] text-amber-400 border-b border-stone-800">
                    <tr>
                      <th className="p-4">ID Order</th>
                      <th className="p-4">Pelanggan</th>
                      <th className="p-4">Total Pemaharan</th>
                      <th className="p-4">Status Pesanan</th>
                      <th className="p-4">Bukti Transfer</th>
                      <th className="p-4">No. Resi</th>
                      <th className="p-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60">
                    {filteredOrders.map(o => {
                      const customer = users.find(u => u.id === o.userId);
                      return (
                        <tr key={o.id} className="hover:bg-stone-900/50 transition-colors">
                          <td className="p-4 font-mono font-bold text-amber-300">#{o.id}</td>
                          <td className="p-4">
                            <p className="font-semibold text-stone-100">{customer?.name || `User #${o.userId}`}</p>
                            <span className="text-[10px] text-stone-400 font-mono">{customer?.email}</span>
                          </td>
                          <td className="p-4 font-bold text-stone-100">
                            Rp {o.total.toLocaleString('id-ID')}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold ${
                                o.status === 'Delivered'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : o.status === 'Shipped'
                                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="p-4">
                            {o.paymentProofUrl ? (
                              <button
                                onClick={() => setViewPaymentProofUrl({ url: o.paymentProofUrl!, orderId: o.id })}
                                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-amber-500 hover:text-stone-950 text-amber-400 font-mono text-[10px] flex items-center gap-1 transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" /> Lihat Bukti
                              </button>
                            ) : (
                              <span className="text-[10px] text-stone-500 font-mono">-</span>
                            )}
                          </td>
                          <td className="p-4 font-mono text-stone-400">{o.trackingNumber || '-'}</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openModal('orderStatus', o)}
                                className="p-2 rounded-lg bg-stone-800 text-amber-400 hover:bg-amber-500 hover:text-stone-950 transition-all"
                                title="Update Status & Resi"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => openConfirmDialog('order', o.id)}
                                className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-400">
                  Manajemen Pengguna & Hak Akses
                </h2>
                <p className="text-xs font-mono text-stone-400 mt-1">
                  Kelola akun pengguna, berikan akses admin, atau tambah pengguna baru.
                </p>
              </div>

              <button
                onClick={() => openModal('user')}
                className="px-5 py-2.5 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg gold-glow flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" /> Tambah User
              </button>
            </div>

            <div className="glass-panel rounded-2xl overflow-x-auto border border-amber-500/20">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950/80 uppercase font-mono text-[10px] text-amber-400 border-b border-stone-800">
                  <tr>
                    <th className="p-4">Nama Lengkap</th>
                    <th className="p-4">Alamat Email</th>
                    <th className="p-4">Peran (Role)</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-stone-900/50 transition-colors">
                      <td className="p-4 font-semibold text-stone-100">{u.name}</td>
                      <td className="p-4 font-mono text-stone-400">{u.email}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                            u.isAdmin
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-stone-800 text-stone-400'
                          }`}
                        >
                          {u.isAdmin ? 'Executive Admin' : 'Pelanggan'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal('user', u)}
                            className="p-2 rounded-lg bg-stone-800 text-amber-400 hover:bg-amber-500 hover:text-stone-950 transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openConfirmDialog('user', u.id)}
                            className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'vouchers':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-amber-400">
                  Manajemen Kupon & Diskon
                </h2>
                <p className="text-xs font-mono text-stone-400 mt-1">
                  Buat kode promo diskon pemaharan dan atur masa berlaku kupon.
                </p>
              </div>

              <button
                onClick={() => openModal('voucher')}
                className="px-5 py-2.5 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-xl shadow-lg gold-glow flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" /> Buat Kupon Baru
              </button>
            </div>

            <div className="glass-panel rounded-2xl overflow-x-auto border border-amber-500/20">
              <table className="w-full text-left text-xs text-stone-300">
                <thead className="bg-stone-950/80 uppercase font-mono text-[10px] text-amber-400 border-b border-stone-800">
                  <tr>
                    <th className="p-4">Kode Promo</th>
                    <th className="p-4">Persentase Diskon</th>
                    <th className="p-4">Tanggal Berakhir</th>
                    <th className="p-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {vouchers.map(v => (
                    <tr key={v.id} className="hover:bg-stone-900/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-amber-400 text-sm">
                        <span className="px-2.5 py-1 rounded-lg bg-stone-900 border border-amber-500/30">
                          {v.code}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-emerald-400 font-mono">
                        {v.discountPercentage}% Potongan
                      </td>
                      <td className="p-4 font-mono text-stone-400">
                        {new Date(v.endDate).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal('voucher', v)}
                            className="p-2 rounded-lg bg-stone-800 text-amber-400 hover:bg-amber-500 hover:text-stone-950 transition-all"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openConfirmDialog('voucher', v.id)}
                            className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Render modal content dynamically
  const renderModalContent = () => {
    const inputClass =
      "w-full px-3.5 py-2.5 text-xs bg-stone-900 border border-stone-800 rounded-xl text-stone-100 focus:outline-none focus:border-amber-500";

    switch (modal.type) {
      case 'product':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-stone-400 mb-1">Nama Pusaka / Produk</label>
              <input
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                placeholder="Contoh: Keris Pusaka Kyai Sengkelat"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-stone-400 mb-1">Custom URL Slug (Opsional SEO)</label>
                <input
                  name="slug"
                  value={formData.slug || ''}
                  onChange={handleInputChange}
                  placeholder="Contoh: keris-pusaka-kyai-sengkelat"
                  className={inputClass}
                />
                <span className="text-[10px] text-stone-500 font-mono">Kosongkan untuk buat otomatis dari nama</span>
              </div>
              <div>
                <label className="block text-[11px] font-mono text-stone-400 mb-1">Kata Kunci SEO / Keywords (Opsional)</label>
                <input
                  name="keywords"
                  value={formData.keywords || ''}
                  onChange={handleInputChange}
                  placeholder="Contoh: keris sepuh, kyai sengkelat, pusaka bertuah"
                  className={inputClass}
                />
                <span className="text-[10px] text-stone-500 font-mono">Pisahkan dengan koma untuk Google SEO</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-stone-400 mb-1">Deskripsi & Tuah</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                placeholder="Jelaskan sejarah, tuah, dan fisik pusaka..."
                className={`${inputClass} h-24`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-stone-400 mb-1">Harga Pemaharan (Rp)</label>
                <input
                  name="price"
                  type="number"
                  value={formData.price || ''}
                  onChange={handleInputChange}
                  placeholder="5000000"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono text-stone-400 mb-1">Stok Barang</label>
                <input
                  name="stock"
                  type="number"
                  value={formData.stock || ''}
                  onChange={handleInputChange}
                  placeholder="1"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-stone-400 mb-1">Kategori Produk</label>
              <select
                name="category"
                value={formData.category || ''}
                onChange={handleInputChange}
                className={inputClass}
              >
                <option value="">-- Pilih Kategori --</option>
                <option value="Pusaka & Keris">Pusaka & Keris</option>
                <option value="Media Bertuah">Media Bertuah</option>
                <option value="Herbal & Keilmuan">Herbal & Keilmuan</option>
              </select>
            </div>

            {/* Flash Sale Toggle */}
            <div className="p-3 rounded-xl bg-gradient-to-r from-rose-500/10 via-orange-500/10 to-rose-500/10 border border-rose-500/30">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFlashSale"
                  checked={Boolean(formData.isFlashSale)}
                  onChange={handleInputChange}
                  className="w-4 h-4 accent-rose-500"
                />
                <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
                  🔥 Aktifkan Flash Sale (Diskon & Countdown)
                </span>
              </label>

              {formData.isFlashSale && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-[11px] font-mono text-stone-400 mb-1">Harga Flash Sale (Rp)</label>
                    <input
                      name="flashSalePrice"
                      type="number"
                      value={formData.flashSalePrice || ''}
                      onChange={handleInputChange}
                      placeholder="Lebih rendah dari harga normal"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-stone-400 mb-1">Berakhir Pada</label>
                    <input
                      name="flashSaleEnd"
                      type="datetime-local"
                      value={formData.flashSaleEnd || ''}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Multi image uploader preview */}
            <ImageUploaderPreview imageUrls={imageUrls} onChange={setImageUrls} />
          </div>
        );

      case 'user':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-stone-400 mb-1">Nama Lengkap</label>
              <input
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                placeholder="Nama Pengguna"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-stone-400 mb-1">Alamat Email</label>
              <input
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                placeholder="email@domain.com"
                className={inputClass}
              />
            </div>
            {!modal.data && (
              <div>
                <label className="block text-[11px] font-mono text-stone-400 mb-1">Kata Sandi</label>
                <input
                  name="password"
                  type="password"
                  value={formData.password || ''}
                  onChange={handleInputChange}
                  placeholder="Password123!"
                  className={inputClass}
                />
              </div>
            )}
            <div>
              <label className="block text-[11px] font-mono text-stone-400 mb-1">Hak Akses (Role)</label>
              <select
                name="isAdmin"
                value={formData.isAdmin || false}
                onChange={handleInputChange}
                className={inputClass}
              >
                <option value="false">Pelanggan</option>
                <option value="true">Executive Admin</option>
              </select>
            </div>
          </div>
        );

      case 'voucher':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-stone-400 mb-1">Kode Voucher / Diskon</label>
              <input
                name="code"
                value={formData.code || ''}
                onChange={handleInputChange}
                placeholder="Contoh: TAPAKPROMO10"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-stone-400 mb-1">Diskon (%)</label>
              <input
                name="discountPercentage"
                type="number"
                value={formData.discountPercentage || ''}
                onChange={handleInputChange}
                placeholder="10"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-stone-400 mb-1">Tanggal Mulai</label>
              <input
                name="startDate"
                type="date"
                value={formData.startDate || ''}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-stone-400 mb-1">Tanggal Berakhir</label>
              <input
                name="endDate"
                type="date"
                value={formData.endDate || ''}
                onChange={handleInputChange}
                className={inputClass}
              />
            </div>
          </div>
        );

      case 'orderStatus':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono text-stone-400 mb-1">Status Pesanan Baru</label>
              <select
                name="status"
                value={formData.status || modal.data?.status}
                onChange={handleInputChange}
                className={inputClass}
              >
                {Object.values(OrderStatus).map(s => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-mono text-stone-400 mb-1">Nomor Resi Pengiriman (Ekspedisi)</label>
              <input
                name="trackingNumber"
                value={formData.trackingNumber || modal.data?.trackingNumber || ''}
                onChange={handleInputChange}
                placeholder="Contoh: JNE123456789"
                className={inputClass}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-stone-950 text-stone-100 overflow-hidden font-sans">
      {/* Form Modals */}
      {modal.type && (
        <FormModal
          t={t}
          title={`${modal.data ? 'Edit' : 'Tambah'} ${modal.type}`}
          onSave={handleSave}
          onCancel={closeModal}
          isSaving={isSaving}
        >
          {renderModalContent()}
        </FormModal>
      )}

      {/* Confirmation Modal */}
      {confirmDelete.type && (
        <ConfirmationDialog
          t={t}
          title={t('admin.deleteTitle')}
          message={t('admin.deleteMessage')}
          onConfirm={handleDelete}
          onCancel={closeConfirmDialog}
        />
      )}

      {/* Payment Proof Lightbox Modal */}
      {viewPaymentProofUrl && (
        <PaymentProofModal
          imageUrl={viewPaymentProofUrl.url}
          onClose={() => setViewPaymentProofUrl(null)}
          onApprove={() => {
            handleOrderStatusChange(viewPaymentProofUrl.orderId, OrderStatus.Processing);
            setViewPaymentProofUrl(null);
          }}
        />
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border text-xs font-mono font-bold flex items-center gap-3 backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-950/95 border-emerald-500/50 text-emerald-200 shadow-emerald-950/50'
                : 'bg-rose-950/95 border-rose-500/50 text-rose-200 shadow-rose-950/50'
            }`}
          >
            <CheckCircle className={`w-5 h-5 ${toast.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`} />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 bg-stone-900/90 border-r border-stone-800 flex flex-col flex-shrink-0 z-20">
        <div className="p-4 lg:p-6 border-b border-stone-800">
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <img src="https://files.catbox.moe/z44d2s.png" alt="" className="h-9 w-9 rounded-full border border-amber-500/40 flex-shrink-0" />
            <div className="hidden lg:block">
              <h1 className="text-base font-serif font-bold gold-gradient-text">Tapak Pamungkas</h1>
              <p className="text-[10px] font-mono text-stone-400">Executive Control Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavItem tabName="dashboard" icon={<LayoutDashboard className="w-4 h-4" />} label="Overview Analytics" />
          <NavItem tabName="products" icon={<Package className="w-4 h-4" />} label="Kelola Produk & Stok" />
          <NavItem tabName="orders" icon={<ShoppingBag className="w-4 h-4" />} label="Pesanan & Bukti Bayar" />
          <NavItem tabName="users" icon={<Users className="w-4 h-4" />} label="Kelola Pengguna" />
          <NavItem tabName="vouchers" icon={<Ticket className="w-4 h-4" />} label="Kupon & Promo" />
        </nav>

        <div className="p-4 border-t border-stone-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center lg:justify-start gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors font-medium text-xs"
          >
            <LogOut className="w-4 h-4" /> <span className="hidden lg:inline">Keluar dari Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto bg-stone-950">{renderContent()}</main>
    </div>
  );
};

export default AdminPanel;