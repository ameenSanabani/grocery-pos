/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { registerUser } from '../services/auth.service';
import { initDb } from '../db';

async function createAdmin() {
    const username = process.argv[2] || 'admin';
    const email = process.argv[3] || 'admin@store.com';
    const password = process.argv[4] || 'password123';

    console.log(`Creating admin user: ${username} (${email})...`);

    try {
        initDb(); // Ensure tables exist

        const user = await registerUser({
            username,
            email,
            password,
            role: 'admin',
            cash_limit: 999999
        });

        console.log('✅ Admin user created successfully:');
        console.log(JSON.stringify(user, null, 2));
        process.exit(0);
    } catch (err: any) {
        console.error('❌ Failed to create admin user:', err.message);
        process.exit(1);
    }
}

createAdmin();
