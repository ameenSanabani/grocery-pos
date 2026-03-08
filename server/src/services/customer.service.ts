/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { CustomerInput, UpdateCustomerInput, CustomerTransactionInput } from '../schemas/customer.schema';

export function createCustomer(input: CustomerInput) {
    const id = uuidv4();
    const stmt = db.prepare(`
        INSERT INTO customers (id, name, phone, email, address, credit_limit)
        VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, input.name, input.phone, input.email || null, input.address || null, input.credit_limit);
    return { id, ...input, current_balance: 0 };
}

export function getCustomers(search?: string, limit: number = 10) {
    if (search) {
        return db.prepare(`
            SELECT * FROM customers 
            WHERE is_active = 1 
            AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)
            ORDER BY name ASC
            LIMIT ?
        `).all(`%${search}%`, `%${search}%`, `%${search}%`, limit);
    }
    return db.prepare('SELECT * FROM customers WHERE is_active = 1 ORDER BY name ASC LIMIT ?').all(limit);
}

export function getCustomerById(id: string) {
    return db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
}

export function updateCustomer(id: string, input: UpdateCustomerInput) {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
    });

    if (fields.length === 0) return getCustomerById(id);

    values.push(id);
    db.prepare(`UPDATE customers SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
    return getCustomerById(id);
}

export function addCustomerTransaction(customerId: string, input: CustomerTransactionInput, saleId?: string) {
    const id = uuidv4();

    const transaction = db.transaction(() => {
        // 1. Insert transaction record
        db.prepare(`
            INSERT INTO customer_transactions (id, customer_id, sale_id, amount, type, payment_method, description)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(id, customerId, saleId || null, input.amount, input.type, input.payment_method || null, input.description || null);

        // 2. Update customer balance
        // amount is positive for debt (purchase), negative for repayment
        db.prepare(`
            UPDATE customers 
            SET current_balance = current_balance + ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        `).run(input.amount, customerId);

        return { id, ...input };
    });

    return transaction();
}

export function getCustomerHistory(customerId: string) {
    return db.prepare(`
        SELECT * FROM customer_transactions 
        WHERE customer_id = ? 
        ORDER BY created_at DESC
    `).all(customerId);
}
