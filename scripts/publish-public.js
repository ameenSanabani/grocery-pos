/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 *
 * Script: Produces a stripped "public edition" of the codebase.
 * Usage:  node scripts/publish-public.js
 *
 * Output: ../grocery-pos-public/
 *   - All premium files removed
 *   - features.json set to all false
 *   - Ready to git init and push to a new public repo
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.resolve(ROOT, '..', 'grocery-pos-public');

// ── Premium files to DELETE from the public edition ──
const PREMIUM_FILES = [
    // Server: Analytics
    'server/src/controllers/analytics.controller.ts',
    'server/src/services/analytics.service.ts',
    'server/src/routes/analytics.routes.ts',

    // Server: Bulk Import
    'server/src/controllers/bulkImport.controller.ts',
    'server/src/services/bulkImport.service.ts',

    // Server: Procurement / Purchase Orders
    'server/src/controllers/purchase.controller.ts',
    'server/src/services/purchase.service.ts',
    'server/src/routes/purchase.routes.ts',

    // Server: Refund
    'server/src/services/refund.service.ts',
    'server/src/services/__tests__/refund.test.ts',

    // Client: Premium pages
    'client/src/app/analytics/page.tsx',
    'client/src/app/procurement/page.tsx',
    'client/src/app/refunds/page.tsx',

    // Client: Premium components
    'client/src/components/procurement/BulkImportModal.tsx',
    'client/src/components/procurement/POInvoice.tsx',
    'client/src/components/procurement/PurchaseOrderModal.tsx',
    'client/src/components/procurement/ReceiveStockModal.tsx',

    // Client: Premium stores
    'client/src/store/useAnalyticsStore.ts',
];

// ── Directories to SKIP during copy ──
const SKIP_DIRS = new Set([
    'node_modules',
    '.next',
    'dist',
    '.git',
    '.env',
    '.env.local',
    'grocery.db',
    'grocery.db-wal',
    'grocery.db-shm',
]);

// ── Helper: recursive copy ──
function copyDirSync(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        if (SKIP_DIRS.has(entry.name)) continue;

        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// ── Helper: delete file if it exists ──
function deleteIfExists(filePath) {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`  🗑️  Deleted: ${path.relative(OUTPUT, filePath)}`);
        return true;
    }
    return false;
}

// ── Helper: try to remove empty parent directories ──
function removeEmptyDirs(dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const entries = fs.readdirSync(dirPath);
    if (entries.length === 0) {
        fs.rmdirSync(dirPath);
        console.log(`  🗑️  Removed empty dir: ${path.relative(OUTPUT, dirPath)}`);
    }
}

// ── Helper: Remove premium imports from index.ts ──
function cleanServerIndex(indexPath) {
    if (!fs.existsSync(indexPath)) return;
    let content = fs.readFileSync(indexPath, 'utf-8');

    // Remove import lines for premium routes
    content = content.replace(/^import purchaseRoutes.*\r?\n/m, '');
    content = content.replace(/^import analyticsRoutes.*\r?\n/m, '');

    // Remove the conditional registration blocks
    content = content.replace(/\/\/ ── Premium Routes.*?console\.log\([^)]*\);\s*\}\s*/gs, '');

    fs.writeFileSync(indexPath, content, 'utf-8');
    console.log('  ✏️  Cleaned premium imports from server/src/index.ts');
}

// ══════════════════════════════════════
//  MAIN
// ══════════════════════════════════════
console.log('🔧 Publishing public edition...\n');

// Step 1: Copy project
console.log(`📂 Copying project to: ${OUTPUT}`);
if (fs.existsSync(OUTPUT)) {
    console.log('   ⚠️  Output directory already exists. Deleting it first...');
    fs.rmSync(OUTPUT, { recursive: true, force: true });
}
copyDirSync(ROOT, OUTPUT);
console.log('   ✅ Copy complete\n');

// Step 2: Delete premium files
console.log('🗑️  Removing premium files...');
let deleted = 0;
for (const file of PREMIUM_FILES) {
    if (deleteIfExists(path.join(OUTPUT, file))) deleted++;
}

// Clean up empty directories
const premiumDirs = [
    'client/src/app/analytics',
    'client/src/app/procurement',
    'client/src/app/refunds',
    'client/src/components/procurement',
    'server/src/services/__tests__',
];
for (const dir of premiumDirs) {
    removeEmptyDirs(path.join(OUTPUT, dir));
}
console.log(`   Deleted ${deleted} premium files\n`);

// Step 3: Set features.json to all false
console.log('⚙️  Setting features.json to public mode...');
const publicFeatures = {
    analytics: false,
    refunds: false,
    procurement: false,
    bulkImport: false,
};
fs.writeFileSync(
    path.join(OUTPUT, 'features.json'),
    JSON.stringify(publicFeatures, null, 2) + '\n',
    'utf-8'
);
console.log('   ✅ All premium features disabled\n');

// Step 4: Clean server index.ts
console.log('✏️  Cleaning server index.ts...');
cleanServerIndex(path.join(OUTPUT, 'server/src/index.ts'));
console.log('');

// Step 5: Summary
console.log('══════════════════════════════════════');
console.log('✅ Public edition ready!');
console.log(`📁 Output: ${OUTPUT}`);
console.log('');
console.log('Next steps:');
console.log('  1. cd ../grocery-pos-public');
console.log('  2. git init');
console.log('  3. git remote add origin https://github.com/YOUR_USERNAME/grocery-pos.git');
console.log('  4. git add . && git commit -m "Initial public release"');
console.log('  5. git push -u origin main');
console.log('══════════════════════════════════════');
