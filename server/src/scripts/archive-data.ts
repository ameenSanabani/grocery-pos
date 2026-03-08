/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../grocery.db');
const ARCHIVE_DIR = path.join(__dirname, '../../archives');

// Get months to keep from command line argument, default to 12
const args = process.argv.slice(2);
const monthsToKeep = args[0] ? parseInt(args[0]) : 12;

if (isNaN(monthsToKeep) || monthsToKeep < 0) {
    console.error('❌ Error: Please provide a valid number of months to keep (e.g., npm run archive 6)');
    process.exit(1);
}

async function runArchiving() {
    console.log('--- Database Shrinking: Sales Archiving ---');
    console.log(`Setting: Keeping the last ${monthsToKeep} month(s) of sales.`);

    if (!fs.existsSync(ARCHIVE_DIR)) {
        fs.mkdirSync(ARCHIVE_DIR);
    }

    const db = new Database(DB_PATH);
    
    // Calculate cutoff date based on user input
    const cutoffDate = new Date();
    cutoffDate.setMonth(cutoffDate.getMonth() - monthsToKeep);
    const cutoffStr = cutoffDate.toISOString();
    
    // Name the archive file based on the date of the archiving task
    const archiveTimestamp = new Date().toISOString().split('T')[0];
    const archiveDbPath = path.join(ARCHIVE_DIR, `sales_archive_created_${archiveTimestamp}.db`);
    
    console.log(`Target: Moving sales created BEFORE ${cutoffStr.split('T')[0]}`);
    console.log(`Archive Destination: ${archiveDbPath}`);

    try {
        // 1. Attach the archive database
        db.prepare(`ATTACH DATABASE ? AS archive`).run(archiveDbPath);

        // 2. Create tables in the archive file
        db.exec(`
            CREATE TABLE IF NOT EXISTS archive.sales (
                id TEXT PRIMARY KEY,
                receipt_ref TEXT,
                user_id TEXT,
                customer_id TEXT,
                subtotal REAL,
                tax_total REAL,
                discount_total REAL,
                grand_total REAL,
                payment_method TEXT,
                status TEXT,
                created_at TEXT
            );

            CREATE TABLE IF NOT EXISTS archive.sale_items (
                id TEXT PRIMARY KEY,
                sale_id TEXT,
                product_id TEXT,
                quantity REAL,
                unit_price_at_sale REAL,
                tax_rate_at_sale REAL,
                subtotal REAL
            );
        `);

        // 3. Move the data inside a transaction
        const archiveTransaction = db.transaction(() => {
            const countRow = db.prepare(`SELECT COUNT(*) as count FROM main.sales WHERE created_at < ?`).get(cutoffStr) as { count: number };
            
            if (countRow.count === 0) {
                console.log('No sales found older than the cutoff date. Nothing to archive.');
                return false;
            }

            console.log(`Moving ${countRow.count} sales and their items to archive...`);

            // A. Copy to Archive
            db.prepare(`INSERT INTO archive.sales SELECT * FROM main.sales WHERE created_at < ?`).run(cutoffStr);
            db.prepare(`
                INSERT INTO archive.sale_items 
                SELECT * FROM main.sale_items 
                WHERE sale_id IN (SELECT id FROM main.sales WHERE created_at < ?)
            `).run(cutoffStr);

            // B. Delete from Main Database
            db.prepare(`
                DELETE FROM main.sale_items 
                WHERE sale_id IN (SELECT id FROM main.sales WHERE created_at < ?)
            `).run(cutoffStr);

            db.prepare(`DELETE FROM main.sales WHERE created_at < ?`).run(cutoffStr);

            return true;
        });

        const moved = archiveTransaction();

        // 4. Detach and Shrink
        db.prepare(`DETACH DATABASE archive`).run();

        if (moved) {
            console.log('✅ Sales history successfully moved to archive.');
            console.log('Starting VACUUM to shrink the main database file (this may take a moment)...');
            db.exec('VACUUM');
            console.log('✅ VACUUM complete. Main database file has been shrunk.');
        }

        db.close();
    } catch (err) {
        console.error('❌ Archiving failed:', err);
        process.exit(1);
    }

    console.log('--- Task Complete ---');
}

runArchiving();
