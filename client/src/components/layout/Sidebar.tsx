"use client";

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
    Truck,
    UserCircle,
    RotateCcw,
    Package,
    BarChart3,
    ShoppingCart,
    Settings,
    LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore, useGlobalStore } from '@/store';
import { canAccess } from '@/lib/permissions';

export function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuthStore();
    const { storeProfile } = useGlobalStore();
    const userRole = user?.role || 'cashier';

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    return (
        <aside className="w-64 flex flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 h-screen shrink-0">
            <div className="p-6 flex items-center gap-3 mb-4">
                <div
                    className="p-2 rounded-xl shadow-lg transition-colors"
                    style={{
                        backgroundColor: storeProfile?.vibrant_color || '#059669',
                        boxShadow: `0 10px 15px -3px ${storeProfile?.vibrant_color}33`
                    }}
                >
                    <Package className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-black tracking-tighter truncate">
                    {storeProfile?.store_name}
                </span>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {canAccess(userRole, '/analytics') && (
                    <NavItem
                        icon={<BarChart3 className="h-5 w-5" />}
                        label="Dashboard"
                        active={pathname === '/analytics'}
                        onClick={() => router.push('/analytics')}
                    />
                )}
                {canAccess(userRole, '/inventory') && (
                    <NavItem
                        icon={<Package className="h-5 w-5" />}
                        label="Inventory"
                        active={pathname === '/inventory'}
                        onClick={() => router.push('/inventory')}
                    />
                )}
                {/* POS always visible to all roles */}
                <NavItem
                    icon={<ShoppingCart className="h-5 w-5" />}
                    label="Point of Sale"
                    onClick={() => router.push('/pos')}
                />
                {canAccess(userRole, '/customers') && (
                    <NavItem
                        icon={<UserCircle className="h-5 w-5" />}
                        label="Customers"
                        active={pathname === '/customers'}
                        onClick={() => router.push('/customers')}
                    />
                )}
                {canAccess(userRole, '/suppliers') && (
                    <NavItem
                        icon={<Truck className="h-5 w-5" />}
                        label="Suppliers"
                        active={pathname === '/suppliers'}
                        onClick={() => router.push('/suppliers')}
                    />
                )}
                {canAccess(userRole, '/procurement') && (
                    <NavItem
                        icon={<ShoppingCart className="h-5 w-5" />}
                        label="Procurement"
                        active={pathname === '/procurement'}
                        onClick={() => router.push('/procurement')}
                    />
                )}
                {canAccess(userRole, '/refunds') && (
                    <NavItem
                        icon={<RotateCcw className="h-5 w-5" />}
                        label="Refunds"
                        active={pathname === '/refunds'}
                        onClick={() => router.push('/refunds')}
                    />
                )}
                {/* Settings always visible, content filtered in component */}
                <NavItem
                    icon={<Settings className="h-5 w-5" />}
                    label="Settings"
                    active={pathname === '/settings'}
                    onClick={() => router.push('/settings')}
                    brandColor={storeProfile?.vibrant_color}
                />
            </nav>

            <div className="p-4 border-t border-zinc-100 dark:border-zinc-900">
                <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold">
                        {user?.username?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold truncate">{user?.username}</p>
                        <p className="text-[10px] text-zinc-500 uppercase font-black">{user?.role || 'Manager'}</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-400 hover:text-red-500 transition-colors"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </aside>
    );
}

function NavItem({ icon, label, active = false, onClick, brandColor }: any) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                active
                    ? "text-white shadow-lg font-black"
                    : "text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white"
            )}
            style={active ? {
                backgroundColor: brandColor || '#059669',
                boxShadow: `0 10px 15px -3px ${brandColor || '#059669'}33`
            } : {}}
        >
            {icon}
            {label}
        </button>
    );
}
