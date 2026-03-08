/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { z } from 'zod';

export const createProductSchema = z.object({
    sku: z.string().min(1),
    barcode: z.string().optional(),
    name: z.string().min(1),
    description: z.string().optional(),
    category_id: z.number().int().positive().optional(),
    cost_price: z.number().positive(),
    selling_price: z.number().positive(),
    tax_rate: z.number().min(0).max(100).default(0),
    is_perishable: z.boolean().default(false),
    is_weighed: z.boolean().default(false),
    display_order: z.number().int().optional(),
    reorder_level: z.number().default(10),
    initial_quantity: z.number().min(0).default(0),
});

export const updateProductSchema = createProductSchema.partial();

export const productQuerySchema = z.object({
    search: z.string().optional(),
    category_id: z.string().optional(),
    barcode: z.string().optional(),
    limit: z.string().default('50'),
    offset: z.string().default('0'),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductQuery = z.infer<typeof productQuerySchema>;
