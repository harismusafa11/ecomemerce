import React from 'react';
import { User } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { User as UserIcon, ShoppingBag, Heart, ShieldCheck, LogOut, Ticket } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfilePageProps {
    user: User | null;
    onNavigate: (page: any) => void;
    onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onNavigate, onLogout }) => {
    const { t } = useTranslations();

    if (!user) {
        return (
            <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center p-4">
                <div className="glass-panel p-8 rounded-3xl border border-amber-500/20 text-center max-w-sm">
                    <UserIcon className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                    <h2 className="text-xl font-serif font-bold mb-2">Silakan Masuk Terlebih Dahulu</h2>
                    <p className="text-xs text-stone-400 mb-6 font-mono">
                        Login untuk mengakses profil dan riwayat pemaharan Anda.
                    </p>
                    <button
                        onClick={() => onNavigate('login')}
                        className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-bold rounded-xl text-xs uppercase gold-glow"
                    >
                        Masuk Akun
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-950 text-stone-100 py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-panel rounded-3xl border border-amber-500/30 overflow-hidden shadow-2xl"
                >
                    {/* Header Banner */}
                    <div className="bg-stone-900/80 p-8 border-b border-stone-800 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400">Akun Terverifikasi</span>
                            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-100 mt-1">Profil Pelanggan</h1>
                        </div>
                        {user.isAdmin && (
                            <button
                                onClick={() => onNavigate('adminPanel')}
                                className="px-4 py-2 bg-amber-500/15 border border-amber-500/40 text-amber-400 rounded-xl text-xs font-mono font-bold hover:bg-amber-500 hover:text-stone-950 transition-all flex items-center gap-1.5"
                            >
                                <ShieldCheck className="w-4 h-4" /> Executive Admin Dashboard
                            </button>
                        )}
                    </div>

                    <div className="p-8 space-y-8">
                        {/* User Details */}
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-stone-950 font-serif font-black text-4xl flex items-center justify-center shadow-xl border-2 border-stone-950 gold-glow flex-shrink-0">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="space-y-3 text-center sm:text-left flex-1">
                                <div>
                                    <span className="text-[10px] font-mono text-stone-500 uppercase block">Nama Lengkap</span>
                                    <p className="text-lg font-serif font-bold text-stone-100">{user.name}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-mono text-stone-500 uppercase block">Email Terdaftar</span>
                                    <p className="text-sm font-mono text-stone-300">{user.email}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-mono text-stone-500 uppercase block">Peran Keanggotaan</span>
                                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[10px] font-mono font-bold">
                                        {user.isAdmin ? 'Executive Administrator' : 'Pemahar Terverifikasi'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Navigation Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button
                                onClick={() => onNavigate('orderHistory')}
                                className="glass-panel p-5 rounded-2xl border border-stone-800 hover:border-amber-500/40 text-left transition-all group"
                            >
                                <ShoppingBag className="w-6 h-6 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                                <h4 className="font-serif font-bold text-stone-100 text-sm">Riwayat Belanja</h4>
                                <p className="text-[10px] text-stone-400 font-mono mt-1">Cek status & resi order</p>
                            </button>

                            <button
                                onClick={() => onNavigate('wishlist')}
                                className="glass-panel p-5 rounded-2xl border border-stone-800 hover:border-rose-500/40 text-left transition-all group"
                            >
                                <Heart className="w-6 h-6 text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
                                <h4 className="font-serif font-bold text-stone-100 text-sm">Wishlist Saya</h4>
                                <p className="text-[10px] text-stone-400 font-mono mt-1">Item pusaka impian</p>
                            </button>

                            <button
                                onClick={() => onNavigate('vouchers')}
                                className="glass-panel p-5 rounded-2xl border border-stone-800 hover:border-emerald-500/40 text-left transition-all group"
                            >
                                <Ticket className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                                <h4 className="font-serif font-bold text-stone-100 text-sm">Kupon Promo</h4>
                                <p className="text-[10px] text-stone-400 font-mono mt-1">Voucher diskon mahar</p>
                            </button>
                        </div>

                        {/* Logout Section */}
                        <div className="pt-6 border-t border-stone-800 flex justify-end">
                            <button
                                onClick={onLogout}
                                className="px-5 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white font-mono text-xs font-bold transition-all flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" /> Keluar dari Akun
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProfilePage;
