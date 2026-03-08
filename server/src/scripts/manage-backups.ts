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
const BACKUP_DIR = path.join(__dirname, '../../backups');
const MAX_BACKUPS = 5; // How many recent backups to keep

async function runBackup() {
    console.log('--- Database Management Task ---');

    // 1. Ensure backup directory exists
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR);
        console.log(`Created directory: ${BACKUP_DIR}`);
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `grocery_backup_${timestamp}.db`);

    // 2. Perform the backup
    try {
        const db = new Database(DB_PATH);
        console.log(`Starting backup of ${DB_PATH}...`);
        
        await db.backup(backupPath);
        
        const stats = fs.statSync(backupPath);
        const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
        
        console.log(`✅ Backup successful!`);
        console.log(`Saved to: ${backupPath} (${sizeInMB} MB)`);
        
        db.close();
    } catch (err) {
        console.error('❌ Backup failed:', err);
        process.exit(1);
    }

    // 3. Delete old backups (Pruning)
    try {
        const files = fs.readdirSync(BACKUP_DIR)
            .filter(f => f.startsWith('grocery_backup_') && f.endsWith('.db'))
            .map(f => ({
                name: f,
                path: path.join(BACKUP_DIR, f),
                time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime()
            }))
            .sort((a, b) => b.time - a.time); // Newest first

        if (files.length > MAX_BACKUPS) {
            console.log(`Cleaning up ${files.length - MAX_BACKUPS} old backup(s)...`);
            const filesToDelete = files.slice(MAX_BACKUPS);
            
            for (const file of filesToDelete) {
                fs.unlinkSync(file.path);
                console.log(`Deleted old backup: ${file.name}`);
            }
        }
    } catch (err) {
        console.error('⚠️ Could not clean up old backups:', err);
    }

    console.log('--- Task Complete ---');
}

runBackup();
