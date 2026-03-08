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

console.log('Starting migration: Add stock audit columns and history table...');

const transaction = db.transaction(() => {
    // 1. Add columns to stock_levels
    try {
        db.prepare("ALTER TABLE stock_levels ADD COLUMN created_by TEXT").run();
        console.log('Added created_by column.');
    } catch (e: any) {
        if (!e.message.includes('duplicate column')) throw e;
        console.log('Column created_by already exists.');
    }

    try {
        db.prepare("ALTER TABLE stock_levels ADD COLUMN updated_by TEXT").run();
        console.log('Added updated_by column.');
    } catch (e: any) {
        if (!e.message.includes('duplicate column')) throw e;
        console.log('Column updated_by already exists.');
    }

    try {
        db.prepare("ALTER TABLE stock_levels ADD COLUMN updated_at TEXT DEFAULT CURRENT_TIMESTAMP").run();
        console.log('Added updated_at column.');
    } catch (e: any) {
        if (!e.message.includes('duplicate column')) throw e;
        console.log('Column updated_at already exists.');
    }

    // 2. Create stock_level_history table
    db.prepare(`
        CREATE TABLE IF NOT EXISTS stock_level_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_id TEXT NOT NULL,
            quantity REAL,
            reorder_level REAL,
            last_restock_date TEXT,
            created_by TEXT,
            updated_by TEXT,
            updated_at TEXT,
            history_created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(product_id) REFERENCES products(id)
        )
    `).run();
    console.log('Created stock_level_history table.');

    // 3. Create Trigger to record history on UPDATE
    // We record the OLD values into history
    db.prepare(`DROP TRIGGER IF EXISTS stock_levels_update_history`).run();
    db.prepare(`
        CREATE TRIGGER stock_levels_update_history
        AFTER UPDATE ON stock_levels
        BEGIN
            INSERT INTO stock_level_history (
                product_id, quantity, reorder_level, last_restock_date,
                created_by, updated_by, updated_at
            )
            VALUES (
                OLD.product_id, OLD.quantity, OLD.reorder_level, OLD.last_restock_date,
                OLD.created_by, OLD.updated_by, OLD.updated_at
            );
        END;
    `).run();
    console.log('Created stock_levels_update_history trigger.');
    
    // Optional: Trigger to update updated_at automatically if not provided?
    // The application logic should handle updated_by, so we can let the app handle updated_at too, 
    // or use a trigger. The requirement says "updated_at... when change happens this information gets recorded".
    // I'll rely on the app to set updated_by and let the DB default updated_at or app set it.
    // Actually, usually `updated_at` is best handled by a trigger to ensure it always changes.
    // But for now, I'll rely on the `DEFAULT CURRENT_TIMESTAMP` and my code updates.
    
    // Wait, if I do `UPDATE stock_levels SET quantity = ...`, `updated_at` won't update unless I set it.
    // I should add a trigger to update `updated_at` automatically OR ensure my queries always set it.
    // Since I'm modifying the queries anyway to set `updated_by`, I will set `updated_at` there.
});

transaction();
console.log('Migration completed successfully.');
