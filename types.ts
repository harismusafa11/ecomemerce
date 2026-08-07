import React from 'react';

export interface Product {
  id: number;
  name: string;
  slug?: string;
  keywords?: string;
  description: string;
  price: number;
  imageUrls: string[];
  category: string;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
  flashSaleEnd?: string;
  flashSalePrice?: number;
  isFlashSale?: boolean;
  soldCount?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string; // Password should be handled securely on a server
  isAdmin: boolean;
}

export enum OrderStatus {
  PendingPayment = 'Pending Payment',
  Processing = 'Processing',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
}

export interface Order {
  id: string;
  userId: number;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  orderDate: string;
  paymentProofUrl?: string;
  trackingNumber?: string;
}

export interface Voucher {
  id: number;
  code: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  productId?: number; // Applied to a specific product, optional for store-wide
}

export interface Review {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  comment?: string | null;
  createdAt: string;
  user?: { id: number; name: string };
}

export interface SocialLink {
  name: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

export type Page = 'home' | 'about' | 'contact' | 'product' | 'cart' | 'checkout' | 'adminLogin' | 'adminPanel' | 'login' | 'register' | 'allProducts' | 'orderConfirmation' | 'wishlist' | 'vouchers' | 'orderHistory' | 'profile' | 'privasi' | 'syarat' | 'faq' | 'blog' | 'blogArticle';