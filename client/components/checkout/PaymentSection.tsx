'use client';

import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import Link from 'next/link';

interface PaymentSectionProps {
    onSubmit: () => Promise<void>;
    isLoading: boolean;
}

export default function PaymentSection({ onSubmit, isLoading }: PaymentSectionProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);

    return (
        <div className="space-y-4 pt-8 animate-up" style={{ animationDelay: '300ms' }}>
            <h2 className="text-lg font-black italic uppercase text-white mb-2">Payment</h2>
            <p className="text-xs text-zinc-500 mb-4">All transactions are secure and encrypted.</p>

            <div className="bg-zinc-900 border border-zinc-800 rounded-md p-4 space-y-4">
                {/* Stripe Element */}
                {/* Stripe Element - Billing details configured to show Name but hide others */}
                <PaymentElement
                    id="payment-element"
                    options={{
                        layout: "tabs",
                        fields: {
                            billingDetails: {
                                name: 'auto',
                                email: 'never',
                                phone: 'never',
                                address: 'never'
                            }
                        }
                    }}
                />
            </div>

            <div className="pt-6">
                <button
                    onClick={onSubmit}
                    disabled={isLoading || !stripe || !elements}
                    className="w-full bg-white text-black font-black uppercase tracking-widest py-5 rounded-md hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-white/20 active:scale-[0.99] transform duration-100"
                >
                    {isLoading ? "Processing..." : "Pay Now"}
                </button>
            </div>

            {/* Footer Policies */}
            <div className="pt-4 text-center text-[10px] uppercase text-zinc-600 space-x-4 flex justify-center">
                <Link href="/policies/refund-policy" className="hover:text-zinc-400 transition-colors cursor-pointer">Refund Policy</Link>
                <Link href="/policies/shipping-policy" className="hover:text-zinc-400 transition-colors cursor-pointer">Shipping Policy</Link>
                <Link href="/policies/privacy-policy" className="hover:text-zinc-400 transition-colors cursor-pointer">Privacy Policy</Link>
            </div>
        </div>
    );
}
