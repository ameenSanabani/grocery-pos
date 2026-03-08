/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { FastifyReply, FastifyRequest } from 'fastify';
import {
    createCustomer,
    getCustomers,
    getCustomerById,
    updateCustomer,
    getCustomerHistory,
    addCustomerTransaction
} from '../services/customer.service';
import { CustomerInput, UpdateCustomerInput, CustomerTransactionInput } from '../schemas/customer.schema';

export async function createCustomerHandler(
    request: FastifyRequest<{ Body: CustomerInput }>,
    reply: FastifyReply
) {
    try {
        const customer = createCustomer(request.body);
        return reply.code(201).send(customer);
    } catch (err: any) {
        return reply.code(400).send({ message: err.message });
    }
}

export async function getCustomersHandler(
    request: FastifyRequest<{ Querystring: { search?: string; limit?: string } }>,
    reply: FastifyReply
) {
    try {
        const limit = request.query.limit ? parseInt(request.query.limit) : 10;
        const customers = getCustomers(request.query.search, limit);
        return reply.code(200).send(customers);
    } catch (err: any) {
        return reply.code(500).send({ message: err.message });
    }
}

export async function getCustomerHandler(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) {
    try {
        const customer = getCustomerById(request.params.id);
        if (!customer) return reply.code(404).send({ message: 'Customer not found' });
        return reply.code(200).send(customer);
    } catch (err: any) {
        return reply.code(500).send({ message: err.message });
    }
}

export async function updateCustomerHandler(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateCustomerInput }>,
    reply: FastifyReply
) {
    try {
        const customer = updateCustomer(request.params.id, request.body);
        return reply.code(200).send(customer);
    } catch (err: any) {
        return reply.code(400).send({ message: err.message });
    }
}

export async function getCustomerHistoryHandler(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) {
    try {
        const history = getCustomerHistory(request.params.id);
        return reply.code(200).send(history);
    } catch (err: any) {
        return reply.code(500).send({ message: err.message });
    }
}

export async function addCustomerTransactionHandler(
    request: FastifyRequest<{ Params: { id: string }; Body: CustomerTransactionInput }>,
    reply: FastifyReply
) {
    try {
        const transaction = addCustomerTransaction(request.params.id, request.body);
        return reply.code(201).send(transaction);
    } catch (err: any) {
        return reply.code(400).send({ message: err.message });
    }
}
