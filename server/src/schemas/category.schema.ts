/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { z } from 'zod';

export const categorySchema = z.object({
    name: z.string().min(2),
    description: z.string().optional()
});

export type CategoryInput = z.infer<typeof categorySchema>;
