'use client';

import { useState, useEffect } from 'react';

interface EmailModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function EmailModal({ isOpen, onClose }: EmailModalProps) {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'sending' | 'success'>('idle');

    // Auto-close timer logic
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, 5000); // 5 seconds
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!email.includes('@')) {
            alert('Please enter a valid email.');
            return;
        }

        setStatus('sending');

        // Simulate network delay matching legacy app.js
        setTimeout(() => {
            setStatus('success');
            setTimeout(() => {
                alert(`VERIFICATION CODE SENT TO: ${email}\n\n(Check your spam folder)`);
                onClose();
                setStatus('idle');
                setEmail('');
            }, 1000);
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-500" onClick={onClose}>
            <div
                className="welcome-modal-card bg-black border border-white p-8 max-w-md w-full relative text-center shadow-[0_0_50px_rgba(255,255,255,0.1)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-white font-bold"
                >
                    X
                </button>

                <h3 className="text-3xl font-black italic uppercase mb-2 text-white">Join The Family</h3>
                <p className="text-[10px] uppercase text-zinc-400 mb-8 tracking-widest">
                    Join for early access & exclusive offers.
                </p>

                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ENTER YOUR EMAIL"
                    className="w-full bg-transparent border-b border-zinc-700 py-3 text-center text-white text-xs font-bold uppercase tracking-widest outline-none focus:border-white mb-6 placeholder-zinc-700"
                />

                <button
                    onClick={handleSubmit}
                    disabled={status !== 'idle'}
                    className={`w-full py-4 text-xs font-black uppercase tracking-widest transition duration-300 ${status === 'success'
                        ? 'bg-green-600 text-white'
                        : 'bg-white text-black hover:bg-zinc-200'
                        } ${status === 'sending' ? 'opacity-70 cursor-wait' : ''}`}
                >
                    {status === 'sending' ? 'SENDING CODE...' : status === 'success' ? 'CODE SENT!' : 'UNLOCK ACCESS'}
                </button>

                <div className="progress-bar" />
                <style jsx>{`
                    .progress-bar {
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        height: 3px;
                        background: #fff;
                        width: 100%;
                        animation: shrink 5s linear forwards;
                    }
                    @keyframes shrink {
                        from { width: 100%; }
                        to { width: 0%; }
                    }
                `}</style>
            </div>
        </div>
    );
}
