/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { FastifyInstance } from 'fastify';
import { getUsersHandler, createUserHandler, toggleUserStatusHandler, updateUserHandler } from '../controllers/user.controller';

export default async function userRoutes(server: FastifyInstance) {
    server.addHook('onRequest', async (request, reply) => {
        try {
            await request.jwtVerify();
            const role = (request.user as any).role;
            if (role !== 'admin' && role !== 'manager') {
                return reply.code(403).send({ message: 'Forbidden: Admins or Managers only' });
            }
        } catch (err) {
            reply.code(401).send({ message: 'Unauthorized' });
        }
    });

    server.get('/', getUsersHandler);
    server.post('/', createUserHandler);
    server.put('/:id', updateUserHandler);
    server.patch('/:id/toggle', toggleUserStatusHandler);
}
