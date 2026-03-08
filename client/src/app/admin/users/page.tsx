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
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
    UserPlus, Search, User, Mail, Shield,
    MoreHorizontal, Loader2, CheckCircle2, AlertCircle, Trash2, Wallet,
    Edit2, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlobalStore, useAuthStore } from '@/store';
import { POSSidebar } from '@/components/layout/POSSidebar';

export default function UserManagementPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { storeProfile } = useGlobalStore();
    const currencySymbol = storeProfile?.currency_symbol || '$';

    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    // Form state
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('cashier');
    const [cashLimit, setCashLimit] = useState('500.00');
    const [submitting, setSubmitting] = useState(false);

    // RBAC: Redirect non-admin users
    useEffect(() => {
        if (user && user.role !== 'admin') {
            router.push('/pos');
        }
    }, [user, router]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await api.get<any[]>('/users');
            setUsers(data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEdit = (user: any) => {
        setEditingUser(user);
        setUsername(user.username);
        setEmail(user.email);
        setPassword(''); // Don't show password
        setRole(user.role);
        setCashLimit(user.cash_limit?.toString() || '0.00');
        setIsCreateModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setEditingUser(null);
        setUsername('');
        setEmail('');
        setPassword('');
        setRole('cashier');
        setCashLimit('500.00');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload: any = { username, email, role, cash_limit: parseFloat(cashLimit) };
            if (password) payload.password = password;

            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, payload);
            } else {
                await api.post('/users', { ...payload, password });
            }

            handleCloseModal();
            fetchUsers();
        } catch (err: any) {
            alert(err.message || 'Failed to save user');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleStatus = async (userId: string) => {
        try {
            await api.patch(`/users/${userId}/toggle`, {});
            fetchUsers();
        } catch (err: any) {
            alert(err.message || 'Failed to toggle status');
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-black overflow-hidden">
            <POSSidebar />

            <main className="flex-1 overflow-auto p-12">
                <div className="max-w-6xl mx-auto space-y-10 px-4">
                    <header className="flex justify-between items-end">
                        <div className="space-y-2">
                            <h1 className="text-5xl font-black tracking-tight text-zinc-900 dark:text-white">Staff Management</h1>
                            <p className="text-zinc-500 font-bold text-lg uppercase tracking-wide">Control system access & security thresholds</p>
                        </div>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="h-16 px-8 rounded-2xl font-black gap-3 bg-zinc-900 hover:bg-black text-white text-lg shadow-2xl shadow-zinc-500/20 active:scale-95 transition-all"
                        >
                            <UserPlus className="h-6 w-6" />
                            Provision New Account
                        </Button>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        <div className="lg:col-span-3 space-y-6">
                            {/* Search & Stats */}
                            <div className="bg-white dark:bg-zinc-900 p-3 rounded-3xl border border-zinc-200/60 dark:border-zinc-800 flex items-center gap-4 shadow-sm">
                                <div className="relative flex-1">
                                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-zinc-300" />
                                    <input
                                        className="w-full h-14 pl-14 pr-6 bg-transparent outline-none font-bold text-lg border-none placeholder:text-zinc-300"
                                        placeholder="Locate user by identifier..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Users List */}
                            <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800 overflow-x-auto shadow-xl shadow-zinc-200/50 dark:shadow-none">
                                <table className="w-full text-left min-w-[900px]">
                                    <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800">
                                        <tr>
                                            <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Account Identity</th>
                                            <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Access Tier</th>
                                            <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Cash Threshold</th>
                                            <th className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Status</th>
                                            <th className="px-10 py-6"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={5} className="px-10 py-32 text-center">
                                                    <Loader2 className="h-12 w-12 animate-spin mx-auto text-zinc-200" />
                                                </td>
                                            </tr>
                                        ) : filteredUsers.map((u) => (
                                            <tr key={u.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-950/30 transition-all duration-300">
                                                <td className="px-10 py-8">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-black text-xl text-zinc-400 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                                                            {u.username[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-lg text-zinc-900 dark:text-white leading-tight">{u.username}</p>
                                                            <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <div className={cn(
                                                        "inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider border-2",
                                                        u.role === 'admin' ? "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-900/40" :
                                                            u.role === 'manager' ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/40" :
                                                                "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-900/40"
                                                    )}>
                                                        <Shield className="h-3.5 w-3.5" />
                                                        {u.role}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8 text-center sm:text-left">
                                                    <div className="flex items-center gap-2 font-mono text-lg font-black text-zinc-700 dark:text-zinc-300">
                                                        <span className="text-zinc-300 dark:text-zinc-600">{currencySymbol}</span>
                                                        {parseFloat(u.cash_limit || '0').toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-8">
                                                    <button
                                                        onClick={() => toggleStatus(u.id)}
                                                        className="flex items-center gap-3 active:scale-95 transition-transform"
                                                    >
                                                        <div className={cn(
                                                            "w-3 h-3 rounded-full shadow-[0_0_10px]",
                                                            u.is_active ? "bg-emerald-500 shadow-emerald-500/50" : "bg-zinc-300 shadow-zinc-300/50"
                                                        )} />
                                                        <span className={cn(
                                                            "text-xs font-black uppercase tracking-widest",
                                                            u.is_active ? "text-emerald-600" : "text-zinc-400"
                                                        )}>
                                                            {u.is_active ? 'Enabled' : 'Disabled'}
                                                        </span>
                                                    </button>
                                                </td>
                                                <td className="px-10 py-8 text-right">
                                                    <div className="flex items-center justify-end gap-2 transition-opacity">
                                                        <button
                                                            onClick={() => handleOpenEdit(u)}
                                                            className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-zinc-700 rounded-xl transition-all shadow-sm border border-transparent hover:border-indigo-100"
                                                            title="Edit User"
                                                        >
                                                            <Edit2 className="h-5 w-5" />
                                                        </button>
                                                        <button className="p-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-red-600 hover:bg-white dark:hover:bg-zinc-700 rounded-xl transition-all shadow-sm">
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <aside className="space-y-6">
                            <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/30">
                                <div className="relative z-10 space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black leading-tight">Access Control</h3>
                                        <p className="text-indigo-100 text-sm font-bold uppercase tracking-wide opacity-80">Security Audit</p>
                                    </div>
                                    <p className="text-indigo-50 text-xs font-medium leading-relaxed">Unique identifiers prevent credential sharing and ensure individual accountability for drawer variances.</p>

                                    <div className="pt-6 space-y-4">
                                        <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.2em] text-indigo-200">
                                            <span>Staff Count</span>
                                            <span className="text-white text-2xl tracking-normal">{users.length}</span>
                                        </div>
                                        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-white w-full opacity-80" />
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -right-16 -bottom-16 w-56 h-56 bg-indigo-400 rounded-full blur-3xl opacity-40" />
                                <div className="absolute -left-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                            </div>

                            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-8 border border-zinc-200/60 dark:border-zinc-800 space-y-6 shadow-sm">
                                <div className="flex items-center gap-3 text-zinc-400">
                                    <AlertCircle className="h-5 w-5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Administrator Alert</span>
                                </div>
                                <p className="text-xs font-bold text-zinc-500 leading-relaxed">Deactivating an account will immediately terminate any active POS sessions for that identifier.</p>
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            {/* Create/Edit User Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] bg-zinc-950/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="w-full max-w-xl bg-white dark:bg-zinc-900 rounded-[3rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)] border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-5 duration-500 ease-out">
                        <div className="p-12">
                            <div className="flex justify-between items-start mb-10">
                                <div className="flex items-center gap-5">
                                    <div className="bg-indigo-600 p-4 rounded-2xl shadow-xl shadow-indigo-500/20">
                                        {editingUser ? <Edit2 className="h-8 w-8 text-white" /> : <UserPlus className="h-8 w-8 text-white" />}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black">{editingUser ? 'Adjust Identity' : 'Commission Account'}</h2>
                                        <p className="text-[11px] text-zinc-400 font-black uppercase tracking-[0.2em] mt-1">{editingUser ? 'Modify credentials & status' : 'Provision new system access'}</p>
                                    </div>
                                </div>
                                <button onClick={handleCloseModal} className="p-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all">
                                    <X className="h-6 w-6 text-zinc-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest px-1">Display Name</label>
                                        <Input
                                            placeholder="Full Name / ID"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                            className="h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border-none ring-2 ring-zinc-100 dark:ring-zinc-800 focus:ring-indigo-600 transition-all font-black text-lg"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest px-1">Email Access</label>
                                        <Input
                                            type="email"
                                            placeholder="user@store.io"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border-none ring-2 ring-zinc-100 dark:ring-zinc-800 focus:ring-indigo-600 transition-all font-black text-lg"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest px-1">Security Tier</label>
                                        <select
                                            className="w-full h-16 px-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border-none ring-2 ring-zinc-100 dark:ring-zinc-800 outline-none font-black text-lg appearance-none cursor-pointer focus:ring-indigo-600 transition-all"
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                        >
                                            <option value="cashier">Cashier</option>
                                            <option value="manager">Manager</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest px-1">Cash Threshold ({currencySymbol})</label>
                                        <div className="relative">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-lg font-black text-zinc-300"></span>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="500.00"
                                                value={cashLimit}
                                                onChange={(e) => setCashLimit(e.target.value)}
                                                required
                                                className="h-16 pl-12 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border-none ring-2 ring-zinc-100 dark:ring-zinc-800 focus:ring-indigo-600 transition-all font-mono font-black text-lg"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest px-1">
                                        {editingUser ? 'New Access Key (Optional)' : 'Access Key'}
                                    </label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required={!editingUser}
                                        className="h-16 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border-none ring-2 ring-zinc-100 dark:ring-zinc-800 focus:ring-indigo-600 transition-all font-black text-lg"
                                    />
                                    {editingUser && <p className="text-[10px] text-zinc-400 font-bold uppercase ml-1">Leave empty to retain current key</p>}
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 h-16 rounded-2xl font-black text-lg border-2"
                                        onClick={handleCloseModal}
                                    >
                                        Discard
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-[2] h-16 rounded-2xl font-black text-xl gap-3 bg-indigo-600 hover:bg-indigo-700 shadow-2xl shadow-indigo-600/30 text-white active:scale-95 transition-all"
                                        disabled={submitting}
                                    >
                                        {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : editingUser ? <CheckCircle2 className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
                                        {editingUser ? 'Confirm Adjustments' : 'Authorize Account'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
