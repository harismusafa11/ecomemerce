import { Product, User, Order } from '../types';

const API_URL = '/api';

export const api = {
    // Products
    getProducts: async (): Promise<Product[]> => {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        return response.json();
    },

    getProduct: async (id: number): Promise<Product> => {
        const response = await fetch(`${API_URL}/products/${id}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        return response.json();
    },

    createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
        const response = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
        });
        if (!response.ok) throw new Error('Failed to create product');
        return response.json();
    },

    updateProduct: async (id: number, product: Partial<Product>): Promise<Product> => {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product),
        });
        if (!response.ok) throw new Error('Failed to update product');
        return response.json();
    },

    deleteProduct: async (id: number): Promise<void> => {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete product');
    },

    // Auth
    login: async (email: string, password: string): Promise<User> => {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) throw new Error('Invalid credentials');
        return response.json();
    },

    register: async (name: string, email: string, password: string): Promise<User> => {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        if (!response.ok) throw new Error('Registration failed');
        return response.json();
    },

    // Users (Admin)
    getUsers: async (): Promise<User[]> => {
        const response = await fetch(`${API_URL}/users`);
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    },

    updateUser: async (id: number, user: Partial<User>): Promise<User> => {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user),
        });
        if (!response.ok) throw new Error('Failed to update user');
        return response.json();
    },

    deleteUser: async (id: number): Promise<void> => {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete user');
    },

    // Orders
    createOrder: async (orderData: { userId: number; items: any[]; total: number }): Promise<Order> => {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
        });
        if (!response.ok) throw new Error('Failed to create order');
        return response.json();
    },

    getOrders: async (): Promise<Order[]> => {
        const response = await fetch(`${API_URL}/orders`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        return response.json();
    },

    getUserOrders: async (userId: number): Promise<Order[]> => {
        const response = await fetch(`${API_URL}/orders/user/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch user orders');
        return response.json();
    },

    updateOrderStatus: async (id: string, status: string, trackingNumber?: string): Promise<Order> => {
        const response = await fetch(`${API_URL}/orders/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status, trackingNumber }),
        });
        if (!response.ok) throw new Error('Failed to update order status');
        return response.json();
    },

    // Cart
    getCart: async (userId: number): Promise<any[]> => {
        const response = await fetch(`${API_URL}/cart?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch cart');
        return response.json();
    },

    addToCart: async (userId: number, productId: number, quantity: number): Promise<any> => {
        const response = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, productId, quantity }),
        });
        if (!response.ok) throw new Error('Failed to add to cart');
        return response.json();
    },

    removeFromCart: async (userId: number, productId: number): Promise<void> => {
        const response = await fetch(`${API_URL}/cart?userId=${userId}&productId=${productId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to remove from cart');
    },

    clearCart: async (userId: number): Promise<void> => {
        const response = await fetch(`${API_URL}/cart/${userId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to clear cart');
    },

    // Wishlist
    getWishlist: async (userId: number): Promise<any[]> => {
        const response = await fetch(`${API_URL}/wishlist/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch wishlist');
        return response.json();
    },

    addToWishlist: async (userId: number, productId: number): Promise<void> => {
        const response = await fetch(`${API_URL}/wishlist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, productId }),
        });
        if (!response.ok) throw new Error('Failed to add to wishlist');
    },

    removeFromWishlist: async (userId: number, productId: number): Promise<void> => {
        const response = await fetch(`${API_URL}/wishlist/${userId}/item/${productId}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to remove from wishlist');
    },

    // Orders
    createOrder: async (userId: number, items: any[], total: number): Promise<Order> => {
        const response = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, items, total }),
        });
        if (!response.ok) throw new Error('Failed to create order');
        return response.json();
    },

    getUserOrders: async (userId: number): Promise<Order[]> => {
        const response = await fetch(`${API_URL}/orders?userId=${userId}`);
        if (!response.ok) throw new Error('Failed to fetch orders');
        return response.json();
    },

    // Vouchers
    getVouchers: async (): Promise<any[]> => {
        const response = await fetch(`${API_URL}/vouchers`);
        if (!response.ok) throw new Error('Failed to fetch vouchers');
        return response.json();
    },

    claimVoucher: async (userId: number, voucherId: number): Promise<void> => {
        const response = await fetch(`${API_URL}/vouchers/claim`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, voucherId }),
        });
        if (!response.ok) throw new Error('Failed to claim voucher');
    },

    getUserVouchers: async (userId: number): Promise<any[]> => {
        const response = await fetch(`${API_URL}/vouchers/user/${userId}`);
        if (!response.ok) throw new Error('Failed to fetch user vouchers');
        return response.json();
    },

    validateVoucher: async (userId: number, code: string): Promise<any> => {
        const response = await fetch(`${API_URL}/vouchers/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, code }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to validate voucher');
        }
        return response.json();
    },

    createVoucher: async (voucher: { code: string; discountPercentage: number; startDate: string; endDate: string }): Promise<any> => {
        const response = await fetch(`${API_URL}/vouchers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(voucher),
        });
        if (!response.ok) throw new Error('Failed to create voucher');
        return response.json();
    },

    updateVoucher: async (id: number, voucher: { code: string; discountPercentage: number; startDate: string; endDate: string }): Promise<any> => {
        const response = await fetch(`${API_URL}/vouchers/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(voucher),
        });
        if (!response.ok) throw new Error('Failed to update voucher');
        return response.json();
    },

    deleteVoucher: async (id: number): Promise<void> => {
        const response = await fetch(`${API_URL}/vouchers/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete voucher');
    },
};
