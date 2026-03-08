/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../grocery.db');
const db = new Database(dbPath);

console.log('Starting migration to add payment_method to customer_transactions...');

try {
    const columns = db.prepare("PRAGMA table_info(customer_transactions)").all() as any[];
    const hasPaymentMethod = columns.some(c => c.name === 'payment_method');

    if (!hasPaymentMethod) {
        console.log('Adding payment_method column to customer_transactions table...');
        db.prepare('ALTER TABLE customer_transactions ADD COLUMN payment_method TEXT CHECK (payment_method IN ("cash", "card", "credit", "other"))').run();
        console.log('Column added successfully.');
    } else {
        console.log('payment_method column already exists.');
    }

    console.log('Migration complete.');
} catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
}
