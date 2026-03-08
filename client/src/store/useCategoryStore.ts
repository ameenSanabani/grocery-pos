/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Category {
    id: string;
    name: string;
    description?: string;
}

interface CategoryStore {
    categories: Category[];
    loading: boolean;
    // --- ADDED THIS ---
    selectedCategory: Category | null;
    setSelectedCategory: (category: Category | null) => void;
    // ------------------
    fetchCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryStore>((set) => ({
    categories: [],
    loading: false,

    // --- ADDED THIS ---
    selectedCategory: null,
    setSelectedCategory: (category) => set({ selectedCategory: category }),
    // ------------------

    fetchCategories: async () => {
        set({ loading: true });
        try {
            const data = await api.get<Category[]>('/categories');
            set({ categories: data });
        } catch (err) {
            console.error('Failed to fetch categories');
        } finally {
            set({ loading: false });
        }
    }
}));