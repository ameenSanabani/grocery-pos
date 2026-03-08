/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { FastifyReply, FastifyRequest } from 'fastify';
import {
    createSale,
    getSales,
    getSaleById,
    getSaleByReceipt,
    voidSale,
    getDailySummary,
    refundSale,
    processManualReturn
} from '../services/sale.service';
import { CreateSaleInput, VoidSaleInput, SalesQuery, RefundSaleInput, ManualReturnInput } from '../schemas/sale.schema';

export async function createSaleHandler(
    request: FastifyRequest<{ Body: CreateSaleInput }>,
    reply: FastifyReply
) {
    try {
        // Get user ID from JWT token
        const user = request.user as { id: string };
        const sale = createSale(request.body, user.id);
        return reply.code(201).send(sale);
    } catch (err: any) {
        return reply.code(400).send({ message: err.message });
    }
}

export async function getSalesHandler(
    request: FastifyRequest<{ Querystring: SalesQuery }>,
    reply: FastifyReply
) {
    try {
        const sales = getSales(request.query);
        return reply.code(200).send(sales);
    } catch (err: any) {
        return reply.code(500).send({ message: err.message });
    }
}

export async function getSaleHandler(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) {
    try {
        const sale = getSaleById(request.params.id);
        if (!sale) {
            return reply.code(404).send({ message: 'Sale not found' });
        }
        return reply.code(200).send(sale);
    } catch (err: any) {
        return reply.code(500).send({ message: err.message });
    }
}

export async function getSaleByReceiptHandler(
    request: FastifyRequest<{ Params: { receipt: string } }>,
    reply: FastifyReply
) {
    try {
        const sale = getSaleByReceipt(request.params.receipt);
        if (!sale) {
            return reply.code(404).send({ message: 'Sale not found' });
        }
        return reply.code(200).send(sale);
    } catch (err: any) {
        return reply.code(500).send({ message: err.message });
    }
}

export async function voidSaleHandler(
    request: FastifyRequest<{ Params: { id: string }; Body: VoidSaleInput }>,
    reply: FastifyReply
) {
    try {
        const user = request.user as { id: string };
        const result = voidSale(request.params.id, request.body.reason, user.id);
        return reply.code(200).send(result);
    } catch (err: any) {
        return reply.code(400).send({ message: err.message });
    }
}

export async function getDailySummaryHandler(
    request: FastifyRequest<{ Querystring: { date?: string } }>,
    reply: FastifyReply
) {
    try {
        const summary = getDailySummary(request.query.date);
        return reply.code(200).send(summary);
    } catch (err: any) {
        return reply.code(500).send({ message: err.message });
    }
}

export async function refundSaleHandler(
    request: FastifyRequest<{ Params: { id: string }; Body: RefundSaleInput }>,
    reply: FastifyReply
) {
    try {
        const user = request.user as { id: string; role: string };
        if (user.role === 'cashier') {
            return reply.code(403).send({ message: 'Forbidden: Only managers and admins can process refunds' });
        }
        const result = refundSale(request.params.id, request.body, user.id);
        return reply.code(200).send(result);
    } catch (err: any) {
        return reply.code(400).send({ message: err.message });
    }
}

export async function manualReturnHandler(
    request: FastifyRequest<{ Body: ManualReturnInput }>,
    reply: FastifyReply
) {
    try {
        const user = request.user as { id: string; role: string };
        if (user.role === 'cashier') {
            return reply.code(403).send({ message: 'Forbidden: Only managers and admins can process returns' });
        }
        const result = processManualReturn(request.body, user.id);
        return reply.code(201).send(result);
    } catch (err: any) {
        return reply.code(400).send({ message: err.message });
    }
}
