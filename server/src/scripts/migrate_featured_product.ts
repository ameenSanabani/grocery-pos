/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import db from '../db';

function migrate() {
  try {
    console.log('Running migration to add display_order to products...');
    
    // Check if column exists first
    const columnInfo = db.prepare(`PRAGMA table_info(products)`).all();
    const columnExists = columnInfo.some((col: any) => col.name === 'display_order');

    if (!columnExists) {
        db.prepare(
            `ALTER TABLE products ADD COLUMN display_order INTEGER DEFAULT 9999`
        ).run();
        console.log('✅ Migration successful: display_order column added.');
    } else {
        console.log('✅ Migration skipped: display_order column already exists.');
    }
    
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
