'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import OrderSummary from './OrderSummary';
import ContactSection from './ContactSection';
import DeliverySection, { AddressData } from './DeliverySection';
import ShippingSection from './ShippingSection';
import PaymentSection from './PaymentSection';
import { useCheckoutValidation } from '@/hooks/useCheckoutValidation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import Link from 'next/link';

// Move Stripe loader outside to avoid recreating it
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

function CheckoutContent() {
    const { subtotal, bundleDiscount } = useCart();
    const { errors, validateAll, clearError } = useCheckoutValidation();

    // Form State
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState<AddressData>({
        firstName: '',
        lastName: '',
        address: '',
        apartment: '',
        postalCode: '',
        city: '',
        country: 'Sweden',
        phone: ''
    });

    // Determine derived state
    const adjustedSubtotal = subtotal - bundleDiscount;
    const shippingCost = adjustedSubtotal >= 130 ? 0 : 15;

    // Stripe State
    const stripe = useStripe();
    const elements = useElements();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Ensure scrolling is enabled for checkout page (overriding global lock)
    useEffect(() => {
        document.body.style.overflow = 'auto';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    // Validation Check for sequential reveal
    const isContactValid = email.includes('@') && email.includes('.');
    const isAddressValid = address.firstName && address.lastName && address.address && address.city && address.postalCode && address.phone;

    // Multi-step State
    const [step, setStep] = useState<'delivery' | 'payment'>('delivery');

    const handleAddressChange = (field: keyof AddressData, value: string) => {
        setAddress(prev => ({ ...prev, [field]: value }));
        clearError(field);
    };

    const handleContinueToPayment = () => {
        const isValid = validateAll(email, address);
        if (isValid) {
            setStep('payment');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Shake effect or scroll to error could be added here
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handlePaymentSubmit = async () => {
        if (!stripe || !elements) return;

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/success`,
                receipt_email: email,
                shipping: {
                    name: `${address.firstName} ${address.lastName}`,
                    address: {
                        line1: address.address,
                        line2: address.apartment,
                        city: address.city,
                        postal_code: address.postalCode,
                        country: address.country === 'Sweden' ? 'SE' : 'GB',
                    },
                    phone: address.phone,
                },
            },
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message || "Payment failed");
            } else {
                setMessage("An unexpected error occurred.");
            }
        }

        setIsLoading(false);
    };

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-screen">

            {/* LEFT COLUMN - FORMS (Main Content) */}
            <div className="lg:col-span-7 py-8 px-4 md:px-8 lg:pr-12 lg:border-r border-zinc-900 pb-24 overflow-hidden">
                <div className="max-w-xl mx-auto lg:mx-0 lg:ml-auto">

                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold mb-8 text-zinc-500 transition-colors duration-300">
                        <span className="text-white">Information</span>
                        <span className="text-zinc-700">/</span>
                        <button
                            onClick={() => setStep('delivery')}
                            className={`hover:text-white transition-colors ${step === 'delivery' ? 'text-white' : 'text-zinc-400'}`}
                        >
                            Shipping
                        </button>
                        <span className="text-zinc-700">/</span>
                        <span className={step === 'payment' ? 'text-white' : ''}>Payment</span>
                    </nav>

                    <AnimatePresence mode="wait">
                        {step === 'delivery' ? (
                            <motion.div
                                key="delivery"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                <ContactSection
                                    email={email}
                                    onChange={(e) => { setEmail(e); clearError('email'); }}
                                    error={errors.email}
                                />

                                <DeliverySection
                                    data={address}
                                    onChange={handleAddressChange}
                                    errors={errors}
                                />

                                <ShippingSection shippingCost={shippingCost} />

                                <div className="pt-6 flex justify-end">
                                    <button
                                        onClick={handleContinueToPayment}
                                        className="bg-white text-black font-black uppercase tracking-widest px-8 py-4 rounded-md hover:bg-zinc-200 transition-colors text-xs"
                                    >
                                        Continue to Payment
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="payment"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-8"
                            >
                                <div className="bg-zinc-900/50 border border-zinc-800 rounded p-4 mb-6">
                                    <div className="flex justify-between items-center text-xs mb-2 border-b border-zinc-800 pb-2">
                                        <span className="text-zinc-500">Contact</span>
                                        <span className="text-white">{email}</span>
                                        <button onClick={() => setStep('delivery')} className="text-zinc-400 hover:text-white underline">Change</button>
                                    </div>
                                    <div className="flex justify-between items-center text-xs mb-2 border-b border-zinc-800 pb-2">
                                        <span className="text-zinc-500">Ship to</span>
                                        <span className="text-white truncate max-w-[200px]">{address.address}, {address.city}</span>
                                        <button onClick={() => setStep('delivery')} className="text-zinc-400 hover:text-white underline">Change</button>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-zinc-500">Method</span>
                                        <span className="text-white">Standard • {shippingCost === 0 ? 'Free' : `£${shippingCost}`}</span>
                                    </div>
                                </div>

                                <PaymentSection onSubmit={handlePaymentSubmit} isLoading={isLoading} />

                                {message && <div className="p-4 bg-red-900/20 border border-red-900 text-red-500 text-xs font-bold uppercase text-center">{message}</div>}

                                <div className="pt-4 flex justify-center">
                                    <button
                                        onClick={() => setStep('delivery')}
                                        className="text-zinc-500 hover:text-white text-xs uppercase tracking-widest font-bold flex items-center gap-2"
                                    >
                                        ← Return to Shipping
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </div>
            </div>

            {/* RIGHT COLUMN - SUMMARY (Sidebar) */}
            <div className="hidden lg:block lg:col-span-5 bg-black lg:bg-zinc-950/30 py-8 px-4 md:px-8 lg:pl-12 sticky top-0 h-screen">
                <div className="max-w-xl mx-auto lg:mx-0">
                    <OrderSummary />
                </div>
            </div>
        </div>
    );
}

export default function CheckoutContainer() {
    const { cart } = useCart();
    const [clientSecret, setClientSecret] = useState('');
    const [initError, setInitError] = useState<string | null>(null);

    useEffect(() => {
        if (cart.length > 0) {
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/create-payment-intent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ items: cart, currency: "gbp" }),
            })
                .then((res) => {
                    if (!res.ok) throw new Error('Failed to init payment');
                    return res.json();
                })
                .then((data) => {
                    if (data.error) throw new Error(data.error);
                    setClientSecret(data.clientSecret);
                })
                .catch(err => {
                    console.error("Error creating payment intent:", err);
                    setInitError(err.message);
                });
        }
    }, [cart]);

    if (cart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-4">Your Bag is Empty</h1>
                <Link href="/?skipEnter=true" className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-colors">
                    Return to Shop
                </Link>
            </div>
        );
    }

    if (!clientSecret) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse">
                {initError ? (
                    <div className="text-red-500 text-center">
                        <p>Error loading checkout</p>
                        <p className="text-[10px] mt-2 text-zinc-400">{initError}</p>
                        <button onClick={() => window.location.reload()} className="mt-4 underline text-white">Retry</button>
                    </div>
                ) : (
                    'Initializing Secure Checkout...'
                )}
            </div>
        );
    }

    const appearance = {
        theme: 'night' as const,
        variables: {
            colorPrimary: '#ffffff', // Changed from red to white
            colorBackground: '#18181b', // zinc-900
            colorText: '#ffffff',
            colorDanger: '#ef4444',
            fontFamily: 'Inter, system-ui, sans-serif',
            borderRadius: '4px',
        },
    };

    return (
        <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
            <CheckoutContent />
        </Elements>
    );
}
