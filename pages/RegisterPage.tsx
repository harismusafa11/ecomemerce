import React, { useState } from 'react';
import { Page, User } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { motion } from 'framer-motion';
import { User as UserIcon, Mail, Lock, ArrowRight } from 'lucide-react';

interface RegisterPageProps {
    onRegister: (name: string, email: string, pass: string) => Promise<User | null> | User | null;
    onNavigate: (page: Page) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onNavigate }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslations();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError(t('register.errorPasswordLength'));
            return;
        }

        setIsLoading(true);
        try {
            const user = await onRegister(name.trim(), email.trim(), password);
            setIsLoading(false);
            if (!user) {
                setError(t('register.errorGeneral'));
            }
        } catch (err) {
            setIsLoading(false);
            setError(t('register.errorGeneral'));
        }
    };

    return (
        <div className="min-h-screen w-full relative flex items-center justify-center p-4 bg-stone-950 text-stone-100 overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[130px] pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md glass-panel p-8 rounded-3xl border border-amber-500/30 shadow-2xl z-10 relative"
            >
                <div className="text-center mb-8">
                    <a onClick={() => onNavigate('home')} className="inline-block cursor-pointer group mb-3">
                        <img src="https://files.catbox.moe/z44d2s.png" alt="Tapak Pamungkas" className="h-12 w-12 mx-auto rounded-full border border-amber-500/40 group-hover:scale-110 transition-transform" />
                    </a>
                    <h2 className="text-2xl font-serif font-bold text-stone-100">
                        Pendaftaran Anggota
                    </h2>
                    <p className="mt-1 text-xs font-mono text-stone-400">
                        Buat akun untuk memulai pemaharan pusaka otentik
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-mono text-stone-400 mb-1">Nama Lengkap</label>
                        <div className="relative">
                            <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Budi Santoso"
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-stone-400 mb-1">Alamat Email</label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nama@email.com"
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-stone-400 mb-1">Kata Sandi (Minimal 6 Karakter)</label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-100 text-xs focus:outline-none focus:border-amber-500"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 px-6 rounded-xl font-bold text-stone-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 transition-all shadow-xl gold-glow text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                        <span>{isLoading ? 'Memproses...' : 'Daftar Akun Baru'}</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                <div className="mt-6 text-center text-xs font-mono text-stone-400">
                    <span>Sudah memiliki akun? </span>
                    <button
                        onClick={() => onNavigate('login')}
                        className="text-amber-400 hover:text-amber-300 font-bold hover:underline"
                    >
                        Masuk Ke Akun
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;