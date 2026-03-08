/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { useEffect } from 'react';
import { useAuthStore } from './useAuthStore';
import { useGlobalStore } from './useGlobalStore';
import { useCategoryStore } from './useCategoryStore';
import { useProductStore } from './useProductStore';
import { useCustomerStore } from './useCustomerStore';
import { useSupplierStore } from './useSupplierStore';
import { useCartStore } from './useCartStore';

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const fetchStoreProfile = useGlobalStore((state) => state.fetchStoreProfile);
    const fetchCategories = useCategoryStore((state) => state.fetchCategories);
    const fetchCustomers = useCustomerStore((state) => state.fetchCustomers);
    const fetchSuppliers = useSupplierStore((state) => state.fetchSuppliers);
    const fetchCart = useCartStore((state) => state.fetchCart);
    const fetchProducts = useProductStore((state) => state.fetchProducts);

    useEffect(() => {
        if (isAuthenticated) {
            // Initialize essential data when user is authenticated
            fetchStoreProfile();
            fetchCategories();
            fetchCustomers();
            fetchSuppliers();
            fetchCart();
            fetchProducts();
        }
    }, [isAuthenticated, fetchStoreProfile, fetchCategories, fetchCustomers, fetchSuppliers, fetchCart, fetchProducts]);

    return <>{children}</>;
}