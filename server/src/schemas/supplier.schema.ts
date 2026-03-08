/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { z } from 'zod';

export const createSupplierSchema = z.object({
    name: z.string().min(1),
    contact_person: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial();

export const createPurchaseOrderSchema = z.object({
    supplier_id: z.string().uuid(),
    items: z.array(z.object({
        product_id: z.string().uuid(),
        quantity: z.number().positive(),
        unit_cost: z.number().positive(),
        expiry_date: z.string().optional(), // ISO date string
    })).min(1),
    notes: z.string().optional(),
});

export const receivePurchaseOrderSchema = z.object({
    items_received: z.array(z.object({
        id: z.string().uuid(), // purchase order item id
        quantity_received: z.number().nonnegative(),
        expiry_date: z.string().optional(),
    })),
});

export type CreateSupplierInput = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>;
export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderSchema>;
