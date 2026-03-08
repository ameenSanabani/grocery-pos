/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCartStore } from '../store/useCartStore';

describe('Cart Store Logic', () => {
    beforeEach(() => {
        useCartStore.getState().clearCart();
    });

    it('should add items and calculate subtotal', () => {
        const product = {
            id: 'p1',
            sku: 'APPLE',
            name: 'Apple',
            selling_price: 2.0,
            tax_rate: 0
        };

        useCartStore.getState().addItem(product, 3);

        const state = useCartStore.getState();
        expect(state.items.length).toBe(1);
        expect(state.items[0].quantity).toBe(3);
        expect(state.subtotal).toBe(6.0);
        expect(state.grandTotal).toBe(6.0);
    });

    it('should update quantity of existing items', () => {
        const product = {
            id: 'p1',
            sku: 'APPLE',
            name: 'Apple',
            selling_price: 2.0,
            tax_rate: 0
        };

        useCartStore.getState().addItem(product, 1);
        useCartStore.getState().addItem(product, 2);

        const state = useCartStore.getState();
        expect(state.items.length).toBe(1);
        expect(state.items[0].quantity).toBe(3);
    });

    it('should calculate tax correctly', () => {
        const product = {
            id: 'p2',
            sku: 'CHIPS',
            name: 'Chips',
            selling_price: 10.0,
            tax_rate: 10 // 10%
        };

        useCartStore.getState().addItem(product, 1);

        const state = useCartStore.getState();
        expect(state.subtotal).toBe(10.0);
        expect(state.taxTotal).toBe(1.0);
        expect(state.grandTotal).toBe(11.0);
    });

    it('should apply discount correctly', () => {
        const product = {
            id: 'p1',
            sku: 'APPLE',
            name: 'Apple',
            selling_price: 10.0,
            tax_rate: 0
        };

        useCartStore.getState().addItem(product, 1);
        useCartStore.getState().setDiscount(2.0);

        const state = useCartStore.getState();
        expect(state.grandTotal).toBe(8.0);
    });

    it('should remove items when quantity becomes 0', () => {
        const product = {
            id: 'p1',
            sku: 'APPLE',
            name: 'Apple',
            selling_price: 2.0,
            tax_rate: 0
        };

        useCartStore.getState().addItem(product, 1);
        useCartStore.getState().updateQuantity('p1', 0);

        const state = useCartStore.getState();
        expect(state.items.length).toBe(0);
    });
});
