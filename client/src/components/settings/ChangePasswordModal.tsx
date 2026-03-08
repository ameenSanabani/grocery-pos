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
import { X, Loader2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        if (formData.newPassword !== formData.confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/change-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            setSuccess(true);
            setTimeout(() => {
                onClose();
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setSuccess(false);
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <h2 className="text-xl font-black">Change Password</h2>
                    <Button variant="ghost" size="icon" onClick={onClose} disabled={loading}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in zoom-in">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <p className="text-lg font-black text-zinc-900 dark:text-zinc-100">Password Updated!</p>
                            <p className="text-sm text-zinc-500 text-center">Your password has been changed successfully.</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Current Password</label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.currentPassword}
                                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">New Password</label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.newPassword}
                                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        required
                                    />
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
                                    Update
                                </Button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
}
