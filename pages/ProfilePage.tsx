import React from 'react';
import { User } from '../types';
import { useTranslations } from '../hooks/useTranslations';

interface ProfilePageProps {
    user: User | null;
    onNavigate: (page: any) => void;
    onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onNavigate, onLogout }) => {
    const { t } = useTranslations();

    if (!user) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-serif font-bold text-brand-dark mb-4">Please log in to view your profile.</h2>
                <button
                    onClick={() => onNavigate('login')}
                    className="bg-brand-gold text-brand-dark font-bold py-2 px-6 rounded-md hover:bg-white transition-colors"
                >
                    Login
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-brand-dark py-6 px-8">
                    <h1 className="text-3xl font-serif font-bold text-white">My Profile</h1>
                </div>
                <div className="p-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="w-32 h-32 bg-brand-light rounded-full flex items-center justify-center text-4xl text-brand-primary font-serif font-bold border-4 border-brand-gold">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-grow space-y-4 text-center md:text-left">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider">Full Name</label>
                                <p className="text-xl font-semibold text-brand-dark">{user.name}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider">Email Address</label>
                                <p className="text-xl font-semibold text-brand-dark">{user.email}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider">Account Type</label>
                                <p className="text-lg text-brand-primary">{user.isAdmin ? 'Administrator' : 'Customer'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <button
                            onClick={() => onNavigate('orderHistory')}
                            className="flex items-center justify-center gap-3 p-6 bg-brand-light rounded-lg hover:bg-brand-gold/20 transition-colors border border-brand-accent/20 group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary group-hover:text-brand-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                            <span className="text-lg font-medium text-brand-dark">Order History</span>
                        </button>
                        <button
                            onClick={() => onNavigate('wishlist')}
                            className="flex items-center justify-center gap-3 p-6 bg-brand-light rounded-lg hover:bg-brand-gold/20 transition-colors border border-brand-accent/20 group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary group-hover:text-brand-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.662l1.318-1.344a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" />
                            </svg>
                            <span className="text-lg font-medium text-brand-dark">My Wishlist</span>
                        </button>
                    </div>

                    <div className="mt-12 pt-8 border-t border-gray-200 flex justify-end">
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
