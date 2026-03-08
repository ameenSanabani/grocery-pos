/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { FastifyReply, FastifyRequest } from 'fastify';
import {
    createSupplier,
    getSuppliers,
    getSupplierById,
    updateSupplier,
    deleteSupplier
} from '../services/supplier.service';
import { CreateSupplierInput, UpdateSupplierInput } from '../schemas/supplier.schema';

export async function createSupplierHandler(
    request: FastifyRequest<{ Body: CreateSupplierInput }>,
    reply: FastifyReply
) {
    try {
        const supplier = createSupplier(request.body);
        return reply.code(201).send(supplier);
    } catch (err: any) {
        return reply.code(400).send({ message: err.message });
    }
}

export async function getSuppliersHandler(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const suppliers = getSuppliers();
        return reply.code(200).send(suppliers);
    } catch (err: any) {
        return reply.code(500).send({ message: err.message });
    }
}

export async function getSupplierHandler(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) {
    try {
        const supplier = getSupplierById(request.params.id);
        if (!supplier) {
            return reply.code(404).send({ message: 'Supplier not found' });
        }
        return reply.code(200).send(supplier);
    } catch (err: any) {
        return reply.code(500).send({ message: err.message });
    }
}

export async function updateSupplierHandler(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateSupplierInput }>,
    reply: FastifyReply
) {
    try {
        const supplier = updateSupplier(request.params.id, request.body);
        return reply.code(200).send(supplier);
    } catch (err: any) {
        return reply.code(400).send({ message: err.message });
    }
}

export async function deleteSupplierHandler(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) {
    try {
        const result = deleteSupplier(request.params.id);
        return reply.code(200).send(result);
    } catch (err: any) {
        return reply.code(400).send({ message: err.message });
    }
}
