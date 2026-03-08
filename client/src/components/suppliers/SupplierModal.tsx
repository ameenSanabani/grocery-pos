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
import { useSupplierStore } from '@/store';

interface SupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    supplier?: any | null;
    onSuccess?: () => void; // Made optional
}

export function SupplierModal({ isOpen, onClose, supplier, onSuccess }: SupplierModalProps) {
    const { createSupplier, updateSupplier, loading, error, clearError } = useSupplierStore();

    const [formData, setFormData] = useState({
        name: '',
        contact_person: '',
        phone: '',
        email: '',
        address: ''
    });

    useEffect(() => {
        if (isOpen) {
            clearError();
            if (supplier) {
                setFormData({
                    name: supplier.name || '',
                    contact_person: supplier.contact_person || '',
                    phone: supplier.phone || '',
                    email: supplier.email || '',
                    address: supplier.address || ''
                });
            } else {
                setFormData({
                    name: '',
                    contact_person: '',
                    phone: '',
                    email: '',
                    address: ''
                });
            }
        }
    }, [supplier, isOpen, clearError]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let success = false;
        if (supplier) {
            success = await updateSupplier(supplier.id, formData);
        } else {
            success = await createSupplier(formData);
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
                    <h2 className="text-2xl font-black">{supplier ? 'Edit Supplier' : 'Add New Supplier'}</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} disabled={loading}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Company Name</label>
                            <Input
                                placeholder="e.g. Acme Wholesale"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Contact Person</label>
                                <Input
                                    placeholder="John Doe"
                                    value={formData.contact_person}
                                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Phone Number</label>
                                <Input
                                    placeholder="+1 234 567 890"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Email Address</label>
                            <Input
                                type="email"
                                placeholder="contact@supplier.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Address</label>
                            <textarea
                                className="w-full min-h-[100px] p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
                                placeholder="Full company address..."
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 font-medium animate-in slide-in-from-top-2">
                            <AlertCircle className="h-4 w-4" /> {error}
                        </div>
                    )}

                    <div className="flex gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <Button variant="ghost" type="button" className="flex-1 rounded-xl h-12" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button className="flex-1 rounded-xl h-12 gap-2 shadow-lg shadow-emerald-500/20" disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            {supplier ? 'Update Supplier' : 'Save Supplier'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
