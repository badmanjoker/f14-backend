'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSettings } from '@/components/SettingsContext';

export type CartItem = {
    id: string; // Unique ID (product ID + size)
    productId: string;
    name: string;
    price: number;
    size: string;
    qty: number;
    image: string;
};

type CartContextType = {
    cart: CartItem[];
    cartOpen: boolean;
    checkoutOpen: boolean;
    toggleCart: () => void;
    toggleCheckout: () => void;
    addToCart: (product: any, size: string, qty: number, suppressToast?: boolean) => void;
    removeFromCart: (id: string) => void;
    updateQty: (id: string, delta: number) => void;
    updateSize: (id: string, newSize: string) => void;
    itemCount: number;
    subtotal: number;
    bundleDiscount: number;
    activeBundleNames: string[];
    potentialBundles: any[];
    suggestedBundles: any[];
    allActiveBundles: any[];
    showToast: boolean;
    setShowToast: (v: boolean) => void;
    toastId: number;
    clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const { getSetting } = useSettings();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [checkoutOpen, setCheckoutOpen] = useState(false);

    const [showToast, setShowToast] = useState(false);
    const [toastId, setToastId] = useState(0);

    // New Dynamic Bundle Logic
    const [activeBundles, setActiveBundles] = useState<any[]>([]);

    useEffect(() => {
        const fetchBundles = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const res = await fetch(`${apiUrl}/api/bundles`);
                const data = await res.json();
                // Filter for active bundles only
                setActiveBundles(data.filter((b: any) => b.active));
            } catch (err) {
                console.error("Failed to fetch bundles for cart", err);
            }
        };
        fetchBundles();
        // Refresh bundles every 30 seconds or when cart changes? 
        // For now, on mount is fine, but let's poll slightly.
        const interval = setInterval(fetchBundles, 30000);
        return () => clearInterval(interval);
    }, []);

    const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    const calculateBundleDiscount = () => {
        let totalDiscount = 0;
        let appliedBundles: string[] = [];
        let potentialBundles: any[] = [];
        let suggestedBundles: any[] = [];

        activeBundles.forEach(bundle => {
            const products = bundle.products || [];
            // Count total quantity of items in cart that are part of this bundle
            const eligibleItems = cart.filter(item =>
                products.some((p: any) => (p._id || p) === item.productId)
            );

            const totalQty = eligibleItems.reduce((sum, item) => sum + item.qty, 0);
            const minQty = bundle.minQuantity || 2;

            if (totalQty >= minQty) {
                if (bundle.isPercentage) {
                    totalDiscount += (subtotal * (bundle.discount / 100));
                } else {
                    totalDiscount += bundle.discount;
                }
                appliedBundles.push(bundle.name);
            } else if (totalQty > 0) {
                potentialBundles.push({
                    name: bundle.name,
                    currentQty: totalQty,
                    minQuantity: minQty,
                    missingQty: minQty - totalQty,
                    discount: bundle.discount,
                    isPercentage: bundle.isPercentage
                });
            } else {
                suggestedBundles.push({
                    name: bundle.name,
                    minQuantity: minQty,
                    discount: bundle.discount,
                    isPercentage: bundle.isPercentage
                });
            }
        });

        return { totalDiscount, appliedBundles, potentialBundles, suggestedBundles };
    };

    const {
        totalDiscount: bundleDiscount,
        appliedBundles: activeBundleNames,
        potentialBundles,
        suggestedBundles
    } = calculateBundleDiscount();

    const toggleCart = () => setCartOpen(!cartOpen);
    const toggleCheckout = () => {
        setCheckoutOpen(!checkoutOpen);
        if (!checkoutOpen) setCartOpen(false);
    };

    const addToCart = (product: any, size: string, qty: number, suppressToast = false) => {
        const uniqueId = `${product.id || product._id}-${size}`;
        setCart((prev) => {
            const existing = prev.find((item) => item.id === uniqueId);
            if (existing) {
                return prev.map((item) =>
                    item.id === uniqueId ? { ...item, qty: item.qty + qty } : item
                );
            }
            return [
                ...prev,
                {
                    id: uniqueId,
                    productId: product.id || product._id,
                    name: product.name,
                    price: typeof product.price === 'number' ? product.price : 0,
                    size,
                    qty,
                    image: product.image,
                },
            ];
        });
        if (!suppressToast) {
            setShowToast(true);
            setToastId(Date.now());
        }
    };

    const removeFromCart = (id: string) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const updateQty = (id: string, delta: number) => {
        setCart((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const newQty = item.qty + delta;
                    return newQty > 0 ? { ...item, qty: newQty } : item;
                }
                return item;
            })
        );
    };

    const updateSize = (id: string, newSize: string) => {
        setCart((prev) => {
            const currentItem = prev.find((item) => item.id === id);
            if (!currentItem) return prev;

            const newId = `${currentItem.productId}-${newSize}`;
            const targetItem = prev.find((item) => item.id === newId);

            if (targetItem && targetItem.id !== id) {
                return prev
                    .filter((item) => item.id !== id)
                    .map((item) =>
                        item.id === newId
                            ? { ...item, qty: item.qty + currentItem.qty }
                            : item
                    );
            } else {
                return prev.map((item) =>
                    item.id === id ? { ...item, id: newId, size: newSize } : item
                );
            }
        });
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                cartOpen,
                checkoutOpen,
                toggleCart,
                toggleCheckout,
                addToCart,
                removeFromCart,
                updateQty,
                updateSize,
                itemCount,
                subtotal,
                bundleDiscount,
                activeBundleNames,
                potentialBundles,
                suggestedBundles,
                allActiveBundles: activeBundles,
                showToast,
                setShowToast,
                toastId,
                clearCart: () => setCart([])
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
