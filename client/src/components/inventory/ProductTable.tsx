/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
    Search, Plus, Edit2, Trash2, Filter, ArrowUpDown,
    Package, AlertTriangle, ChevronLeft, ChevronRight,
    XCircle, RefreshCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductModal } from './ProductModal';
import { StockAdjustModal } from './StockAdjustModal';
import { useProductStore, useGlobalStore, useCategoryStore } from '@/store';

// 1. UPDATE INTERFACE: Added category_id and made category_name optional
interface Product {
    id: string;
    name: string;
    sku: string;
    barcode?: string;
    category_id: string; // Ensure this exists
    category_name?: string; // This might be null coming from DB
    selling_price: number;
    quantity: number;
    reorder_level: number;
}

const ITEMS_PER_PAGE = 25;

export function ProductTable() {
    const {
        products,
        loading,
        searchQuery,
        setSearchQuery,
        fetchProducts,
        deleteProduct
    } = useProductStore();
    const { storeProfile } = useGlobalStore();

    // 2. FIX VARIABLE COLLISION: Rename 'categories' to 'allCategories'
    const { categories: allCategories, fetchCategories } = useCategoryStore();

    const [sortField, setSortField] = useState('name');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isAdjustOpen, setIsAdjustOpen] = useState(false);
    const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, [fetchProducts, fetchCategories]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, categoryFilter, stockFilter]);

    // 3. HELPER FUNCTION: To find name by ID
    const getCategoryName = (categoryId: string) => {
        if (!categoryId) return 'Uncategorized';
        const category = allCategories.find((c: any) => c.id === categoryId);
        return category ? category.name : 'Unknown Category';
    };

    // 4. DERIVED DATA: Get unique category IDs present in products
    const availableCategories = useMemo(() => {
        // Get unique IDs
        const catIds = new Set(products.map(p => p.category_id).filter(Boolean));
        // Map IDs back to full category objects for the dropdown
        return Array.from(catIds).map(id => {
            return allCategories.find((c: any) => c.id === id);
        }).filter(Boolean); // Remove undefined if id not found
    }, [products, allCategories]);

    // 2. Filter & Search Logic
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // Text Search (Name, SKU, Barcode)
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                product.name.toLowerCase().includes(query) ||
                product.sku.toLowerCase().includes(query) ||
                product.barcode?.toLowerCase().includes(query);

            // Category Filter - Ensure we compare IDs correctly
            // Note: If your product has category_id as a number, use == instead of === or cast to String
            const matchesCategory =
                categoryFilter === 'all' ||
                String(product.category_id) === String(categoryFilter);

            // Stock Status Filter
            let matchesStock = true;
            if (stockFilter === 'in_stock') matchesStock = product.quantity > 0;
            if (stockFilter === 'out_of_stock') matchesStock = product.quantity <= 0;
            if (stockFilter === 'low_stock') matchesStock = product.quantity <= product.reorder_level && product.quantity > 0;

            return matchesSearch && matchesCategory && matchesStock;
        });
    }, [products, searchQuery, categoryFilter, stockFilter]);

    const sortedProducts = useMemo(() => {
        return [...filteredProducts].sort((a: any, b: any) => {
            // Special handling if sorting by category name (which is derived)
            let valA = a[sortField];
            let valB = b[sortField];

            if (sortField === 'category_name') {
                valA = getCategoryName(a.category_id);
                valB = getCategoryName(b.category_id);
            }

            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredProducts, sortField, sortOrder, allCategories]); // Add allCategories to dep array

    const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = sortedProducts.slice(
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

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await deleteProduct(id);
        } catch (err) {
            alert('Failed to delete product');
        }
    };

    const clearFilters = () => {
        setCategoryFilter('all');
        setStockFilter('all');
        setSearchQuery('');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="relative flex-1 w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                        placeholder="Filter by name, SKU, or barcode..."
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
                            setEditingProduct(null);
                            setIsModalOpen(true);
                        }}
                    >
                        <Plus className="h-4 w-4" /> Add Product
                    </Button>
                </div>
            </div>

            {showFilters && (
                <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase">Category</label>
                        <select
                            className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            {/* 5. FIX FILTER: Use availableCategories to show names */}
                            {availableCategories.map((cat: any) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-500 uppercase">Stock Status</label>
                        <select
                            className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            value={stockFilter}
                            onChange={(e) => setStockFilter(e.target.value)}
                        >
                            <option value="all">All Statuses</option>
                            <option value="in_stock">In Stock</option>
                            <option value="low_stock">Low Stock (Reorder)</option>
                            <option value="out_of_stock">Out of Stock</option>
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
                                        Product {sortField === 'name' && <ArrowUpDown className="h-3 w-3" />}
                                    </div>
                                </th>
                                <th className="px-6 py-4">SKU / Barcode</th>
                                {/* Sort by category_name now works because we handled it in sort logic */}
                                <th className="px-6 py-4 cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => toggleSort('category_name')}>
                                    <div className="flex items-center gap-2">
                                        Category {sortField === 'category_name' && <ArrowUpDown className="h-3 w-3" />}
                                    </div>
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:text-emerald-600 transition-colors text-right" onClick={() => toggleSort('selling_price')}>
                                    <div className="flex items-center justify-end gap-2">
                                        Price {sortField === 'selling_price' && <ArrowUpDown className="h-3 w-3" />}
                                    </div>
                                </th>
                                <th className="px-6 py-4 cursor-pointer hover:text-emerald-600 transition-colors text-center" onClick={() => toggleSort('quantity')}>
                                    <div className="flex items-center justify-center gap-2">
                                        Stock {sortField === 'quantity' && <ArrowUpDown className="h-3 w-3" />}
                                    </div>
                                </th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-4 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="px-6 py-8">
                                            <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded w-full"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : paginatedProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center text-zinc-400">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Search className="h-8 w-8 text-zinc-300" />
                                            <p>No products found matching your filters.</p>
                                            {(searchQuery || categoryFilter !== 'all' || stockFilter !== 'all') && (
                                                <Button variant="ghost" onClick={clearFilters} className="text-emerald-600">
                                                    Clear filters
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedProducts.map((product) => (
                                    <tr key={product.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/20 group-hover:text-emerald-600 transition-colors">
                                                    <Package className="h-5 w-5" />
                                                </div>
                                                <span className="font-semibold text-zinc-900 dark:text-zinc-100">{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-xs font-mono">
                                                <span className="text-zinc-900 dark:text-zinc-300">{product.sku}</span>
                                                <span className="text-zinc-400">{product.barcode}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium uppercase">
                                                {/* 6. USE HELPER: Find name using ID */}
                                                {getCategoryName(product.category_id)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-zinc-900 dark:text-zinc-100">
                                            {storeProfile?.currency_symbol} {product.selling_price.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className={cn(
                                                "inline-flex items-center gap-1.5 font-bold",
                                                product.quantity <= product.reorder_level ? "text-amber-500" : "text-zinc-900 dark:text-zinc-100"
                                            )}>
                                                {product.quantity}
                                                {product.quantity <= product.reorder_level && <AlertTriangle className="h-3.5 w-3.5" />}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={cn(
                                                "px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                                                product.quantity > 0
                                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                            )}>
                                                {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-zinc-400 hover:text-amber-600"
                                                    onClick={() => {
                                                        setAdjustingProduct(product);
                                                        setIsAdjustOpen(true);
                                                    }}
                                                    title="Adjust Stock"
                                                >
                                                    <RefreshCcw className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-zinc-400 hover:text-emerald-600"
                                                    onClick={() => handleEdit(product)}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-zinc-400 hover:text-red-600"
                                                    onClick={() => handleDelete(product.id)}
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
                        Showing {paginatedProducts.length} of {filteredProducts.length} products
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
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                }}
                product={editingProduct}
            />

            <StockAdjustModal
                isOpen={isAdjustOpen}
                onClose={() => {
                    setIsAdjustOpen(false);
                    setAdjustingProduct(null);
                }}
                product={adjustingProduct}
            />
        </div>
    );
}