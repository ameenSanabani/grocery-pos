/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

// Global and shared stores
export { useGlobalStore } from './useGlobalStore';
export { StoreProvider } from './StoreProvider';

// Entity-specific stores
export { useProductStore } from './useProductStore';
export { useCustomerStore } from './useCustomerStore';
export { useSupplierStore } from './useSupplierStore';
export { useCategoryStore } from './useCategoryStore';
export { useAnalyticsStore } from './useAnalyticsStore';

// Authentication and shift management
export { useAuthStore, useShiftStore } from './useAuthStore';

// Cart store (existing)
export { useCartStore } from './useCartStore';

// Types
export type { StoreProfile } from './useGlobalStore';
export type { Product } from './useProductStore';
export type { Customer } from './useCustomerStore';
export type { Supplier } from './useSupplierStore';
export type { Category } from './useCategoryStore';
export type { User, Shift, Register } from './useAuthStore';
export type { CartItem } from './useCartStore';
export type { 
    AnalyticsSummary, 
    TrendData, 
    TopProduct, 
    AgingDebt 
} from './useAnalyticsStore';