'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import HUD from './HUD';
import SizeGuideModal from './SizeGuideModal';
import { useSettings } from '@/components/SettingsContext';

interface Variant {
    size: string;
    color: string;
    stock: number;
}

interface Product {
    _id: string;
    id: string; // for compatibility with legacy manual ID, mapped from slug or _id
    name: string;
    price: number | string;
    originalPrice?: number;
    image: string;
    images?: string[]; // Added images array
    showSlideshow: boolean; // [NEW]
    description: string;
    badge: string | null;
    badgeColor: string | null;
    stock: number;
    variants: Variant[];
    sizeGuide?: string; // [NEW] 
    available: boolean; // Computed on the fly
}

interface SupplyProps {
    onBack: () => void;
}

export default function Supply({ onBack }: SupplyProps) {
    const { addToCart } = useCart();
    const { getSetting, loading: settingsLoading, refreshSettings } = useSettings();
    const bgImage = getSetting('supply_bg', '/cbr.png');
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://f14-backend.onrender.com';

    const formatImgUrl = (path: string) => {
        if (!path) return '/cbr.png';
        if (path.startsWith('http')) return path;
        if (path.startsWith('/uploads/')) return `${API_URL}${path}`;
        return path;
    };

    // Data State
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Selection State
    const [selections, setSelections] = useState<Record<string, { size: string, qty: number }>>({});

    // Size Guide State
    const [sizeGuideValue, setSizeGuideValue] = useState<string | null>(null);
    const [openQtyId, setOpenQtyId] = useState<string | null>(null);

    // Dynamic Slideshow State (Generalized)
    const [slideshowIndices, setSlideshowIndices] = useState<Record<string, number>>({});

    // --- LAUNCH TIMER LOGIC ---
    const timerActive = getSetting('timer_active', 'false') === 'true';
    const isShopOpen = !timerActive;
    // --------------------------

    useEffect(() => {
        const interval = setInterval(() => {
            setSlideshowIndices(prev => {
                const next = { ...prev };
                products.forEach(p => {
                    if (p.showSlideshow && p.images && p.images.length > 1) {
                        next[p.id] = ((next[p.id] || 0) + 1) % p.images.length;
                    }
                });
                return next;
            });
        }, 4000); // Switch every 4 seconds
        return () => clearInterval(interval);
    }, [products]);

    // Fetch Products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://f14-backend.onrender.com'}/api/products`);
                const data = await res.json();

                // Map DB data to Frontend structure and initialize selections
                const mappedProducts = data.map((p: any) => {
                    // Calculate real total stock from variants
                    const totalStock = p.variants ? p.variants.reduce((acc: number, v: any) => acc + (v.stock || 0), 0) : (p.stock || 0);

                    // Normalize ID for frontend logic (hoodie, pants, etc)
                    let normalizedId = p.slug || p._id;
                    if (normalizedId.includes('hoodie')) normalizedId = 'hoodie';
                    if (normalizedId.includes('sweat') || normalizedId.includes('pant')) normalizedId = 'pants';
                    if (normalizedId.includes('tee')) normalizedId = 'tee';

                    return {
                        ...p,
                        id: normalizedId,
                        available: totalStock > 0
                    };
                });

                setProducts(mappedProducts);

                // Initialize selections and slideshow indices
                const initialSelections: Record<string, { size: string, qty: number }> = {};
                const initialSlides: Record<string, number> = {};
                mappedProducts.forEach((p: Product) => {
                    initialSelections[p.id] = { size: 'S', qty: 1 };
                    initialSlides[p.id] = 0;
                });
                setSelections(initialSelections);
                setSlideshowIndices(initialSlides);
            } catch (error) {
                console.error("Failed to load products", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();

        const poll = setInterval(() => {
            fetchProducts();
            refreshSettings(); // Check if shop has been opened/locked
        }, 10000);
        return () => clearInterval(poll);
    }, []);

    const updateSelection = (id: string, field: 'size' | 'qty', value: string | number) => {
        setSelections(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    const handleAddToCart = (product: Product) => {
        const sel = selections[product.id];
        const variant = product.variants?.find(v => v.size === sel.size);

        // Safety check
        if (!variant || variant.stock < sel.qty) {
            alert("Sorry, not enough stock!");
            return;
        }

        addToCart({
            id: product.id,
            name: product.name,
            price: typeof product.price === 'string' ? 0 : product.price,
            image: product.image, // Use main image
            description: product.description,
            stock: variant.stock
        }, sel.size, sel.qty);
    };

    // Helper to check stock status
    const getVariantStatus = (product: Product, size: string) => {
        const variant = product.variants?.find(v => v.size === size);
        if (!variant) return 'unavailable';
        if (variant.stock === 0) return 'sold-out';
        if (variant.stock < 10) return 'low-stock'; // "Low in stock" logic requested by user
        return 'in-stock';
    };

    if (loading || settingsLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }



    return (
        <section id="supply" className="relative pt-24 md:pt-32 pb-12 md:pb-20 bg-black min-h-screen">
            {/* Background (Fixed) */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <Image
                    src={formatImgUrl(bgImage)}
                    alt="Supply Background"
                    fill
                    className="object-cover opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black"></div>
            </div>

            <div className="relative z-20 max-w-7xl mx-auto px-6">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-16 text-center street-font text-white"
                >
                    Supply
                </motion.h1>



                {/* SHOW PRODUCTS ONLY IF SHOP IS OPEN */}
                {isShopOpen ? (
                    <>
                        {/* No products message */}
                        {products.length === 0 && (
                            <div className="text-center py-20">
                                <p className="text-red-500 font-bold uppercase tracking-widest text-xl">
                                    NO PRODUCTS FOUND IN DATABASE
                                </p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16">
                            {products.map((product, index) => {
                                const currentSelection = selections[product.id] || { size: 'S', qty: 1 };
                                const currentVariant = product.variants?.find(v => v.size === currentSelection.size);
                                const isOutOfStock = !currentVariant || currentVariant.stock === 0;

                                const hasImages = product.images && product.images.length > 0;
                                const slideIndex = slideshowIndices[product.id] || 0;
                                const displayImages = hasImages ? product.images! : [product.image];

                                return (
                                    <div key={product.id} className="group h-full transition-all duration-500 hover:scale-[1.02]">
                                        <div className="prod-card-bg p-4 h-full flex flex-col border border-transparent hover:border-zinc-800 transition-colors">
                                            <div className="aspect-[4/5] overflow-hidden bg-black/50 border border-zinc-800 relative flex-shrink-0 group cursor-pointer hover:shadow-2xl hover:shadow-white/5 transition-all">
                                                <Link href={`/product/${product.id}`} className="block h-full w-full relative cursor-pointer">
                                                    <AnimatePresence mode="wait">
                                                        <motion.div
                                                            key={slideIndex}
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            transition={{ duration: 0.8 }}
                                                            className="absolute inset-0"
                                                        >
                                                            <Image
                                                                src={formatImgUrl(displayImages[slideIndex])}
                                                                alt={product.name}
                                                                fill
                                                                className={`prod-img object-center object-cover ${!product.available ? 'sold-out-img' : ''} transition-transform duration-700`}
                                                            />
                                                        </motion.div>
                                                    </AnimatePresence>
                                                </Link>

                                                {/* Badge Logic - Driven by Real Data */}
                                                {product.badge && (
                                                    <div className={`absolute top-2 right-2 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest z-20 ${product.badge === 'Low Stock' ? 'bg-red-600 animate-pulse' : 'bg-zinc-800'}`}>
                                                        {product.badge}
                                                    </div>
                                                )}

                                                {/* SALE Badge */}
                                                {product.originalPrice && product.originalPrice > (typeof product.price === 'number' ? product.price : 0) && (
                                                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest z-20 shadow-lg">
                                                        SALE
                                                    </div>
                                                )}

                                                {/* Calculated Out of Stock Badge */}
                                                {!isOutOfStock && currentVariant && !product.badge && (
                                                    <>
                                                        {currentVariant.stock <= 5 ? (
                                                            <div className="absolute top-2 right-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest z-20 animate-pulse">
                                                                Only {currentVariant.stock} Left
                                                            </div>
                                                        ) : currentVariant.stock < 10 && (
                                                            <div className="absolute top-2 right-2 bg-zinc-800 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest z-20">
                                                                Low Stock
                                                            </div>
                                                        )}
                                                    </>
                                                )}

                                                {!product.available && (
                                                    <div className="absolute bottom-2 left-2 border border-white bg-black/80 px-2 py-1 text-[8px] font-bold uppercase tracking-widest text-white backdrop-blur-sm">
                                                        Sold Out
                                                    </div>
                                                )}
                                            </div>

                                            {/* Thumbnail Dots/Gallery if multiple images AND slideshow enabled */}
                                            {product.showSlideshow && displayImages.length > 1 && (
                                                <div className="flex gap-2 mt-3 mb-1 overflow-x-auto pb-1 scrollbar-hide">
                                                    {displayImages.map((slide, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => setSlideshowIndices(prev => ({ ...prev, [product.id]: idx }))}
                                                            className={`relative w-12 h-16 border border-zinc-800 overflow-hidden transition-all duration-300 flex-shrink-0 cursor-pointer hover:scale-105 active:scale-90 ${slideIndex === idx ? 'opacity-100 ring-1 ring-white' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}
                                                        >
                                                            <Image src={formatImgUrl(slide)} alt="Thumbnail" fill className="object-cover" />
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="mt-4 flex flex-col flex-1">
                                                <div className="prod-header">
                                                    <h3 className={`text-2xl md:text-3xl street-font uppercase mb-1 ${!product.available ? 'text-zinc-500 line-through decoration-white' : 'text-white'}`}>
                                                        {product.name}
                                                    </h3>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-lg font-black italic tracking-widest ${!product.available ? 'text-zinc-600' : 'text-zinc-400'}`}>
                                                            {typeof product.price === 'number' ? `£${product.price}` : product.price}
                                                        </span>
                                                        {product.originalPrice && product.originalPrice > (typeof product.price === 'number' ? product.price : 0) && (
                                                            <span className="text-zinc-600 text-sm line-through font-mono italic">
                                                                £{product.originalPrice}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="prod-desc leading-relaxed">
                                                    {product.description}
                                                </p>

                                                <div className="mb-2 text-right mt-auto">
                                                    <button
                                                        onClick={() => setSizeGuideValue(product.sizeGuide || (product.id === 'pants' ? 'pants' : product.id === 'tee' ? 'tee' : 'hoodie'))}
                                                        className="text-[9px] uppercase font-bold tracking-widest border-b border-zinc-600 hover:text-white hover:border-white transition-all cursor-pointer pb-0.5 hover:scale-105 active:scale-95 origin-right"
                                                    >
                                                        Size Guide
                                                    </button>
                                                </div>

                                                {/* Controls */}
                                                {product.available ? (
                                                    <div className="product-controls">
                                                        <div className="size-selector-container">
                                                            {['S', 'M', 'L', 'XL'].map(size => {
                                                                const status = getVariantStatus(product, size);
                                                                return (
                                                                    <button
                                                                        key={size}
                                                                        className={`size-chip cursor-pointer transition-all hover:scale-110 active:scale-90 ${currentSelection.size === size ? 'selected' : ''} ${status === 'sold-out' ? 'opacity-30 cursor-not-allowed line-through hover:scale-100' : ''}`}
                                                                        onClick={() => status !== 'sold-out' && updateSelection(product.id, 'size', size)}
                                                                        disabled={status === 'sold-out'}
                                                                        title={status === 'sold-out' ? 'Sold Out' : ''}
                                                                    >
                                                                        {size}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        <div className="controls-row">
                                                            <div className="relative h-full w-[70px]" onMouseLeave={() => setOpenQtyId(null)}>
                                                                <button
                                                                    className={`qty-input w-full h-full flex items-center justify-center transition-colors ${openQtyId === product.id ? 'border-white bg-zinc-900 text-white' : 'hover:border-red-600 hover:text-red-600'} ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                                                    onClick={() => !isOutOfStock && setOpenQtyId(openQtyId === product.id ? null : product.id)}
                                                                    disabled={isOutOfStock}
                                                                >
                                                                    {isOutOfStock ? 'X' : currentSelection.qty}
                                                                </button>

                                                                {openQtyId === product.id && (
                                                                    <div className="absolute top-full left-0 w-full bg-black border border-zinc-700 z-50 flex flex-col shadow-xl">
                                                                        {Array.from({ length: Math.min(5, currentVariant?.stock || 0) }, (_, i) => i + 1).map(num => (
                                                                            <button
                                                                                key={num}
                                                                                className={`p-2 text-sm font-bold transition-colors cursor-pointer ${currentSelection.qty === num
                                                                                    ? 'bg-zinc-800 text-white'
                                                                                    : 'text-zinc-400 hover:bg-red-600 hover:text-white'
                                                                                    }`}
                                                                                onClick={() => {
                                                                                    updateSelection(product.id, 'qty', num);
                                                                                    setOpenQtyId(null);
                                                                                }}
                                                                            >
                                                                                {num}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <button
                                                                onClick={() => handleAddToCart(product)}
                                                                className={`add-btn-luxury ${isOutOfStock ? 'opacity-50 cursor-not-allowed bg-zinc-900 text-zinc-600 border-zinc-900' : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl hover:shadow-red-600/10 transition-all'}`}
                                                                disabled={isOutOfStock}
                                                            >
                                                                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                                                            </button>
                                                        </div>
                                                    </div>

                                                ) : (
                                                    <div className="flex gap-2 items-end relative z-10 pt-6">
                                                        <button className="btn-disabled" disabled>SOLD OUT</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    // LOCKED STATE
                    <div className="flex flex-col items-center justify-center min-h-[40vh] animate-in fade-in zoom-in duration-1000">
                        <div className="border border-red-900/50 bg-red-950/10 p-12 text-center rounded-xl backdrop-blur-sm max-w-2xl mx-auto">
                            <h2 className="text-3xl md:text-5xl font-black italic uppercase text-red-600 mb-4 tracking-tighter animate-pulse">
                                Access Denied
                            </h2>
                            <p className="text-zinc-400 font-mono text-xs md:text-sm uppercase tracking-widest leading-relaxed">
                                The supply zone is currently locked.<br />
                                Await launch sequence completion.
                            </p>
                            <div className="mt-8">
                                <span className="inline-block px-4 py-2 border border-red-800 text-red-500 text-[10px] font-bold uppercase tracking-[0.2em] rounded animate-pulse">
                                    System Locked
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-20">
                    <HUD />
                </div>
            </div>

            <SizeGuideModal
                isOpen={!!sizeGuideValue}
                onClose={() => setSizeGuideValue(null)}
                sizeGuide={sizeGuideValue}
            />
        </section >
    );
}

