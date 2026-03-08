/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { FastifyInstance } from 'fastify';
import {
    createCustomerHandler,
    getCustomersHandler,
    getCustomerHandler,
    updateCustomerHandler,
    getCustomerHistoryHandler,
    addCustomerTransactionHandler
} from '../controllers/customer.controller';
import { customerSchema, updateCustomerSchema, customerTransactionSchema } from '../schemas/customer.schema';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function customerRoutes(server: FastifyInstance) {
    const app = server.withTypeProvider<ZodTypeProvider>();

    app.addHook('onRequest', async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.code(401).send({ message: 'Unauthorized' });
        }
    });

    app.post('/', { schema: { body: customerSchema } }, createCustomerHandler);
    app.get('/', getCustomersHandler);
    app.get('/:id', getCustomerHandler);
    app.patch('/:id', { schema: { body: updateCustomerSchema } }, updateCustomerHandler);
    app.get('/:id/history', getCustomerHistoryHandler);
    app.post('/:id/transactions', { schema: { body: customerTransactionSchema } }, addCustomerTransactionHandler);
}
