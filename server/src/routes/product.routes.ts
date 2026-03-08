/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { FastifyInstance } from 'fastify';
import {
    createProductHandler,
    getProductsHandler,
    getProductHandler,
    getProductByBarcodeHandler,
    updateProductHandler,
    deleteProductHandler,
    adjustStockHandler
} from '../controllers/product.controller';
import {
    createProductSchema,
    updateProductSchema,
    productQuerySchema
} from '../schemas/product.schema';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

export default async function productRoutes(server: FastifyInstance) {
    const app = server.withTypeProvider<ZodTypeProvider>();

    // Add authentication hook for all product routes
    app.addHook('onRequest', async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.send(err);
        }
    });

    // Create product
    app.post(
        '/',
        {
            schema: {
                body: createProductSchema,
            },
        },
        createProductHandler
    );

    // Get all products with filters
    app.get(
        '/',
        {
            schema: {
                querystring: productQuerySchema,
            },
        },
        getProductsHandler
    );

    // Get product by ID
    app.get('/:id', getProductHandler);

    // Get product by barcode
    app.get('/barcode/:barcode', getProductByBarcodeHandler);

    // Update product
    app.put(
        '/:id',
        {
            schema: {
                body: updateProductSchema,
            },
        },
        updateProductHandler
    );

    // Delete product (soft delete)
    app.delete('/:id', deleteProductHandler);

    // Adjust stock
    app.post(
        '/:id/stock',
        {
            schema: {
                body: z.object({
                    quantity: z.number(),
                    reason: z.string(),
                }),
            },
        },
        adjustStockHandler
    );
}
