/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import db, { initDb } from '../../db';
import { createProduct } from '../product.service';
import { createSale, getSaleById } from '../sale.service';
import { registerUser } from '../auth.service';
import { openShift } from '../shift.service';
import { v4 as uuid } from 'uuid';

describe('Sale Service (Integration)', () => {
    let testUser: any;
    let appleProduct: any;
    let register: any;

    beforeAll(async () => {
        initDb();
        db.exec('PRAGMA foreign_keys = OFF');
        db.prepare('DELETE FROM users').run();
        db.prepare('DELETE FROM registers').run();
        db.prepare('DELETE FROM register_shifts').run();
        db.exec('PRAGMA foreign_keys = ON');

        testUser = await registerUser({
            username: 'cashier_sale_test',
            email: 'sale_test@mart.com',
            password: 'password123',
            role: 'cashier',
            cash_limit: 500
        });

        const regId = uuid();
        db.prepare("INSERT INTO registers (id, name, status) VALUES (?, ?, 'active')").run(regId, 'Main Register');
        register = { id: regId };
    });

    beforeEach(() => {
        db.exec('PRAGMA foreign_keys = OFF');
        db.prepare('DELETE FROM stock_level_history').run();
        db.prepare('DELETE FROM sale_items').run();
        db.prepare('DELETE FROM sales').run();
        db.prepare('DELETE FROM stock_levels').run();
        db.prepare('DELETE FROM products').run();
        db.prepare('DELETE FROM register_shifts').run();
        db.exec('PRAGMA foreign_keys = ON');

        // Seed a product
        appleProduct = createProduct({
            sku: 'APPLE001',
            name: 'Red Apple',
            cost_price: 0.5,
            selling_price: 1.0,
            initial_quantity: 100,
            reorder_level: 10,
            tax_rate: 0
        } as any);

        // Open shift
        openShift(testUser.id, { register_id: register.id, opening_balance: 100 });
    });

    it('should complete a checkout and deduct stock', async () => {
        const saleInput = {
            items: [
                {
                    product_id: appleProduct.id,
                    quantity: 5,
                    unit_price: 1.0
                }
            ],
            discount_total: 0,
            payment_method: 'cash' as const,
            amount_tendered: 10
        };

        const result = createSale(saleInput, testUser.id) as any;

        expect(result.grand_total).toBe(5.0);
        expect(result.change).toBe(5.0);
        expect(result.items.length).toBe(1);

        // Verify stock deduction
        const updatedProduct = db.prepare('SELECT quantity FROM stock_levels WHERE product_id = ?').get(appleProduct.id) as any;
        expect(updatedProduct.quantity).toBe(95);

        // Verify sale record
        const saleRecord = getSaleById(result.id) as any;
        expect(saleRecord).toBeDefined();
        expect(saleRecord.items.length).toBe(1);
    });

    it('should fail if insufficient stock', async () => {
        const saleInput = {
            items: [
                {
                    product_id: appleProduct.id,
                    quantity: 101, // More than initial 100
                    unit_price: 1.0
                }
            ],
            discount_total: 0,
            payment_method: 'cash' as const
        };

        expect(() => createSale(saleInput, testUser.id)).toThrow(/Insufficient stock/);
    });

    it('should calculate tax correctly', async () => {
        const taxedProduct = createProduct({
            sku: 'TAXED',
            name: 'Taxed Snack',
            cost_price: 1.0,
            selling_price: 10.0,
            initial_quantity: 10,
            reorder_level: 1,
            tax_rate: 10 // 10% tax
        } as any);

        const saleInput = {
            items: [
                {
                    product_id: taxedProduct.id,
                    quantity: 1,
                    unit_price: 10.0
                }
            ],
            discount_total: 0,
            payment_method: 'card' as const
        };

        const result = createSale(saleInput, testUser.id) as any;
        expect(result.subtotal).toBe(10.0);
        expect(result.tax_total).toBe(1.0);
        expect(result.grand_total).toBe(11.0);
    });
});
