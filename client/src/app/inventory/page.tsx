/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductTable } from '@/components/inventory/ProductTable';
import { Button } from '@/components/ui/Button';
import { ChevronRight } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';
import { useGlobalStore, useProductStore } from '@/store';

export default function InventoryPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const {
        products,
        loading,
        fetchProducts,
        searchQuery,
        setSearchQuery
    } = useProductStore();
    const { storeProfile } = useGlobalStore();

    useEffect(() => {
        // if (!user) {
        //     router.push('/login');
        //     return;
        // }

        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            router.push('/login');
        }

        fetchProducts();
    }, [router, fetchProducts]);

    useEffect(() => {
        // Fetch products when search query changes
        if (searchQuery !== undefined) {
            fetchProducts({ search: searchQuery });
        }
    }, [searchQuery, fetchProducts]);

    const compactFormatter = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1
    });

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 overflow-hidden">
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 px-8 flex items-center justify-between bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <span>Management</span>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-zinc-900 dark:text-zinc-100 font-bold">Inventory</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="outline" className="rounded-xl border-zinc-200 dark:border-zinc-800">
                            Export Data
                        </Button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Inventory Management</h1>
                        <p className="text-zinc-500">Monitor stock levels, manage products, and restock batches.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard label="Total Products" value={products.length} trend="+5%" />
                        <StatCard label="Low Stock Items" value={products.filter(product => product.quantity < product.reorder_level).length} trend="-2" warning />
                        <StatCard label="Out of Stock" value={products.filter(product => product.quantity === 0).length} danger />
                        <StatCard label="Total Value" value={storeProfile?.currency_symbol + ' ' + compactFormatter.format(products.reduce((total, product) => total + product.quantity * product.selling_price, 0))} trend="" />
                    </div>

                    <ProductTable />
                </div>
            </main>
        </div>
    );
}

// StatCard and main return remains...

function StatCard({ label, value, trend, warning, danger }: any) {
    return (
        <div className="p-6 bg-white dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{label}</p>
            <div className="flex items-end justify-between">
                <span className={cn(
                    "text-3xl font-black",
                    danger ? "text-red-500" : warning ? "text-amber-500" : "text-zinc-900 dark:text-zinc-100"
                )}>
                    {value}
                </span>
                {trend && (
                    <span className="text-[10px] font-bold bg-zinc-50 dark:bg-zinc-900 px-2 py-1 rounded-md text-zinc-400">
                        {trend}
                    </span>
                )}
            </div>
        </div>
    );
}
