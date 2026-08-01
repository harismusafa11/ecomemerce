import React, { useState } from 'react';
import { Page, User } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { signIn } from '../lib/auth-client';

interface LoginPageProps {
    onLogin: (email: string, pass: string) => Promise<User | null> | User | null;
    onNavigate: (page: Page) => void;
    needsAdminAccess?: boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onNavigate, needsAdminAccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslations();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const user = await onLogin(email.trim(), password);
            setIsLoading(false);

            if (!user) {
                setError(t('login.errorIncorrect'));
            } else if (needsAdminAccess && !user.isAdmin) {
                setError(t('login.errorAdminAccess'));
            }
        } catch (err) {
            setIsLoading(false);
            setError(t('login.errorIncorrect'));
        }
    };

    const handleGoogleLogin = async () => {
        setError('');
        try {
            await signIn.social({
                provider: 'google',
                callbackURL: window.location.origin,
            });
        } catch (err) {
            console.error('Google Sign In Error:', err);
            setError('Gagal masuk dengan Google. Silakan coba lagi.');
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
                        {needsAdminAccess ? 'Executive Admin Portal' : 'Selamat Datang Kembali'}
                    </h2>
                    <p className="mt-1 text-xs font-mono text-stone-400">
                        {needsAdminAccess ? 'Masukan kredensial administrator' : 'Masuk untuk mengakses layanan pemaharan'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono text-center">
                            {error}
                        </div>
                    )}

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
                        <label className="block text-xs font-mono text-stone-400 mb-1">Kata Sandi</label>
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
                        <span>{isLoading ? 'Memuat...' : 'Masuk Sekarang'}</span>
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center gap-3">
                    <div className="flex-1 h-px bg-stone-800"></div>
                    <span className="text-[10px] font-mono text-stone-500 uppercase tracking-widest">Atau</span>
                    <div className="flex-1 h-px bg-stone-800"></div>
                </div>

                {/* Google Sign In Button */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full py-3 px-4 rounded-xl font-medium text-stone-200 bg-stone-900 border border-stone-800 hover:border-amber-500/50 hover:bg-stone-800 transition-all text-xs flex items-center justify-center gap-3 shadow-md group"
                >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                        <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z" />
                        <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z" />
                        <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
                    </svg>
                    <span>Masuk dengan Akun Google</span>
                </button>

                <div className="mt-6 text-center text-xs font-mono text-stone-400">
                    <span>Belum memiliki akun? </span>
                    <button
                        onClick={() => onNavigate('register')}
                        className="text-amber-400 hover:text-amber-300 font-bold hover:underline"
                    >
                        Daftar Akun Baru
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;