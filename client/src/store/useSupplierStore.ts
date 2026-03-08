/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Supplier {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    contact_person?: string;
    payment_terms?: string;
    created_at: string;
    updated_at: string;
}

interface SupplierStore {
    suppliers: Supplier[];
    loading: boolean;
    error: string | null;
    searchQuery: string;

    fetchSuppliers: () => Promise<void>;
    createSupplier: (data: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
    updateSupplier: (id: string, data: Partial<Supplier>) => Promise<boolean>;
    deleteSupplier: (id: string) => Promise<boolean>;
    setSearchQuery: (query: string) => void;
    clearError: () => void;
}

export const useSupplierStore = create<SupplierStore>((set, get) => ({
    suppliers: [],
    loading: false,
    error: null,
    searchQuery: '',

    fetchSuppliers: async () => {
        set({ loading: true, error: null });

        try {
            const data = await api.get<Supplier[]>('/suppliers');
            set({ suppliers: data });
        } catch (err: any) {
            set({ error: err.message || 'Failed to fetch suppliers' });
        } finally {
            set({ loading: false });
        }
    },

    createSupplier: async (data) => {
        set({ loading: true, error: null });

        try {
            const newSupplier = await api.post<Supplier>('/suppliers', data);
            set(state => ({
                suppliers: [newSupplier, ...state.suppliers],
                loading: false
            }));
            return true;
        } catch (err: any) {
            set({ error: err.message || 'Failed to create supplier', loading: false });
            return false;
        }
    },

    updateSupplier: async (id, data) => {
        set({ loading: true, error: null });

        try {
            const updatedSupplier = await api.put<Supplier>(`/suppliers/${id}`, data);
            set(state => ({
                suppliers: state.suppliers.map(s => s.id === id ? updatedSupplier : s),
                loading: false
            }));
            return true;
        } catch (err: any) {
            set({ error: err.message || 'Failed to update supplier', loading: false });
            return false;
        }
    },

    deleteSupplier: async (id) => {
        set({ loading: true, error: null });

        try {
            await api.delete(`/suppliers/${id}`);
            set(state => ({
                suppliers: state.suppliers.filter(s => s.id !== id),
                loading: false
            }));
            return true;
        } catch (err: any) {
            set({ error: err.message || 'Failed to delete supplier', loading: false });
            return false;
        }
    },

    setSearchQuery: (query) => {
        set({ searchQuery: query });
    },

    clearError: () => {
        set({ error: null });
    }
}));