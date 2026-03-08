/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
    Plus,
    Users,
    Search,
    ChevronRight,
    Edit2,
    History,
    CreditCard,
    ArrowUpRight,
    Loader2,
    Phone,
    TrendingUp,
    Filter,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight as ChevronRightIcon,
    XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CustomerModal } from '@/components/customers/CustomerModal';
import { useCustomerStore, useGlobalStore, Customer } from '@/store';

const ITEMS_PER_PAGE = 25;

export default function CustomersPage() {
    const router = useRouter();
    const {
        customers,
        loading,
        fetchCustomers,
        searchQuery,
        setSearchQuery
    } = useCustomerStore();
    const { storeProfile } = useGlobalStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [sortField, setSortField] = useState('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [balanceFilter, setBalanceFilter] = useState('all');
    const [creditFilter, setCreditFilter] = useState('all');

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, balanceFilter, creditFilter]);

    const filteredCustomers = useMemo(() => {
        return customers.filter(customer => {
            // Text Search (Name, Phone, Email)
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                customer.name.toLowerCase().includes(query) ||
                customer.phone.includes(query) ||
                customer.email?.toLowerCase().includes(query);

            // Balance Filter
            let matchesBalance = true;
            if (balanceFilter === 'has_debt') matchesBalance = customer.current_balance > 0;
            if (balanceFilter === 'no_debt') matchesBalance = customer.current_balance <= 0;
            if (balanceFilter === 'over_limit') matchesBalance = customer.current_balance > customer.credit_limit;

            // Credit Filter
            let matchesCredit = true;
            if (creditFilter === 'has_credit') matchesCredit = customer.credit_limit > 0;
            if (creditFilter === 'no_credit') matchesCredit = customer.credit_limit <= 0;

            return matchesSearch && matchesBalance && matchesCredit;
        });
    }, [customers, searchQuery, balanceFilter, creditFilter]);

    const sortedCustomers = useMemo(() => {
        return [...filteredCustomers].sort((a: any, b: any) => {
            let valA = a[sortField];
            let valB = b[sortField];

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredCustomers, sortField, sortOrder]);

    const totalPages = Math.ceil(sortedCustomers.length / ITEMS_PER_PAGE);
    const paginatedCustomers = sortedCustomers.slice(
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
        setBalanceFilter('all');
        setCreditFilter('all');
        setSearchQuery('');
    };

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 px-8 flex items-center justify-between bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <span>Management</span>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-zinc-900 dark:text-zinc-100 font-bold">Customers</span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">Customer Accounts</h1>
                            <p className="text-zinc-500">Manage store credit lines and customer loyalty profiles.</p>
                        </div>
                        <Button
                            className="rounded-xl h-12 gap-2 shadow-lg shadow-emerald-500/20"
                            onClick={() => {
                                setEditingCustomer(null);
                                setIsModalOpen(true);
                            }}
                        >
                            <Plus className="h-5 w-5" /> Register New Customer
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard
                            label="Total Debt Owed"
                            value={`${storeProfile?.currency_symbol || ''}${customers.reduce((acc, c) => acc + c.current_balance, 0).toLocaleString()}`}
                            icon={<TrendingUp className="h-5 w-5" />}
                            color="text-red-500"
                        />
                        <StatCard
                            label="Active Credit Lines"
                            value={customers.filter(c => c.credit_limit > 0).length.toString()}
                            icon={<CreditCard className="h-5 w-5" />}
                            color="text-emerald-500"
                        />
                        <StatCard
                            label="Total Customers"
                            value={customers.length.toString()}
                            icon={<Users className="h-5 w-5" />}
                            color="text-zinc-900"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="relative flex-1 w-full max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                <Input
                                    placeholder="Search by name, phone, or email..."
                                    className="pl-10 h-10 rounded-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
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

                        {showFilters && (
                            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase">Balance Status</label>
                                    <select
                                        className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        value={balanceFilter}
                                        onChange={(e) => setBalanceFilter(e.target.value)}
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="has_debt">Has Debt</option>
                                        <option value="no_debt">No Debt</option>
                                        <option value="over_limit">Over Limit</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-zinc-500 uppercase">Credit Line</label>
                                    <select
                                        className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                        value={creditFilter}
                                        onChange={(e) => setCreditFilter(e.target.value)}
                                    >
                                        <option value="all">All Customers</option>
                                        <option value="has_credit">Has Credit Line</option>
                                        <option value="no_credit">No Credit Line</option>
                                    </select>
                                </div>

                                <div className="flex items-end">
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

                        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">
                                            <th className="px-6 py-4 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => toggleSort('name')}>
                                                <div className="flex items-center gap-2">
                                                    Customer {sortField === 'name' && <ArrowUpDown className="h-3 w-3" />}
                                                </div>
                                            </th>
                                            <th className="px-6 py-4">Contact Info</th>
                                            <th className="px-6 py-4 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => toggleSort('credit_limit')}>
                                                <div className="flex items-center gap-2">
                                                    Credit Line {sortField === 'credit_limit' && <ArrowUpDown className="h-3 w-3" />}
                                                </div>
                                            </th>
                                            <th className="px-6 py-4 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => toggleSort('current_balance')}>
                                                <div className="flex items-center gap-2">
                                                    Balance Owed {sortField === 'current_balance' && <ArrowUpDown className="h-3 w-3" />}
                                                </div>
                                            </th>
                                            <th className="px-4 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                                        {loading ? (
                                            Array.from({ length: 5 }).map((_, i) => (
                                                <tr key={i} className="animate-pulse">
                                                    <td colSpan={5} className="px-6 py-8">
                                                        <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-full"></div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : paginatedCustomers.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-20 text-center text-zinc-400">
                                                    <div className="flex flex-col items-center justify-center gap-2">
                                                        <Search className="h-8 w-8 text-zinc-300" />
                                                        <p>No customers found matching your filters.</p>
                                                        {(searchQuery || balanceFilter !== 'all' || creditFilter !== 'all') && (
                                                            <Button variant="ghost" onClick={clearFilters} className="text-emerald-600">
                                                                Clear filters
                                                            </Button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedCustomers.map((customer) => (
                                                <tr key={customer.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/40 transition-colors group">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 font-black">
                                                                {customer.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-sm">{customer.name}</p>
                                                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">ID: {customer.id.slice(0, 8)}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col gap-1">
                                                            <p className="text-xs font-bold flex items-center gap-1.5 min-w-[120px]">
                                                                <Phone className="h-3 w-3 text-zinc-400" /> {customer.phone}
                                                            </p>
                                                            {customer.email && (
                                                                <p className="text-[10px] text-zinc-500 uppercase font-bold">{customer.email}</p>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 font-bold text-sm">
                                                        {storeProfile?.currency_symbol} {customer.credit_limit.toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex flex-col">
                                                            <span className={cn(
                                                                "text-sm font-black",
                                                                customer.current_balance > 0 ? "text-red-600" : "text-emerald-600"
                                                            )}>
                                                                {storeProfile?.currency_symbol}{customer.current_balance.toFixed(2)}
                                                            </span>
                                                            <div className="w-24 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
                                                                <div
                                                                    className={cn(
                                                                        "h-full rounded-full transition-all",
                                                                        (customer.current_balance / customer.credit_limit) > 0.8 ? "bg-red-500" : "bg-emerald-500"
                                                                    )}
                                                                    style={{ width: `${Math.min((customer.current_balance / customer.credit_limit) * 100, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 text-zinc-400 hover:text-emerald-600"
                                                                onClick={() => {
                                                                    setEditingCustomer(customer);
                                                                    setIsModalOpen(true);
                                                                }}
                                                                title="Edit Customer"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-9 w-9 text-zinc-400 hover:text-blue-600"
                                                                onClick={() => router.push(`/customers/${customer.id}`)}
                                                                title="Transaction History"
                                                            >
                                                                <History className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/30">
                                <p className="text-xs text-zinc-500">
                                    Showing {paginatedCustomers.length} of {filteredCustomers.length} customers
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
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
                                        <ChevronRightIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <CustomerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                customer={editingCustomer}
            />
        </div>
    );
}

function StatCard({ label, value, icon, color }: any) {
    return (
        <div className="p-6 bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center justify-between group hover:border-emerald-500/30 transition-colors">
            <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{label}</p>
                <p className={cn("text-2xl font-black", color)}>{value}</p>
            </div>
            <div className={cn("p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 text-zinc-400 group-hover:text-emerald-500 transition-colors")}>
                {icon}
            </div>
        </div>
    );
}
