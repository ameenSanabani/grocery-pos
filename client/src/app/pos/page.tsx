/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { ProductSearch } from '@/components/pos/ProductSearch';
import { Cart } from '@/components/pos/Cart';
import { ScannerHandler } from '@/components/pos/ScannerHandler';
import { ShiftGate } from '@/components/pos/ShiftGate';
import { POSSidebar } from '@/components/layout/POSSidebar';
import { useCartStore, useCategoryStore, useProductStore, useGlobalStore, useAuthStore } from '@/store';
import { Loader2, ShoppingBag, Plus, Package, Apple, Carrot, Milk, Croissant } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';

import { useVirtualizer } from '@tanstack/react-virtual';

export default function POSPage() {
    const { categories, fetchCategories, selectedCategory, setSelectedCategory } = useCategoryStore();
    const { products: categoryProducts, loading: loadingProducts, fetchProducts } = useProductStore();
    const { storeProfile } = useGlobalStore();
    const { user } = useAuthStore();
    const addItem = useCartStore(state => state.addItem);

    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [currentShift, setCurrentShift] = useState<any>(null);
    const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

    // Virtualization Setup
    const parentRef = useRef<HTMLDivElement>(null);

    // Simple responsive column calculation
    const [numColumns, setNumColumns] = useState(2);

    useEffect(() => {
        const updateColumns = () => {
            const width = window.innerWidth;
            if (width >= 1024) setNumColumns(4);      // lg
            else if (width >= 768) setNumColumns(3);  // md
            else setNumColumns(2);                    // base
        };

        updateColumns();
        window.addEventListener('resize', updateColumns);
        return () => window.removeEventListener('resize', updateColumns);
    }, []);

    const rowCount = Math.ceil(categoryProducts.length / numColumns);

    const virtualizer = useVirtualizer({
        count: rowCount,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 220, // Approximate height of a product card row
        overscan: 5,
    });

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        if (selectedCategory) {
            fetchProducts({ category_id: selectedCategory.id, limit: 20 });
        } else {
            fetchProducts({ limit: 0 });
        }
    }, [selectedCategory, fetchProducts]);

    useEffect(() => {
        if (categoryProducts.length > 0) {
            setSelectedIndex(0);
            itemRefs.current = [];
        } else {
            setSelectedIndex(-1);
        }
    }, [categoryProducts]);

    useEffect(() => {
        const selectedElement = itemRefs.current[selectedIndex];
        if (selectedElement) {
            selectedElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    }, [selectedIndex]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (categoryProducts.length === 0) return;

        if (e.key === 'ArrowRight') {
            setSelectedIndex(prev => (prev < categoryProducts.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowLeft') {
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'ArrowDown') {
            setSelectedIndex(prev => (prev + 4 < categoryProducts.length ? prev + 4 : prev));
        } else if (e.key === 'ArrowUp') {
            setSelectedIndex(prev => (prev - 4 >= 0 ? prev - 4 : prev));
        } else if (e.key === 'Enter') {
            // FIX 1: Prevent the Enter key from triggering a click on the focused element (the category button)
            e.preventDefault();

            if (selectedIndex >= 0) {
                addItem(categoryProducts[selectedIndex]);
            }
        }
    };

    const getCategoryIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('fruit')) return <Apple className="h-6 w-6 text-red-400 group-hover:text-red-500" />;
        if (n.includes('veg')) return <Carrot className="h-6 w-6 text-orange-400 group-hover:text-orange-500" />;
        if (n.includes('dair')) return <Milk className="h-6 w-6 text-blue-400 group-hover:text-blue-500" />;
        if (n.includes('bakery')) return <Croissant className="h-6 w-6 text-amber-500 group-hover:text-amber-600" />;
        return <ShoppingBag className="h-6 w-6 text-zinc-400 group-hover:text-emerald-600" />;
    };

    return (
        <ShiftGate>
            <div
                id="pos-main-container"
                className="flex h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 overflow-hidden outline-none"
                onKeyDown={handleKeyDown}
                tabIndex={0}
            >
                <ScannerHandler />
                <POSSidebar />

                <main className="flex-1 flex overflow-hidden">
                    <div className="flex-1 flex flex-col p-8 space-y-8 overflow-hidden">
                        <header className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-black tracking-tight">Grocery POS</h1>
                            </div>
                        </header>

                        <div className="flex flex-col gap-8 flex-1 overflow-hidden">
                            <ProductSearch />

                            <div className="space-y-4">
                                <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 px-1">Categories</h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={(e) => {
                                                e.currentTarget.blur();
                                                document.getElementById('pos-main-container')?.focus();
                                                setSelectedCategory(cat.id === selectedCategory?.id ? null : cat)
                                            }}
                                            className={cn(
                                                "p-4 bg-white dark:bg-zinc-900 rounded-2xl border flex items-center gap-3 transition-all hover:shadow-md",
                                                selectedCategory?.id === cat.id
                                                    ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10"
                                                    : "border-zinc-200 dark:border-zinc-800 hover:border-emerald-500"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                selectedCategory?.id === cat.id ? "bg-white/50" : "bg-zinc-100 dark:bg-zinc-800"
                                            )}>
                                                {getCategoryIcon(cat.name)}
                                            </div>
                                            <span className="font-bold text-sm truncate">{cat.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {selectedCategory && (
                                <div className="flex-1 flex flex-col min-h-0 space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                                    <div className="flex items-center justify-between px-1">
                                        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">
                                            Products in {selectedCategory.name}
                                        </h2>
                                        {loadingProducts && <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />}
                                    </div>

                                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar" ref={parentRef}>
                                        {categoryProducts.length > 0 ? (
                                            <div
                                                style={{
                                                    height: `${virtualizer.getTotalSize()}px`,
                                                    width: '100%',
                                                    position: 'relative',
                                                }}
                                            >
                                                {virtualizer.getVirtualItems().map((virtualRow) => {
                                                    const rowStartIndex = virtualRow.index * numColumns;
                                                    const rowProducts = categoryProducts.slice(rowStartIndex, rowStartIndex + numColumns);

                                                    return (
                                                        <div
                                                            key={virtualRow.index}
                                                            style={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                width: '100%',
                                                                height: `${virtualRow.size}px`,
                                                                transform: `translateY(${virtualRow.start}px)`,
                                                            }}
                                                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-1"
                                                        >
                                                            {rowProducts.map((prod, colIndex) => {
                                                                const index = rowStartIndex + colIndex;
                                                                return (
                                                                    <button
                                                                        key={prod.id}
                                                                        ref={(el) => { itemRefs.current[index] = el; }}
                                                                        onClick={() => addItem(prod)}
                                                                        onMouseMove={() => setSelectedIndex(index)}
                                                                        tabIndex={-1}
                                                                        className={cn(
                                                                            "p-5 rounded-3xl border text-left transition-all h-full flex flex-col justify-between group",
                                                                            selectedIndex === index
                                                                                ? "bg-emerald-600 border-emerald-600 text-white shadow-xl shadow-emerald-500/30 scale-[1.02] z-10"
                                                                                : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-emerald-500"
                                                                        )}
                                                                    >
                                                                        <div>
                                                                            <div className={cn(
                                                                                "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors",
                                                                                selectedIndex === index ? "bg-white/20" : "bg-zinc-50 dark:bg-zinc-800"
                                                                            )}>
                                                                                <Package className={cn(
                                                                                    "h-5 w-5",
                                                                                    selectedIndex === index ? "text-white" : "text-zinc-400"
                                                                                )} />
                                                                            </div>
                                                                            <h3 className="font-black text-sm line-clamp-2 mb-1">{prod.name}</h3>
                                                                            <p className={cn(
                                                                                "text-[10px] uppercase font-bold tracking-wider",
                                                                                selectedIndex === index ? "text-emerald-100" : "text-zinc-400"
                                                                            )}>
                                                                                {prod.sku}
                                                                            </p>
                                                                        </div>
                                                                        <div className="mt-4 flex items-center justify-between">
                                                                            <span className="text-lg font-black">{storeProfile?.currency_symbol} {prod.selling_price.toFixed(2)}</span>
                                                                            <div className={cn(
                                                                                "p-1.5 rounded-lg",
                                                                                selectedIndex === index ? "bg-white/20" : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                                                                            )}>
                                                                                <Plus className="h-4 w-4" />
                                                                            </div>
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : !loadingProducts && (
                                            <div className="h-full flex flex-col items-center justify-center text-zinc-400 py-12 border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-3xl">
                                                <Package className="h-12 w-12 mb-4 opacity-20" />
                                                <p className="font-bold">No products found in this category</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <footer className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-900 p-4 rounded-xl flex justify-between shrink-0">
                            <span>System Status: Online</span>
                            <span>Keyboard: Use arrows to browse products • Enter to add</span>
                        </footer>
                    </div>

                    <div className="w-[450px] shrink-0">
                        <Cart />
                    </div>
                </main>
            </div>
        </ShiftGate>
    );

}