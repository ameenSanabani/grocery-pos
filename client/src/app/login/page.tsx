/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Package, Lock, User, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [storeProfile, setStoreProfile] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        fetchStoreProfile();
    }, []);

    const fetchStoreProfile = async () => {
        try {
            const data = await api.get('/settings/store-profile');
            setStoreProfile(data);
        } catch (err) {
            console.warn('Failed to fetch store profile branding. Using defaults.', err);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data = await api.post<any>('/auth/login', { username, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            router.push('/pos');
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4">
            <div className="w-full max-w-md bg-white dark:bg-zinc-950 p-8 rounded-3xl shadow-2xl border border-zinc-100 dark:border-zinc-900">
                <div className="flex flex-col items-center mb-10">
                    <div
                        className="p-4 rounded-3xl shadow-lg mb-6 transition-colors"
                        style={{
                            backgroundColor: storeProfile?.vibrant_color || '#059669',
                            boxShadow: `0 10px 15px -3px ${storeProfile?.vibrant_color || '#059669'}33`
                        }}
                    >
                        <Package className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                        {storeProfile?.name || 'Welcome Back'}
                    </h1>
                    <p className="text-zinc-500 mt-2 text-center uppercase text-[10px] font-black tracking-widest">Secure Terminal Access</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Username</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                            <Input
                                className="pl-10 h-12 bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl"
                                placeholder="cashier_01"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                            <Input
                                type="password"
                                className="pl-10 h-12 bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 animate-pulse">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full h-14 rounded-2xl text-lg font-bold shadow-emerald-500/20 shadow-xl"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Launch POS Terminal'}
                    </Button>
                </form>

                <div className="mt-8 text-center text-xs text-zinc-400">
                    Grocery Management System v1.0 • Secure Terminal
                </div>
            </div>
        </div>
    );
}
