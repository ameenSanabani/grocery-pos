/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { FastifyInstance } from 'fastify';
import { registerHandler, loginHandler, getMeHandler, changePasswordHandler, getUsersHandler, getSupervisorsHandler } from '../controllers/auth.controller';
import { registerSchema, loginSchema, changePasswordSchema } from '../schemas/auth.schema';
import { z } from 'zod';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function authRoutes(server: FastifyInstance) {
    const app = server.withTypeProvider<ZodTypeProvider>();

    app.post(
        '/register',
        {
            schema: {
                body: registerSchema,
            },
        },
        registerHandler
    );

    app.post(
        '/login',
        {
            schema: {
                body: loginSchema,
            },
        },
        loginHandler
    );

    app.get(
        '/me',
        {
            onRequest: [async (request, reply) => {
                try {
                    await request.jwtVerify();
                } catch (err) {
                    reply.code(401).send({ message: 'Unauthorized' });
                }
            }],
        },
        getMeHandler
    );

    app.post(
        '/change-password',
        {
            onRequest: [async (request, reply) => {
                try {
                    await request.jwtVerify();
                } catch (err) {
                    reply.code(401).send({ message: 'Unauthorized' });
                }
            }],
            schema: {
                body: changePasswordSchema,
            },
        },
        changePasswordHandler
    );

    app.get(
        '/users',
        {
            onRequest: [async (request, reply) => {
                try {
                    await request.jwtVerify();
                    // Optional: check for admin role here if needed
                } catch (err) {
                    reply.code(401).send({ message: 'Unauthorized' });
                }
            }]
        },
        getUsersHandler
    );

    app.get(
        '/supervisors',
        {
            onRequest: [async (request, reply) => {
                try {
                    await request.jwtVerify();
                    // Optional: check for admin role here if needed
                } catch (err) {
                    reply.code(401).send({ message: 'Unauthorized' });
                }
            }]
        },
        getSupervisorsHandler
    );
}
