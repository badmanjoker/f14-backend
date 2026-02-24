'use client';

import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSettings } from '@/components/SettingsContext';

const SizeDropdown = ({ currentSize, onSelect }: { currentSize: string, onSelect: (s: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative inline-block" onMouseLeave={() => setIsOpen(false)}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest border border-zinc-900 bg-zinc-950 px-3 py-1.5 hover:text-white hover:border-zinc-700 transition-all flex items-center gap-2 min-w-[50px] justify-between cursor-pointer hover:scale-105 active:scale-95"
            >
                {currentSize}
                <span className="text-[8px] opacity-50">▼</span>
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 bg-zinc-950 border border-zinc-800 z-50 flex flex-col w-full min-w-[50px] shadow-xl">
                    {['S', 'M', 'L', 'XL'].map(s => (
                        <button
                            key={s}
                            onClick={() => { onSelect(s); setIsOpen(false); }}
                            className={`text-[10px] font-bold py-2 transition-colors uppercase w-full text-center cursor-pointer ${currentSize === s ? 'bg-white text-black' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const CompleteLookSuggestion = ({ item, message }: { item: { name: string, price: number, image: string, id: string }, message?: string }) => {
    const { addToCart } = useCart();

    // Helper to format image URL
    const formatImgUrl = (path: string) => {
        if (!path) return '/cbr.png';
        if (path.startsWith('http')) return path;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        if (path.startsWith('/uploads/')) return `${apiUrl}${path}`;
        return path;
    };

    return (
        <div className="bg-zinc-950 p-3 border border-zinc-900 mb-2 animate-up">
            <div className="flex justify-between items-center mb-2">
                <p className="text-[9px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Complete the Look</p>
                <p className="text-[9px] text-emerald-500 uppercase tracking-widest font-bold animate-pulse">{message || 'Unlock £10 Off'}</p>
            </div>
            <div className="flex gap-3 items-center">
                <div className="relative w-10 h-14 border border-zinc-800 bg-zinc-900">
                    <Image src={formatImgUrl(item.image)} alt={item.name} fill className="object-cover opacity-80" />
                </div>
                <div className="flex-1">
                    <p className="text-white text-sm font-bebas tracking-wide leading-none mb-0.5">{item.name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono">£{item.price}</p>
                </div>
                <button
                    onClick={() => addToCart({ ...item, image: formatImgUrl(item.image), description: 'Added via upsell' }, 'L', 1, true)}
                    className="text-[9px] bg-white text-black px-3 py-1 font-bold uppercase hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 tracking-wider cursor-pointer"
                >
                    Add +
                </button>
            </div>
        </div>
    );
};

export default function CartSidebar() {
    const {
        cart, cartOpen, toggleCart, updateQty, updateSize, removeFromCart, subtotal, toggleCheckout,
        bundleDiscount, activeBundleNames, potentialBundles, suggestedBundles
    } = useCart();

    const [upsells, setUpsells] = useState<any[]>([]);

    useEffect(() => {
        if (!cartOpen) return;
        const fetchUpsells = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const res = await fetch(`${apiUrl}/api/upsells`);
                const data = await res.json();
                setUpsells(data.filter((u: any) => u.active));
            } catch (err) {
                console.error('Failed to fetch upsells', err);
            }
        };
        fetchUpsells();
    }, [cartOpen]);

    const activeUpsell = upsells.find(u =>
        cart.some(item => (item.id === u.triggerProductId?._id || item.productId === u.triggerProductId?._id)) &&
        !cart.some(item => (item.id === u.suggestedProductId?._id || item.productId === u.suggestedProductId?._id))
    );
    const { getSetting } = useSettings();
    const shippingThreshold = parseFloat(getSetting('shipping_threshold', '130'));
    const adjustedSubtotal = subtotal - bundleDiscount;
    const shippingCost = (cart.length === 0 || adjustedSubtotal >= shippingThreshold) ? 0 : 15;
    const total = adjustedSubtotal + shippingCost;
    const progress = Math.min((adjustedSubtotal / shippingThreshold) * 100, 100);

    return (
        <AnimatePresence>
            {cartOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleCart}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1000]"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-black border-l border-zinc-900 z-[2000] flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="px-8 py-6 flex justify-between items-end border-b border-zinc-900/50">
                            <h2 className="text-3xl font-bebas italic uppercase text-white tracking-tight leading-none">Your Bag</h2>
                            <button
                                onClick={toggleCart}
                                className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-all hover:scale-110 active:scale-90 pb-1 cursor-pointer p-4 -mr-4"
                            >
                                Close [X]
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-hide">
                            {activeBundleNames.length > 0 && (
                                <div className="space-y-2 mb-6">
                                    {activeBundleNames.map(name => (
                                        <div key={name} className="text-center font-bold text-[9px] uppercase tracking-[0.2em] py-2.5 text-emerald-400 border border-emerald-900/30 bg-emerald-950/5 animate-up">
                                            Bundle: {name} Aktiverad!
                                        </div>
                                    ))}
                                    <div className="text-center font-black text-[10px] uppercase tracking-[0.3em] py-1 text-emerald-500">
                                        Total Rabatt: -£{bundleDiscount}
                                    </div>
                                </div>
                            )}

                            {/* Shipping Progress */}
                            <div className="mb-6">
                                <div className="flex justify-between items-end mb-3">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white">
                                        {adjustedSubtotal >= shippingThreshold ? 'Free Shipping Unlocked' : 'Free Shipping'}
                                    </p>
                                    <p className="text-[9px] font-mono text-zinc-500">
                                        {adjustedSubtotal >= shippingThreshold ? '100%' : `£${shippingThreshold - adjustedSubtotal} away`}
                                    </p>
                                </div>
                                <div className="h-[2px] bg-zinc-900 w-full overflow-hidden">
                                    <div
                                        className="h-full bg-white transition-all duration-700 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>

                            {/* Potential Bundles (Awareness) */}
                            {potentialBundles.length > 0 && (
                                <div className="space-y-4 mb-10">
                                    {potentialBundles.map(pb => (
                                        <div key={pb.name} className="animate-up">
                                            <div className="flex justify-between items-end mb-2">
                                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">
                                                    {pb.name} DISCOUNT
                                                </p>
                                                <p className="text-[9px] font-bold text-zinc-500 uppercase">
                                                    Add {pb.missingQty} more
                                                </p>
                                            </div>
                                            <div className="h-[2px] bg-emerald-500/10 w-full overflow-hidden">
                                                <div
                                                    className="h-full bg-emerald-500 transition-all duration-700 ease-out"
                                                    style={{ width: `${(pb.currentQty / pb.minQuantity) * 100}%` }}
                                                />
                                            </div>
                                            <p className="text-[8px] text-zinc-600 font-bold uppercase mt-2 tracking-widest whitespace-normal leading-relaxed">
                                                Unlock {pb.isPercentage ? `${pb.discount}%` : `£${pb.discount}`} off your order
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Collection Suggestions */}
                            {suggestedBundles.length > 0 && cart.length > 0 && (
                                <div className="mb-10 px-4 py-3 bg-zinc-950/50 border border-zinc-900 border-dashed rounded-lg animate-up">
                                    <p className="text-[8px] text-zinc-500 font-black uppercase tracking-[0.2em] mb-1">Bundle Suggestion</p>
                                    <p className="text-[10px] text-white font-bold uppercase tracking-tight">
                                        {suggestedBundles[0].name} is active!
                                        <span className="text-emerald-500 ml-1">Save {suggestedBundles[0].isPercentage ? `${suggestedBundles[0].discount}%` : `£${suggestedBundles[0].discount}`}</span>
                                    </p>
                                </div>
                            )}

                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-[300px] text-white animate-in fade-in zoom-in duration-300">
                                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">Your bag is empty</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map((item) => (
                                        <div key={item.id} className="group flex gap-5 relative">

                                            {/* Product Image */}
                                            <div className="w-[90px] h-[110px] bg-zinc-900 border border-zinc-900 relative shrink-0">
                                                <Image src={item.image} alt={item.name} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 flex flex-col justify-between py-1">
                                                <div>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bebas text-xl tracking-wide text-white leading-none pr-4">{item.name}</h4>
                                                        <p className="text-sm font-mono text-white">£{item.price * item.qty}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <SizeDropdown
                                                            currentSize={item.size}
                                                            onSelect={(newSize) => updateSize(item.id, newSize)}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-end">
                                                    {/* Qty Custom Control */}
                                                    <div className="flex items-center border border-zinc-800 bg-zinc-950">
                                                        <button
                                                            onClick={() => updateQty(item.id, -1)}
                                                            className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all text-xs cursor-pointer active:scale-75"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="text-[10px] font-bold w-8 text-center text-white font-mono">{item.qty}</span>
                                                        <button
                                                            onClick={() => updateQty(item.id, 1)}
                                                            className="w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all text-xs cursor-pointer active:scale-75"
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="text-[9px] text-zinc-500 uppercase font-bold hover:text-white transition-all hover:scale-105 active:scale-95 tracking-wider inline-block cursor-pointer"
                                                    >
                                                        REMOVE
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                    ))}
                                </div>
                            )}

                            {/* Complete the Look Suggestion */}
                            {cart.length > 0 && activeUpsell && activeUpsell.suggestedProductId && (
                                <div className="mt-4 border-t border-zinc-900/50 pt-4">
                                    <CompleteLookSuggestion
                                        item={{
                                            name: activeUpsell.suggestedProductId.name,
                                            price: activeUpsell.suggestedProductId.price,
                                            image: activeUpsell.suggestedProductId.image,
                                            id: activeUpsell.suggestedProductId._id
                                        }}
                                        message={activeUpsell.message}
                                    />
                                </div>
                            )}

                            {/* Bundle Discount Message */}

                        </div>

                        {/* Footer */}
                        <div className="px-8 py-8 border-t border-zinc-900 bg-black">
                            {cart.length > 0 && (
                                <>
                                    <div className="flex justify-between items-center text-[10px] font-bold uppercase text-zinc-500 mb-3 tracking-widest">
                                        <span>Shipping</span>
                                        <span className={shippingCost === 0 ? 'text-white' : ''}>{shippingCost === 0 ? 'FREE' : `£${shippingCost}`}</span>
                                    </div>

                                    <div className="flex justify-between items-end mb-8">
                                        <span className="text-3xl font-bebas italic uppercase text-white tracking-tighter">Total</span>
                                        <div className="flex flex-col items-end">
                                            {bundleDiscount > 0 && (
                                                <span className="text-zinc-600 line-through text-xs font-mono mb-1">£{total + bundleDiscount}</span>
                                            )}
                                            <span className="text-3xl font-bebas text-white tracking-tight leading-none">£{total}</span>
                                        </div>
                                    </div>
                                </>
                            )}

                            {getSetting('timer_active', 'false') === 'true' ? (
                                <button
                                    disabled
                                    className="block w-full py-4 bg-zinc-800 text-zinc-500 font-black uppercase tracking-[0.25em] text-xs cursor-not-allowed text-center relative overflow-hidden"
                                >
                                    Launch Pending
                                </button>
                            ) : (
                                <Link
                                    href="/checkout"
                                    onClick={toggleCart}
                                    className="block w-full py-4 bg-white text-black font-black uppercase tracking-[0.25em] text-xs hover:bg-zinc-200 active:scale-[0.98] transition-all text-center relative overflow-hidden group hover:shadow-2xl hover:shadow-white/10"
                                >
                                    <span className="relative z-10">Checkout</span>
                                </Link>
                            )}


                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
