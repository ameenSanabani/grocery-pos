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

console.log('Running migration for registers and shifts...');

db.exec(`
    CREATE TABLE IF NOT EXISTS registers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS register_shifts (
        id TEXT PRIMARY KEY,
        register_id TEXT NOT NULL REFERENCES registers(id),
        user_id TEXT NOT NULL REFERENCES users(id),
        start_time TEXT DEFAULT CURRENT_TIMESTAMP,
        end_time TEXT,
        status TEXT CHECK (status IN ('open', 'closed')) DEFAULT 'open',
        opening_balance REAL NOT NULL,
        closing_balance REAL,
        expected_closing_balance REAL,
        variance REAL,
        supervisor_id TEXT REFERENCES users(id),
        notes TEXT
    );

    CREATE TABLE IF NOT EXISTS cash_drops (
        id TEXT PRIMARY KEY,
        shift_id TEXT NOT NULL REFERENCES register_shifts(id),
        amount REAL NOT NULL,
        recorded_at TEXT DEFAULT CURRENT_TIMESTAMP,
        notes TEXT
    );

    -- Insert a default register if none exist
    INSERT OR IGNORE INTO registers (id, name, status) VALUES ('reg_01', 'Main Counter 01', 'active');
`);

console.log('Migration complete.');
db.close();
