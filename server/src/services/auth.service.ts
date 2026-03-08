/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';

const saltRounds = 10;

export async function registerUser(input: RegisterInput) {
    const { username, email, password, role, cash_limit } = input;

    // Check if user exists
    const userExists = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
    if (userExists) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const id = uuidv4();

    const stmt = db.prepare(`
    INSERT INTO users (id, username, email, password_hash, role, cash_limit)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

    stmt.run(id, username, email, hashedPassword, role, cash_limit || 500.00);

    return { id, username, email, role, cash_limit: cash_limit || 500.00 };
}

export async function loginUser(input: LoginInput) {
    const { username, password } = input;

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;

    if (!user || !user.is_active) {
        throw new Error('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
        throw new Error('Invalid credentials');
    }

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        cash_limit: user.cash_limit
    };
}

export async function changePassword(userId: string, input: any) {
    const { currentPassword, newPassword } = input;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

    if (!user) throw new Error('User not found');

    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) throw new Error('Invalid current password');

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(hashedPassword, userId);

    return { success: true };
}
