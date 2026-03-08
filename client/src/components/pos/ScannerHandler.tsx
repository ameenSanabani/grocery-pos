/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

"use client";

import { useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useCartStore } from '@/store/useCartStore';

export function ScannerHandler() {
    const addItem = useCartStore((state) => state.addItem);
    const buffer = useRef<string>('');
    const lastKeyTime = useRef<number>(0);

    useEffect(() => {
        const handleKeyDown = async (e: KeyboardEvent) => {
            // Ignore if we are typing in an input or textarea
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
                return;
            }

            // Barcode scanners usually send characters very fast
            const currentTime = Date.now();
            const diff = currentTime - lastKeyTime.current;
            lastKeyTime.current = currentTime;

            // If it's the Enter key, process the buffer
            if (e.key === 'Enter') {
                if (buffer.current.length >= 3) {
                    try {
                        const product = await api.get<any>(`/products/barcode/${buffer.current}`);
                        if (product) {
                            addItem(product);
                            // Small sound or haptic feedback could go here
                        }
                    } catch (err) {
                        console.error('Scanned product not found:', buffer.current);
                    }
                }
                buffer.current = '';
                return;
            }

            // If it's a normal character
            if (e.key.length === 1) {
                // Manual typing speed detected (gap > 35ms)? Clear buffer to ensure only fast scanner inputs survive
                if (diff > 35) {
                    buffer.current = '';
                }
                buffer.current += e.key;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [addItem]);

    return null; // Invisible component
}
