/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { FastifyReply, FastifyRequest } from 'fastify';
import { getStoreProfile, updateStoreProfile } from '../services/settings.service';
import { StoreProfileInput } from '../schemas/settings.schema';

export async function getStoreProfileHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
        const profile = getStoreProfile();
        return reply.code(200).send(profile);
    } catch (err: any) {
        return reply.code(500).send({ message: err.message });
    }
}

export async function updateStoreProfileHandler(
    request: FastifyRequest<{ Body: StoreProfileInput }>,
    reply: FastifyReply
) {
    try {
        const profile = updateStoreProfile(request.body);
        return reply.code(200).send(profile);
    } catch (err: any) {
        return reply.code(400).send({ message: err.message });
    }
}
