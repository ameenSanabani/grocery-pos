/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import { CreateSaleInput, SalesQuery, SaleItem, RefundSaleInput, ManualReturnInput } from '../schemas/sale.schema';
import { getActiveShift } from './shift.service';

// Generate receipt reference (store-date-sequence format)
function generateReceiptRef(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const seq = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `RCP-${dateStr}-${seq}`;
}

export function createSale(input: CreateSaleInput, userId: string) {
  // Validate Cash Limit Security
  const shift = getActiveShift(userId);
  if (!shift) {
    throw new Error('No active shift found. Please open a shift before making sales.');
  }

  // Get user's cash limit
  const user = db.prepare('SELECT cash_limit FROM users WHERE id = ?').get(userId) as { cash_limit: number };
  const cashLimit = Number(user?.cash_limit ?? 500);
  const currentBalance = Number(shift.current_balance ?? 0);

  // Calculate estimated total for limit check
  let estimatedTotal = 0;
  for (const item of input.items) {
    const product = db.prepare('SELECT selling_price, tax_rate FROM products WHERE id = ?').get(item.product_id) as any;
    if (product) {
      const price = item.unit_price || product.selling_price;
      estimatedTotal += (price * item.quantity) * (1 + (product.tax_rate / 100));
    }
  }

  if (currentBalance + estimatedTotal > cashLimit) {
    console.log(`[CASH_LIMIT_GUARD] Blocked Sale: UserID=${userId}, Balance=${currentBalance}, NewTotal=${currentBalance + estimatedTotal}, Limit=${cashLimit}`);
    throw new Error(`Transaction Blocked: This sale would exceed your drawer limit (Balance: ${currentBalance.toFixed(2)}, Sale: ${estimatedTotal.toFixed(2)}, Limit: ${cashLimit.toFixed(2)}). Please perform a Cash Drop.`);
  }

  const saleId = uuidv4();
  const receiptRef = generateReceiptRef();

  // Start transaction
  const transaction = db.transaction(() => {
    let subtotal = 0;
    let taxTotal = 0;
    const processedItems: any[] = [];

    // 1. First pass: Calculate totals and validate products/stock
    for (const item of input.items) {
      const product = db.prepare(`
                SELECT p.*, s.quantity as stock_qty
                FROM products p
                LEFT JOIN stock_levels s ON p.id = s.product_id
                WHERE p.id = ? AND p.deleted_at IS NULL
            `).get(item.product_id) as any;

      if (!product) throw new Error(`Product ${item.product_id} not found`);
      if (product.stock_qty < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock_qty}`);
      }

      const unitPrice = item.unit_price || product.selling_price;
      const itemSubtotal = unitPrice * item.quantity;
      const itemTax = itemSubtotal * (product.tax_rate / 100);

      subtotal += itemSubtotal;
      taxTotal += itemTax;

      processedItems.push({
        product,
        quantity: item.quantity,
        unitPrice,
        taxRate: product.tax_rate,
        subtotal: itemSubtotal
      });
    }

    const grandTotal = subtotal + taxTotal - input.discount_total;

    // 2. Validate Customer Credit if applicable
    let customer: any = null;
    if (input.payment_method === 'credit') {
      if (!input.customer_id) throw new Error('Customer ID is required for credit payments');
      customer = db.prepare('SELECT * FROM customers WHERE id = ?').get(input.customer_id) as any;
      if (!customer) throw new Error('Customer not found');
      if (!customer.is_active) throw new Error('Customer account is inactive');

      const newBalance = customer.current_balance + grandTotal;
      if (newBalance > customer.credit_limit) {
        throw new Error(`Credit limit exceeded. Limit: ${customer.credit_limit}, New Balance: ${newBalance}`);
      }
    }

    // 3. Create the parent Sale record FIRST
    db.prepare(`
            INSERT INTO sales (id, receipt_ref, user_id, customer_id, subtotal, tax_total, discount_total, grand_total, payment_method, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')
        `).run(saleId, receiptRef, userId, input.customer_id || null, subtotal, taxTotal, input.discount_total, grandTotal, input.payment_method);

    // 3. Create Sale Items and deduct stock
    const saleItemsResponse: any[] = [];
    for (const item of processedItems) {
      const saleItemId = uuidv4();
      db.prepare(`
                INSERT INTO sale_items (id, sale_id, product_id, quantity, unit_price_at_sale, tax_rate_at_sale, subtotal)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(saleItemId, saleId, item.product.id, item.quantity, item.unitPrice, item.taxRate, item.subtotal);

      db.prepare(`
                UPDATE stock_levels 
                SET quantity = quantity - ?,
                    updated_by = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE product_id = ?
            `).run(item.quantity, userId, item.product.id);

      saleItemsResponse.push({
        id: saleItemId,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        tax_rate: item.taxRate,
        subtotal: item.subtotal,
      });
    }

    // 5. Update Customer Balance if credit purchase
    if (input.payment_method === 'credit' && input.customer_id) {
      db.prepare(`
        UPDATE customers SET current_balance = current_balance + ? WHERE id = ?
      `).run(grandTotal, input.customer_id);

      db.prepare(`
        INSERT INTO customer_transactions (id, customer_id, sale_id, amount, type, description)
        VALUES (?, ?, ?, ?, 'credit_purchase', ?)
      `).run(uuidv4(), input.customer_id, saleId, grandTotal, `Purchase on receipt ${receiptRef}`);
    }

    // Calculate change for cash payments
    const change = input.payment_method === 'cash' && input.amount_tendered
      ? input.amount_tendered - grandTotal
      : 0;

    return {
      id: saleId,
      receipt_ref: receiptRef,
      items: saleItemsResponse,
      subtotal,
      tax_total: taxTotal,
      discount_total: input.discount_total,
      grand_total: grandTotal,
      payment_method: input.payment_method,
      amount_tendered: input.amount_tendered || grandTotal,
      change,
      status: 'completed',
      created_at: new Date().toISOString(),
    };
  });

  return transaction();
}

export function getSales(query: SalesQuery) {
  let sql = `
    SELECT s.*, u.username as cashier_name,
           (SELECT COUNT(*) FROM sale_items WHERE sale_id = s.id) as item_count
    FROM sales s
    LEFT JOIN users u ON s.user_id = u.id
    WHERE 1=1
  `;

  const params: any[] = [];

  if (query.start_date) {
    sql += ` AND s.created_at >= ?`;
    params.push(query.start_date);
  }

  if (query.end_date) {
    sql += ` AND s.created_at <= ?`;
    params.push(query.end_date);
  }

  if (query.user_id) {
    sql += ` AND s.user_id = ?`;
    params.push(query.user_id);
  }

  if (query.status) {
    sql += ` AND s.status = ?`;
    params.push(query.status);
  }

  sql += ` ORDER BY s.created_at DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(query.limit), parseInt(query.offset));

  return db.prepare(sql).all(...params);
}

export function getSaleById(id: string) {
  const sale = db.prepare(`
    SELECT s.*, u.username as cashier_name
    FROM sales s
    LEFT JOIN users u ON s.user_id = u.id
    WHERE s.id = ?
  `).get(id) as any;

  if (!sale) return null;

  // Get sale items with product details and refund count
  const items = db.prepare(`
    SELECT si.*, p.name as product_name, p.sku, p.barcode,
           COALESCE((
             SELECT SUM(ri.quantity)
             FROM refund_items ri
             JOIN refunds r ON ri.refund_id = r.id
             WHERE r.sale_id = si.sale_id AND ri.product_id = si.product_id
           ), 0) as quantity_refunded
    FROM sale_items si
    LEFT JOIN products p ON si.product_id = p.id
    WHERE si.sale_id = ?
  `).all(id);

  return { ...sale, items };
}

export function getSaleByReceipt(receiptRef: string) {
  const sale = db.prepare(`
    SELECT s.*, u.username as cashier_name
    FROM sales s
    LEFT JOIN users u ON s.user_id = u.id
    WHERE s.receipt_ref = ?
  `).get(receiptRef) as any;

  if (!sale) return null;

  const items = db.prepare(`
    SELECT si.*, p.name as product_name, p.sku, p.barcode,
           COALESCE((
             SELECT SUM(ri.quantity)
             FROM refund_items ri
             JOIN refunds r ON ri.refund_id = r.id
             WHERE r.sale_id = si.sale_id AND ri.product_id = si.product_id
           ), 0) as quantity_refunded
    FROM sale_items si
    LEFT JOIN products p ON si.product_id = p.id
    WHERE si.sale_id = ?
  `).all(sale.id);

  return { ...sale, items };
}

export function voidSale(id: string, reason: string, userId: string) {
  const transaction = db.transaction(() => {
    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(id) as any;

    if (!sale) {
      throw new Error('Sale not found');
    }

    if (sale.status === 'voided') {
      throw new Error('Sale already voided');
    }

    // Restore stock for each item
    const items = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(id) as any[];
    for (const item of items) {
      db.prepare(`
        UPDATE stock_levels 
        SET quantity = quantity + ?,
            updated_by = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE product_id = ?
      `).run(item.quantity, userId, item.product_id);
    }

    // Update sale status
    db.prepare(`
      UPDATE sales SET status = 'voided' WHERE id = ?
    `).run(id);

    // Log the void action
    db.prepare(`
      INSERT INTO audit_logs (id, user_id, action, entity, entity_id, details)
      VALUES (?, ?, 'VOID_SALE', 'sales', ?, ?)
    `).run(uuidv4(), userId, id, JSON.stringify({ reason, original_total: sale.grand_total }));

    return { success: true, message: 'Sale voided successfully' };
  });

  return transaction();
}

export function getDailySummary(date?: string) {
  const targetDate = date || new Date().toISOString().slice(0, 10);

  const summary = db.prepare(`
    SELECT 
      COUNT(*) as total_transactions,
      SUM(CASE WHEN status = 'completed' THEN grand_total ELSE 0 END) as total_sales,
      SUM(CASE WHEN status = 'voided' THEN grand_total ELSE 0 END) as voided_amount,
      SUM(CASE WHEN status = 'completed' THEN tax_total ELSE 0 END) as total_tax,
      SUM(CASE WHEN status = 'completed' AND payment_method = 'cash' THEN grand_total ELSE 0 END) as cash_sales,
      SUM(CASE WHEN status = 'completed' AND payment_method = 'card' THEN grand_total ELSE 0 END) as card_sales
    FROM sales
    WHERE DATE(created_at) = ?
  `).get(targetDate);

  return { date: targetDate, ...(summary as object) };
}

export function refundSale(saleId: string, input: RefundSaleInput, userId: string) {
  const transaction = db.transaction(() => {
    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(saleId) as any;
    if (!sale) throw new Error('Sale not found');
    if (sale.status === 'voided') throw new Error('Cannot refund a voided sale');

    const refundId = uuidv4();
    let totalRefundAmount = 0;

    // 1. Validate quantities and calculate refund amount
    const originalItems = db.prepare('SELECT * FROM sale_items WHERE sale_id = ?').all(saleId) as any[];

    for (const item of input.items) {
      const originalItem = originalItems.find(oi => oi.product_id === item.product_id);
      if (!originalItem) throw new Error(`Product ${item.product_id} not found in original sale`);

      // Check if already refunded (need to track this or just allow partial up to original)
      // For simplicity here, we assume one refund per sale for now, or we'd need to sum historical refunds
      const previousRefunds = db.prepare(`
        SELECT SUM(quantity) as total 
        FROM refund_items ri
        JOIN refunds r ON ri.refund_id = r.id
        WHERE r.sale_id = ? AND ri.product_id = ?
      `).get(saleId, item.product_id) as { total: number };

      if (item.quantity + (previousRefunds.total || 0) > originalItem.quantity) {
        throw new Error(`Refund quantity exceeds original purchased quantity for product ${item.product_id}`);
      }

      totalRefundAmount += (item.quantity * originalItem.unit_price_at_sale) * (1 + (originalItem.tax_rate_at_sale / 100));
    }

    // 2. Create Refund Record
    db.prepare(`
      INSERT INTO refunds (id, sale_id, customer_id, user_id, amount, payment_method, reason)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(refundId, saleId, sale.customer_id, userId, totalRefundAmount, sale.payment_method, input.reason || null);

    // 3. Process Items
    for (const item of input.items) {
      const originalItem = originalItems.find(oi => oi.product_id === item.product_id);
      db.prepare(`
        INSERT INTO refund_items (id, refund_id, product_id, quantity, unit_price)
        VALUES (?, ?, ?, ?, ?)
      `).run(uuidv4(), refundId, item.product_id, item.quantity, originalItem.unit_price_at_sale);

      // Restore stock
      db.prepare(`
        UPDATE stock_levels 
        SET quantity = quantity + ?,
            updated_by = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE product_id = ?
      `).run(item.quantity, userId, item.product_id);
    }

    // 4. Update Sale Status
    const allRefundedItems = db.prepare(`
      SELECT SUM(ri.quantity) as total_qty, si.quantity as original_qty
      FROM sale_items si
      LEFT JOIN (
        SELECT ri.product_id, SUM(ri.quantity) as quantity
        FROM refund_items ri
        JOIN refunds r ON ri.refund_id = r.id
        WHERE r.sale_id = ?
        GROUP BY ri.product_id
      ) ri ON si.product_id = ri.product_id
      WHERE si.sale_id = ?
    `).all(saleId, saleId) as any[];

    const isFullyRefunded = allRefundedItems.every(row => row.total_qty >= row.original_qty);
    db.prepare('UPDATE sales SET status = ? WHERE id = ?')
      .run(isFullyRefunded ? 'refunded' : 'partially_refunded', saleId);

    // 5. Update Customer Balance if credit
    if (sale.payment_method === 'credit' && sale.customer_id) {
      db.prepare('UPDATE customers SET current_balance = current_balance - ? WHERE id = ?')
        .run(totalRefundAmount, sale.customer_id);

      db.prepare(`
        INSERT INTO customer_transactions (id, customer_id, sale_id, amount, type, description)
        VALUES (?, ?, ?, ?, 'adjustment', ?)
      `).run(uuidv4(), sale.customer_id, saleId, -totalRefundAmount, `Refund for receipt ${sale.receipt_ref}`);
    }

    return getRefundDetails(refundId);
  });

  return transaction();
}

export function processManualReturn(input: ManualReturnInput, userId: string) {
  const transaction = db.transaction(() => {
    const refundId = uuidv4();
    let totalAmount = 0;

    for (const item of input.items) {
      totalAmount += item.quantity * item.unit_price;
    }

    // 1. Create Refund Record
    db.prepare(`
      INSERT INTO refunds (id, customer_id, customer_name, user_id, amount, payment_method, reason)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      refundId,
      input.customer_id || null,
      input.customer_name || null,
      userId,
      totalAmount,
      input.payment_method,
      input.reason || 'Manual Return'
    );

    // 2. Process Items and Restore Stock
    for (const item of input.items) {
      db.prepare(`
        INSERT INTO refund_items (id, refund_id, product_id, quantity, unit_price)
        VALUES (?, ?, ?, ?, ?)
      `).run(uuidv4(), refundId, item.product_id, item.quantity, item.unit_price);

      db.prepare(`
        UPDATE stock_levels 
        SET quantity = quantity + ?,
            updated_by = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE product_id = ?
      `).run(item.quantity, userId, item.product_id);
    }

    // 3. Update Customer Balance if credit
    if (input.payment_method === 'credit' && input.customer_id) {
      db.prepare('UPDATE customers SET current_balance = current_balance - ? WHERE id = ?')
        .run(totalAmount, input.customer_id);

      db.prepare(`
        INSERT INTO customer_transactions (id, customer_id, amount, type, description)
        VALUES (?, ?, ?, 'adjustment', ?)
      `).run(uuidv4(), input.customer_id, -totalAmount, `Manual return credit adjustment`);
    }

    return getRefundDetails(refundId);
  });

  return transaction();
}

export function getRefundDetails(refundId: string) {
  const refund = db.prepare(`
    SELECT r.*, u.username as cashier_name, s.receipt_ref as original_receipt_ref
    FROM refunds r
    LEFT JOIN users u ON r.user_id = u.id
    LEFT JOIN sales s ON r.sale_id = s.id
    WHERE r.id = ?
  `).get(refundId) as any;

  if (!refund) return null;

  const items = db.prepare(`
    SELECT ri.*, p.name as product_name, p.sku
    FROM refund_items ri
    JOIN products p ON ri.product_id = p.id
    WHERE ri.refund_id = ?
  `).all(refundId);

  return { ...refund, items };
}
