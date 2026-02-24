'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// Hardcoded matching Supply.tsx for search
const PRODUCTS = [
    {
        id: 'hoodie',
        name: 'ZIPPED HOODIE (LOGO)',
        price: 60,
        image: '/Hoodie.jpg',
        href: '/product/hoodie',
        keywords: ['hoodie', 'zip', 'sweater', 'top']
    },
    {
        id: 'pants',
        name: 'BAGGY PANTS (LOGO)',
        price: 50,
        image: '/Pants.jpg',
        href: '/product/pants',
        keywords: ['pants', 'sweats', 'joggers', 'bottoms', 'trousers', 'baggy']
    },
    {
        id: 'tee',
        name: 'KRAKEN TEE',
        price: 30,
        image: '/festbild.jpg',
        href: '/product/tee',
        keywords: ['tee', 't-shirt', 'top', 'shirt']
    }
];

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Handle ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const filteredProducts = query.length > 0
        ? PRODUCTS.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.keywords.some(k => k.includes(query.toLowerCase()))
        )
        : [];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Darker Blur Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[9998] bg-black/90 backdrop-blur-md"
                    />

                    {/* Modal Container - Smaller & Centered */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="fixed top-[20vh] left-1/2 -translate-x-1/2 z-[9999] w-full max-w-lg px-4"
                    >
                        <div className="bg-transparent flex flex-col items-center">

                            {/* Header / Input Area - Smaller Text */}
                            <div className="relative w-full mb-6 text-center">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="SEARCH..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full bg-transparent text-3xl font-black italic uppercase text-white placeholder-zinc-800 outline-none tracking-tighter text-center transition-all focus:placeholder-zinc-700"
                                />
                            </div>

                            {/* Content Area - Compact */}
                            <div className="w-full min-h-[100px] max-h-[50vh] overflow-y-auto scrollbar-hide">

                                {/* Empty State: Trending / Suggestions */}
                                {query.length === 0 && (
                                    <div className="grid grid-cols-3 gap-3">
                                        {PRODUCTS.map((product, i) => (
                                            <Link
                                                key={product.id}
                                                href={product.href}
                                                onClick={onClose}
                                                className="group relative aspect-[3/4] overflow-hidden bg-zinc-900/50 rounded-sm hover:scale-[1.02] transition-transform duration-300"
                                            >
                                                <Image
                                                    src={product.image}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                                                />
                                                {/* Hidden on hover info for cleaner look */}
                                                <div className="absolute inset-0 flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                                                    <span className="text-[10px] uppercase font-bold text-white tracking-widest">{product.name}</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {/* Search Results - Compact List */}
                                {query.length > 0 && (
                                    <div className="space-y-2">
                                        {filteredProducts.length > 0 ? (
                                            filteredProducts.map(product => (
                                                <Link
                                                    key={product.id}
                                                    href={product.href}
                                                    onClick={onClose}
                                                    className="flex items-center gap-4 p-3 rounded bg-zinc-900/30 hover:bg-zinc-900/80 transition-all group border border-transparent hover:border-zinc-800"
                                                >
                                                    <div className="relative w-12 h-16 bg-zinc-800 shrink-0 overflow-hidden rounded-sm">
                                                        <Image
                                                            src={product.image}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col items-start">
                                                        <span className="text-sm font-black italic uppercase text-zinc-400 group-hover:text-white transition-colors tracking-tight">
                                                            {product.name}
                                                        </span>
                                                        <span className="text-[10px] text-zinc-600 font-mono group-hover:text-zinc-500">
                                                            £{product.price}
                                                        </span>
                                                    </div>
                                                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-200">
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white">
                                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                                            <polyline points="12 5 19 12 12 19"></polyline>
                                                        </svg>
                                                    </div>
                                                </Link>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-zinc-800 font-black italic uppercase text-lg tracking-tighter">No Matches</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
