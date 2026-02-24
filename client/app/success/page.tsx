'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';

export default function SuccessPage() {
    const { clearCart } = useCart();

    useEffect(() => {
        clearCart();
    }, []);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center animate-up">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-lg w-full"
            >
                <div className="mb-8">
                    <svg className="w-20 h-20 mx-auto text-green-500 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4">
                        Order Confirmed
                    </h1>
                    <p className="text-xl font-bold uppercase tracking-widest text-zinc-400 mb-8">
                        Thanks for your purchase
                    </p>
                </div>

                <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-lg mb-12">
                    <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                        We've received your order and are getting it ready.
                        Payment transaction details have been emailed to you.
                    </p>
                    <p className="text-zinc-500 text-xs uppercase tracking-widest">
                        Check your inbox for the confirmation
                    </p>
                </div>

                <Link
                    href="/"
                    className="inline-block bg-white text-black font-black uppercase tracking-[0.2em] px-8 py-4 text-xs hover:bg-zinc-200 transition-colors"
                >
                    Continue Shopping
                </Link>
            </motion.div>
        </div>
    );
}
