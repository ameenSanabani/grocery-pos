/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { FastifyReply, FastifyRequest } from 'fastify';
import { openShift, closeShift, recordCashDrop, getActiveShift, getAllRegisters } from '../services/shift.service';
import { OpenShiftInput, CloseShiftInput, CashDropInput } from '../schemas/shift.schema';

export async function getActiveShiftHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
        const userId = (request.user as any).id;
        const shift = getActiveShift(userId);
        return reply.code(200).send(shift || null);
    } catch (err: any) {
        return reply.code(500).send({ message: err.message });
    }
}

export async function openShiftHandler(
    request: FastifyRequest<{ Body: OpenShiftInput }>,
    reply: FastifyReply
) {
    try {
        const userId = (request.user as any).id;
        const shift = openShift(userId, request.body);
        return reply.code(201).send(shift);
    } catch (err: any) {
        return reply.code(400).send({ message: err.message });
    }
}

export async function recordCashDropHandler(
    request: FastifyRequest<{ Params: { id: string }, Body: CashDropInput }>,
    reply: FastifyReply
) {
    try {
        const drop = recordCashDrop(request.params.id, request.body);
        return reply.code(201).send(drop);
    } catch (err: any) {
        return reply.code(400).send({ message: err.message });
    }
}

export async function closeShiftHandler(
    request: FastifyRequest<{ Params: { id: string }, Body: CloseShiftInput }>,
    reply: FastifyReply
) {
    try {
        const result = closeShift(request.params.id, request.body);
        return reply.code(200).send(result);
    } catch (err: any) {
        return reply.code(400).send({ message: err.message });
    }
}

export async function getRegistersHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
        const registers = getAllRegisters();
        return reply.code(200).send(registers);
    } catch (err: any) {
        return reply.code(500).send({ message: err.message });
    }
}
