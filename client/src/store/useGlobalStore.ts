/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { create } from 'zustand';
import { api } from '@/lib/api';

export interface StoreProfile {
    id: string;
    store_name: string;
    currency_symbol: string;
    tax_rate: number;
    phone: string;
    email: string;
    address: string;
    logo_url?: string;
    vibrant_color?: string;
}

interface GlobalStore {
    storeProfile: StoreProfile | null;
    storeProfileLoading: boolean;
    storeProfileError: string | null;

    fetchStoreProfile: () => Promise<void>;
    updateStoreProfile: (data: Partial<StoreProfile>) => Promise<void>;
    clearStoreProfileError: () => void;
}

export const useGlobalStore = create<GlobalStore>((set, get) => ({
    storeProfile: null,
    storeProfileLoading: false,
    storeProfileError: null,

    fetchStoreProfile: async () => {
        const { storeProfileLoading } = get();
        if (storeProfileLoading) return;

        set({ storeProfileLoading: true, storeProfileError: null });

        try {
            const data = await api.get<StoreProfile>('/settings/store-profile');
            set({ storeProfile: data });

            // Store in localStorage for persistence
            if (typeof window !== 'undefined') {
                localStorage.setItem('storeProfile', JSON.stringify(data));
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch store profile';
            set({ storeProfileError: errorMessage });

            // Try to get from localStorage as fallback
            if (typeof window !== 'undefined') {
                const cached = localStorage.getItem('storeProfile');
                if (cached) {
                    set({ storeProfile: JSON.parse(cached) });
                }
            }
        } finally {
            set({ storeProfileLoading: false });
        }
    },

    updateStoreProfile: async (data: Partial<StoreProfile>) => {
        set({ storeProfileLoading: true, storeProfileError: null });

        try {
            const updated = await api.patch<StoreProfile>('/settings/store-profile', data);
            set({ storeProfile: updated });

            // Update localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('storeProfile', JSON.stringify(updated));
            }

            // Dispatch event for components that are still using the old pattern
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('store-profile-updated', { detail: updated }));
            }
        } catch (err: any) {
            set({ storeProfileError: err.message || 'Failed to update store profile' });
            throw err;
        } finally {
            set({ storeProfileLoading: false });
        }
    },

    clearStoreProfileError: () => {
        set({ storeProfileError: null });
    }
}));

// Initialize store with cached data if available
if (typeof window !== 'undefined') {
    const cached = localStorage.getItem('storeProfile');
    if (cached) {
        useGlobalStore.setState({ storeProfile: JSON.parse(cached) });
    }
}