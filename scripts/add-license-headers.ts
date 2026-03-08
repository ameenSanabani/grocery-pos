/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 *
 * Script: Adds license headers to all source files.
 * Usage:  npx ts-node scripts/add-license-headers.ts
 */

import fs from 'fs';
import path from 'path';

const HEADER_BLOCK = `/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */`;

const MARKER = 'PolyForm Noncommercial License 1.0.0';

const EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs']);

const SCAN_DIRS = [
    path.resolve(__dirname, '../server/src'),
    path.resolve(__dirname, '../client/src'),
];

let added = 0;
let skipped = 0;
let errors = 0;

function processFile(filePath: string): void {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');

        if (content.includes(MARKER)) {
            skipped++;
            return;
        }

        const newContent = HEADER_BLOCK + '\n\n' + content;
        fs.writeFileSync(filePath, newContent, 'utf-8');
        console.log(`  ✅ ${path.relative(process.cwd(), filePath)}`);
        added++;
    } catch (err) {
        console.error(`  ❌ Error processing ${filePath}:`, err);
        errors++;
    }
}

function walkDir(dir: string): void {
    if (!fs.existsSync(dir)) {
        console.warn(`⚠️  Directory not found: ${dir}`);
        return;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            // Skip node_modules, .next, dist, __tests__ directories
            if (['node_modules', '.next', 'dist', '__pycache__'].includes(entry.name)) {
                continue;
            }
            walkDir(fullPath);
        } else if (entry.isFile() && EXTENSIONS.has(path.extname(entry.name))) {
            processFile(fullPath);
        }
    }
}

console.log('🔧 Adding license headers to source files...\n');

for (const dir of SCAN_DIRS) {
    console.log(`📂 Scanning: ${dir}`);
    walkDir(dir);
    console.log('');
}

console.log(`\n📊 Summary:`);
console.log(`   Added:   ${added} files`);
console.log(`   Skipped: ${skipped} files (already had header)`);
console.log(`   Errors:  ${errors} files`);
