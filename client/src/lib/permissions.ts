/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { isFeatureEnabled, FEATURE_ROUTES, type FeatureName } from './features';

/**
 * Role-Based Access Control (RBAC) Permission Configuration
 * 
 * Roles:
 * - cashier: POS only, Settings (password change only)
 * - manager: Full access except user management
 * - admin: Full administrative privileges
 */

export type Role = 'cashier' | 'manager' | 'admin';

/**
 * Route permissions - which roles can access which routes
 */
export const ROUTE_PERMISSIONS: Record<string, Role[]> = {
    '/pos': ['cashier', 'manager', 'admin'],
    '/analytics': ['manager', 'admin'],
    '/inventory': ['manager', 'admin'],
    '/customers': ['manager', 'admin'],
    '/suppliers': ['manager', 'admin'],
    '/procurement': ['manager', 'admin'],
    '/refunds': ['manager', 'admin'],
    '/settings': ['cashier', 'manager', 'admin'],  // Content filtered in component
    '/admin/users': ['admin'],
};

/**
 * Feature permissions - granular control over specific features
 */
export const FEATURE_PERMISSIONS = {
    userManagement: ['admin'] as Role[],
    storeProfileEdit: ['admin'] as Role[],
    fullSettings: ['manager', 'admin'] as Role[],  // Full settings access
    voidSale: ['manager', 'admin'] as Role[],
};

/**
 * Routes that are disabled because their feature flag is off.
 * Built once at module load time.
 */
const disabledRoutes = new Set<string>();
for (const [feature, routes] of Object.entries(FEATURE_ROUTES)) {
    if (!isFeatureEnabled(feature as FeatureName)) {
        for (const route of routes) {
            disabledRoutes.add(route);
        }
    }
}

/**
 * Check if user can access a specific route.
 * Returns false if the route's feature is disabled OR if the user's role
 * doesn't have permission.
 */
export function canAccess(userRole: string | undefined, route: string): boolean {
    if (!userRole) return false;
    if (disabledRoutes.has(route)) return false;
    const allowed = ROUTE_PERMISSIONS[route];
    return allowed?.includes(userRole as Role) ?? false;
}

/**
 * Check if user has a specific feature permission
 */
export function hasFeature(userRole: string | undefined, feature: keyof typeof FEATURE_PERMISSIONS): boolean {
    if (!userRole) return false;
    return FEATURE_PERMISSIONS[feature].includes(userRole as Role);
}

/**
 * Get all accessible routes for a role
 */
export function getAccessibleRoutes(userRole: string | undefined): string[] {
    if (!userRole) return [];
    return Object.entries(ROUTE_PERMISSIONS)
        .filter(([route, roles]) => !disabledRoutes.has(route) && roles.includes(userRole as Role))
        .map(([route]) => route);
}
