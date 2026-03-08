/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { FastifyInstance } from 'fastify';
import { getCategoriesHandler, createCategoryHandler } from '../controllers/category.controller';

export default async function categoryRoutes(server: FastifyInstance) {
    server.get('/', getCategoriesHandler);
    server.post('/', createCategoryHandler);
}
