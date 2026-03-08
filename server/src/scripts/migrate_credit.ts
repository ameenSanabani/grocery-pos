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

console.log('Starting thorough migration for Sales table...');

try {
    const columns = db.prepare("PRAGMA table_info(sales)").all() as any[];
    const hasCustomerId = columns.some(c => c.name === 'customer_id');

    // Check current payment_method constraint if possible
    const tableSql = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='sales'").get() as any;
    const needsCreditConstraint = !tableSql.sql.includes("'credit'");

    if (!hasCustomerId || needsCreditConstraint) {
        console.log('Rebuilding sales table to update schema and constraints...');

        db.transaction(() => {
            // 1. Rename old table
            db.prepare('ALTER TABLE sales RENAME TO sales_old').run();

            // 2. Create new table with correct schema
            db.prepare(`
                CREATE TABLE sales (
                    id TEXT PRIMARY KEY,
                    receipt_ref TEXT UNIQUE NOT NULL,
                    user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
                    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
                    subtotal REAL NOT NULL,
                    tax_total REAL NOT NULL,
                    discount_total REAL DEFAULT 0.00,
                    grand_total REAL NOT NULL,
                    payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'credit', 'split')),
                    status TEXT DEFAULT 'completed',
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            `).run();

            // 3. Copy data
            db.prepare(`
                INSERT INTO sales (
                    id, receipt_ref, user_id, customer_id, 
                    subtotal, tax_total, discount_total, grand_total, 
                    payment_method, status, created_at
                )
                SELECT 
                    id, receipt_ref, user_id, 
                    ${hasCustomerId ? 'customer_id' : 'NULL'}, 
                    subtotal, tax_total, discount_total, grand_total, 
                    payment_method, status, created_at
                FROM sales_old
            `).run();

            // 4. Drop old table
            db.prepare('DROP TABLE sales_old').run();

            // 5. Re-create indexes
            db.prepare('CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at)').run();
        })();

        console.log('Sales table successfully rebuilt with new schema.');
    } else {
        console.log('Sales table already matches the new schema.');
    }

    console.log('Migration complete.');
} catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
}
