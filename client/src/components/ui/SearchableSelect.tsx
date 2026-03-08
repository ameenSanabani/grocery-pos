/**
 * Grocery POS App
 * Copyright (c) 2026 Ameen Al-Sanabani
 * Licensed under PolyForm Noncommercial License 1.0.0
 * https://polyformproject.org/licenses/noncommercial/1.0.0/
 */

import { useState, useMemo, useRef, useEffect } from 'react';
import { Input } from './Input';

interface SearchableSelectProps {
    options: { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function SearchableSelect({ options, value, onChange, placeholder }: SearchableSelectProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const filteredOptions = useMemo(() =>
        options.filter(option =>
            option.label.toLowerCase().includes(searchTerm.toLowerCase())
        ), [options, searchTerm]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
                setIsOpen(true);
                setHighlightedIndex(0);
                return;
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setHighlightedIndex(prev => 
                    prev < filteredOptions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
                    handleSelect(filteredOptions[highlightedIndex].value);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setHighlightedIndex(-1);
                break;
        }
    };

    const handleSelect = (selectedValue: string) => {
        onChange(selectedValue);
        setSearchTerm('');
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    useEffect(() => {
        if (isOpen) {
            setHighlightedIndex(0);
        } else {
            setHighlightedIndex(-1);
        }
    }, [isOpen]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative" ref={wrapperRef}>
            <Input
                type="text"
                placeholder={selectedOption ? selectedOption.label : placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                className="w-full h-14 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm"
            />

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg">
                    <ul className="max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => (
                                <li
                                    key={option.value}
                                    className={`px-4 py-3 cursor-pointer font-medium text-sm transition-colors ${
                                        index === highlightedIndex
                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                    }`}
                                    onClick={() => handleSelect(option.value)}
                                    onMouseEnter={() => setHighlightedIndex(index)}
                                >
                                    {option.label}
                                </li>
                            ))
                        ) : (
                            <li className="px-4 py-3 text-zinc-500 text-sm">No results found</li>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}
