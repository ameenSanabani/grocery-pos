/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { FastifyInstance } from 'fastify';
import {
    openShiftHandler,
    closeShiftHandler,
    recordCashDropHandler,
    getActiveShiftHandler,
    getRegistersHandler
} from '../controllers/shift.controller';
import { openShiftSchema, closeShiftSchema, cashDropSchema } from '../schemas/shift.schema';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function shiftRoutes(server: FastifyInstance) {
    const app = server.withTypeProvider<ZodTypeProvider>();

    app.addHook('onRequest', async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.code(401).send({ message: 'Unauthorized' });
        }
    });

    app.get('/active', getActiveShiftHandler);
    app.get('/registers', getRegistersHandler);

    app.post('/open', {
        schema: {
            body: openShiftSchema
        }
    }, openShiftHandler);

    app.post('/:id/drop', {
        schema: {
            body: cashDropSchema
        }
    }, recordCashDropHandler);

    app.post('/:id/close', {
        schema: {
            body: closeShiftSchema
        }
    }, closeShiftHandler);
}
