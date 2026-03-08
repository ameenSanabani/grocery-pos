/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { CreateProductInput, UpdateProductInput, ProductQuery } from '../schemas/product.schema';

export function createProduct(input: CreateProductInput, userId: string) {
    const id = uuidv4();

    const stmt = db.prepare(`
    INSERT INTO products (
      id, sku, barcode, name, description, category_id,
      cost_price, selling_price, tax_rate, is_perishable, is_weighed, display_order, user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    stmt.run(
        id,
        input.sku,
        input.barcode || null,
        input.name,
        input.description || null,
        input.category_id || null,
        input.cost_price,
        input.selling_price,
        input.tax_rate,
        input.is_perishable ? 1 : 0,
        input.is_weighed ? 1 : 0,
        input.display_order ?? 9999,
        userId
    );

    // Initialize stock level
    const stockStmt = db.prepare(`
    INSERT INTO stock_levels (product_id, quantity, reorder_level, created_by, updated_by, updated_at)
    VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);
    stockStmt.run(id, input.initial_quantity ?? 0, input.reorder_level, userId, userId);

    // Return the full product with all fields (including quantity)
    const saved = getProductById(id);
    console.log('Created product: ', id, saved);
    return saved;
}

export function getProducts(query: ProductQuery) {
    let sql = `
    SELECT p.*, s.quantity, s.reorder_level
    FROM products p
    LEFT JOIN stock_levels s ON p.id = s.product_id
    WHERE p.deleted_at IS NULL
  `;

    const params: any[] = [];

    if (query.search) {
        sql += ` AND (p.name LIKE ? OR p.sku LIKE ? OR p.barcode LIKE ?)`;
        params.push(`%${query.search}%`, `%${query.search}%`, `%${query.search}%`);
    }

    if (query.category_id) {
        sql += ` AND p.category_id = ?`;
        params.push(parseInt(query.category_id));
    }

    if (query.barcode) {
        sql += ` AND p.barcode = ?`;
        params.push(query.barcode);
    }

    sql += ` ORDER BY p.display_order ASC, p.name ASC`;

    sql += ` LIMIT ? OFFSET ?`;
    params.push(parseInt(query.limit), parseInt(query.offset));

    const stmt = db.prepare(sql);
    return stmt.all(...params);
}

export function getProductById(id: string) {
    const stmt = db.prepare(`
    SELECT p.*, s.quantity, s.reorder_level
    FROM products p
    LEFT JOIN stock_levels s ON p.id = s.product_id
    WHERE p.id = ? AND p.deleted_at IS NULL
  `);
    return stmt.get(id);
}

export function getProductByBarcode(barcode: string) {
    const stmt = db.prepare(`
    SELECT p.*, s.quantity, s.reorder_level
    FROM products p
    LEFT JOIN stock_levels s ON p.id = s.product_id
    WHERE p.barcode = ? AND p.deleted_at IS NULL
  `);
    return stmt.get(barcode);
}

export function updateProduct(id: string, input: UpdateProductInput) {
    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined && key !== 'reorder_level' && key !== 'initial_quantity') {
            fields.push(`${key} = ?`);
            if (typeof value === 'boolean') {
                values.push(value ? 1 : 0);
            } else {
                values.push(value);
            }
        }
    });

    if (fields.length === 0) {
        throw new Error('No fields to update');
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
    UPDATE products
    SET ${fields.join(', ')}
    WHERE id = ? AND deleted_at IS NULL
  `);

    const result = stmt.run(...values);

    if (result.changes === 0) {
        throw new Error('Product not found');
    }

    return getProductById(id);
}

export function deleteProduct(id: string, userId: string) {
    // Soft delete
    const stmt = db.prepare(`
    UPDATE products
    SET deleted_at = CURRENT_TIMESTAMP,
        user_id = ?
    WHERE id = ? AND deleted_at IS NULL
  `);

    const result = stmt.run(userId, id);

    if (result.changes === 0) {
        throw new Error('Product not found');
    }

    return { success: true };
}

export function adjustStock(productId: string, quantityChange: number, reason: string, userId: string) {
    const updateStmt = db.prepare(`
    UPDATE stock_levels
    SET quantity = quantity + ?,
        last_restock_date = CURRENT_TIMESTAMP,
        updated_by = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE product_id = ?
  `);

    const result = updateStmt.run(quantityChange, userId, productId);

    if (result.changes === 0) {
        throw new Error('Product not found');
    }

    // Get updated stock
    const stmt = db.prepare('SELECT * FROM stock_levels WHERE product_id = ?');
    return stmt.get(productId);
}
