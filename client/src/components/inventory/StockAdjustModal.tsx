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
import { X, Loader2, Save, AlertCircle, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProductStore } from '@/store';

interface StockAdjustModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
    onSuccess?: () => void; // Made optional
}

export function StockAdjustModal({ isOpen, onClose, product, onSuccess }: StockAdjustModalProps) {
    const { adjustStock, loading, error, clearError } = useProductStore();
    const [amount, setAmount] = useState<string>('0');
    const [reason, setReason] = useState<string>('Manual adjustment');
    const [type, setType] = useState<'add' | 'subtract'>('add');

    useEffect(() => {
        if (isOpen) {
            clearError();
            setAmount('0');
            setReason('Manual adjustment');
            setType('add');
        }
    }, [isOpen, clearError]);

    if (!isOpen || !product) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const quantity = parseFloat(amount);
        if (isNaN(quantity) || quantity <= 0) {
            // This should be handled by the store's error state.
            // For now, we'll just prevent submission.
            return;
        }

        const finalChange = type === 'add' ? quantity : -quantity;
        const success = await adjustStock(product.id, finalChange, reason);

        if (success) {
            onSuccess?.();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black">Adjust Stock</h2>
                        <p className="text-xs text-zinc-500 font-bold uppercase truncate max-w-[250px]">{product.name}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} disabled={loading}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                        <span className="text-zinc-500 font-bold uppercase text-xs">Current Stock</span>
                        <span className="text-2xl font-black">{product.quantity}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setType('add')}
                            className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-1",
                                type === 'add'
                                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600"
                                    : "border-zinc-100 dark:border-zinc-800 text-zinc-400"
                            )}
                        >
                            <Plus className="h-6 w-6" />
                            <span className="font-bold text-xs">Add</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('subtract')}
                            className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-1",
                                type === 'subtract'
                                    ? "border-red-500 bg-red-50 dark:bg-red-900/10 text-red-600"
                                    : "border-zinc-100 dark:border-zinc-800 text-zinc-400"
                            )}
                        >
                            <Minus className="h-6 w-6" />
                            <span className="font-bold text-xs">Subtract</span>
                        </button>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Quantity Change</label>
                        <Input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            className="h-12 text-lg font-bold"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Reason (Optional)</label>
                        <Input
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Stock count, damage, return"
                        />
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
                        <Button
                            className={cn(
                                "flex-1 rounded-xl h-12 gap-2",
                                type === 'subtract' ? "bg-red-600 hover:bg-red-700 shadow-red-500/20" : ""
                            )}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Update Stock
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
