/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Edit2, Trash2, Search, Plus, Phone, Mail, MapPin, User, Loader2, Filter, ArrowUpDown, ChevronLeft, ChevronRight as ChevronRightIcon, XCircle } from 'lucide-react';
import { SupplierModal } from './SupplierModal';
import { cn } from '@/lib/utils';
import { useSupplierStore } from '@/store';

const ITEMS_PER_PAGE = 25;

export function SupplierTable() {
    const {
        suppliers,
        loading,
        searchQuery,
        setSearchQuery,
        fetchSuppliers,
        deleteSupplier
    } = useSupplierStore();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<any | null>(null);
    const [sortField, setSortField] = useState('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [hasEmailFilter, setHasEmailFilter] = useState('all');
    const [hasPhoneFilter, setHasPhoneFilter] = useState('all');
    const [hasAddressFilter, setHasAddressFilter] = useState('all');

    useEffect(() => {
        fetchSuppliers();
    }, [fetchSuppliers]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, hasEmailFilter, hasPhoneFilter, hasAddressFilter]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this supplier?')) return;
        await deleteSupplier(id);
    };

    const handleEdit = (supplier: any) => {
        setEditingSupplier(supplier);
        setIsModalOpen(true);
    };

    const filteredSuppliers = useMemo(() => {
        return suppliers.filter(supplier => {
            // Text Search (Name, Contact Person, Phone, Email, Address)
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                supplier.name.toLowerCase().includes(query) ||
                supplier.contact_person?.toLowerCase().includes(query) ||
                supplier.phone?.toLowerCase().includes(query) ||
                supplier.email?.toLowerCase().includes(query) ||
                supplier.address?.toLowerCase().includes(query);

            // Email Filter
            let matchesEmail = true;
            if (hasEmailFilter === 'has_email') matchesEmail = !!(supplier.email && supplier.email.trim() !== '');
            if (hasEmailFilter === 'no_email') matchesEmail = !supplier.email || supplier.email.trim() === '';

            // Phone Filter
            let matchesPhone = true;
            if (hasPhoneFilter === 'has_phone') matchesPhone = !!(supplier.phone && supplier.phone.trim() !== '');
            if (hasPhoneFilter === 'no_phone') matchesPhone = !supplier.phone || supplier.phone.trim() === '';

            // Address Filter
            let matchesAddress = true;
            if (hasAddressFilter === 'has_address') matchesAddress = !!(supplier.address && supplier.address.trim() !== '');
            if (hasAddressFilter === 'no_address') matchesAddress = !supplier.address || supplier.address.trim() === '';

            return matchesSearch && matchesEmail && matchesPhone && matchesAddress;
        });
    }, [suppliers, searchQuery, hasEmailFilter, hasPhoneFilter, hasAddressFilter]);

    const sortedSuppliers = useMemo(() => {
        return [...filteredSuppliers].sort((a: any, b: any) => {
            let valA = a[sortField];
            let valB = b[sortField];

            if (valA === undefined || valA === null) valA = '';
            if (valB === undefined || valB === null) valB = '';

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredSuppliers, sortField, sortOrder]);

    const totalPages = Math.ceil(sortedSuppliers.length / ITEMS_PER_PAGE);
    const paginatedSuppliers = sortedSuppliers.slice(
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
        setHasEmailFilter('all');
        setHasPhoneFilter('all');
        setHasAddressFilter('all');
        setSearchQuery('');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder="Search by company, contact, phone, email..."
                        className="pl-10 h-10 rounded-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
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
                    <Button
                        className="rounded-xl h-10 gap-2 shadow-lg shadow-emerald-500/20 flex-1 sm:flex-none"
                        onClick={() => {
                            setEditingSupplier(null);
                            setIsModalOpen(true);
                        }}
                    >
                        <Plus className="h-4 w-4" />
                        Add Supplier
                    </Button>
                </div>
            </div>

            {showFilters && (
                <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase">Email</label>
                        <select
                            className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            value={hasEmailFilter}
                            onChange={(e) => setHasEmailFilter(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="has_email">Has Email</option>
                            <option value="no_email">No Email</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase">Phone</label>
                        <select
                            className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            value={hasPhoneFilter}
                            onChange={(e) => setHasPhoneFilter(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="has_phone">Has Phone</option>
                            <option value="no_phone">No Phone</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase">Address</label>
                        <select
                            className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            value={hasAddressFilter}
                            onChange={(e) => setHasAddressFilter(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="has_address">Has Address</option>
                            <option value="no_address">No Address</option>
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
                                        Company & Contact {sortField === 'name' && <ArrowUpDown className="h-3 w-3" />}
                                    </div>
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => toggleSort('phone')}>
                                    <div className="flex items-center gap-2">
                                        Phone {sortField === 'phone' && <ArrowUpDown className="h-3 w-3" />}
                                    </div>
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => toggleSort('email')}>
                                    <div className="flex items-center gap-2">
                                        Email {sortField === 'email' && <ArrowUpDown className="h-3 w-3" />}
                                    </div>
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => toggleSort('address')}>
                                    <div className="flex items-center gap-2">
                                        Address {sortField === 'address' && <ArrowUpDown className="h-3 w-3" />}
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
                            ) : paginatedSuppliers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-zinc-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Search className="h-8 w-8 text-zinc-300" />
                                            <p>No suppliers found matching your filters.</p>
                                            {(searchQuery || hasEmailFilter !== 'all' || hasPhoneFilter !== 'all' || hasAddressFilter !== 'all') && (
                                                <Button variant="ghost" onClick={clearFilters} className="text-emerald-600">
                                                    Clear filters
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedSuppliers.map((supplier) => (
                                    <tr key={supplier.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-black text-zinc-900 dark:text-zinc-100 text-base">{supplier.name}</span>
                                                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-bold mt-1">
                                                    <User className="h-3 w-3" />
                                                    {supplier.contact_person || 'No contact person'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 font-mono text-zinc-600 dark:text-zinc-400">
                                                <Phone className="h-3.5 w-3.5 text-zinc-400" />
                                                {supplier.phone || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                                                <Mail className="h-3.5 w-3.5 text-zinc-400" />
                                                {supplier.email || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-2 text-zinc-500 max-w-[200px] truncate">
                                                <MapPin className="h-3.5 w-3.5 text-zinc-400 mt-0.5" />
                                                <span className="truncate">{supplier.address || 'No address'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-zinc-400 hover:text-emerald-600"
                                                    onClick={() => handleEdit(supplier)}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-zinc-400 hover:text-red-500"
                                                    onClick={() => handleDelete(supplier.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
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
                        Showing {paginatedSuppliers.length} of {filteredSuppliers.length} suppliers
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

            <SupplierModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingSupplier(null);
                }}
                supplier={editingSupplier}
            />
        </div>
    );
}
