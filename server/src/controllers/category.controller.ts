/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import db from '../db';
import { v4 as uuidv4 } from 'uuid';
import { categorySchema } from '../schemas/category.schema';

export async function getCategoriesHandler(request: FastifyRequest, reply: FastifyReply) {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name ASC').all();
    return categories;
}

export async function createCategoryHandler(request: FastifyRequest, reply: FastifyReply) {
    const body = categorySchema.parse(request.body);

    const result = db.prepare('INSERT INTO categories (name, description) VALUES (?, ?)')
        .run(body.name, body.description || null);

    return { id: result.lastInsertRowid, ...body };
}
