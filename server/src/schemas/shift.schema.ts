/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { z } from 'zod';

export const openShiftSchema = z.object({
    register_id: z.string(),
    opening_balance: z.number().min(0),
});

export const closeShiftSchema = z.object({
    closing_balance: z.number().min(0),
    notes: z.string().optional(),
    supervisor_id: z.string().optional(),
});

export const cashDropSchema = z.object({
    amount: z.number().positive(),
    notes: z.string().optional(),
});

export type OpenShiftInput = z.infer<typeof openShiftSchema>;
export type CloseShiftInput = z.infer<typeof closeShiftSchema>;
export type CashDropInput = z.infer<typeof cashDropSchema>;
