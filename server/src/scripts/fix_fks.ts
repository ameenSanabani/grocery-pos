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

process.env.DB_PATH = dbPath;

console.log('--- REPAIRING BROKEN FOREIGN KEYS ---');

try {
    db.transaction(() => {
        // 1. Check sale_items
        const saleItemsSql = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='sale_items'").get() as any;
        if (saleItemsSql.sql.includes('sales_old')) {
            console.log('sale_items is referencing sales_old. Rebuilding...');
            db.prepare('ALTER TABLE sale_items RENAME TO sale_items_old').run();
            db.prepare(`
                CREATE TABLE sale_items (
                    id TEXT PRIMARY KEY,
                    sale_id TEXT REFERENCES sales(id) ON DELETE CASCADE,
                    product_id TEXT REFERENCES products(id) ON DELETE RESTRICT,
                    quantity REAL NOT NULL,
                    unit_price_at_sale REAL NOT NULL,
                    tax_rate_at_sale REAL NOT NULL,
                    subtotal REAL NOT NULL
                )
            `).run();
            db.prepare(`
                INSERT INTO sale_items SELECT * FROM sale_items_old
            `).run();
            db.prepare('DROP TABLE sale_items_old').run();
        }

        // 2. Check customer_transactions
        const custTxSql = db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='customer_transactions'").get() as any;
        if (custTxSql && custTxSql.sql.includes('sales_old')) {
            console.log('customer_transactions is referencing sales_old. Rebuilding...');
            db.prepare('ALTER TABLE customer_transactions RENAME TO customer_transactions_old').run();
            db.prepare(`
                CREATE TABLE customer_transactions (
                    id TEXT PRIMARY KEY,
                    customer_id TEXT REFERENCES customers(id) ON DELETE CASCADE,
                    sale_id TEXT REFERENCES sales(id) ON DELETE SET NULL,
                    amount REAL NOT NULL,
                    type TEXT CHECK (type IN ('credit_purchase', 'payment', 'adjustment')),
                    description TEXT,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            `).run();
            db.prepare(`
                INSERT INTO customer_transactions SELECT * FROM customer_transactions_old
            `).run();
            db.prepare('DROP TABLE customer_transactions_old').run();
        }

    })();
    console.log('Repair complete.');
} catch (err) {
    console.error('Repair failed:', err);
}
