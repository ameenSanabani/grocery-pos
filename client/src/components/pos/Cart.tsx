/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { useState, memo } from 'react';
import { useCartStore, useGlobalStore, useAuthStore, useShiftStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Trash2, Plus, Minus, ShoppingBag, AlertCircle, Wallet } from 'lucide-react';
import { CheckoutModal } from '@/components/pos/CheckoutModal';
import { ReceiptView } from '@/components/pos/ReceiptView';
import { cn } from '@/lib/utils';

interface CartItemProps {
    item: any;
    currencySymbol: string | undefined;
    onUpdateQuantity: (id: string, quantity: number) => void;
    onRemove: (id: string) => void;
}

const CartItem = memo(({ item, currencySymbol, onUpdateQuantity, onRemove }: CartItemProps) => (
    <div className="flex items-center gap-4 group p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-100 dark:hover:border-zinc-800">
        <div className="flex-1">
            <div className="font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</div>
            <div className="text-sm text-zinc-500">{currencySymbol}{item.unit_price.toFixed(2)} / ea</div>
        </div>

        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            >
                <Minus className="h-3 w-3" />
            </Button>
            <div className="w-8 text-center font-mono font-bold text-sm">{item.quantity}</div>
            <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            >
                <Plus className="h-3 w-3" />
            </Button>
        </div>

        <div className="w-20 text-right font-bold text-emerald-600">
            {currencySymbol}{(item.unit_price * item.quantity).toFixed(2)}
        </div>

        <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 h-8 w-8 text-zinc-400 hover:text-red-500 transition-all"
            onClick={() => onRemove(item.id)}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    </div>
));
CartItem.displayName = 'CartItem';

export function Cart() {
    const { items, subtotal, taxTotal, grandTotal, updateQuantity, removeItem, clearCart } = useCartStore();
    const { storeProfile } = useGlobalStore();
    const currencySymbol = storeProfile?.currency_symbol || '$';
    const { user } = useAuthStore();
    const { currentShift: shift } = useShiftStore();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const cashLimit = Number(user?.cash_limit ?? 500);
    const currentBalance = Number(shift?.current_balance ?? 0);
    // Use grandTotal to prevent the sale that WOULD put the user over the limit
    const isLimitExceeded = (currentBalance + grandTotal) > cashLimit;

    const handleCheckoutClick = () => {
        if (!shift) {
            alert('Please open a shift before processing payments.');
            return;
        }

        if (isLimitExceeded) {
            alert(`Transaction Blocked: This sale of ${currencySymbol}${grandTotal.toFixed(2)} would exceed your drawer limit (${currencySymbol}${currentBalance.toFixed(2)} + ${currencySymbol}${grandTotal.toFixed(2)} > ${currencySymbol}${cashLimit.toFixed(2)}). Please perform a Cash Drop.`);
            return;
        }

        setIsCheckoutOpen(true);
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-xl">
            {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 py-20 grayscale opacity-50">
                    <ShoppingBag className="h-16 w-16 mb-4 stroke-1" />
                    <p className="text-lg">Cart is empty</p>
                </div>
            ) : (
                <>
                    <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            Current Sale
                            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full dark:bg-emerald-900/30 dark:text-emerald-400">
                                {items.reduce((acc, i) => acc + i.quantity, 0)} items
                            </span>
                        </h2>
                        <Button variant="ghost" size="sm" onClick={clearCart} className="text-zinc-500 hover:text-red-600">
                            Clear
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {items.map((item) => (
                            <CartItem
                                key={item.id}
                                item={item}
                                currencySymbol={storeProfile?.currency_symbol}
                                onUpdateQuantity={updateQuantity}
                                onRemove={removeItem}
                            />
                        ))}
                    </div>

                    <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4 bg-zinc-50 dark:bg-zinc-900/30">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-zinc-500">
                                <span>Subtotal</span>
                                <span>{storeProfile?.currency_symbol}{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-zinc-500">
                                <span>Tax</span>
                                <span>{storeProfile?.currency_symbol}{taxTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center py-2 border-t border-zinc-200 dark:border-zinc-700">
                            <span className="text-lg font-bold">Total</span>
                            <span className="text-3xl font-black text-emerald-600">{storeProfile?.currency_symbol}{grandTotal.toFixed(2)}</span>
                        </div>

                        {isLimitExceeded && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-3 animate-pulse">
                                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-black text-amber-700 uppercase tracking-tight">Cash Limit Exceeded</p>
                                    <p className="text-[10px] text-amber-600 font-bold leading-tight">Please perform a Cash Drop before continuing with more cash sales.</p>
                                </div>
                            </div>
                        )}

                        <Button
                            className={cn(
                                "w-full h-16 text-xl font-bold shadow-lg transition-all active:scale-[0.98]",
                                isLimitExceeded
                                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200 shadow-amber-500/10"
                                    : "shadow-emerald-500/20"
                            )}
                            onClick={handleCheckoutClick}
                        >
                            {isLimitExceeded ? (
                                <span className="flex items-center gap-2">
                                    <Wallet className="h-6 w-6" /> Drop Cash to Continue
                                </span>
                            ) : "Pay Now"}
                        </Button>
                    </div>
                </>
            )}

            <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
            <ReceiptView />
        </div>
    );
}
