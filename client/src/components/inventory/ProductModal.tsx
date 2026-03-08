/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Loader2, Save, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCategoryStore, useProductStore, useGlobalStore } from '@/store';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    product?: any | null;
    onSuccess?: () => void; // Made optional as the store will update the list
}

export function ProductModal({ isOpen, onClose, product, onSuccess }: ProductModalProps) {
    const { createProduct, updateProduct, loading, error, clearError } = useProductStore();
    const { categories, fetchCategories } = useCategoryStore();
    const { storeProfile } = useGlobalStore();

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        barcode: '',
        category_id: '',
        cost_price: '',
        selling_price: '',
        tax_rate: '0',
        reorder_level: '10',
        initial_quantity: '0',
        display_order: '9999',
        is_weighed: false,
        is_perishable: false
    });

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            clearError();
        }
    }, [isOpen, fetchCategories, clearError]);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                sku: product.sku || '',
                barcode: product.barcode || '',
                category_id: product.category_id || '',
                cost_price: product.cost_price?.toString() || '',
                selling_price: product.selling_price?.toString() || '',
                tax_rate: product.tax_rate?.toString() || '0',
                reorder_level: product.reorder_level?.toString() || '10',
                initial_quantity: product.quantity?.toString() || '0',
                display_order: product.display_order?.toString() || '9999',
                is_weighed: !!product.is_weighed,
                is_perishable: !!product.is_perishable
            });
        } else {
            setFormData({
                name: '',
                sku: '',
                barcode: '',
                category_id: '',
                cost_price: '',
                selling_price: '',
                tax_rate: '0',
                reorder_level: '10',
                initial_quantity: '0',
                display_order: '9999',
                is_weighed: false,
                is_perishable: false
            });
        }
    }, [product, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            ...formData,
            category_id: formData.category_id || undefined,
            cost_price: parseFloat(formData.cost_price),
            selling_price: parseFloat(formData.selling_price),
            tax_rate: parseFloat(formData.tax_rate),
            reorder_level: parseInt(formData.reorder_level),
            initial_quantity: parseInt(formData.initial_quantity),
            display_order: parseInt(formData.display_order),
        };

        let success = false;
        if (product) {
            success = await updateProduct(product.id, payload as any);
        } else {
            success = await createProduct(payload as any);
        }

        if (success) {
            onSuccess?.();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <h2 className="text-2xl font-black">{product ? 'Edit Product' : 'Add New Product'}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} disabled={loading}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2 col-span-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Product Name</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="e.g. Whole Milk 1L"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">SKU</label>
                            <Input
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                required
                                placeholder="PROD-001"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Barcode</label>
                            <Input
                                value={formData.barcode}
                                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                placeholder="1234567890123"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Category</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:border-zinc-700 dark:bg-zinc-950"
                                value={formData.category_id}
                                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Reorder Level</label>
                            <Input
                                type="number"
                                value={formData.reorder_level}
                                onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Display Order</label>
                            <Input
                                type="number"
                                value={formData.display_order}
                                onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                                required
                                placeholder="e.g. 1, 2, 3..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Cost Price ({storeProfile?.currency_symbol})</label>
                            <Input
                                type="number" step="0.01"
                                value={formData.cost_price}
                                onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase">Selling Price ({storeProfile?.currency_symbol})</label>
                            <Input
                                type="number" step="0.01"
                                value={formData.selling_price}
                                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                                required
                            />
                        </div>

                        {!product && (
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Initial Stock</label>
                                <Input
                                    type="number"
                                    value={formData.initial_quantity}
                                    onChange={(e) => setFormData({ ...formData, initial_quantity: e.target.value })}
                                    required
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex gap-6 pt-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                                checked={formData.is_weighed}
                                onChange={(e) => setFormData({ ...formData, is_weighed: e.target.checked })}
                            />
                            <span className="text-sm font-medium">Is Weighed</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                                checked={formData.is_perishable}
                                onChange={(e) => setFormData({ ...formData, is_perishable: e.target.checked })}
                            />
                            <span className="text-sm font-medium">Is Perishable</span>
                        </label>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 font-medium">
                            <AlertCircle className="h-4 w-4" /> {error}
                        </div>
                    )}

                    <div className="flex gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <Button variant="ghost" type="button" className="flex-1 rounded-xl h-12" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button className="flex-1 rounded-xl h-12 gap-2" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {product ? 'Update Product' : 'Create Product'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
