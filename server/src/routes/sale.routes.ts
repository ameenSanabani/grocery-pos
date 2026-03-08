/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { FastifyInstance } from 'fastify';
import {
    createSaleHandler,
    getSalesHandler,
    getSaleHandler,
    getSaleByReceiptHandler,
    voidSaleHandler,
    getDailySummaryHandler,
    refundSaleHandler,
    manualReturnHandler
} from '../controllers/sale.controller';
import { createSaleSchema, voidSaleSchema, salesQuerySchema, refundSaleSchema, manualReturnSchema } from '../schemas/sale.schema';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { isFeatureEnabled } from '../features';

export default async function saleRoutes(server: FastifyInstance) {
    const app = server.withTypeProvider<ZodTypeProvider>();

    // Authentication hook for all sale routes
    app.addHook('onRequest', async (request, reply) => {
        try {
            await request.jwtVerify();
        } catch (err) {
            reply.code(401).send({ message: 'Unauthorized' });
        }
    });

    // Create new sale (POS transaction)
    app.post(
        '/',
        {
            schema: {
                body: createSaleSchema,
            },
        },
        createSaleHandler
    );

    // Get all sales with filters
    app.get(
        '/',
        {
            schema: {
                querystring: salesQuerySchema,
            },
        },
        getSalesHandler
    );

    // Get daily summary/report
    app.get(
        '/summary',
        {
            schema: {
                querystring: z.object({
                    date: z.string().optional(),
                }),
            },
        },
        getDailySummaryHandler
    );

    // Get sale by ID
    app.get('/:id', getSaleHandler);

    // Get sale by receipt reference
    app.get('/receipt/:receipt', getSaleByReceiptHandler);

    // Void a sale
    app.post(
        '/:id/void',
        {
            schema: {
                body: voidSaleSchema,
            },
        },
        voidSaleHandler
    );

    // ── Premium: Refund routes (gated by feature flag) ──
    if (isFeatureEnabled('refunds')) {
        // Refund a sale (Receipt-based)
        app.post(
            '/:id/refund',
            {
                schema: {
                    body: refundSaleSchema,
                },
            },
            refundSaleHandler
        );

        // Manual return (No receipt)
        app.post(
            '/manual-return',
            {
                schema: {
                    body: manualReturnSchema,
                },
            },
            manualReturnHandler
        );
    }
}
