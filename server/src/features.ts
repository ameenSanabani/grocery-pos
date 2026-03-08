/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import path from 'path';
import fs from 'fs';

export type FeatureName = 'analytics' | 'refunds' | 'procurement' | 'bulkImport';

interface FeaturesConfig {
    analytics: boolean;
    refunds: boolean;
    procurement: boolean;
    bulkImport: boolean;
}

let config: FeaturesConfig;

try {
    const configPath = path.resolve(__dirname, '../../features.json');
    const raw = fs.readFileSync(configPath, 'utf-8');
    config = JSON.parse(raw);
} catch {
    // Default: all features enabled (private/full version)
    config = {
        analytics: true,
        refunds: true,
        procurement: true,
        bulkImport: true,
    };
}

export function isFeatureEnabled(feature: FeatureName): boolean {
    return config[feature] ?? false;
}

export function getEnabledFeatures(): FeatureName[] {
    return (Object.keys(config) as FeatureName[]).filter(f => config[f]);
}
