/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { FastifyReply, FastifyRequest } from 'fastify';
import db from '../db';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';

export async function getUsersHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
        const users = db.prepare('SELECT id, username, email, role, cash_limit, is_active, created_at FROM users').all();
        return reply.code(200).send(users);
    } catch (err: any) {
        return reply.code(500).send({ message: err.message });
    }
}

export async function createUserHandler(
    request: FastifyRequest<{ Body: any }>,
    reply: FastifyReply
) {
    try {
        const { username, email, password, role, cash_limit } = request.body as any;
        const password_hash = await bcrypt.hash(password, 10);
        const id = uuid();

        db.prepare(`
            INSERT INTO users (id, username, email, password_hash, role, cash_limit)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(id, username, email, password_hash, role, cash_limit || 500.00);

        return reply.code(201).send({ id, username, email, role, cash_limit });
    } catch (err: any) {
        return reply.code(400).send({ message: err.message });
    }
}

export async function updateUserHandler(
    request: FastifyRequest<{ Params: { id: string }, Body: any }>,
    reply: FastifyReply
) {
    try {
        const { id } = request.params;
        const { username, email, role, cash_limit, password } = request.body as any;

        const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
        if (!user) return reply.code(404).send({ message: 'User not found' });

        let sql = 'UPDATE users SET username = ?, email = ?, role = ?, cash_limit = ?, updated_at = CURRENT_TIMESTAMP';
        const params: any[] = [username, email, role, cash_limit];

        if (password && password.length >= 6) {
            const password_hash = await bcrypt.hash(password, 10);
            sql += ', password_hash = ?';
            params.push(password_hash);
        }

        sql += ' WHERE id = ?';
        params.push(id);

        db.prepare(sql).run(...params);

        return reply.code(200).send({ id, username, email, role, cash_limit });
    } catch (err: any) {
        return reply.code(400).send({ message: err.message });
    }
}

export async function toggleUserStatusHandler(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) {
    try {
        const user = db.prepare('SELECT is_active FROM users WHERE id = ?').get(request.params.id) as any;
        if (!user) return reply.code(404).send({ message: 'User not found' });

        const newStatus = user.is_active === 1 ? 0 : 1;
        db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(newStatus, request.params.id);

        return reply.code(200).send({ is_active: newStatus });
    } catch (err: any) {
        return reply.code(500).send({ message: err.message });
    }
}
