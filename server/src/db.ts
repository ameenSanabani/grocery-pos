/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = process.env.DB_PATH || path.join(__dirname, '../grocery.db'); // DB inside src or server root? Let's put it in server root: ../grocery.db
const schemaPath = path.join(__dirname, '../schema.sql'); // Schema is in server root

const db = new Database(dbPath);
db.pragma('journal_mode = WAL'); // Better concurrency

export function initDb() {
    if (fs.existsSync(schemaPath)) {
        const migration = fs.readFileSync(schemaPath, 'utf-8');
        db.pragma('foreign_keys = OFF');
        db.exec(migration);
        db.pragma('foreign_keys = ON');
        console.log('Database initialized from schema.sql');
    } else {
        console.error('Schema file not found at:', schemaPath);
    }
}

export default db;
