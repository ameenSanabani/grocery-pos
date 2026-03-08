/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import db, { initDb } from '../../db';
import { createProduct, getProducts, adjustStock, getProductById } from '../product.service';

describe('Product Service', () => {
    beforeAll(() => {
        initDb();
    });

    beforeEach(() => {
        db.exec('PRAGMA foreign_keys = OFF');
        db.prepare('DELETE FROM stock_level_history').run();
        db.prepare('DELETE FROM sale_items').run();
        db.prepare('DELETE FROM purchase_order_items').run();
        db.prepare('DELETE FROM batches').run();
        db.prepare('DELETE FROM stock_levels').run();
        db.prepare('DELETE FROM products').run();
        db.prepare('DELETE FROM users').run();
        db.exec('PRAGMA foreign_keys = ON');

        db.prepare("INSERT INTO users (id, username, email, password_hash, role) VALUES ('test-user-id', 'testuser', 'test@test.com', 'hash', 'admin')").run();
    });

    it('should create a product with initial stock', () => {
        const input = {
            sku: 'SKU001',
            name: 'Test Product',
            cost_price: 10,
            selling_price: 15,
            initial_quantity: 50,
            reorder_level: 10
        };

        const result = createProduct(input as any, 'test-user-id') as any;
        expect(result).toHaveProperty('id');

        const product = getProductById(result.id) as any;
        expect(product.sku).toBe(input.sku);
        expect(product.quantity).toBe(input.initial_quantity);
    });

    it('should adjust stock levels correctly', () => {
        const input = {
            sku: 'SKU002',
            name: 'Stock Test',
            cost_price: 5,
            selling_price: 8,
            initial_quantity: 10,
            reorder_level: 5
        };

        const created = createProduct(input as any, 'test-user-id') as any;

        // Add stock
        adjustStock(created.id, 5, 'Restock', 'test-user-id');
        let updated = getProductById(created.id) as any;
        expect(updated.quantity).toBe(15);

        // Deduct stock
        adjustStock(created.id, -3, 'Sale', 'test-user-id');
        updated = getProductById(created.id) as any;
        expect(updated.quantity).toBe(12);
    });

    it('should filter products by search query', () => {
        createProduct({ sku: 'APPLE', name: 'Fresh Apple', cost_price: 1, selling_price: 2 } as any, 'test-user-id');
        createProduct({ sku: 'BANANA', name: 'Yellow Banana', cost_price: 1, selling_price: 2 } as any, 'test-user-id');

        const results = getProducts({ search: 'apple', limit: '10', offset: '0' });
        expect(results.length).toBe(1);
        expect((results[0] as any).name).toBe('Fresh Apple');
    });

    it('should throw error for non-existent product adjustment', () => {
        expect(() => adjustStock('non-existent-id', 10, 'Test', 'test-user-id')).toThrow('Product not found');
    });
});
