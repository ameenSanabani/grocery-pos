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
import { Store, MapPin, Phone, Mail, Hash, Palette, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StoreProfile {
    name: string;
    address: string;
    phone: string;
    email: string;
    tax_number: string;
    currency_symbol: string;
    vibrant_color: string;
}

export function StoreProfileForm() {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState<StoreProfile>({
        name: '',
        address: '',
        phone: '',
        email: '',
        tax_number: '',
        currency_symbol: '$',
        vibrant_color: '#059669'
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const data = await api.get<StoreProfile>('/settings/store-profile');
            if (data) {
                setFormData(data);
            }
        } catch (err) {
            console.error('Failed to fetch store profile', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess(false);
        try {
            await api.patch('/settings/store-profile', formData);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);

            // Dispatch event for other components to update (like Sidebar)
            window.dispatchEvent(new Event('store-profile-updated'));
        } catch (err) {
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-20 flex flex-col items-center justify-center text-zinc-400">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p className="font-bold uppercase text-[10px] tracking-widest">Loading Profile...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Info */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <Store className="h-3 w-3" /> Store Name
                        </label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. GroceryMart Main"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="h-3 w-3" /> Commercial Address
                        </label>
                        <Input
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="123 Market St, City"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                <Phone className="h-3 w-3" /> Phone
                            </label>
                            <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+1 234 567"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                <Mail className="h-3 w-3" /> Email
                            </label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="contact@store.com"
                            />
                        </div>
                    </div>
                </div>

                {/* Billing & Branding */}
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <Hash className="h-3 w-3" /> Tax Registration Number
                        </label>
                        <Input
                            value={formData.tax_number}
                            onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                            placeholder="TX-000-000"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                Currecy Symbol
                            </label>
                            <Input
                                value={formData.currency_symbol}
                                onChange={(e) => setFormData({ ...formData, currency_symbol: e.target.value })}
                                placeholder="$"
                                className="font-black text-lg"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                <Palette className="h-3 w-3" /> Brand Color
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    className="h-10 w-12 rounded-lg bg-transparent border-none cursor-pointer"
                                    value={formData.vibrant_color}
                                    onChange={(e) => setFormData({ ...formData, vibrant_color: e.target.value })}
                                />
                                <Input
                                    value={formData.vibrant_color}
                                    onChange={(e) => setFormData({ ...formData, vibrant_color: e.target.value })}
                                    className="uppercase font-mono text-xs"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-4 group">
                        <div
                            className="h-12 w-12 rounded-2xl shadow-lg transition-transform group-hover:scale-105"
                            style={{ backgroundColor: formData.vibrant_color }}
                        />
                        <div>
                            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-tighter">Live Preview</p>
                            <p className="text-sm font-black">System Vibrant Accent</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 font-medium">Changes correctly reflect on all dynamic receipts and invoices.</p>
                <Button
                    className="rounded-2xl h-14 px-10 gap-2 shadow-xl shadow-emerald-500/20 active:scale-[0.98] transition-all"
                    disabled={saving}
                >
                    {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : success ? <CheckCircle2 className="h-5 w-5" /> : <Save className="h-5 w-5" />}
                    {success ? 'Profile Updated!' : 'Save Store Profile'}
                </Button>
            </div>
        </form>
    );
}
