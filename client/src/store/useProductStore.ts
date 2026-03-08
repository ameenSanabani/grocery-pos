/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Product {
    id: string;
    sku: string;
    name: string;
    description?: string;
    category_id: string;
    selling_price: number;
    cost_price: number;
    tax_rate: number;
    quantity: number;
    reorder_level: number;
    unit: string;
    is_weighed: boolean;
    barcode?: string;
    supplier_id?: string;
    created_at: string;
    updated_at: string;
}

interface ProductStore {
    products: Product[];
    loading: boolean;
    error: string | null;
    searchQuery: string;
    selectedCategory: string | null;

    fetchProducts: (params?: { search?: string; category_id?: string; limit?: number }) => Promise<void>;
    createProduct: (data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
    updateProduct: (id: string, data: Partial<Product>) => Promise<boolean>;
    deleteProduct: (id: string) => Promise<boolean>;
    getProductByBarcode: (barcode: string) => Promise<Product | null>;
    adjustStock: (id: string, quantity: number, reason: string) => Promise<boolean>;
    setSearchQuery: (query: string) => void;
    setSelectedCategory: (categoryId: string | null) => void;
    clearError: () => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
    products: [],
    loading: false,
    error: null,
    searchQuery: '',
    selectedCategory: null,

    fetchProducts: async (params = {}) => {
        set({ loading: true, error: null });

        try {
            const queryParams = new URLSearchParams();
            if (params.search) queryParams.append('search', params.search);
            if (params.category_id) queryParams.append('category_id', params.category_id);
            if (params.limit) queryParams.append('limit', params.limit.toString());

            const endpoint = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
            const data = await api.get<Product[]>(endpoint);
            set({ products: data });
        } catch (err: any) {
            set({ error: err.message || 'Failed to fetch products' });
        } finally {
            set({ loading: false });
        }
    },

    createProduct: async (data) => {
        set({ loading: true, error: null });

        try {
            const newProduct = await api.post<Product>('/products', data);
            set(state => ({
                products: [newProduct, ...state.products],
                loading: false
            }));
            return true;
        } catch (err: any) {
            set({ error: err.message || 'Failed to create product', loading: false });
            return false;
        }
    },

    updateProduct: async (id, data) => {
        set({ loading: true, error: null });

        try {
            const updatedProduct = await api.put<Product>(`/products/${id}`, data);
            set(state => ({
                products: state.products.map(p => p.id === id ? updatedProduct : p),
                loading: false
            }));
            return true;
        } catch (err: any) {
            set({ error: err.message || 'Failed to update product', loading: false });
            return false;
        }
    },

    deleteProduct: async (id) => {
        set({ loading: true, error: null });

        try {
            await api.delete(`/products/${id}`);
            set(state => ({
                products: state.products.filter(p => p.id !== id),
                loading: false
            }));
            return true;
        } catch (err: any) {
            set({ error: err.message || 'Failed to delete product', loading: false });
            return false;
        }
    },

    getProductByBarcode: async (barcode: string) => {
        try {
            const product = await api.get<Product>(`/products/barcode/${barcode}`);
            return product;
        } catch (err: any) {
            return null;
        }
    },

    adjustStock: async (id, quantity, reason) => {
        set({ loading: true, error: null });

        try {
            await api.post(`/products/${id}/stock`, { quantity, reason });
            // Refetch products to get updated stock levels
            await get().fetchProducts();
            return true;
        } catch (err: any) {
            set({ error: err.message || 'Failed to adjust stock', loading: false });
            return false;
        }
    },

    setSearchQuery: (query) => {
        set({ searchQuery: query });
    },

    setSelectedCategory: (categoryId) => {
        set({ selectedCategory: categoryId });
    },

    clearError: () => {
        set({ error: null });
    }
}));