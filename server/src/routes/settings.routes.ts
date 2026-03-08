/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { FastifyInstance } from 'fastify';
import { getStoreProfileHandler, updateStoreProfileHandler } from '../controllers/settings.controller';
import { storeProfileSchema } from '../schemas/settings.schema';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function settingsRoutes(server: FastifyInstance) {
    const app = server.withTypeProvider<ZodTypeProvider>();

    app.get('/store-profile', getStoreProfileHandler);

    app.patch('/store-profile', {
        schema: {
            body: storeProfileSchema
        }
    }, updateStoreProfileHandler);
}
