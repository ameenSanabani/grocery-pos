/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

// Feature flags — read from features.json at project root
// In the public edition, all premium flags are set to false

import featuresConfig from '../../../features.json';

export type FeatureName = 'analytics' | 'refunds' | 'procurement' | 'bulkImport';

const config = featuresConfig as Record<FeatureName, boolean>;

export function isFeatureEnabled(feature: FeatureName): boolean {
    return config[feature] ?? false;
}

/**
 * Maps feature names to their associated routes.
 * Used by permissions.ts to filter out disabled features from the sidebar.
 */
export const FEATURE_ROUTES: Record<FeatureName, string[]> = {
    analytics: ['/analytics'],
    refunds: ['/refunds'],
    procurement: ['/procurement'],
    bulkImport: [],  // bulk import is part of procurement UI, no separate route
};
