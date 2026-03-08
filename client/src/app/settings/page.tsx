/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { ChangePasswordModal } from '@/components/settings/ChangePasswordModal';
import { StoreProfileForm } from '@/components/settings/StoreProfileForm';
import { ChevronRight, Settings, Info, Shield, Monitor, Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store';
import { hasFeature } from '@/lib/permissions';

export default function SettingsPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const userRole = user?.role || 'cashier';
    const canEditStoreSettings = hasFeature(userRole, 'fullSettings');

    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
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
                        <span className="text-zinc-900 dark:text-zinc-100 font-bold">Settings</span>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 max-w-4xl">
                    <div className="mb-12">
                        <h1 className="text-3xl font-black tracking-tight">System Settings</h1>
                        <p className="text-zinc-500">Configure your store preferences and system parameters.</p>
                    </div>

                    <div className="space-y-6">
                        {canEditStoreSettings && (
                            <SettingsSection
                                title="Store Profile & Branding"
                                description="Public info about your grocery store shown on receipts and system layout."
                                icon={<Info className="h-5 w-5" />}
                            >
                                <StoreProfileForm />
                            </SettingsSection>
                        )}

                        {canEditStoreSettings && (
                            <SettingsSection
                                title="Display & Interface"
                                description="How the POS and Dashboard appear to staff."
                                icon={<Monitor className="h-5 w-5" />}
                            >
                                <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                                    <span className="text-sm font-bold">Dark Mode</span>
                                    <div className="w-12 h-6 bg-emerald-600 rounded-full relative">
                                        <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                                    </div>
                                </div>
                            </SettingsSection>
                        )}

                        <SettingsSection
                            title="Security"
                            description="Password policies and session management."
                            icon={<Shield className="h-5 w-5" />}
                        >
                            <button
                                className="text-sm text-emerald-600 font-black hover:underline px-1"
                                onClick={() => setIsPasswordModalOpen(true)}
                            >
                                Change Password →
                            </button>
                        </SettingsSection>
                    </div>

                    <ChangePasswordModal
                        isOpen={isPasswordModalOpen}
                        onClose={() => setIsPasswordModalOpen(false)}
                    />

                    <div className="mt-12 p-8 rounded-3xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 flex items-center gap-6">
                        <div className="bg-emerald-600 p-4 rounded-2xl">
                            <Bell className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-400">System Updates</h3>
                            <p className="text-sm text-emerald-700/70 dark:text-emerald-500/70">Your system is running the latest version (v1.0.0-PRO). No updates available.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function SettingsSection({ title, description, icon, children }: any) {
    return (
        <div className="p-8 bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-zinc-500">
                    {icon}
                </div>
                <div>
                    <h3 className="text-lg font-black">{title}</h3>
                    <p className="text-xs text-zinc-500 uppercase font-bold tracking-tight">{description}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

function PlaceholderField({ label, value }: { label: string, value: string }) {
    return (
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
            <p className="text-[10px] text-zinc-400 font-bold uppercase mb-1">{label}</p>
            <p className="text-sm font-black text-zinc-500">{value}</p>
        </div>
    );
}
