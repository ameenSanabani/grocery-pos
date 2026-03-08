/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Customer {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    credit_limit: number;
    current_balance: number;
    created_at: string;
    updated_at: string;
}

interface CustomerStore {
    customers: Customer[];
    loading: boolean;
    error: string | null;
    searchQuery: string;

    fetchCustomers: () => Promise<void>;
    createCustomer: (data: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'current_balance'>) => Promise<boolean>;
    updateCustomer: (id: string, data: Partial<Customer>) => Promise<boolean>;
    deleteCustomer: (id: string) => Promise<boolean>;
    getCustomerById: (id: string) => Promise<Customer | null>;
    getCustomerHistory: (id: string) => Promise<any[]>;
    addTransaction: (customerId: string, data: any) => Promise<void>;
    setSearchQuery: (query: string) => void;
    clearError: () => void;
}

export const useCustomerStore = create<CustomerStore>((set, get) => ({
    customers: [],
    loading: false,
    error: null,
    searchQuery: '',

    fetchCustomers: async () => {
        set({ loading: true, error: null });

        try {
            const data = await api.get<Customer[]>('/customers');
            set({ customers: data });
        } catch (err: any) {
            set({ error: err.message || 'Failed to fetch customers' });
        } finally {
            set({ loading: false });
        }
    },

    createCustomer: async (data) => {
        set({ loading: true, error: null });

        try {
            const newCustomer = await api.post<Customer>('/customers', data);
            set(state => ({
                customers: [newCustomer, ...state.customers],
                loading: false
            }));
            return true;
        } catch (err: any) {
            set({ error: err.message || 'Failed to create customer', loading: false });
            return false;
        }
    },

    updateCustomer: async (id, data) => {
        set({ loading: true, error: null });

        try {
            const updatedCustomer = await api.patch<Customer>(`/customers/${id}`, data);
            set(state => ({
                customers: state.customers.map(c => c.id === id ? updatedCustomer : c),
                loading: false
            }));
            return true;
        } catch (err: any) {
            set({ error: err.message || 'Failed to update customer', loading: false });
            return false;
        }
    },

    deleteCustomer: async (id) => {
        set({ loading: true, error: null });

        try {
            await api.delete(`/customers/${id}`);
            set(state => ({
                customers: state.customers.filter(c => c.id !== id),
                loading: false
            }));
            return true;
        } catch (err: any) {
            set({ error: err.message || 'Failed to delete customer', loading: false });
            return false;
        }
    },

    getCustomerById: async (id: string) => {
        try {
            const customer = await api.get<Customer>(`/customers/${id}`);
            return customer;
        } catch (err: any) {
            return null;
        }
    },

    getCustomerHistory: async (id: string) => {
        try {
            const history = await api.get<any[]>(`/customers/${id}/history`);
            return history;
        } catch (err: any) {
            return [];
        }
    },

    addTransaction: async (customerId, data) => {
        set({ loading: true, error: null });

        try {
            await api.post(`/customers/${customerId}/transactions`, data);
            // Refetch customers to get updated balances
            await get().fetchCustomers();
        } catch (err: any) {
            set({ error: err.message || 'Failed to add transaction', loading: false });
            throw err;
        }
    },

    setSearchQuery: (query) => {
        set({ searchQuery: query });
    },

    clearError: () => {
        set({ error: null });
    }
}));