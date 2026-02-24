'use client';

import { useState } from 'react';
import Link from 'next/link';
import Toast from './Toast';

interface GlobalFooterProps {
    onNavigate?: (view: string, subTarget?: string) => void;
}

export default function GlobalFooter({ onNavigate }: GlobalFooterProps) {
    const [showSubscribedToast, setShowSubscribedToast] = useState(false);

    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [error, setError] = useState('');

    const handleJoin = async () => {
        if (!email || !email.includes('@')) {
            setError('INVALID EMAIL');
            return;
        }

        setError(''); // Clear error
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        try {
            const res = await fetch(`${apiUrl}/api/newsletter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (res.ok) {
                setShowSubscribedToast(true);
                setTimeout(() => setShowSubscribedToast(false), 3000);
                setEmail(''); // Clear input
            } else {
                console.error('Newsletter failed');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNav = (target: string, subTarget?: string) => {
        if (onNavigate) {
            onNavigate(target, subTarget);
            window.scrollTo(0, 0);
        }
    };

    return (
        <div className="pro-footer border-t border-zinc-800 bg-black pt-20 pb-10 px-6 relative">
            <Toast isActive={showSubscribedToast} message="WELCOME TO THE FAMILY. CHECK YOUR INBOX FOR CODE: FAMILY14" onClose={() => setShowSubscribedToast(false)} />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-7xl mx-auto mb-20">
                <div className="footer-col">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-6">Customer Care</h4>
                    <div className="flex flex-col gap-4 text-[10px] uppercase tracking-widest text-zinc-500">
                        <Link href="/policies/shipping-policy" className="text-left hover:text-white transition">Shipping Info</Link>
                        <Link href="/policies/refund-policy" className="text-left hover:text-white transition">Returns & Exchanges</Link>
                        <button onClick={() => handleNav('size-guide')} className="text-left hover:text-white transition cursor-pointer">Size Guide</button>
                        <button onClick={() => handleNav('faq')} className="text-left hover:text-white transition cursor-pointer">FAQ</button>
                    </div>
                </div>
                <div className="footer-col">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-6">Legal</h4>
                    <div className="flex flex-col gap-4 text-[10px] uppercase tracking-widest text-zinc-500">
                        <Link href="/policies/terms-of-service" className="text-left hover:text-white transition">Terms of Service</Link>
                        <Link href="/policies/privacy-policy" className="text-left hover:text-white transition">Privacy Policy</Link>
                        <Link href="/policies/cookie-policy" className="text-left hover:text-white transition">Cookie Policy</Link>
                    </div>
                </div>
                <div className="footer-col">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-6">Connect</h4>
                    <div className="flex flex-col gap-4 text-[10px] uppercase tracking-widest text-zinc-500">
                        <a href="https://www.instagram.com/floatingfourteen/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">Instagram</a>
                        <a href="https://www.tiktok.com/@floatingfourteen" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">TikTok</a>
                        <a href="mailto:Floatingfourteen@gmail.com" className="hover:text-white transition">Contact Us</a>
                    </div>
                </div>
                <div className="footer-col">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-white mb-6">Newsletter</h4>
                    <p className="text-[10px] text-zinc-500 mb-4 leading-relaxed">Subscribe for exclusive drops and early access.</p>

                    {error && (
                        <p className="text-[10px] text-red-500 font-bold mb-2 uppercase animate-pulse">{error}</p>
                    )}

                    <div className="flex border-b border-zinc-700 pb-1">
                        <input
                            type="email"
                            placeholder="EMAIL ADDRESS"
                            className="bg-transparent w-full text-[10px] text-white outline-none uppercase font-bold placeholder-zinc-700"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) setError('');
                            }}
                        />
                        <button
                            onClick={handleJoin}
                            disabled={isLoading}
                            className="text-[10px] font-bold text-white uppercase hover:text-zinc-400 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                        >
                            {isLoading ? '...' : 'JOIN'}
                        </button>
                    </div>
                </div>
            </div>
            <div className="text-center text-[10px] uppercase text-zinc-600 tracking-widest">
                &copy; <Link href="/admin" className="cursor-default hover:text-zinc-500 transition-colors">2026</Link> Floating Fourteen Inc. All Rights Reserved.
            </div>
        </div>
    );
}
