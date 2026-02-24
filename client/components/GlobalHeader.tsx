'use client';

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import SearchModal from './SearchModal';

export default function GlobalHeader() {
    const { toggleCart, itemCount } = useCart();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const pathname = usePathname();

    const isAdmin = pathname?.startsWith('/admin');

    return (
        <>
            <header className="fixed top-0 left-0 w-full z-[800] py-6 px-6 md:px-12 pointer-events-none">
                <div className="w-full flex justify-between items-start pointer-events-auto">
                    {/* Left Logo */}
                    <Link href="/" className="relative w-10 h-10 hover:opacity-80 transition-opacity">
                        <Image
                            src="/F14 logga.png"
                            alt="F14 Home"
                            fill
                            className="object-contain invert" // Invert because logo is black? Checking Hero... Hero says invert mix-blend-overlay. Let's just use invert if it's black on black bg.
                            priority
                        />
                    </Link>

                    {/* Right Icons */}
                    <div className="flex items-center gap-4">
                        {isAdmin && (
                            <Link href="/" className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-white transition-colors mr-2">
                                Exit to Store
                            </Link>
                        )}
                        {/* Search Trigger */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="text-white hover:text-zinc-400 transition-colors relative group cursor-pointer p-2"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </button>

                        {/* Cart Trigger (Replaces old floating trigger) */}
                        <button
                            onClick={toggleCart}
                            className="text-white hover:text-zinc-400 transition-colors relative cursor-pointer p-2"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                            {itemCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[9px] font-black w-3 h-3 flex items-center justify-center rounded-full border border-black animate-in fade-in zoom-in">
                                    {itemCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}
