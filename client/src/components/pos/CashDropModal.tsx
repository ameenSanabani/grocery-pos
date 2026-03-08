/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TrendingDown, Loader2, ArrowDownCircle } from 'lucide-react';
import { useGlobalStore, useShiftStore } from '@/store';
import { ShiftReceiptView } from './ShiftReceiptView';

interface CashDropModalProps {
    shiftId: string;
    onSuccess: () => void;
    onClose: () => void;
}

export function CashDropModal({ shiftId, onSuccess, onClose }: CashDropModalProps) {
    const { storeProfile } = useGlobalStore();
    const { refreshActiveShift } = useShiftStore();
    const currencySymbol = storeProfile?.currency_symbol || '$';
    const [amount, setAmount] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [receiptData, setReceiptData] = useState<any>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = await api.post<any>(`/shifts/${shiftId}/drop`, {
                amount: parseFloat(amount),
                notes
            });
            await refreshActiveShift();
            setReceiptData(data);
            onSuccess();
        } catch (err: any) {
            alert(err.message || 'Failed to record cash drop');
        } finally {
            setLoading(false);
        }
    };

    if (receiptData) {
        return <ShiftReceiptView type="drop" data={receiptData} onClose={onClose} />;
    }

    return (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-2xl">
                            <TrendingDown className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black">Cash Drop</h2>
                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Transfer to Safe</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Amount to Drop</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-zinc-400"></span>
                                <Input
                                    type="number"
                                    step="0.01"
                                    className="pl-10 h-14 rounded-2xl text-lg font-black bg-zinc-50 dark:bg-zinc-950 border-none ring-2 ring-zinc-100 dark:ring-zinc-800 focus:ring-amber-500 transition-all"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Notes / Reason</label>
                            <Input
                                className="h-12 rounded-xl bg-zinc-50 dark:bg-zinc-950 border-none ring-1 ring-zinc-100 dark:ring-zinc-800 focus:ring-amber-500 transition-all"
                                placeholder="Drawer limit exceeded / Mid-shift drop"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button type="button" variant="secondary" className="flex-1 h-12 rounded-xl font-bold" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 h-12 rounded-xl font-black gap-2 bg-amber-600 hover:bg-amber-700 shadow-lg shadow-amber-500/20"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowDownCircle className="h-5 w-5" />}
                                Confirm Drop
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
