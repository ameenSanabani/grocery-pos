/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { create } from 'zustand';
import { api } from '@/lib/api';

export interface User {
    id: string;
    username: string;
    role: string;
    name?: string;
    cash_limit: number;
}

export interface Shift {
    id: string;
    user_id: string;
    register_id: string;
    opening_time?: string;
    start_time: string;
    end_time?: string;
    opening_balance: number;
    closing_balance?: number;
    status: 'open' | 'closed';
    total_cash_sales?: number;
    total_drops?: number;
    current_balance?: number;
    transaction_count?: number;
    cashier_name?: string;
    register_name?: string;
    supervisor_name?: string;
}

export interface Register {
    id: string;
    name: string;
    description?: string;
    status: 'active' | 'inactive';
    is_occupied?: boolean;
    occupied_by?: string | null;
}

interface AuthStore {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;

    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
    changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
    clearError: () => void;
}

interface ShiftStore {
    currentShift: Shift | null;
    registers: Register[];
    shiftLoading: boolean;
    shiftError: string | null;

    fetchRegisters: () => Promise<void>;
    openShift: (registerId: string, openingBalance: number) => Promise<void>;
    closeShift: (closingBalance: number, notes?: string, supervisorId?: string) => Promise<any>;
    fetchActiveShift: () => Promise<void>;
    refreshActiveShift: () => Promise<void>;
    clearShift: () => void;
    clearShiftError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,

    login: async (username, password) => {
        set({ loading: true, error: null });

        try {
            const data = await api.post<{ user: User; token: string }>('/auth/login', {
                username,
                password
            });

            set({
                user: data.user,
                token: data.token,
                isAuthenticated: true,
                loading: false
            });

            // Store in localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }
        } catch (err: any) {
            set({
                error: err.message || 'Login failed',
                loading: false
            });
            throw err;
        }
    },

    logout: () => {
        set({
            user: null,
            token: null,
            isAuthenticated: false
        });

        // Clear localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },

    refreshUser: async () => {
        try {
            const data = await api.get<User>('/auth/me');
            set({ user: data });
            if (typeof window !== 'undefined') {
                localStorage.setItem('user', JSON.stringify(data));
            }
        } catch (err) {
            console.error('Failed to refresh user profile', err);
        }
    },

    changePassword: async (oldPassword, newPassword) => {
        set({ loading: true, error: null });

        try {
            await api.post('/auth/change-password', {
                old_password: oldPassword,
                new_password: newPassword
            });
            set({ loading: false });
        } catch (err: any) {
            set({
                error: err.message || 'Failed to change password',
                loading: false
            });
            throw err;
        }
    },

    clearError: () => {
        set({ error: null });
    }
}));

export const useShiftStore = create<ShiftStore>((set, get) => ({
    currentShift: null,
    registers: [],
    shiftLoading: false,
    shiftError: null,

    fetchRegisters: async () => {
        set({ shiftLoading: true, shiftError: null });

        try {
            const data = await api.get<Register[]>('/shifts/registers');
            set({ registers: data, shiftLoading: false });
        } catch (err: any) {
            set({
                shiftError: err.message || 'Failed to fetch registers',
                shiftLoading: false
            });
        }
    },

    openShift: async (registerId, openingBalance) => {
        set({ shiftLoading: true, shiftError: null });

        try {
            const shift = await api.post<Shift>('/shifts/open', {
                register_id: registerId,
                opening_balance: openingBalance
            });
            // Immediately fetch again to get computed fields like current_balance
            const fullShift = await api.get<Shift>('/shifts/active');
            set({ currentShift: fullShift, shiftLoading: false });
        } catch (err: any) {
            set({
                shiftError: err.message || 'Failed to open shift',
                shiftLoading: false
            });
            throw err;
        }
    },

    closeShift: async (closingBalance, notes, supervisorId) => {
        const { currentShift, fetchRegisters } = get();
        if (!currentShift) return;

        set({ shiftLoading: true, shiftError: null });

        try {
            const result = await api.post<Shift>(`/shifts/${currentShift.id}/close`, {
                closing_balance: closingBalance,
                notes,
                supervisor_id: supervisorId
            });

            // Only stop loading and refresh registers.
            // Do NOT clear currentShift yet, so the UI can show the receipt/summary.
            set({ shiftLoading: false });
            get().fetchRegisters(); // Refresh registers so they show as available immediately

            return result;
        } catch (err: any) {
            set({
                shiftError: err.message || 'Failed to close shift',
                shiftLoading: false
            });
            throw err;
        }
    },

    clearShift: () => set({ currentShift: null }),

    fetchActiveShift: async () => {
        set({ shiftLoading: true, shiftError: null });

        try {
            const shift = await api.get<Shift>('/shifts/active');
            set({ currentShift: shift, shiftLoading: false });
        } catch (err: any) {
            set({ currentShift: null, shiftLoading: false });
        }
    },

    refreshActiveShift: async () => {
        try {
            const shift = await api.get<Shift>('/shifts/active');
            set({ currentShift: shift });
        } catch (err) {
            console.error('Failed to refresh shift', err);
        }
    },

    clearShiftError: () => {
        set({ shiftError: null });
    }
}));

// Initialize auth store with localStorage data
if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
        try {
            const user = JSON.parse(userStr);
            useAuthStore.setState({
                token,
                user,
                isAuthenticated: true
            });
        } catch (err) {
            // Clear invalid data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }
}