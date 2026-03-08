/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { LayoutDashboard, Settings, LogOut, Package, History, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store';
import { canAccess } from '@/lib/permissions';

export function POSSidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useAuthStore();
    const userRole = user?.role || 'cashier';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    return (
        <aside className="w-20 flex flex-col items-center py-8 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 shrink-0">
            <div className="mb-10 bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
                <Package className="h-6 w-6 text-white" />
            </div>

            <nav className="flex-1 space-y-4">
                {canAccess(userRole, '/analytics') && (
                    <SidebarIcon
                        icon={<LayoutDashboard className="h-5 w-5" />}
                        active={pathname === '/analytics'}
                        onClick={() => router.push('/analytics')}
                        title="Dashboard"
                    />
                )}
                {canAccess(userRole, '/inventory') && (
                    <SidebarIcon
                        icon={<Package className="h-5 w-5" />}
                        active={pathname === '/inventory'}
                        onClick={() => router.push('/inventory')}
                        title="Inventory"
                    />
                )}
                <SidebarIcon
                    icon={<History className="h-5 w-5" />}
                    title="Sales History"
                />
                {canAccess(userRole, '/admin/users') && (
                    <SidebarIcon
                        icon={<User className="h-5 w-5" />}
                        active={pathname === '/admin/users'}
                        onClick={() => router.push('/admin/users')}
                        title="User Management"
                    />
                )}
                {/* Settings always visible, content filtered in component */}
                <SidebarIcon
                    icon={<Settings className="h-5 w-5" />}
                    active={pathname === '/settings'}
                    onClick={() => router.push('/settings')}
                    title="Settings"
                />
            </nav>

            <Button
                variant="ghost"
                size="icon"
                className="text-zinc-400 hover:text-red-500 transition-colors"
                onClick={handleLogout}
            >
                <LogOut className="h-5 w-5" />
            </Button>
        </aside>
    );
}

function SidebarIcon({ icon, active, onClick, title }: any) {
    return (
        <Button
            variant="ghost"
            size="icon"
            title={title}
            className={cn(
                "transition-all duration-200",
                active
                    ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 shadow-inner"
                    : "text-zinc-400 hover:text-emerald-600"
            )}
            onClick={onClick}
        >
            {icon}
        </Button>
    );
}
