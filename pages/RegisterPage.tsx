import React, { useState } from 'react';
import { Page, User } from '../types';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { cn } from '../lib/utils';
import { useTranslations } from '../hooks/useTranslations';
import { motion, AnimatePresence } from 'framer-motion';

// Fix: Add `children` prop to correctly type the component.
const LabelInputContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({
  children,
  className,
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};

const SpinnerIcon = () => (
    <svg className="animate-spin h-5 w-5 text-brand-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

interface RegisterPageProps {
    onRegister: (name: string, email: string, pass: string) => User | null;
    onNavigate: (page: Page) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onNavigate }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslations();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password.length < 6) {
            setError(t('register.errorPasswordLength'));
            return;
        }

        setIsLoading(true);
        // Simulate API call latency
        setTimeout(() => {
            const user = onRegister(name, email, password);
            setIsLoading(false);
            if (!user) {
                setError(t('register.errorGeneral'));
            }
        }, 1000);
    };

    return (
        <div 
            className="min-h-screen w-full relative flex items-center justify-center p-4 bg-brand-dark bg-cover bg-center"
            style={{backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-wood.png')"}}
        >
            <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-brand-dark [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

            <div className="mx-auto w-full max-w-md rounded-2xl bg-brand-dark/80 backdrop-blur-sm p-4 md:p-8 z-10 border border-brand-gold/30 shadow-2xl shadow-brand-gold/10">
                 <a onClick={() => onNavigate('home')} className="flex justify-center items-center cursor-pointer mb-6">
                    <img src="https://files.catbox.moe/z44d2s.png" alt="Tapak Pamungkas Logo" className="h-12" />
                </a>
                <h2 className="text-xl font-bold text-white font-serif">
                    {t('register.title')}
                </h2>
                <p className="mt-2 max-w-sm text-sm text-brand-accent">
                    {t('register.subtitle')}
                </p>

                <form className="my-8" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-900/40 border border-red-500/30 text-red-200 p-3 rounded-md text-center text-sm mb-4">
                            {error}
                        </div>
                    )}
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="name" className="text-brand-accent">{t('register.nameLabel')}</Label>
                        <Input 
                            id="name" 
                            placeholder="Budi Santoso" 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required 
                            className="bg-brand-primary border-brand-secondary/50 text-brand-accent placeholder:text-brand-accent/60 focus:ring-brand-gold"
                        />
                    </LabelInputContainer>
                    <LabelInputContainer className="mb-4">
                        <Label htmlFor="email" className="text-brand-accent">{t('register.emailLabel')}</Label>
                         <Input 
                            id="email" 
                            placeholder="nama@email.com" 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            className="bg-brand-primary border-brand-secondary/50 text-brand-accent placeholder:text-brand-accent/60 focus:ring-brand-gold"
                        />
                    </LabelInputContainer>
                    <LabelInputContainer className="mb-8">
                        <Label htmlFor="password" className="text-brand-accent">{t('register.passwordLabel')}</Label>
                         <Input 
                            id="password" 
                            placeholder="••••••••" 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            className="bg-brand-primary border-brand-secondary/50 text-brand-accent placeholder:text-brand-accent/60 focus:ring-brand-gold"
                        />
                    </LabelInputContainer>
                    
                    <button
                      className="w-full h-10 rounded-md bg-brand-gold font-bold text-brand-dark transition-all duration-300 hover:bg-white hover:shadow-lg hover:shadow-brand-gold/20 flex items-center justify-center"
                      type="submit"
                      disabled={isLoading}
                    >
                      <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="spinner"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                            >
                                <SpinnerIcon />
                            </motion.div>
                        ) : (
                            <motion.span
                                key="text"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                            >
                                {t('register.registerButton')} &rarr;
                            </motion.span>
                        )}
                      </AnimatePresence>
                    </button>

                    <p className="mt-8 text-center text-sm text-brand-accent/80">
                        {t('register.hasAccount')}{' '}
                        <a onClick={() => onNavigate('login')} className="font-medium text-brand-gold hover:text-brand-accent cursor-pointer transition-colors">
                            {t('register.loginLink')}
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;