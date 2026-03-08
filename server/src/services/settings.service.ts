/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import db from '../db';
import { StoreProfileInput } from '../schemas/settings.schema';

const STORE_PROFILE_KEY = 'store_profile';

export function getStoreProfile() {
    const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
    const row = stmt.get(STORE_PROFILE_KEY) as { value: string } | undefined;

    if (!row) {
        return null;
    }

    return JSON.parse(row.value);
}

export function updateStoreProfile(input: StoreProfileInput) {
    const value = JSON.stringify(input);
    const stmt = db.prepare(`
        INSERT INTO settings (key, value, updated_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET
            value = excluded.value,
            updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(STORE_PROFILE_KEY, value);
    return input;
}
