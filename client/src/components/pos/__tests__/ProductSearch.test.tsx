/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductSearch } from '../ProductSearch';
import { api } from '@/lib/api';
import { useCartStore } from '@/store/useCartStore';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the API
vi.mock('@/lib/api', () => ({
    api: {
        get: vi.fn(),
    },
}));

// Mock the store
vi.mock('@/store/useCartStore', () => ({
    useCartStore: vi.fn(),
}));

describe('ProductSearch Component', () => {
    const mockAddItem = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useCartStore as any).mockReturnValue(mockAddItem);
    });

    it('should show results when typing', async () => {
        const mockProducts = [
            { id: '1', name: 'Milk', sku: 'MILK01', selling_price: 2.5 }
        ];
        (api.get as any).mockResolvedValue(mockProducts);

        render(<ProductSearch />);

        const input = screen.getByPlaceholderText(/Search products/);
        fireEvent.change(input, { target: { value: 'Milk' } });

        await waitFor(() => {
            expect(screen.getByText('Milk')).toBeInTheDocument();
        });

        expect(screen.getByText('MILK01')).toBeInTheDocument();
        expect(screen.getByText('$2.50')).toBeInTheDocument();
    });

    it('should call addItem when a result is clicked', async () => {
        const mockProducts = [
            { id: '1', name: 'Milk', sku: 'MILK01', selling_price: 2.5 }
        ];
        (api.get as any).mockResolvedValue(mockProducts);

        render(<ProductSearch />);

        const input = screen.getByPlaceholderText(/Search products/);
        fireEvent.change(input, { target: { value: 'Milk' } });

        await waitFor(() => {
            const productButton = screen.getByRole('button');
            fireEvent.click(productButton);
        });

        expect(mockAddItem).toHaveBeenCalledWith(mockProducts[0]);
    });

    it('should fetch by barcode when a numeric string is entered', async () => {
        const barcode = '1234567890123';
        const mockProduct = { id: '1', name: 'Whole Milk 1L', sku: 'DAI-MILK-001', selling_price: 2.50 };
        // for the barcode call
        (api.get as any).mockResolvedValueOnce(mockProduct);

        render(<ProductSearch />);

        const input = screen.getByPlaceholderText(/Search products/);
        fireEvent.change(input, { target: { value: barcode } });

        await waitFor(() => {
            expect(api.get).toHaveBeenCalledWith(`/products/barcode/${barcode}`);
        });

        await waitFor(() => {
            expect(screen.getByText('Whole Milk 1L')).toBeInTheDocument();
        });
    });
});
