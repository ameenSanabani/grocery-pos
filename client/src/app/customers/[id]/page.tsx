/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
    ChevronLeft,
    CreditCard,
    TrendingUp,
    TrendingDown,
    ArrowDownLeft,
    ArrowUpRight,
    Clock,
    Plus,
    Loader2,
    Calendar,
    Receipt,
    Wallet,
    ChevronRight,
    X,
    Save,
    Filter,
    ArrowUpDown,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightNav,
    XCircle,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Customer {
    id: string;
    name: string;
    email: string;
    created_at: string;
    current_balance: number;
    credit_limit: number;
}

interface Transaction {
    id: string;
    amount: number;
    type: string;
    payment_method: string;
    description: string;
    created_at: string;
}

interface StoreProfile {
    currency_symbol: string;
}

const ITEMS_PER_PAGE = 25;

export default function CustomerDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [history, setHistory] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [storeProfile, setStoreProfile] = useState<StoreProfile | null>(null);

    // Payment recording state
    const [isRecordingPayment, setIsRecordingPayment] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
    const [paymentNotes, setPaymentNotes] = useState('');

    // Table functionality state
    const [sortField, setSortField] = useState('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');

useEffect(() => {
        if (params.id) {
            fetchData();
        }
        fetchStoreProfile();

        const handleUpdate = () => fetchStoreProfile();
        window.addEventListener('store-profile-updated', handleUpdate);
        return () => window.removeEventListener('store-profile-updated', handleUpdate);
    }, [params.id]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, typeFilter, paymentMethodFilter]);

    const fetchStoreProfile = async () => {
        try {
            const data = await api.get<StoreProfile>('/settings/store-profile');
            if (data) {
                setStoreProfile(data);
            }
        } catch (err) {
            console.error('Failed to fetch store profile', err);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [custData, histData] = await Promise.all([
                api.get(`/customers/${params.id}`),
                api.get(`/customers/${params.id}/history`)
            ]) as [Customer, Transaction[]];
            setCustomer(custData);
            setHistory(histData);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) return alert('Enter a valid payment amount');

        try {
            await api.post(`/customers/${params.id}/transactions`, {
                amount: -amount, // Negative for repayment
                type: 'payment',
                payment_method: paymentMethod,
                description: paymentNotes || 'Customer repayment'
            });
            setPaymentAmount('');
            setPaymentMethod('cash');
            setPaymentNotes('');
            setIsRecordingPayment(false);
            fetchData();
        } catch (err) {
            alert('Failed to record payment');
        }
    };

    const filteredTransactions = useMemo(() => {
        return history.filter(transaction => {
            // Text Search (Description, Payment Method)
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                transaction.description?.toLowerCase().includes(query) ||
                transaction.payment_method?.toLowerCase().includes(query);

            // Type Filter
            const matchesType = typeFilter === 'all' || transaction.type === typeFilter;

            // Payment Method Filter
            const matchesPaymentMethod = paymentMethodFilter === 'all' || transaction.payment_method === paymentMethodFilter;

            return matchesSearch && matchesType && matchesPaymentMethod;
        });
    }, [history, searchQuery, typeFilter, paymentMethodFilter]);

    const sortedTransactions = useMemo(() => {
        return [...filteredTransactions].sort((a: any, b: any) => {
            let valA = a[sortField];
            let valB = b[sortField];

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredTransactions, sortField, sortOrder]);

    const totalPages = Math.ceil(sortedTransactions.length / ITEMS_PER_PAGE);
    const paginatedTransactions = sortedTransactions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const toggleSort = (field: string) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const clearFilters = () => {
        setTypeFilter('all');
        setPaymentMethodFilter('all');
        setSearchQuery('');
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-black">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        </div>
    );

    if (!customer) return <div>Customer not found</div>;

    const creditUtilization = (customer.current_balance / customer.credit_limit) * 100;

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 px-8 flex items-center justify-between bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push('/customers')} className="rounded-xl">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                            <span>Customers</span>
                            <ChevronRight className="h-4 w-4" />
                            <span className="text-zinc-900 dark:text-zinc-100 font-bold">{customer.name}</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Customer Header Info */}
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight">{customer.name}</h1>
                            <div className="flex gap-4 mt-2 text-zinc-500 font-bold text-sm">
                                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Joined {new Date(customer.created_at).toLocaleDateString()}</span>
                                {customer.email && <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {customer.email}</span>}
                            </div>
                        </div>
                        <Button
                            className="rounded-xl h-12 gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                            onClick={() => setIsRecordingPayment(true)}
                        >
                            <Wallet className="h-5 w-5" /> Record Repayment
                        </Button>
                    </div>

                    {/* Credit Status Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-8 bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Account Balance</p>
                            <div className="flex items-end justify-between">
                                <p className={cn("text-4xl font-black", customer.current_balance > 0 ? "text-red-500" : "text-emerald-500")}>
                                    {storeProfile?.currency_symbol}{customer.current_balance.toFixed(2)}
                                </p>
                                <div className={cn(
                                    "p-2 rounded-xl",
                                    customer.current_balance > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                                )}>
                                    {customer.current_balance > 0 ? <TrendingUp className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase text-zinc-400">
                                    <span>Credit Limit Usage</span>
                                    <span>{creditUtilization.toFixed(1)}%</span>
                                </div>
                                <div className="h-2 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full transition-all duration-500",
                                            creditUtilization > 90 ? "bg-red-500" : creditUtilization > 50 ? "bg-amber-500" : "bg-emerald-500"
                                        )}
                                        style={{ width: `${Math.min(creditUtilization, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Approved Credit Line</p>
                            <p className="text-4xl font-black text-zinc-900 dark:text-zinc-100">{storeProfile?.currency_symbol}{customer.credit_limit.toFixed(2)}</p>
                            <p className="text-xs font-bold text-zinc-500 leading-relaxed italic">Maximum debt balance allowed for this customer.</p>
                        </div>

                        <div className="p-8 bg-zinc-900 text-white rounded-3xl border border-zinc-800 shadow-sm space-y-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Remaining Available</p>
                            <p className="text-4xl font-black text-emerald-400">{storeProfile?.currency_symbol}{(customer.credit_limit - customer.current_balance).toFixed(2)}</p>
                            <p className="text-xs font-bold text-zinc-400 leading-relaxed uppercase tracking-tighter">Liquid credit for new purchases</p>
                        </div>
                    </div>

{/* Transaction History */}
                    <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <h2 className="text-xl font-black flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-zinc-400" /> Transaction Ledger
                                </h2>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button
                                        variant={showFilters ? "secondary" : "outline"}
                                        className={cn(
                                            "rounded-xl h-10 gap-2 border-zinc-200 dark:border-zinc-800 flex-1 sm:flex-none",
                                            showFilters && "bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
                                        )}
                                        onClick={() => setShowFilters(!showFilters)}
                                    >
                                        <Filter className="h-4 w-4" />
                                        {showFilters ? 'Hide Filters' : 'Filters'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {showFilters && (
                            <div className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800 p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <Input
                                            placeholder="Search description..."
                                            className="pl-10 h-10 rounded-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase">Transaction Type</label>
                                    <select
                                        className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                    >
                                        <option value="all">All Types</option>
                                        <option value="credit_purchase">Credit Purchase</option>
                                        <option value="payment">Payment</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase">Payment Method</label>
                                    <select
                                        className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        value={paymentMethodFilter}
                                        onChange={(e) => setPaymentMethodFilter(e.target.value)}
                                    >
                                        <option value="all">All Methods</option>
                                        <option value="cash">Cash</option>
                                        <option value="card">Card</option>
                                    </select>
                                </div>

                                <div className="flex items-end sm:col-span-3">
                                    <Button
                                        variant="ghost"
                                        onClick={clearFilters}
                                        className="text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full sm:w-auto justify-start sm:justify-center gap-2"
                                    >
                                        <XCircle className="h-4 w-4" /> Clear All Filters
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                        <th className="px-6 py-4 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => toggleSort('description')}>
                                            <div className="flex items-center gap-2">
                                                Transaction Details {sortField === 'description' && <ArrowUpDown className="h-3 w-3" />}
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => toggleSort('type')}>
                                            <div className="flex items-center gap-2">
                                                Type {sortField === 'type' && <ArrowUpDown className="h-3 w-3" />}
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => toggleSort('created_at')}>
                                            <div className="flex items-center gap-2">
                                                Date & Time {sortField === 'created_at' && <ArrowUpDown className="h-3 w-3" />}
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 cursor-pointer hover:text-emerald-600 transition-colors text-right" onClick={() => toggleSort('amount')}>
                                            <div className="flex items-center justify-end gap-2">
                                                Amount {sortField === 'amount' && <ArrowUpDown className="h-3 w-3" />}
                                            </div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                                    {loading ? (
                                        Array.from({ length: 5 }).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={4} className="px-6 py-8">
                                                    <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-full"></div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : paginatedTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-20 text-center text-zinc-400">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Search className="h-8 w-8 text-zinc-300" />
                                                    <p>No transactions found matching your filters.</p>
                                                    {(searchQuery || typeFilter !== 'all' || paymentMethodFilter !== 'all') && (
                                                        <Button variant="ghost" onClick={clearFilters} className="text-emerald-600">
                                                            Clear filters
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
) : (
                                        paginatedTransactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "h-10 w-10 rounded-xl flex items-center justify-center",
                                                            tx.amount > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                                                        )}>
                                                            {tx.type === 'credit_purchase' ? <Receipt className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black">{tx.description || 'Customer Transaction'}</p>
                                                            <div className="flex items-center gap-2">
                                                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">ID: {tx.id.slice(0, 8)}</p>
                                                                {tx.payment_method && (
                                                                    <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 font-black uppercase">via {tx.payment_method}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={cn(
                                                        "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                        tx.type === 'credit_purchase'
                                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                                                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                                    )}>
                                                        {tx.type.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
                                                        {new Date(tx.created_at).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-[10px] text-zinc-400">
                                                        {new Date(tx.created_at).toLocaleTimeString()}
                                                    </p>
                                                </td>
                                                <td className={cn(
                                                    "px-6 py-5 text-right font-black",
                                                    tx.amount > 0 ? "text-red-600" : "text-emerald-600"
                                                )}>
                                                    {tx.amount > 0 ? '+' : ''}{storeProfile?.currency_symbol}{tx.amount.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
</tbody>
                                </table>
                            </div>

                            <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/30">
                                <p className="text-xs text-zinc-500">
                                    Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    >
                                        <ChevronLeftIcon className="h-4 w-4" />
                                    </Button>
                                    <span className="text-xs font-bold px-2 text-zinc-900 dark:text-zinc-100">
                                        Page {currentPage} of {Math.max(1, totalPages)}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg"
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    >
                                        <ChevronRightNav className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                </div>
            </main>

            {/* Repayment Modal */}
            {isRecordingPayment && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                            <h2 className="text-2xl font-black">Record Repayment</h2>
                            <Button variant="ghost" size="icon" onClick={() => setIsRecordingPayment(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <form onSubmit={handleRecordPayment} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Repayment Amount ({storeProfile?.currency_symbol})</label>
                                <Input
                                    className="h-14 text-2xl font-black text-emerald-600"
                                    type="number"
                                    placeholder="0.00"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Payment Method</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('cash')}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2",
                                            paymentMethod === 'cash'
                                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600"
                                                : "border-zinc-100 dark:border-zinc-800 text-zinc-400"
                                        )}
                                    >
                                        <Wallet className="h-6 w-6" />
                                        <span className="font-bold text-xs">CASH</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('card')}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2",
                                            paymentMethod === 'card'
                                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600"
                                                : "border-zinc-100 dark:border-zinc-800 text-zinc-400"
                                        )}
                                    >
                                        <CreditCard className="h-6 w-6" />
                                        <span className="font-bold text-xs">CARD</span>
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">Notes / Remarks</label>
                                <textarea
                                    className="w-full h-24 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 font-bold text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                    placeholder="e.g. Cash payment, check #123..."
                                    value={paymentNotes}
                                    onChange={(e) => setPaymentNotes(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-4">
                                <Button variant="ghost" type="button" className="flex-1 h-12 rounded-xl" onClick={() => setIsRecordingPayment(false)}>
                                    Cancel
                                </Button>
                                <Button className="flex-1 h-12 rounded-xl gap-2 shadow-lg shadow-emerald-500/20">
                                    <Save className="h-4 w-4" /> Save Record
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}


