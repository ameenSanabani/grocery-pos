/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';
import db, { initDb } from '../../db';
import { registerUser, loginUser } from '../auth.service';

// Mock DB for testing by using a separate file or memory
// In this case, we'll just use the existing DB but clean up the users table
// BETTER: Ideally, we should use an in-memory DB, but for now let's just clean up.

describe('Auth Service', () => {
    beforeAll(() => {
        // Ensure table exists
        initDb();
    });

    beforeEach(() => {
        // Clean up users table before each test
        db.exec('PRAGMA foreign_keys = OFF');
        db.prepare('DELETE FROM users').run();
        db.exec('PRAGMA foreign_keys = ON');
    });

    it('should register a new user', async () => {
        const input = {
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
            role: 'cashier' as const
        };

        const result = await registerUser(input);

        expect(result).toHaveProperty('id');
        expect(result.username).toBe(input.username);
        expect(result.email).toBe(input.email);

        const userInDb = db.prepare('SELECT * FROM users WHERE id = ?').get(result.id) as any;
        expect(userInDb).toBeDefined();
        expect(await bcrypt.compare(input.password, userInDb.password_hash)).toBe(true);
    });

    it('should throw error if user already exists', async () => {
        const input = {
            username: 'duplicate',
            email: 'dup@example.com',
            password: 'password123',
            role: 'cashier' as const
        };

        await registerUser(input);
        await expect(registerUser(input)).rejects.toThrow('User already exists');
    });

    it('should login a valid user', async () => {
        const input = {
            username: 'loginuser',
            email: 'login@example.com',
            password: 'password123',
            role: 'cashier' as const
        };

        await registerUser(input);

        const result = await loginUser({
            username: input.username,
            password: input.password
        });

        expect(result.username).toBe(input.username);
        expect(result.id).toBeDefined();
    });

    it('should throw error for invalid credentials', async () => {
        const input = {
            username: 'wrongpass',
            email: 'wrong@example.com',
            password: 'password123',
            role: 'cashier' as const
        };

        await registerUser(input);

        await expect(loginUser({
            username: input.username,
            password: 'wrongpassword'
        })).rejects.toThrow('Invalid credentials');
    });
});
