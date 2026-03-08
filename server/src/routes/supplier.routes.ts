/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { FastifyInstance } from 'fastify';
import {
    createSupplierHandler,
    getSuppliersHandler,
    getSupplierHandler,
    updateSupplierHandler,
    deleteSupplierHandler
} from '../controllers/supplier.controller';
import { createSupplierSchema, updateSupplierSchema } from '../schemas/supplier.schema';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function supplierRoutes(server: FastifyInstance) {
    const app = server.withTypeProvider<ZodTypeProvider>();

    // Add authentication hook (all supplier routes require authentication)
    app.addHook('onRequest', async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.code(401).send({ message: 'Unauthorized' });
        }
    });

    // Create supplier
    app.post(
        '/',
        {
            schema: {
                body: createSupplierSchema,
            },
        },
        createSupplierHandler
    );

    // Get all suppliers
    app.get('/', getSuppliersHandler);

    // Get supplier by ID
    app.get('/:id', getSupplierHandler);

    // Update supplier
    app.put(
        '/:id',
        {
            schema: {
                body: updateSupplierSchema,
            },
        },
        updateSupplierHandler
    );

    // Delete supplier
    app.delete('/:id', deleteSupplierHandler);
}
