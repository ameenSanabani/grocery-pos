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
import {
    Wallet, Monitor, ArrowRight, Loader2, CheckCircle2,
    Lock, LogOut, TrendingDown, Power, User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore, useGlobalStore, useShiftStore } from '@/store';
import { CashDropModal } from './CashDropModal';
import { CloseShiftModal } from './CloseShiftModal';

interface ShiftGateProps {
    children: React.ReactNode;
}

export function ShiftGate({ children }: ShiftGateProps) {
    const { user, logout, refreshUser } = useAuthStore();
    const { storeProfile } = useGlobalStore();
    const {
        currentShift: shift,
        registers,
        fetchRegisters,
        openShift,
        fetchActiveShift,
        shiftLoading
    } = useShiftStore();

    const currencySymbol = storeProfile?.currency_symbol || '$';
    const [opening, setOpening] = useState(false);
    const [selectedRegister, setSelectedRegister] = useState<string>('');
    const [openingBalance, setOpeningBalance] = useState<string>('');

    // UI state for mid-shift actions
    const [showDropModal, setShowDropModal] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false);

    useEffect(() => {
        refreshUser();
        fetchActiveShift();
        fetchRegisters();
    }, []);

    useEffect(() => {
        if (registers.length > 0 && !selectedRegister) {
            setSelectedRegister(registers[0].id);
        }
    }, [registers, selectedRegister]);

    const handleOpenShift = async (e: React.FormEvent) => {
        e.preventDefault();
        setOpening(true);
        try {
            await openShift(selectedRegister, parseFloat(openingBalance || '0'));
        } catch (err: any) {
            alert(err.message || 'Failed to open shift');
        } finally {
            setOpening(false);
        }
    };

    if (shiftLoading && !shift) {
        return (
            <div className="fixed inset-0 z-[100] bg-white dark:bg-black flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-4" />
                <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Securing Session...</p>
            </div>
        );
    }

    if (!shift) {
        return (
            <div className="fixed inset-0 z-[100] bg-zinc-950/90 backdrop-blur-xl flex items-center justify-center p-6">
                <div className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-[2.5rem] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-5 h-full">
                        {/* Sidebar Branding */}
                        <div className="md:col-span-2 bg-emerald-600 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                                    <Lock className="h-6 w-6" />
                                </div>
                                <h2 className="text-3xl font-black leading-tight mb-2">Shift Initialization</h2>
                                <p className="text-emerald-100 text-sm font-medium">Verify your starting balance to begin the trading day.</p>
                            </div>

                            <div className="relative z-10 flex flex-col gap-4">
                                <div className="flex items-center gap-3 p-4 bg-white/10 rounded-2xl backdrop-blur-sm">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Session User</p>
                                        <p className="text-sm font-bold">{user?.username}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-200">
                                    <CheckCircle2 className="h-3 w-3" /> Financial Accountability
                                </div>

                                <Button
                                    type="button"
                                    onClick={() => {
                                        logout();
                                        window.location.href = '/login';
                                    }}
                                    variant="outline"
                                    className="mt-4 border-white/20 bg-white/5 hover:bg-white/20 text-white rounded-2xl h-12 font-black gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Exit System
                                </Button>
                            </div>

                            {/* Decorative background circle */}
                            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-emerald-500 rounded-full blur-3xl opacity-50" />
                        </div>

                        {/* Form Area */}
                        <div className="md:col-span-3 p-12">
                            <form onSubmit={handleOpenShift} className="space-y-8">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                            <Monitor className="h-3 w-3" /> Select Register Station
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {registers.map((reg: any) => (
                                                <button
                                                    key={reg.id}
                                                    type="button"
                                                    onClick={() => !reg.is_occupied && setSelectedRegister(reg.id)}
                                                    disabled={reg.is_occupied}
                                                    className={cn(
                                                        "p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between group",
                                                        selectedRegister === reg.id
                                                            ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/10"
                                                            : reg.is_occupied
                                                                ? "border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 opacity-60 cursor-not-allowed"
                                                                : "border-zinc-100 dark:border-zinc-800 hover:border-emerald-500"
                                                    )}
                                                >
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <p className={cn(
                                                                "font-black text-sm",
                                                                selectedRegister === reg.id ? "text-emerald-600" : "text-zinc-600"
                                                            )}>{reg.name}</p>
                                                            {reg.is_occupied && (
                                                                <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                                                    Occupied by {reg.occupied_by}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] font-bold text-zinc-400">Station ID: {reg.id}</p>
                                                    </div>
                                                    <div className={cn(
                                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                                        selectedRegister === reg.id
                                                            ? "border-emerald-600 bg-emerald-600 text-white"
                                                            : "border-zinc-200 dark:border-zinc-700"
                                                    )}>
                                                        {selectedRegister === reg.id && <CheckCircle2 className="h-3 w-3" />}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                            <Wallet className="h-3 w-3" /> Opening Cash Balance
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-xl font-black text-zinc-300"></span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                className="pl-12 h-16 rounded-[1.25rem] text-2xl font-black bg-zinc-50 dark:bg-zinc-950 border-none ring-2 ring-zinc-100 dark:ring-zinc-800 focus:ring-emerald-500 transition-all font-mono"
                                                placeholder="0.00"
                                                value={openingBalance}
                                                onChange={(e) => setOpeningBalance(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <p className="text-[10px] text-zinc-400 font-bold uppercase mt-2 ml-1 px-1">Ensure all funds are physically present in the drawer.</p>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-16 rounded-[1.25rem] font-black text-lg gap-3 shadow-xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] transition-all"
                                    disabled={opening || !selectedRegister}
                                >
                                    {opening ? (
                                        <>
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                            <span>Initializing Session...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Securely Open Register</span>
                                            <ArrowRight className="h-6 w-6" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen">
            {/* Active Shift Controls Overlay - Moved to left to avoid covering cart */}
            <div className="fixed top-6 left-24 z-50 flex flex-col gap-4 animate-in slide-in-from-left-8 duration-500">
                <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl flex items-center gap-4 pr-6 h-16">
                    <div className="flex flex-col bg-emerald-600/10 dark:bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-600/20">
                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Drawer Balance</span>
                        <span className="text-sm font-black text-emerald-600 font-mono">
                            {currencySymbol}{(shift.current_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                    <div className="w-px h-10 bg-zinc-200 dark:bg-zinc-800" />
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowDropModal(true)}
                            className="w-12 h-12 flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl hover:bg-amber-200 transition-all active:scale-90"
                            title="Mid-shift Cash Drop"
                        >
                            <TrendingDown className="h-6 w-6" />
                        </button>
                        <button
                            onClick={() => setShowCloseModal(true)}
                            className="w-12 h-12 flex items-center justify-center bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl hover:bg-red-200 transition-all active:scale-90"
                            title="End Shift"
                        >
                            <LogOut className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="w-px h-10 bg-zinc-200 dark:border-zinc-800" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Register Active</span>
                        <span className="text-sm font-black text-zinc-900 dark:text-white uppercase">ID: {shift.register_id}</span>
                    </div>
                </div>
            </div>

            {/* Main POS Content */}
            {children}

            {/* Shift Modals */}
            {showDropModal && (
                <CashDropModal
                    shiftId={shift.id}
                    onSuccess={() => {
                        // Optionally refresh shift data if needed
                        console.log('Cash drop recorded');
                    }}
                    onClose={() => setShowDropModal(false)}
                />
            )}

            {showCloseModal && (
                <CloseShiftModal
                    shift={shift}
                    onSuccess={() => {
                        // Success is handled inside the modal by closing it and showing the Return/Exit buttons
                        // But we want the background to reflect the change if they return
                    }}
                    onClose={() => setShowCloseModal(false)}
                />
            )}
        </div>
    );
}
