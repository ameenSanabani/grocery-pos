/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { useGlobalStore, Shift } from '@/store';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Printer, RefreshCcw, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface ShiftReceiptViewProps {
    type: 'drop' | 'close';
    data: any; // The result from the API
    onClose: () => void;
}

interface StoreProfile {
    name: string;
    currency_symbol: string;
    address?: string;
    phone?: string;
    tax_number?: string;
}

export function ShiftReceiptView({ type, data, onClose }: ShiftReceiptViewProps) {
    const { storeProfile } = useGlobalStore();
    const currencySymbol = (storeProfile as any)?.currency_symbol || '$';

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 no-print overflow-y-auto">
            <div className="w-full max-w-sm flex flex-col items-center my-auto">
                {/* Success Icon */}
                <div className="mb-6 bg-emerald-500 p-4 rounded-full shadow-lg shadow-emerald-500/40 animate-bounce">
                    <CheckCircle2 className="h-10 w-10 text-white" />
                </div>

                <h2 className="text-2xl font-black text-white mb-2">
                    {type === 'drop' ? 'Drop Recorded!' : 'Shift Closed!'}
                </h2>
                <p className="text-emerald-400 mb-8 font-mono text-xs uppercase tracking-widest">Verification Receipt Generated</p>

                {/* The Receipt Paper */}
                <div id="shift-receipt-paper" className="w-full bg-white text-black p-8 shadow-2xl rounded-sm font-mono text-[10px] leading-snug">
                    <div className="text-center border-b border-zinc-200 pb-4 mb-4">
                        <h3 className="text-lg font-black uppercase tracking-tight">{(storeProfile as any)?.name || 'Grocery Mart'}</h3>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-zinc-500">
                            {type === 'drop' ? 'Cash Drop Voucher' : 'Shift Reconciliation Report'}
                        </p>
                    </div>

                    <div className="mb-4 space-y-1">
                        <div className="flex justify-between">
                            <span>Cashier:</span>
                            <span className="font-bold uppercase">{data.cashier_name || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Register:</span>
                            <span className="font-bold uppercase">{data.register_name || data.register_id}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Date/Time:</span>
                            <span>{new Date().toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="border-y border-dashed border-zinc-300 py-4 mb-4 space-y-2">
                        {type === 'drop' ? (
                            <div className="flex justify-between text-base font-black">
                                <span>DROP AMOUNT:</span>
                                <span>{currencySymbol}{data.amount?.toFixed(2)}</span>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between">
                                    <span>Opening Balance:</span>
                                    <span>{currencySymbol}{data.opening_balance?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Sales (Cash):</span>
                                    <span>{currencySymbol}{(data.expected_closing_balance - data.opening_balance + (data.total_drops || 0)).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Total Drops:</span>
                                    <span>-{currencySymbol}{data.total_drops?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold pt-1 border-t border-zinc-100">
                                    <span>Expected Drawer:</span>
                                    <span>{currencySymbol}{data.expected_closing_balance?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-black text-sm pt-1 mt-1 border-t-2 border-zinc-900">
                                    <span>ACTUAL COUNT:</span>
                                    <span>{currencySymbol}{data.closing_balance?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-red-600">
                                    <span>VARIANCE:</span>
                                    <span>{currencySymbol}{data.variance?.toFixed(2)}</span>
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mb-6 space-y-2">
                        <div className="flex justify-between">
                            <span>Transaction Count:</span>
                            <span>{data.transaction_count || 0}</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span>Notes:</span>
                            <p className="italic text-zinc-500 min-h-[2em] border-l-2 border-zinc-100 pl-2">
                                {data.notes || 'No adjustment notes provided.'}
                            </p>
                        </div>
                    </div>

                    {/* Signature Areas */}
                    <div className="mt-12 grid grid-cols-2 gap-8 pt-8 border-t border-zinc-100">
                        <div className="space-y-4">
                            <div className="h-px bg-zinc-300 w-full" />
                            <div className="flex flex-col">
                                <span className="font-black text-[7px] uppercase tracking-tighter">Cashier Signature</span>
                                <span className="text-[9px] font-bold text-zinc-400">{data.cashier_name}</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-px bg-zinc-300 w-full" />
                            <div className="flex flex-col">
                                <span className="font-black text-[7px] uppercase tracking-tighter">Supervisor Signature</span>
                                <span className="text-[9px] font-bold text-zinc-400">{data.supervisor_name || 'Verification Required'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-10 pt-4 border-t border-zinc-100 font-bold text-[8px] uppercase tracking-widest text-zinc-400">
                        System Generated Report
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 flex gap-3 w-full h-12">
                    <Button variant="secondary" className="flex-1 h-full gap-2 font-black" onClick={handlePrint}>
                        <Printer className="h-4 w-4" /> Print Report
                    </Button>
                    <Button className="w-12 h-full p-0" variant="outline" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    /* Ensure only the receipt is printed */
                    #shift-receipt-paper, #shift-receipt-paper * {
                        visibility: visible;
                    }
                    #shift-receipt-paper {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 10mm;
                        box-shadow: none;
                        font-size: 11pt; /* Increase font for thermal printer readability */
                    }
                    /* Hide non-print areas strictly */
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
