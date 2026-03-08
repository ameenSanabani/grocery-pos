/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { z } from 'zod';

export const storeProfileSchema = z.object({
    name: z.string().min(1),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    tax_number: z.string().optional(),
    currency_symbol: z.string().default('$'),
    vibrant_color: z.string().default('#059669'), // Emerald-600 default
});

export type StoreProfileInput = z.infer<typeof storeProfileSchema>;
