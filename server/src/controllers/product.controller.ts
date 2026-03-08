/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { FastifyReply, FastifyRequest } from 'fastify';
import {
    createProduct,
    getProducts,
    getProductById,
    getProductByBarcode,
    updateProduct,
    deleteProduct,
    adjustStock
} from '../services/product.service';
import { CreateProductInput, UpdateProductInput, ProductQuery } from '../schemas/product.schema';

export async function createProductHandler(
    request: FastifyRequest<{ Body: CreateProductInput }>,
    reply: FastifyReply
) {
    try {
        const userId = (request.user as any).id;
        const product = createProduct(request.body, userId);
        return reply.code(201).send(product);
    } catch (err: any) {
        if (err.message?.includes('UNIQUE constraint failed')) {
            const field = err.message.split('.').pop() || 'SKU/Barcode';
            return reply.code(409).send({
                message: `Duplicate Entry: A product with this ${field} already exists.`
            });
        }
        return reply.code(400).send({ message: err.message });
    }
}

export async function getProductsHandler(
    request: FastifyRequest<{ Querystring: ProductQuery }>,
    reply: FastifyReply
) {
    try {
        const products = getProducts(request.query);
        return reply.code(200).send(products);
    } catch (err: any) {
        return reply.code(500).send({ message: err.message });
    }
}

export async function getProductHandler(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) {
    try {
        const product = getProductById(request.params.id);
        if (!product) {
            return reply.code(404).send({ message: 'Product not found' });
        }
        return reply.code(200).send(product);
    } catch (err: any) {
        return reply.code(500).send({ message: err.message });
    }
}

export async function getProductByBarcodeHandler(
    request: FastifyRequest<{ Params: { barcode: string } }>,
    reply: FastifyReply
) {
    try {
        const product = getProductByBarcode(request.params.barcode);
        if (!product) {
            return reply.code(404).send({ message: 'Product not found' });
        }
        return reply.code(200).send(product);
    } catch (err: any) {
        return reply.code(500).send({ message: err.message });
    }
}

export async function updateProductHandler(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateProductInput }>,
    reply: FastifyReply
) {
    try {
        const product = updateProduct(request.params.id, request.body);
        return reply.code(200).send(product);
    } catch (err: any) {
        if (err.message?.includes('UNIQUE constraint failed')) {
            const field = err.message.split('.').pop() || 'SKU/Barcode';
            return reply.code(409).send({
                message: `Duplicate Entry: A product with this ${field} already exists.`
            });
        }
        return reply.code(400).send({ message: err.message });
    }
}

export async function deleteProductHandler(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
) {
    try {
        const userId = (request.user as any).id;
        const result = deleteProduct(request.params.id, userId);
        return reply.code(200).send(result);
    } catch (err: any) {
        return reply.code(400).send({ message: err.message });
    }
}

export async function adjustStockHandler(
    request: FastifyRequest<{ Params: { id: string }; Body: { quantity: number; reason: string } }>,
    reply: FastifyReply
) {
    try {
        const userId = (request.user as any).id;
        const stock = adjustStock(request.params.id, request.body.quantity, request.body.reason, userId);
        return reply.code(200).send(stock);
    } catch (err: any) {
        return reply.code(400).send({ message: err.message });
    }
}
