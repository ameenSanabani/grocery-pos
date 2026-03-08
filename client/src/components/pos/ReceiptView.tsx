/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Printer, RefreshCcw } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import JsBarcode from 'jsbarcode';

interface StoreProfile {
    currency_symbol: string;
}

export function ReceiptView() {
    const { lastSale, resetSale } = useCartStore();
    const [storeProfile, setStoreProfile] = useState<any>(null);
    const barcodeRef = useRef<SVGSVGElement>(null);

useEffect(() => {
        if (lastSale) {
            fetchStoreProfile();
        }
    }, [lastSale]);

    useEffect(() => {
        if (lastSale && barcodeRef.current) {
            try {
                JsBarcode(barcodeRef.current, lastSale.receipt_ref, {
                    format: "CODE128",
                    width: 2,
                    height: 40,
                    displayValue: true,
                    fontSize: 12,
                    margin: 10
                });
            } catch (error) {
                console.error('Error generating barcode:', error);
            }
        }
    }, [lastSale]);

    const fetchStoreProfile = async () => {
        try {
            const data = await api.get<StoreProfile>('/settings/store-profile');
            if (data) {
                setStoreProfile(data);
            }
        } catch (err) {
            console.error('Failed to fetch store profile', err);
        }
    };

    if (!lastSale) return null;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 no-print overflow-y-auto">
            <div className="w-full max-w-sm flex flex-col items-center my-auto">
                {/* Success Icon */}
                <div className="mb-6 bg-emerald-500 p-4 rounded-full shadow-lg shadow-emerald-500/40 animate-bounce">
                    <CheckCircle2 className="h-10 w-10 text-white" />
                </div>

                <h2 className="text-2xl font-black text-white mb-2">Sale Successful!</h2>
                <p className="text-emerald-400 mb-8 font-mono">{lastSale.receipt_ref}</p>

                {/* The Receipt Paper */}
                <div id="receipt-paper" className="w-full bg-white text-black p-8 shadow-2xl rounded-sm font-mono text-sm leading-tight">
                    <div className="text-center border-b border-zinc-200 pb-4 mb-4">
                        <h3 className="text-lg font-black uppercase">{storeProfile?.name || 'Grocery Mart'}</h3>
                        {storeProfile?.address && <p className="text-[10px]">{storeProfile.address}</p>}
                        {storeProfile?.phone && <p className="text-[10px]">Tel: {storeProfile.phone}</p>}
                        {storeProfile?.tax_number && <p className="text-[10px]">Tax ID: {storeProfile.tax_number}</p>}
                    </div>

                    <div className="mb-4 space-y-1">
                        <div className="flex justify-between">
                            <span>Date:</span>
                            <span>{new Date(lastSale.created_at).toLocaleString()}</span>
                        </div>
<div className="flex justify-between">
                            <span>Receipt:</span>
                            <span>{lastSale.receipt_ref}</span>
                        </div>
                        <div className="flex justify-center mt-2 mb-2">
                            <svg ref={barcodeRef}></svg>
                        </div>
                        <div className="flex justify-between">
                            <span>Method:</span>
                            <span className="uppercase">{lastSale.payment_method}</span>
                        </div>
                    </div>

                    <div className="border-y border-dashed border-zinc-300 py-4 mb-4 space-y-2">
                        {lastSale.items.map((item: any) => (
                            <div key={item.id} className="space-y-0.5">
                                <div className="flex justify-between font-bold">
                                    <span>{item.product_name}</span>
                                    <span>{storeProfile?.currency_symbol} {(item.unit_price * item.quantity).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xs text-zinc-500">
                                    <span>{item.quantity} x {storeProfile?.currency_symbol} {item.unit_price.toFixed(2)}</span>
                                    {item.tax_rate > 0 && <span>(Tax: {item.tax_rate}%)</span>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-1 font-bold text-right pt-2 border-t border-zinc-100">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>{storeProfile?.currency_symbol} {lastSale.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax:</span>
                            <span>{storeProfile?.currency_symbol} {lastSale.tax_total.toFixed(2)}</span>
                        </div>
                        {lastSale.discount_total > 0 && (
                            <div className="flex justify-between text-emerald-600">
                                <span>Discount:</span>
                                <span>{storeProfile?.currency_symbol} {lastSale.discount_total.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-black pt-2 border-t border-double border-zinc-900 mt-2">
                            <span>TOTAL:</span>
                            <span>{storeProfile?.currency_symbol} {lastSale.grand_total.toFixed(2)}</span>
                        </div>
                    </div>

                    {lastSale.payment_method === 'cash' && (
                        <div className="mt-4 space-y-1 text-right text-xs">
                            <div className="flex justify-between">
                                <span>Tendered:</span>
                                <span> {storeProfile?.currency_symbol} {lastSale.amount_tendered.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold border-t border-zinc-100 pt-1 mt-1">
                                <span>Change:</span>
                                <span>{storeProfile?.currency_symbol} {lastSale.change.toFixed(2)}</span>
                            </div>
                        </div>
                    )}

                    <div className="text-center mt-8 pt-4 border-t border-zinc-100 italic text-xs">
                        Thank you for shopping with us!
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-8 mb-4 flex gap-4 w-full h-12">
                    <Button variant="secondary" className="flex-1 h-full gap-2" onClick={handlePrint}>
                        <Printer className="h-4 w-4" /> Print
                    </Button>
                    <Button className="flex-1 h-full gap-2" onClick={resetSale}>
                        <RefreshCcw className="h-4 w-4" /> New Sale
                    </Button>
                </div>
            </div>

            <style jsx global>{`
                @media print {
                    /* Hide EVERYTHING in the body */
                    body * {
                        visibility: hidden;
                    }
                    /* Specifically show the receipt paper and its children */
                    #receipt-paper, #receipt-paper * {
                        visibility: visible;
                    }
                    /* Position the receipt paper at the top-left for the printer */
                    #receipt-paper {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 10mm; /* Standard margin for thermal paper */
                        box-shadow: none;
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
