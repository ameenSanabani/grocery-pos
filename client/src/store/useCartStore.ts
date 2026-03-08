/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { create } from 'zustand';
import { api } from '@/lib/api';

export interface CartItem {
    id: string;
    sku: string;
    name: string;
    unit_price: number;
    tax_rate: number;
    quantity: number;
    is_weighed: boolean;
}

interface CartStore {
    items: CartItem[];
    subtotal: number;
    taxTotal: number;
    grandTotal: number;
    discount: number;
    loading: boolean;
    error: string | null;
    lastSale: any | null;

    fetchCart: () => Promise<void>;
    addItem: (product: any, quantity?: number) => Promise<void>;
    removeItem: (productId: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    setDiscount: (amount: number) => Promise<void>;
    clearCart: () => Promise<void>;
    calculateTotals: () => Promise<void>;
    checkout: (paymentMethod: 'cash' | 'card' | 'credit' | 'split', amountTendered?: number, customerId?: string) => Promise<void>;
    resetSale: () => Promise<void>;
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],
    subtotal: 0,
    taxTotal: 0,
    grandTotal: 0,
    discount: 0,
    loading: false,
    error: null,
    lastSale: null,

    // --- ADDED THIS SECTION ---
    fetchCart: async () => {
        set({ loading: true, error: null });
        try {

            set({ loading: false });
        } catch (error: any) {
            set({ error: error.message || 'Failed to fetch cart', loading: false });
        }
    },
    // --------------------------

    addItem: async (product, quantity = 1) => {
        const { items } = get();
        const existing = items.find((i) => i.id === product.id);

        if (existing) {
            get().updateQuantity(product.id, existing.quantity + quantity);
        } else {
            set({
                items: [
                    ...items,
                    {
                        id: product.id,
                        sku: product.sku,
                        name: product.name,
                        unit_price: product.selling_price,
                        tax_rate: product.tax_rate || 0,
                        quantity,
                        is_weighed: !!product.is_weighed,
                    },
                ],
            });
            get().calculateTotals();
        }
    },

    removeItem: async (productId) => {
        set((state) => ({
            items: state.items.filter((i) => i.id !== productId),
        }));
        get().calculateTotals();
    },

    updateQuantity: async (productId, quantity) => {
        set((state) => ({
            items: state.items.map((i) =>
                i.id === productId ? { ...i, quantity: Math.max(0, quantity) } : i
            ).filter(i => i.quantity > 0),
        }));
        get().calculateTotals();
    },

    setDiscount: async (amount) => {
        set({ discount: amount });
        get().calculateTotals();
    },

    clearCart: async () => {
        set({ items: [], subtotal: 0, taxTotal: 0, grandTotal: 0, discount: 0 });
    },

    calculateTotals: async () => {
        const { items, discount } = get();

        const subtotal = items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);
        const taxTotal = items.reduce(
            (acc, item) => acc + item.unit_price * item.quantity * (item.tax_rate / 100),
            0
        );

        set({
            subtotal,
            taxTotal,
            grandTotal: Math.max(0, subtotal + taxTotal - discount),
        });
    },

    checkout: async (paymentMethod, amountTendered, customerId) => {
        const { items, discount, loading } = get();
        if (loading || items.length === 0) return;

        set({ loading: true, error: null });

        try {
            const payload = {
                items: items.map(i => ({
                    product_id: i.id,
                    quantity: i.quantity
                })),
                payment_method: paymentMethod,
                customer_id: customerId,
                discount_total: discount,
                amount_tendered: amountTendered
            };

            const result = await api.post<any>('/sales', payload);
            set({ lastSale: result, items: [], subtotal: 0, taxTotal: 0, grandTotal: 0, discount: 0 });
        } catch (err: any) {
            set({ error: err.message || 'Checkout failed' });
            throw err;
        } finally {
            set({ loading: false });
        }
    },

    resetSale: async () => { // Note: Changed to async to match Promise<void> in interface
        set({ lastSale: null, error: null });
    }
}));