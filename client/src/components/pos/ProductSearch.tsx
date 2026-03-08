/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { useState, useEffect } from 'react';
import { useCartStore, useProductStore } from '@/store';
import { Input } from '@/components/ui/Input';
import { Search, Loader2, Barcode } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProductSearch() {
    const { searchQuery, setSearchQuery, products: results, loading, fetchProducts } = useProductStore();
    const addItem = useCartStore((state) => state.addItem);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length < 2) {
                fetchProducts({ search: '' }); // Clear results
                return;
            }
            fetchProducts({ search: searchQuery, limit: 5 });
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, fetchProducts]);

    useEffect(() => {
        if (results.length > 0) {
            setSelectedIndex(0);
        } else {
            setSelectedIndex(-1);
        }
    }, [results]);

    const handleSelect = (product: any) => {
        addItem(product);
        setSearchQuery('');
    };

    return (
        <div className="relative w-full max-w-xl">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                    placeholder="Search products (name, SKU, or scan barcode)..."
                    className="pl-10 pr-10 h-12 text-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                            e.preventDefault();
                            setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
                        } else if (e.key === 'ArrowUp') {
                            e.preventDefault();
                            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
                        } else if (e.key === 'Enter') {
                            e.preventDefault();
                            e.stopPropagation(); // Prevent bubbling to parent handlers
                            if (selectedIndex >= 0 && results[selectedIndex]) {
                                handleSelect(results[selectedIndex]);
                            } else if (results.length === 1 && selectedIndex === -1) { // Auto-add if only one result and nothing selected
                                handleSelect(results[0]);
                            }
                        }
                    }}
                    autoFocus
                />
                <Barcode className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
            </div>

            {loading && (
                <div className="absolute top-full left-0 right-0 mt-1 flex justify-center p-2 z-50">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                </div>
            )}

            {results.length > 0 && searchQuery.length > 1 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-md shadow-lg overflow-hidden z-20 dark:bg-zinc-900 dark:border-zinc-800">
                    {results.map((product, index) => (
                        <button
                            key={product.id}
                            className={cn(
                                "w-full flex items-center justify-between p-4 text-left transition-colors border-b border-zinc-100 last:border-0 dark:border-zinc-800",
                                selectedIndex === index
                                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100"
                                    : "hover:bg-zinc-50 dark:hover:bg-zinc-800"
                            )}
                            onClick={() => handleSelect(product)}
                            onMouseEnter={() => setSelectedIndex(index)}
                        >
                            <div>
                                <div className="font-semibold">{product.name}</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">{product.sku}</div>
                            </div>
                            <div className="text-emerald-600 font-bold">
                                {product.selling_price.toFixed(2)}
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
