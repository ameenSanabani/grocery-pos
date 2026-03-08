/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { z } from 'zod';

// Sale item within a transaction
export const saleItemSchema = z.object({
    product_id: z.string().uuid(),
    quantity: z.number().positive(),
    unit_price: z.number().positive().optional(), // Override price if needed
});

// Create a new sale transaction
export const createSaleSchema = z.object({
    items: z.array(saleItemSchema).min(1),
    payment_method: z.enum(['cash', 'card', 'credit', 'split']),
    customer_id: z.string().uuid().optional(), // Required for credit payments
    discount_total: z.number().min(0).default(0),
    amount_tendered: z.number().positive().optional(), // For cash transactions
});

// Void a sale
export const voidSaleSchema = z.object({
    reason: z.string().min(1),
});

// Refund items from a sale
export const refundSaleSchema = z.object({
    items: z.array(z.object({
        product_id: z.string().uuid(),
        quantity: z.number().positive(),
    })).min(1),
    reason: z.string().optional(),
});

// Manual return (no receipt)
export const manualReturnSchema = z.object({
    customer_name: z.string().nullable().optional(),
    customer_id: z.string().uuid().nullable().optional(),
    items: z.array(z.object({
        product_id: z.string().uuid(),
        quantity: z.number().positive(),
        unit_price: z.number().positive(), // Price they claim to have paid
    })).min(1),
    payment_method: z.enum(['cash', 'credit']),
    reason: z.string().optional(),
});

// Query sales
export const salesQuerySchema = z.object({
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    user_id: z.string().optional(),
    status: z.enum(['completed', 'voided', 'refunded']).optional(),
    limit: z.string().default('50'),
    offset: z.string().default('0'),
});

export type SaleItem = z.infer<typeof saleItemSchema>;
export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type VoidSaleInput = z.infer<typeof voidSaleSchema>;
export type RefundSaleInput = z.infer<typeof refundSaleSchema>;
export type ManualReturnInput = z.infer<typeof manualReturnSchema>;
export type SalesQuery = z.infer<typeof salesQuerySchema>;
