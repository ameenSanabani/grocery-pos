/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import db from '../db';
import { v4 as uuid } from 'uuid';
import { OpenShiftInput, CloseShiftInput, CashDropInput } from '../schemas/shift.schema';

export function getActiveShift(userId: string) {
    const shift = db.prepare(`
        SELECT s.*, r.name as register_name 
        FROM register_shifts s
        JOIN registers r ON s.register_id = r.id
        WHERE s.user_id = ? AND s.status = 'open'
    `).get(userId) as any;

    if (!shift) return null;

    // Calculate real-time balance
    const cashSales = db.prepare(`
        SELECT SUM(grand_total) as total 
        FROM sales 
        WHERE created_at >= ? AND user_id = ? 
          AND payment_method = 'cash' 
          AND status IN ('completed', 'partially_refunded', 'refunded')
    `).get(shift.start_time, shift.user_id) as { total: number };

    const drops = db.prepare(`SELECT SUM(amount) as total FROM cash_drops WHERE shift_id = ?`).get(shift.id) as { total: number };

    const refunds = db.prepare(`
        SELECT SUM(amount) as total 
        FROM refunds 
        WHERE created_at >= ? AND user_id = ? 
          AND payment_method = 'cash'
    `).get(shift.start_time, shift.user_id) as { total: number };

    // Transaction count
    const actions = db.prepare(`
        SELECT COUNT(*) as count 
        FROM sales 
        WHERE created_at >= ? AND user_id = ? AND status = 'completed'
    `).get(shift.start_time, shift.user_id) as { count: number };

    const current_balance = shift.opening_balance + (cashSales.total || 0) - (drops.total || 0) - (refunds.total || 0);

    return {
        ...shift,
        current_balance,
        total_cash_sales: cashSales.total || 0,
        total_drops: drops.total || 0,
        transaction_count: actions.count || 0
    };
}

export function openShift(userId: string, input: OpenShiftInput) {
    const existing = getActiveShift(userId);
    if (existing) {
        throw new Error('You already have an active shift open.');
    }

    // Register exclusivity check
    const registerOccupied = db.prepare("SELECT user_id FROM register_shifts WHERE register_id = ? AND status = 'open'").get(input.register_id);
    if (registerOccupied) {
        throw new Error('This register is already in use by another cashier.');
    }

    const id = uuid();
    const stmt = db.prepare(`
        INSERT INTO register_shifts (id, register_id, user_id, opening_balance, status)
        VALUES (?, ?, ?, ?, 'open')
    `);
    stmt.run(id, input.register_id, userId, input.opening_balance);

    return { id, ...input };
}

export function recordCashDrop(shiftId: string, input: CashDropInput) {
    const id = uuid();
    const stmt = db.prepare(`
        INSERT INTO cash_drops (id, shift_id, amount, notes)
        VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, shiftId, input.amount, input.notes || null);

    // Get details for receipt
    return db.prepare(`
        SELECT d.*, s.register_id, r.name as register_name, u.username as cashier_name
        FROM cash_drops d
        JOIN register_shifts s ON d.shift_id = s.id
        JOIN registers r ON s.register_id = r.id
        JOIN users u ON s.user_id = u.id
        WHERE d.id = ?
    `).get(id);
}

export function closeShift(shiftId: string, input: CloseShiftInput) {
    const shift = db.prepare('SELECT * FROM register_shifts WHERE id = ?').get(shiftId) as any;
    if (!shift || shift.status === 'closed') {
        throw new Error('Shift not found or already closed.');
    }

    // Calculate expected balance
    // Formula: Opening + Cash Sales - Cash Drops
    // Note: We need to filter sales by payment_method = 'cash' and shift_id (if we link them)
    // For now, let's calculate based on time range and user
    const salesStmt = db.prepare(`
        SELECT SUM(grand_total) as total 
        FROM sales 
        WHERE created_at >= ? AND created_at <= CURRENT_TIMESTAMP 
          AND user_id = ? 
          AND payment_method = 'cash' 
          AND status = 'completed'
    `);
    const cashSales = salesStmt.get(shift.start_time, shift.user_id) as { total: number };

    const dropsStmt = db.prepare(`SELECT SUM(amount) as total FROM cash_drops WHERE shift_id = ?`);
    const drops = dropsStmt.get(shiftId) as { total: number };

    const refundsStmt = db.prepare(`
        SELECT SUM(amount) as total 
        FROM refunds 
        WHERE created_at >= ? AND created_at <= CURRENT_TIMESTAMP 
          AND user_id = ? 
          AND payment_method = 'cash'
    `);
    const refunds = refundsStmt.get(shift.start_time, shift.user_id) as { total: number };

    const expected = shift.opening_balance + (cashSales.total || 0) - (drops.total || 0) - (refunds.total || 0);
    const variance = input.closing_balance - expected;

    const stmt = db.prepare(`
        UPDATE register_shifts 
        SET status = 'closed', 
            end_time = CURRENT_TIMESTAMP, 
            closing_balance = ?, 
            expected_closing_balance = ?, 
            variance = ?, 
            supervisor_id = ?, 
            notes = ?
        WHERE id = ?
    `);
    stmt.run(input.closing_balance, expected, variance, input.supervisor_id || null, input.notes || null, shiftId);

    // Get detailed result for receipt
    const closedShift = db.prepare(`
        SELECT s.*, r.name as register_name, u.username as cashier_name, sup.username as supervisor_name
        FROM register_shifts s
        JOIN registers r ON s.register_id = r.id
        JOIN users u ON s.user_id = u.id
        LEFT JOIN users sup ON s.supervisor_id = sup.id
        WHERE s.id = ?
    `).get(shiftId) as any;

    const transactionCount = db.prepare(`
        SELECT COUNT(*) as count 
        FROM sales 
        WHERE created_at >= ? AND created_at <= ? AND user_id = ? AND status = 'completed'
    `).get(closedShift.start_time, closedShift.end_time, closedShift.user_id) as { count: number };

    return {
        ...closedShift,
        expected_closing_balance: expected,
        variance,
        transaction_count: transactionCount.count
    };
}

export function getAllRegisters() {
    const registers = db.prepare(`
        SELECT r.*, 
               rs.user_id as occupied_by_user_id,
               u.username as occupied_by
        FROM registers r
        LEFT JOIN register_shifts rs ON r.id = rs.register_id AND rs.status = 'open'
        LEFT JOIN users u ON rs.user_id = u.id
        WHERE r.status = 'active'
    `).all() as any[];

    return registers.map(row => ({
        id: row.id,
        name: row.name,
        status: row.status,
        created_at: row.created_at,
        is_occupied: !!row.occupied_by_user_id,
        occupied_by: row.occupied_by || null
    }));
}
