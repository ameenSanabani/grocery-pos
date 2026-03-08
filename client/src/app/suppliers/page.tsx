/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { SupplierTable } from '@/components/suppliers/SupplierTable';
import { ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store';

export default function SuppliersPage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            router.push('/login');
        }
    }, [router]);

    return (
        <div className="flex h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 px-8 flex items-center justify-between bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                        <span>Management</span>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-zinc-900 dark:text-zinc-100 font-bold">Suppliers</span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Suppliers & Vendors</h1>
                        <p className="text-zinc-500">Manage your supplier contacts and procurement details.</p>
                    </div>

                    <SupplierTable />
                </div>
            </main>
        </div>
    );
}
