/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { FastifyReply, FastifyRequest } from 'fastify';
import { registerUser, loginUser, changePassword } from '../services/auth.service';
import db from '../db';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';

export async function registerHandler(
    request: FastifyRequest<{ Body: RegisterInput }>,
    reply: FastifyReply
) {
    try {
        const user = await registerUser(request.body);
        return reply.code(201).send(user);
    } catch (err: any) {
        return reply.code(400).send({ message: err.message });
    }
}

export async function loginHandler(
    request: FastifyRequest<{ Body: LoginInput }>,
    reply: FastifyReply
) {
    try {
        const user = await loginUser(request.body);

        // Generate JWT
        const token = await reply.jwtSign({
            id: user.id,
            role: user.role,
            username: user.username
        });

        return reply.code(200).send({ token, user });
    } catch (err: any) {
        return reply.code(401).send({ message: err.message });
    }
}

export async function getMeHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const userId = (request.user as any).id;
        const user = db.prepare('SELECT id, username, email, role, cash_limit FROM users WHERE id = ?').get(userId);
        if (!user) return reply.code(404).send({ message: 'User not found' });
        return reply.code(200).send(user);
    } catch (err: any) {
        return reply.code(500).send({ message: err.message });
    }
}

export async function changePasswordHandler(
    request: FastifyRequest<{ Body: any }>,
    reply: FastifyReply
) {
    try {
        const userId = (request.user as any).id;
        await changePassword(userId, request.body);
        return reply.code(200).send({ message: 'Password updated successfully' });
    } catch (err: any) {
        return reply.code(400).send({ message: err.message });
    }
}

export async function getUsersHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const users = db.prepare('SELECT id, username, email, role, cash_limit, created_at FROM users').all();
        return reply.code(200).send(users);
    } catch (err: any) {
        return reply.code(500).send({ message: err.message });
    }
}

export async function getSupervisorsHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const users = db.prepare("SELECT id, username, role FROM users WHERE role IN ('admin', 'manager') AND is_active = 1").all();
        return reply.code(200).send(users);
    } catch (err: any) {
        return reply.code(500).send({ message: err.message });
    }
}
