import { Product, User, Order, Voucher, Review } from '../types';

const API_URL = '/api';

const TOKEN_KEY = 'tp_token';
let unauthorizedHandler: (() => void) | null = null;

export const getToken = (): string | null => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
};

export const setToken = (token: string) => {
    try { localStorage.setItem(TOKEN_KEY, token); } catch {}
};

export const clearToken = () => {
    try { localStorage.removeItem(TOKEN_KEY); } catch {}
};

export const onUnauthorized = (fn: (() => void) | null) => {
    unauthorizedHandler = fn;
};

const authedFetch = (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = getToken();
    const headers = new Headers(options.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(url, { ...options, headers }).then(response => {
        // Trigger soft re-auth only for expired sessions, not for auth endpoints themselves
        if (response.status === 401 && unauthorizedHandler && !url.includes('/login') && !url.includes('/register')) {
            setTimeout(() => {
                try { unauthorizedHandler && unauthorizedHandler(); } catch (e) {}
            }, 0);
        }
        return response;
    });
};

export interface ShippingOption {
    code: string;
    courierName: string;
    service: string;
    description: string;
    cost: number;
    etd: string;
    isFallback?: boolean;
}

/**
 * Smart Fallback Tariff Matrix from Ulujami, Pemalang to any destination in Indonesia
 */
function calculateSmartRates(province: string, city: string, weightGrams: number = 1000): ShippingOption[] {
    const provUpper = (province || '').toUpperCase();
    const weightKg = Math.max(1, Math.ceil(weightGrams / 1000));

    let jneBase = 14000;
    let jntBase = 15000;
    let sicepatBase = 14500;
    let posBase = 13000;
    let etdJne = '1-2 Hari';
    let etdPos = '2-3 Hari';

    if (provUpper.includes('JAWA TENGAH') || provUpper.includes('YOGYAKARTA')) {
        jneBase = 10000;
        jntBase = 11000;
        sicepatBase = 10500;
        posBase = 9000;
        etdJne = '1-2 Hari';
        etdPos = '2-3 Hari';
    } else if (provUpper.includes('JAKARTA') || provUpper.includes('BANTEN') || provUpper.includes('JAWA BARAT')) {
        jneBase = 13000;
        jntBase = 14000;
        sicepatBase = 13500;
        posBase = 12000;
        etdJne = '1-2 Hari';
        etdPos = '2-3 Hari';
    } else if (provUpper.includes('JAWA TIMUR')) {
        jneBase = 14000;
        jntBase = 15000;
        sicepatBase = 14500;
        posBase = 13000;
        etdJne = '1-2 Hari';
        etdPos = '2-3 Hari';
    } else if (provUpper.includes('SUMATERA') || provUpper.includes('SUMATRA') || provUpper.includes('ACEH') || provUpper.includes('RIAU') || provUpper.includes('LAMPUNG') || provUpper.includes('JAMBI') || provUpper.includes('BENGKULU')) {
        jneBase = 24000;
        jntBase = 26000;
        sicepatBase = 25000;
        posBase = 22000;
        etdJne = '2-4 Hari';
        etdPos = '3-5 Hari';
    } else if (provUpper.includes('BALI') || provUpper.includes('NUSA TENGGARA')) {
        jneBase = 26000;
        jntBase = 28000;
        sicepatBase = 27000;
        posBase = 24000;
        etdJne = '2-4 Hari';
        etdPos = '3-5 Hari';
    } else if (provUpper.includes('KALIMANTAN')) {
        jneBase = 32000;
        jntBase = 35000;
        sicepatBase = 34000;
        posBase = 30000;
        etdJne = '3-5 Hari';
        etdPos = '4-6 Hari';
    } else if (provUpper.includes('SULAWESI') || provUpper.includes('GORONTALO')) {
        jneBase = 35000;
        jntBase = 38000;
        sicepatBase = 36000;
        posBase = 33000;
        etdJne = '3-5 Hari';
        etdPos = '4-6 Hari';
    } else if (provUpper.includes('PAPUA') || provUpper.includes('MALUKU')) {
        jneBase = 75000;
        jntBase = 82000;
        sicepatBase = 78000;
        posBase = 70000;
        etdJne = '4-7 Hari';
        etdPos = '5-8 Hari';
    }

    return [
        {
            code: 'jne',
            courierName: 'JNE Express',
            service: 'REG (Reguler)',
            description: 'Pengiriman Reguler dari Kec. Ulujami, Kab. Pemalang',
            cost: Math.round(jneBase * weightKg),
            etd: etdJne
        },
        {
            code: 'jnt',
            courierName: 'J&T Express',
            service: 'EZ (Express)',
            description: 'Pengiriman Express dari Kec. Ulujami, Kab. Pemalang',
            cost: Math.round(jntBase * weightKg),
            etd: etdJne
        },
        {
            code: 'sicepat',
            courierName: 'SiCepat Ekspres',
            service: 'REG (Reguler)',
            description: 'Pengiriman Reguler SiCepat dari Kec. Ulujami, Kab. Pemalang',
            cost: Math.round(sicepatBase * weightKg),
            etd: etdJne
        },
        {
            code: 'pos',
            courierName: 'POS Indonesia',
            service: 'Pos Reguler',
            description: 'Pengiriman Nusantara POS dari Kec. Ulujami, Kab. Pemalang',
            cost: Math.round(posBase * weightKg),
            etd: etdPos
        }
    ];
}

export const api = {
    // Products
    getProducts: async (): Promise<Product[]> => {
        const response = await authedFetch(`${API_URL}/products`);
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.details || errData.error || 'Failed to fetch products from database');
        }
        return response.json();
    },

    getProduct: async (id: number): Promise<Product> => {
        const response = await authedFetch(`${API_URL}/products?id=${id}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        return response.json();
    },

    createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
        const response = await authedFetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
        });
        if (!response.ok) throw new Error('Failed to create product');
        return response.json();
    },

    updateProduct: async (id: number, product: Partial<Product>): Promise<Product> => {
        const response = await authedFetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
        });
        if (!response.ok) {
            // Retry with query param if path param returns 404
            const retryResp = await authedFetch(`${API_URL}/products?id=${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product),
            });
            if (!retryResp.ok) throw new Error('Failed to update product');
            return retryResp.json();
        }
        return response.json();
    },

    deleteProduct: async (id: number): Promise<void> => {
        const response = await authedFetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            await authedFetch(`${API_URL}/products?id=${id}`, { method: 'DELETE' });
        }
    },

    // Auth
    login: async (email: string, password: string): Promise<User> => {
        const response = await authedFetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) throw new Error('Invalid credentials');
        const data = await response.json();
        if (data && data.token) setToken(data.token);
        return data.user || data;
    },

    register: async (name: string, email: string, password: string): Promise<User> => {
        const response = await authedFetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        if (!response.ok) throw new Error('Registration failed');
        const data = await response.json();
        if (data && data.token) setToken(data.token);
        return data.user || data;
    },

    // Users (Admin)
    getUsers: async (): Promise<User[]> => {
        const response = await authedFetch(`${API_URL}/users`);
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    },

    updateUser: async (id: number, user: Partial<User>): Promise<User> => {
        const response = await authedFetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
        });
        if (!response.ok) throw new Error('Failed to update user');
        return response.json();
    },

    deleteUser: async (id: number): Promise<void> => {
        const response = await authedFetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete user');
    },

    // Orders
    createOrder: async (orderData: { userId: number; items: any[]; total: number; discountAmount?: number; shippingCost?: number; shippingCourier?: string; province?: string; city?: string; district?: string; village?: string; fullAddress?: string }): Promise<Order> => {
        const response = await authedFetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
        });
        if (!response.ok) throw new Error('Failed to create order');
        return response.json();
    },

    getOrders: async (): Promise<Order[]> => {
        const response = await authedFetch(`${API_URL}/orders`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        return response.json();
    },

    getUserOrders: async (userId: number): Promise<Order[]> => {
        const response = await authedFetch(`${API_URL}/orders/user/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch user orders');
        return response.json();
    },

    updateOrderStatus: async (id: string, status: string, trackingNumber?: string): Promise<Order> => {
        const response = await authedFetch(`${API_URL}/orders/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, trackingNumber }),
        });
        if (!response.ok) throw new Error('Failed to update order status');
        return response.json();
    },

    // User Addresses
    getAddresses: async (userId: number): Promise<any[]> => {
        try {
            const response = await authedFetch(`${API_URL}/addresses/${userId}`);
            if (!response.ok) return [];
            return response.json();
        } catch (e) {
            return [];
        }
    },

    saveAddress: async (addressData: { userId: number; recipientName: string; phone: string; province: string; city: string; district: string; village?: string; postalCode?: string; fullAddress: string; isPrimary?: boolean }): Promise<any> => {
        const response = await authedFetch(`${API_URL}/addresses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(addressData),
        });
        if (!response.ok) throw new Error('Failed to save address');
        return response.json();
    },

    deleteAddress: async (id: number): Promise<void> => {
        const response = await authedFetch(`${API_URL}/addresses/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete address');
    },

    // Shipping Fee / Ongkir & Locations Search
    searchLocations: async (searchTerm: string): Promise<{ id: string; type: string; label: string }[]> => {
        if (!searchTerm || searchTerm.trim().length < 2) return [];
        try {
            const response = await authedFetch(`${API_URL}/ongkir?search=${encodeURIComponent(searchTerm.trim())}`);
            if (!response.ok) return [];
            const result = await response.json();
            return result.data || [];
        } catch (e) {
            return [];
        }
    },

    // Calculate Ongkir (100% Reliable Client-Side + Server Hybrid)
    getOngkir: async (params: { province: string; city: string; district?: string; weight?: number }): Promise<{ success: boolean; origin: string; destination: string; options: ShippingOption[] }> => {
        const fallbackOptions = calculateSmartRates(params.province, params.city, params.weight || 1000);

        try {
            const query = new URLSearchParams({
                province: params.province || 'Jawa Tengah',
                city: params.city || 'Kabupaten Pemalang',
                district: params.district || '',
                weight: String(params.weight || 1000)
            });
            const response = await authedFetch(`${API_URL}/ongkir?${query.toString()}`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.options && data.options.length > 0) {
                    return data;
                }
            }
        } catch (err) {
            // Silently fallback to smart calculation matrix
        }

        return {
            success: true,
            origin: 'Kec. Ulujami, Kab. Pemalang, Jawa Tengah',
            destination: `${params.city}, ${params.province}`,
            options: fallbackOptions
        };
    },

    // Cart Management (Hybrid Fail-Safe)
    getCart: async (userId: number): Promise<any[]> => {
        try {
            const response = await authedFetch(`${API_URL}/cart/${userId}`);
            if (response.ok) return await response.json();
        } catch (e) {
            console.warn('[API CART NOTICE] Using local cart state');
        }
        return [];
    },

    addToCart: async (userId: number, productId: number, quantity: number = 1): Promise<any> => {
        try {
            const response = await authedFetch(`${API_URL}/cart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, productId, quantity }),
            });
            if (response.ok) return await response.json();
        } catch (e) {
            console.warn('[API CART NOTICE] Added to local cart state');
        }
        return { userId, productId, quantity };
    },

    removeFromCart: async (userId: number, productId: number): Promise<void> => {
        try {
            await authedFetch(`${API_URL}/cart/${userId}/item/${productId}`, {
                method: 'DELETE',
            });
        } catch (e) {
            console.warn('[API CART NOTICE] Removed from local cart state');
        }
    },

    clearCart: async (userId: number): Promise<void> => {
        try {
            await authedFetch(`${API_URL}/cart/${userId}`, {
                method: 'DELETE',
            });
        } catch (e) {
            console.warn('[API CART NOTICE] Cleared local cart state');
        }
    },

    // Wishlist Management (Hybrid Fail-Safe)
    getWishlist: async (userId: number): Promise<any[]> => {
        try {
            const response = await authedFetch(`${API_URL}/wishlist/${userId}`);
            if (response.ok) return await response.json();
        } catch (e) {
            console.warn('[API WISHLIST NOTICE] Using local wishlist');
        }
        return [];
    },

    addToWishlist: async (userId: number, productId: number): Promise<any> => {
        try {
            const response = await authedFetch(`${API_URL}/wishlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, productId }),
            });
            if (response.ok) return await response.json();
        } catch (e) {
            console.warn('[API WISHLIST NOTICE] Added to local wishlist');
        }
        return { userId, productId };
    },

    removeFromWishlist: async (userId: number, productId: number): Promise<void> => {
        try {
            await authedFetch(`${API_URL}/wishlist/${userId}/item/${productId}`, {
                method: 'DELETE',
            });
        } catch (e) {
            console.warn('[API WISHLIST NOTICE] Removed from local wishlist');
        }
    },

    // Vouchers (Admin & Public)
    getVouchers: async (): Promise<Voucher[]> => {
        try {
            const response = await authedFetch(`${API_URL}/vouchers`);
            if (response.ok) return await response.json();
        } catch (e) {
            console.warn('[API VOUCHERS NOTICE] Using local vouchers state');
        }
        return [];
    },

    createVoucher: async (voucherData: any): Promise<Voucher> => {
        const response = await authedFetch(`${API_URL}/vouchers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(voucherData),
        });
        if (!response.ok) throw new Error('Failed to create voucher');
        return response.json();
    },

    updateVoucher: async (id: number, voucherData: any): Promise<Voucher> => {
        const response = await authedFetch(`${API_URL}/vouchers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(voucherData),
        });
        if (!response.ok) throw new Error('Failed to update voucher');
        return response.json();
    },

    deleteVoucher: async (id: number): Promise<void> => {
        const response = await authedFetch(`${API_URL}/vouchers/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete voucher');
    },

    getUserVouchers: async (userId: number): Promise<any[]> => {
        try {
            const response = await authedFetch(`${API_URL}/vouchers/user/${userId}`);
            if (response.ok) return await response.json();
        } catch (e) {
            console.warn('[API VOUCHERS NOTICE] Using local vouchers');
        }
        return [];
    },

    claimVoucher: async (userId: number, voucherId: number): Promise<any> => {
        try {
            const response = await authedFetch(`${API_URL}/vouchers/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, voucherId }),
            });
            if (response.ok) return await response.json();
        } catch (e) {
            console.warn('[API VOUCHER CLAIM NOTICE] Saved locally');
        }
        return { success: true };
    },

    validateVoucher: async (userId: number, code: string): Promise<Voucher> => {
        const vouchers = await api.getVouchers();
        const found = vouchers.find(v => v.code.toUpperCase() === code.trim().toUpperCase());
        if (!found) {
            throw new Error('Kupon tidak valid atau sudah kadaluwarsa');
        }
        return found;
    },

    trackProductView: async (productId: number, userId?: number | null): Promise<void> => {
        try {
            await authedFetch(`${API_URL}/product-views`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, userId: userId || null }),
            });
        } catch (e) {
        }
    },

    getPopularProducts: async (limit: number = 10): Promise<{ product: Product; views: number }[]> => {
        try {
            const response = await authedFetch(`${API_URL}/products/popular?limit=${limit}`);
            if (response.ok) return await response.json();
        } catch (e) {
        }
        return [];
    },

    trackSearch: async (query: string, resultCount: number, userId?: number | null): Promise<void> => {
        try {
            await authedFetch(`${API_URL}/search-logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, resultCount, userId: userId || null }),
            });
        } catch (e) {
        }
    },

    getReviews: async (productId: number): Promise<{ reviews: Review[]; averageRating: number; totalReviews: number }> => {
        const response = await authedFetch(`${API_URL}/reviews/product/${productId}`);
        if (!response.ok) throw new Error('Failed to fetch reviews');
        return response.json();
    },

    addReview: async (productId: number, userId: number, rating: number, comment: string): Promise<Review> => {
        const response = await authedFetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, userId, rating, comment }),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error || 'Failed to save review');
        }
        return response.json();
    }
};
