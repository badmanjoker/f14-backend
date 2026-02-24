'use client';

import { useEffect } from 'react';

interface ToastProps {
    message: string;
    isActive: boolean;
    onClose: () => void;
    onCheckout?: () => void;
    toastId?: number;
}

export default function Toast({ message, isActive, onClose, onCheckout, toastId }: ToastProps) {
    useEffect(() => {
        if (isActive) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isActive, onClose, toastId]);

    return (
        <div className={`toast-notification ${isActive ? 'active' : ''}`}>
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <span>{message}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                {onCheckout && (
                    <div className="flex gap-2 mt-1">
                        <button
                            onClick={onCheckout}
                            className="bg-white text-black px-3 py-1 text-[10px] uppercase font-bold hover:bg-zinc-200 transition-colors"
                        >
                            VIEW BAG
                        </button>
                        <button
                            onClick={onClose}
                            className="border border-zinc-700 text-white px-3 py-1 text-[10px] uppercase font-bold hover:bg-zinc-900 transition-colors"
                        >
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>

            {isActive && <div key={toastId} className="progress-bar" />}
            <style jsx>{`
                .toast-notification {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                    background: #000;
                    color: #fff;
                    padding: 15px 20px;
                    padding-bottom: 20px; 
                    font-weight: 900;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    font-size: 12px;
                    z-index: 9999;
                    transform: translateY(100px);
                    opacity: 0;
                    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                    border: 1px solid #333;
                    overflow: hidden; 
                    display: flex;
                    flex-direction: column;
                }
                .toast-notification.active {
                    transform: translateY(0);
                    opacity: 1;
                }
                .progress-bar {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    height: 3px;
                    background: #fff; 
                    width: 100%;
                    z-index: 10;
                    animation: shrink 3s linear forwards;
                }
                @keyframes shrink {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    );
}
