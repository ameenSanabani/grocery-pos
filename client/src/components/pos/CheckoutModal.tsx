/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { useState, useEffect, useRef } from 'react';
import { useCartStore, useShiftStore } from '@/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { X, Banknote, CreditCard, Loader2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
    const { grandTotal, checkout, loading, error } = useCartStore();
    const { refreshActiveShift } = useShiftStore();
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'credit'>('cash');
    const [amountTendered, setAmountTendered] = useState<string>('');
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
    const [storeProfile, setStoreProfile] = useState<any | null>(null);

    // Filtered options for the customer select
    const customerOptions = customers.map(c => ({
        value: c.id,
        label: `${c.name} (Limit: ${storeProfile?.currency_symbol} ${c.credit_limit} | Owed: ${storeProfile?.currency_symbol} ${c.current_balance})`
    }));

    useEffect(() => {
        if (isOpen) {
            fetchCustomers();
            setPaymentMethod('cash');
            setAmountTendered('');
            setSelectedCustomerId('');
        }

        fetchStoreProfile();

        const handleUpdate = () => fetchStoreProfile();
        window.addEventListener('store-profile-updated', handleUpdate);
        return () => window.removeEventListener('store-profile-updated', handleUpdate);
    }, [isOpen]);

    const fetchStoreProfile = async () => {
        try {
            const data = await api.get<any>('/settings/store-profile');
            if (data) setStoreProfile(data);
        } catch (err) {
            console.error('Failed to fetch store profile', err);
        }
    };

    const fetchCustomers = async () => {
        try {
            const data = await api.get<any[]>('/customers');
            setCustomers(data);
        } catch (err) {
            console.error('Failed to fetch customers', err);
        }
    };

    const handleSubmit = async (e?: React.FormEvent | React.KeyboardEvent) => {
        if (e) e.preventDefault();

        // Validation
        if (paymentMethod === 'credit' && !selectedCustomerId) {
            alert('Please select a customer for credit payment');
            return;
        }

        const tendered = paymentMethod === 'cash' ? parseFloat(amountTendered) : grandTotal;

        if (paymentMethod === 'cash' && (isNaN(tendered) || tendered < grandTotal)) {
            alert('Amount tendered must be equal to or greater than the total');
            return;
        }

        try {
            await checkout(paymentMethod, tendered, selectedCustomerId || undefined);
            if (paymentMethod === 'cash') {
                await refreshActiveShift();
            }
            onClose();
        } catch (err) {
            console.error(err);
        }
    };

    /**
     * MODIFICATION: handleEnterDown
     * This prevents the "Enter" key from interacting with the product list
     * on the page beneath the modal.
     */
    const handleEnterDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            // Prevent event from reaching the background page
            e.preventDefault();
            e.stopPropagation();

            if (!loading) {
                handleSubmit(e);
            }
        }

        // Bonus: Close modal on Escape key
        if (e.key === 'Escape' && !loading) {
            onClose();
        }
    };

    const change = Math.max(0, (parseFloat(amountTendered) || 0) - grandTotal);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onKeyDown={handleEnterDown} // Captures keydown at the highest level of the modal
        >
            <div className="w-full max-w-lg bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <h2 className="text-2xl font-black">Finalize Payment</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} disabled={loading}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Total Display */}
                    <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold uppercase tracking-wider text-sm">Total Due</span>
                        <span className="text-4xl font-black text-emerald-600">
                            {storeProfile?.currency_symbol} {grandTotal.toFixed(2)}
                        </span>
                    </div>

                    {/* Payment Method Selection */}
                    <div className="grid grid-cols-3 gap-3">
                        <PaymentTypeButton
                            active={paymentMethod === 'cash'}
                            onClick={() => setPaymentMethod('cash')}
                            icon={<Banknote className="h-6 w-6" />}
                            label="Cash"
                        />
                        <PaymentTypeButton
                            active={paymentMethod === 'card'}
                            onClick={() => setPaymentMethod('card')}
                            icon={<CreditCard className="h-6 w-6" />}
                            label="Card"
                        />
                        <PaymentTypeButton
                            active={paymentMethod === 'credit'}
                            onClick={() => setPaymentMethod('credit')}
                            icon={<Users className="h-6 w-6" />}
                            label="Credit"
                        />
                    </div>

                    {/* Conditional Fields: Cash */}
                    {paymentMethod === 'cash' && (
                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-500 ml-1 uppercase">Amount Tendered</label>
                                <div className="relative">
                                    <Input
                                        className="pl-4 h-16 text-2xl font-mono font-bold"
                                        placeholder="0.00"
                                        type="number"
                                        step="0.01"
                                        value={amountTendered}
                                        onChange={(e) => setAmountTendered(e.target.value)}
                                        required
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {change > 0 && (
                                <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl flex justify-between items-center border border-zinc-100 dark:border-zinc-800">
                                    <span className="text-zinc-500 font-medium">Change to return:</span>
                                    <span className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                                        {storeProfile?.currency_symbol} {change.toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Conditional Fields: Credit */}
                    {paymentMethod === 'credit' && (
                        <div className="space-y-4 animate-in slide-in-from-top-2 duration-200">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-500 ml-1 uppercase">Select Customer</label>
                                <SearchableSelect
                                    options={customerOptions}
                                    value={selectedCustomerId}
                                    onChange={setSelectedCustomerId}
                                    placeholder="Search customers..."
                                />
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
                                <p className="text-xs text-amber-700 dark:text-amber-400 font-bold leading-relaxed">
                                    Credit purchases will be added to the customer's balance. Ensure the customer has enough credit limit.
                                </p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 font-medium animate-pulse">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-16 text-xl font-black shadow-xl shadow-emerald-500/20"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Complete Transaction'}
                    </Button>
                </form>
            </div>
        </div>
    );
}

function PaymentTypeButton({ active, onClick, icon, label }: any) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-1",
                active
                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600"
                    : "border-zinc-100 dark:border-zinc-800 text-zinc-400"
            )}
        >
            {icon}
            <span className="font-bold text-xs uppercase tracking-tight">{label}</span>
        </button>
    );
}