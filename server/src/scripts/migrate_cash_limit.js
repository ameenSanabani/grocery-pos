/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../../grocery.db');
const db = new Database(dbPath);

try {
    db.prepare('ALTER TABLE users ADD COLUMN cash_limit REAL DEFAULT 500.00').run();
    console.log('Successfully added cash_limit column to users table.');
} catch (err) {
    if (err.message.includes('duplicate column name')) {
        console.log('Column cash_limit already exists.');
    } else {
        console.error('Error adding column:', err.message);
    }
} finally {
    db.close();
}
