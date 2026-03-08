/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { z } from 'zod';

export const customerSchema = z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    credit_limit: z.number().nonnegative().default(0),
});

export const updateCustomerSchema = customerSchema.partial();

export const customerTransactionSchema = z.object({
    amount: z.number(),
    type: z.enum(['credit_purchase', 'payment', 'adjustment']),
    payment_method: z.enum(['cash', 'card', 'credit', 'other']).optional(),
    description: z.string().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerTransactionInput = z.infer<typeof customerTransactionSchema>;
