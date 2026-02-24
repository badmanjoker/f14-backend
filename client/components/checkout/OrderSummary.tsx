'use client';

import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import { useState } from 'react';
import { useSettings } from '@/components/SettingsContext';

const SizeDropdown = ({ currentSize, onSelect }: { currentSize: string, onSelect: (s: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative inline-block mb-2" onMouseLeave={() => setIsOpen(false)}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-zinc-900 text-[10px] text-zinc-400 font-bold uppercase tracking-widest border border-zinc-700 px-2 py-1 hover:text-white hover:border-zinc-500 transition-all min-w-[40px] flex justify-between items-center gap-2 rounded-sm cursor-pointer hover:scale-105 active:scale-95"
            >
                {currentSize}
                <span className="text-[8px]">▼</span>
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 bg-zinc-900 border border-zinc-700 z-50 flex flex-col w-full min-w-[40px] shadow-xl">
                    {['S', 'M', 'L', 'XL'].map(s => (
                        <button
                            key={s}
                            onClick={() => { onSelect(s); setIsOpen(false); }}
                            className={`text-[10px] font-bold p-1 transition-colors uppercase w-full text-center ${currentSize === s ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:bg-red-600 hover:text-white'
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

export default function OrderSummary() {
    const { cart, subtotal, bundleDiscount, updateQty, updateSize, removeFromCart } = useCart();
    const [discountCode, setDiscountCode] = useState('');

    const { getSetting } = useSettings();
    const adjustedSubtotal = subtotal - bundleDiscount;
    const shippingThreshold = parseFloat(getSetting('shipping_threshold', '130'));
    const shipping = adjustedSubtotal >= shippingThreshold ? 0 : 15;
    const total = adjustedSubtotal + shipping;

    return (
        <div className="space-y-6">
            {/* Products List */}
            <div className="space-y-4">
                {cart.map((item) => (
                    <div key={`${item.id}-${item.size}`} className="flex gap-4 items-center">
                        <div className="relative w-16 h-20 border border-zinc-800 rounded-sm overflow-hidden flex-shrink-0 bg-zinc-900">
                            <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                            />
                            {/* Quantity Badge Removed as per request to have editable controls below */}
                        </div>
                        <div className="flex-1">
                            <h4 className="text-sm font-bold text-white uppercase tracking-wide">{item.name}</h4>

                            <SizeDropdown
                                currentSize={item.size}
                                onSelect={(newSize) => updateSize(item.id, newSize)}
                            />

                            {/* Editable Quantity Controls */}
                            <div className="flex items-center border border-zinc-800 w-fit">
                                <button
                                    onClick={() => updateQty(item.id, -1)}
                                    className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all text-[10px] cursor-pointer active:scale-75"
                                >
                                    -
                                </button>
                                <span className="text-xs font-bold w-6 text-center text-white">{item.qty}</span>
                                <button
                                    onClick={() => updateQty(item.id, 1)}
                                    className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all text-[10px] cursor-pointer active:scale-75"
                                >
                                    +
                                </button>
                            </div>

                            <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-3 hover:text-white transition-all hover:scale-105 active:scale-95 inline-block cursor-pointer"
                            >
                                REMOVE
                            </button>
                        </div>
                        <div className="text-sm font-bold text-white self-start">
                            £{item.price * item.qty}
                        </div>
                    </div>
                ))}
            </div>

            {/* Discount Code */}
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Discount code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors uppercase tracking-widest"
                />
                <button className="px-6 bg-zinc-800 text-zinc-300 font-bold uppercase tracking-widest text-[10px] rounded-md hover:bg-zinc-700 hover:text-white transition-colors disabled:opacity-50">
                    Apply
                </button>
            </div>

            {/* Totals */}
            <div className="pt-6 border-t border-zinc-900 space-y-2">
                <div className="flex justify-between text-xs uppercase tracking-widest text-zinc-400">
                    <span>Subtotal</span>
                    <span>£{subtotal}</span>
                </div>
                {bundleDiscount > 0 && (
                    <div className="flex justify-between text-xs uppercase tracking-widest text-green-500 font-bold">
                        <span>Bundle Savings</span>
                        <span>-£{bundleDiscount}</span>
                    </div>
                )}
                <div className="flex justify-between text-xs uppercase tracking-widest text-zinc-400">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'Free' : `£${shipping}`}</span>
                </div>
            </div>

            {/* Grand Total */}
            <div className="flex justify-between items-end pt-4 border-t border-zinc-800">
                <span className="text-sm uppercase tracking-widest font-bold text-white">Total</span>
                <div className="flex items-baseline gap-2">
                    <span className="text-xs text-zinc-500 uppercase">GBP</span>
                    <span className="text-2xl font-black italic tracking-tighter text-white">£{total}</span>
                </div>
            </div>
        </div>
    );
}
