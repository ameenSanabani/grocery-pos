/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import dotenv from 'dotenv';
import { initDb } from './db';
import { validateLicense } from './license';
import { isFeatureEnabled } from './features';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import saleRoutes from './routes/sale.routes';
import supplierRoutes from './routes/supplier.routes';
import categoryRoutes from './routes/category.routes';
import customerRoutes from './routes/customer.routes';
import settingsRoutes from './routes/settings.routes';
import shiftRoutes from './routes/shift.routes';
import userRoutes from './routes/user.routes';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

dotenv.config();

const server: FastifyInstance = Fastify({
    logger: true
});

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.register(cors, {
    origin: '*'
});

// File upload support (for bulk barcode import)
server.register(multipart, {
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB max
        files: 1,
    },
});

// Register JWT
server.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'supersecret'
});

// ── Core Routes (always registered) ──
server.register(authRoutes, { prefix: '/api/auth' });
server.register(productRoutes, { prefix: '/api/products' });
server.register(saleRoutes, { prefix: '/api/sales' });
server.register(supplierRoutes, { prefix: '/api/suppliers' });
server.register(categoryRoutes, { prefix: '/api/categories' });
server.register(customerRoutes, { prefix: '/api/customers' });
server.register(settingsRoutes, { prefix: '/api/settings' });
server.register(shiftRoutes, { prefix: '/api/shifts' });
server.register(userRoutes, { prefix: '/api/users' });

if (isFeatureEnabled('procurement')) {
    server.register(purchaseRoutes, { prefix: '/api/purchase-orders' });
    console.log('📦 Procurement module: enabled');
}

server.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
});

const start = async () => {
    try {
        validateLicense(); // Verify license key (enforced in production)
        initDb(); // Initialize DB schema w/ tables
        const port = parseInt(process.env.PORT || '3001');
        await server.listen({ port, host: '0.0.0.0' });
        console.log(`Server listening on http://localhost:${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
