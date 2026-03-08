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
import { X, Loader2, Save, AlertCircle, User, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCustomerStore } from '@/store';

interface CustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer?: any | null;
    onSuccess?: () => void; // Made optional
}

export function CustomerModal({ isOpen, onClose, customer, onSuccess }: CustomerModalProps) {
    const { createCustomer, updateCustomer, loading, error, clearError } = useCustomerStore();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        credit_limit: '0'
    });

    useEffect(() => {
        if (isOpen) {
            clearError();
            if (customer) {
                setFormData({
                    name: customer.name || '',
                    phone: customer.phone || '',
                    email: customer.email || '',
                    address: customer.address || '',
                    credit_limit: customer.credit_limit?.toString() || '0'
                });
            } else {
                setFormData({
                    name: '',
                    phone: '',
                    email: '',
                    address: '',
                    credit_limit: '0'
                });
            }
        }
    }, [customer, isOpen, clearError]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const payload = {
            ...formData,
            credit_limit: parseFloat(formData.credit_limit)
        };

        let success = false;
        if (customer) {
            success = await updateCustomer(customer.id, payload);
        } else {
            success = await createCustomer(payload);
        }

        if (success) {
            onSuccess?.();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <h2 className="text-2xl font-black">{customer ? 'Edit Customer' : 'Add New Customer'}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} disabled={loading}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                                <User className="h-3 w-3" /> Full Name
                            </label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="e.g. John Doe"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                                    <Phone className="h-3 w-3" /> Phone Number
                                </label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                    placeholder="+1 234 567 890"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                                    <Mail className="h-3 w-3" /> Email Address
                                </label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2">
                                <MapPin className="h-3 w-3" /> Residential Address
                            </label>
                            <Input
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="e.g. 123 Main St, City"
                            />
                        </div>

                        <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-600 rounded-lg">
                                    <CreditCard className="h-4 w-4 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-emerald-950 dark:text-emerald-400">Credit Line Settings</h3>
                                    <p className="text-[10px] uppercase font-bold text-emerald-700/70">Configure maximum purchase limit</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-emerald-800/60 uppercase">Maximum Approved Credit ($)</label>
                                <Input
                                    type="number"
                                    step="10"
                                    className="bg-white/50 border-emerald-200 focus:ring-emerald-500 h-10 font-bold"
                                    value={formData.credit_limit}
                                    onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
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
                        <Button className="flex-1 rounded-xl h-12 gap-2 shadow-lg shadow-emerald-500/20" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {customer ? 'Update Customer' : 'Register Customer'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
