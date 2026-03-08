/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Calculator, Loader2, AlertCircle, CheckCircle2, FileText, UserCheck, HelpCircle, LogOut, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlobalStore, useAuthStore, useShiftStore } from '@/store';
import { ShiftReceiptView } from './ShiftReceiptView';

interface CloseShiftModalProps {
    shift: any;
    onSuccess: () => void;
    onClose: () => void;
}

export function CloseShiftModal({ shift, onSuccess, onClose }: CloseShiftModalProps) {
    const { storeProfile } = useGlobalStore();
    const { logout } = useAuthStore();
    const { closeShift, clearShift } = useShiftStore();
    const currencySymbol = storeProfile?.currency_symbol || '$';

    const [step, setStep] = useState<1 | 2>(1);
    const [actualBalance, setActualBalance] = useState('');
    const [notes, setNotes] = useState('');
    const [supervisorId, setSupervisorId] = useState('');
    const [supervisors, setSupervisors] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [reconciliationResult, setReconciliationResult] = useState<any>(null);
    const [showVarianceConfirm, setShowVarianceConfirm] = useState(false);
    const [showReceipt, setShowReceipt] = useState(false);

    useEffect(() => {
        fetchSupervisors();
    }, []);

    const fetchSupervisors = async () => {
        try {
            const data = await api.get<any[]>('/auth/supervisors');
            setSupervisors(data);
        } catch (err) {
            console.error('Failed to fetch supervisors', err);
        }
    };

    const handleReconcile = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        const expected = shift.current_balance || (shift.opening_balance + (shift.total_cash_sales || 0) - (shift.total_drops || 0));
        const balance = parseFloat(actualBalance);
        const variance = balance - expected;

        if (!showVarianceConfirm && Math.abs(variance) > 0.01) {
            setShowVarianceConfirm(true);
            return;
        }

        setLoading(true);
        try {
            const result = await closeShift(balance, notes, supervisorId || undefined);
            setReconciliationResult(result);
            setStep(2);
        } catch (err: any) {
            alert(err.message || 'Failed to reconcile shift');
        } finally {
            setLoading(false);
            setShowVarianceConfirm(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
                {step === 1 ? (
                    <div className="p-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-2xl">
                                <Calculator className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black">End of Shift</h2>
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Shift Reconciliation & Sign-off</p>
                            </div>
                        </div>

                        <form onSubmit={handleReconcile} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1">Physical Cash Count</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-black text-zinc-400"></span>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            className="pl-10 h-14 rounded-2xl text-lg font-black bg-zinc-50 dark:bg-zinc-950 border-none ring-2 ring-zinc-100 dark:ring-zinc-800 focus:ring-red-500 transition-all font-mono"
                                            placeholder="0.00"
                                            value={actualBalance}
                                            onChange={(e) => setActualBalance(e.target.value)}
                                            required
                                            autoFocus
                                        />
                                    </div>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase px-1">Count all cash remaining in the drawer.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                        <UserCheck className="h-3 w-3" /> Supervisor Sign-off
                                    </label>
                                    <select
                                        className="w-full h-12 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border-none ring-1 ring-zinc-100 dark:ring-zinc-800 focus:ring-red-500 transition-all text-sm appearance-none outline-none dark:text-white"
                                        value={supervisorId}
                                        onChange={(e) => setSupervisorId(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Supervisor...</option>
                                        {supervisors.map(s => (
                                            <option key={s.id} value={s.id}>{s.username} ({s.role})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                        <FileText className="h-3 w-3" /> Deviation Notes
                                    </label>
                                    <textarea
                                        className="w-full h-[156px] p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border-none ring-1 ring-zinc-100 dark:ring-zinc-800 focus:ring-red-500 transition-all text-sm resize-none"
                                        placeholder="Explain any missing funds or calculation errors..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button type="button" variant="secondary" className="flex-1 h-14 rounded-2xl font-bold" onClick={onClose}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-[2] h-14 rounded-2xl font-black gap-2 bg-red-600 hover:bg-red-700 shadow-xl shadow-red-500/20"
                                        disabled={loading}
                                    >
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Calculator className="h-5 w-5" />}
                                        Finalize & Close
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="p-10 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex flex-col items-center">
                            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-4 rounded-[2rem] mb-6">
                                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
                            </div>
                            <h2 className="text-3xl font-black mb-2">Shift Reconciled</h2>
                            <p className="text-zinc-500 font-medium">Your shift has been successfully ended.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-zinc-50 dark:bg-zinc-950 rounded-3xl border border-zinc-100 dark:border-zinc-800">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Expected Cash</p>
                                <p className="text-2xl font-black font-mono">{currencySymbol}{(reconciliationResult.expected_closing_balance || 0).toFixed(2)}</p>
                            </div>
                            <div className={cn(
                                "p-6 rounded-3xl border",
                                reconciliationResult.variance === 0
                                    ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-800/30"
                                    : "bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-800/30"
                            )}>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Variance</p>
                                <p className={cn(
                                    "text-2xl font-black font-mono",
                                    reconciliationResult.variance === 0 ? "text-emerald-600" : "text-red-600"
                                )}>
                                    {reconciliationResult.variance > 0 ? '+' : ''}
                                    {currencySymbol}{(reconciliationResult.variance || 0).toFixed(2)}
                                </p>
                            </div>
                        </div>

                        {reconciliationResult.variance !== 0 && (
                            <div className="flex items-start gap-4 p-5 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/20 text-left">
                                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-black text-red-600 uppercase tracking-tight">Discrepancy Detected</h4>
                                    <p className="text-xs text-red-600/70 font-medium mt-1">A difference of {currencySymbol}{Math.abs(reconciliationResult.variance).toFixed(2)} has been recorded and flagged for supervisor review.</p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <div className="flex flex-1 gap-4">
                                <Button
                                    className="flex-1 h-14 rounded-2xl font-black text-lg gap-2"
                                    onClick={() => setShowReceipt(true)}
                                >
                                    <Printer className="h-5 w-5" />
                                    Print Report
                                </Button>
                                <Button
                                    variant="outline"
                                    className="flex-1 h-14 rounded-2xl font-black text-lg gap-2"
                                    onClick={() => {
                                        clearShift(); // Clear local state now that we are done
                                        logout();
                                        window.location.href = '/login';
                                    }}
                                >
                                    <LogOut className="h-5 w-5" />
                                    Logout & Exit
                                </Button>
                            </div>
                            <Button
                                className="flex-[2] h-14 rounded-2xl font-black text-lg bg-zinc-900 hover:bg-black text-white"
                                onClick={() => {
                                    clearShift(); // Clear local state now that we are done
                                    onSuccess();
                                    onClose();
                                }}
                            >
                                Return to POS
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Variance Confirmation Overlay */}
            {showVarianceConfirm && (
                <div className="fixed inset-0 z-[80] bg-zinc-950/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-[2rem] p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="bg-amber-100 dark:bg-amber-900/30 p-4 rounded-full">
                                <HelpCircle className="h-10 w-10 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-black">Confirm Variance?</h3>
                            <p className="text-sm text-zinc-500 font-medium">
                                The amount entered results in a variance of <span className="font-black text-red-600">{currencySymbol}{(parseFloat(actualBalance) - (shift.opening_balance + (shift.total_cash_sales || 0) - (shift.total_drops || 0))).toFixed(2)}</span>.
                                Are you sure this is correct?
                            </p>
                            <div className="flex w-full gap-3 pt-4">
                                <Button
                                    variant="secondary"
                                    className="flex-1 h-12 rounded-xl font-bold"
                                    onClick={() => setShowVarianceConfirm(false)}
                                >
                                    Re-count
                                </Button>
                                <Button
                                    className="flex-1 h-12 rounded-xl font-black bg-amber-600 hover:bg-amber-700 text-white"
                                    onClick={() => handleReconcile()}
                                >
                                    Yes, Confirm
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showReceipt && reconciliationResult && (
                <ShiftReceiptView
                    type="close"
                    data={reconciliationResult}
                    onClose={() => setShowReceipt(false)}
                />
            )}
        </div>
    );
}
