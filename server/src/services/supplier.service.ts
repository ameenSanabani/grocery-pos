/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { CreateSupplierInput, UpdateSupplierInput } from '../schemas/supplier.schema';

export function createSupplier(input: CreateSupplierInput) {
    const id = uuidv4();

    const stmt = db.prepare(`
    INSERT INTO suppliers (id, name, contact_person, phone, email, address)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

    stmt.run(
        id,
        input.name,
        input.contact_person || null,
        input.phone || null,
        input.email || null,
        input.address || null
    );

    return { id, ...input };
}

export function getSuppliers() {
    const stmt = db.prepare('SELECT * FROM suppliers ORDER BY name ASC');
    return stmt.all();
}

export function getSupplierById(id: string) {
    const stmt = db.prepare('SELECT * FROM suppliers WHERE id = ?');
    return stmt.get(id);
}

export function updateSupplier(id: string, input: UpdateSupplierInput) {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined) {
            fields.push(`${key} = ?`);
            values.push(value);
        }
    });

    if (fields.length === 0) {
        throw new Error('No fields to update');
    }

    values.push(id);

    const stmt = db.prepare(`
    UPDATE suppliers
    SET ${fields.join(', ')}
    WHERE id = ?
  `);

    const result = stmt.run(...values);

    if (result.changes === 0) {
        throw new Error('Supplier not found');
    }

    return getSupplierById(id);
}

export function deleteSupplier(id: string) {
    // Check if purchase orders exist for this supplier
    const poCount = db.prepare('SELECT COUNT(*) as count FROM purchase_orders WHERE supplier_id = ?').get(id) as any;
    if (poCount.count > 0) {
        throw new Error('Cannot delete supplier with existing purchase orders');
    }

    const stmt = db.prepare('DELETE FROM suppliers WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
        throw new Error('Supplier not found');
    }

    return { success: true };
}
