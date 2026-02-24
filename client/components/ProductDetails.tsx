'use client';

import { PRODUCTS } from '@/constants/products';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import GlobalHeader from '@/components/GlobalHeader';
import GlobalFooter from '@/components/GlobalFooter';
import SizeGuideModal from '@/components/SizeGuideModal';
import { useSettings } from '@/components/SettingsContext';
import { useEffect } from 'react';

export default function ProductDetails({ productId }: { productId: string }) {
    const router = useRouter();
    const { addToCart } = useCart();

    const { getSetting, loading: settingsLoading } = useSettings();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

    const formatImgUrl = (path: string) => {
        if (!path) return '/cbr.png';
        if (path.startsWith('http')) return path;
        if (path.startsWith('/uploads/')) return `${API_URL}${path}`;
        return path;
    };

    // Find product
    const product = PRODUCTS.find(p => p.id === productId);

    const [selectedSize, setSelectedSize] = useState('M');
    const [qty, setQty] = useState(1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

    // Real-time Stock State
    const [dbProduct, setDbProduct] = useState<any>(null);

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        // Fetch real-time stock
        fetch(`${apiUrl}/api/products`)
            .then(res => res.json())
            .then(data => {
                // Determine slug based on productId (e.g. 'hoodie' -> 'zipper-hoodie' or whatever DB has)
                // Actually we standardized slugs to 'hoodie', 'pants', 'tee' in the previous step!
                const found = data.find((p: any) => p.slug === productId || p.id === productId);
                if (found) setDbProduct(found);
            })
            .catch(err => console.error("Stock fetch error:", err));
    }, [productId]);

    const currentVariant = dbProduct?.variants?.find((v: any) => v.size === selectedSize);
    // If we haven't fetched DB data yet, assume available (or loading). 
    // BUT for safety, if we have DB data, use it.
    const isAvailable = dbProduct ? (currentVariant?.stock > 0) : true;


    // Lock Logic
    useEffect(() => {
        if (!settingsLoading) {
            const timerActive = getSetting('timer_active', 'false') === 'true';
            if (timerActive) {
                router.replace('/');
            }
        }
    }, [settingsLoading, getSetting, router]);

    if (settingsLoading) return null;

    if (!product) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bebas mb-4">Product Not Found</h1>
                    <Link href="/" className="text-zinc-500 hover:text-white underline cursor-pointer">Return Home</Link>
                </div>
            </div>
        );
    }

    // Gallery logic
    let gallery = [product.image];
    if (dbProduct?.images && dbProduct.images.length > 0) {
        gallery = dbProduct.images;
    } else if (product.id === 'tee') {
        // Fallback for legacy hardcoded tee images if not in DB
        gallery.push('/leo1.jpg', '/anna1.jpg', '/leo2.jpg', '/anna2.jpg');
    }

    return (
        <main className="bg-black min-h-screen text-white pb-20">
            <GlobalHeader />

            <div className="pt-32 max-w-7xl mx-auto px-6">
                <Link href="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white mb-8 transition-all hover:translate-x-[-4px] cursor-pointer group">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-1 transition-transform">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Home
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Visuals (Gallery) */}
                    <div className="space-y-4">
                        <div className="relative aspect-[4/5] w-full border border-zinc-900 bg-zinc-900/50">
                            <Image
                                src={formatImgUrl(gallery[activeImageIndex])}
                                alt={product.name}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                        {gallery.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {gallery.map((src, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImageIndex(i)}
                                        className={`relative w-20 h-24 flex-shrink-0 border transition-all cursor-pointer hover:scale-105 active:scale-95 ${activeImageIndex === i ? 'border-white' : 'border-zinc-800 hover:border-zinc-600'}`}
                                    >
                                        <Image src={formatImgUrl(src)} alt="thumbnail" fill className="object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-col h-full pt-10">
                        <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter mb-4 leading-none">{product.name}</h1>
                        <div className="flex items-center gap-4 mb-8">
                            <p className="text-2xl font-mono text-zinc-400">£{product.price}</p>
                            {dbProduct?.originalPrice && dbProduct.originalPrice > (product.price as number) && (
                                <>
                                    <p className="text-lg font-mono text-zinc-600 line-through italic">£{dbProduct.originalPrice}</p>
                                    <span className="bg-red-600 text-white text-[10px] font-black px-2 py-1 uppercase tracking-widest">SALE</span>
                                </>
                            )}
                        </div>

                        {/* Bundle Offer Alert */}
                        {(() => {
                            const { allActiveBundles } = useCart();
                            const relevantBundle = allActiveBundles?.find(b =>
                                (b.products || []).some((p: any) => (p._id || p) === productId || (p.slug || p) === productId)
                            );
                            if (!relevantBundle) return null;
                            return (
                                <div className="mb-8 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-lg animate-up group hover:bg-emerald-500/10 transition-all cursor-default">
                                    <div className="flex items-center gap-3 mb-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Bundle Offer</p>
                                    </div>
                                    <p className="text-sm font-bold text-white uppercase tracking-tight">
                                        Köp {relevantBundle.minQuantity || 2} st valfria varor från {relevantBundle.name} och få {relevantBundle.isPercentage ? `${relevantBundle.discount}%` : `£${relevantBundle.discount}`} rabatt!
                                    </p>
                                </div>
                            );
                        })()}

                        <div className="prose prose-invert prose-sm mb-12 text-zinc-300">
                            <p>{product.description}</p>
                            <p className="mt-4 text-xs uppercase tracking-widest text-zinc-500">
                                • 100% Organic Cotton<br />
                                • Heavyweight Fabric
                            </p>
                        </div>

                        <div className="mt-auto space-y-6">
                            {/* Size Selector */}
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Select Size</span>
                                    <button
                                        onClick={() => setIsSizeGuideOpen(true)}
                                        className="text-xs underline text-zinc-500 hover:text-white cursor-pointer transition-all hover:scale-105 active:scale-95 origin-right"
                                    >
                                        Size Guide
                                    </button>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    {['S', 'M', 'L', 'XL'].map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`h-12 border font-bold uppercase transition-all cursor-pointer hover:scale-105 active:scale-95 ${selectedSize === size ? 'bg-white text-black border-white' : 'border-zinc-800 text-zinc-400 hover:border-zinc-600'}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Add to Cart */}
                            <div className="flex gap-4 h-14">
                                <div className="flex items-center border border-zinc-800 hover:border-zinc-600 transition-colors bg-zinc-900/50">
                                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-12 h-full hover:bg-zinc-800 cursor-pointer transition-all active:scale-75" disabled={!isAvailable}>-</button>
                                    <span className="w-12 text-center font-bold flex items-center justify-center">{qty}</span>
                                    <button onClick={() => setQty(q => q + 1)} className="w-12 h-full hover:bg-zinc-800 cursor-pointer transition-all active:scale-75" disabled={!isAvailable}>+</button>
                                </div>
                                <button
                                    onClick={() => addToCart({
                                        id: product.id,
                                        name: product.name,
                                        price: product.price,
                                        image: product.image,
                                        description: product.description,
                                        stock: currentVariant?.stock || 0
                                    }, selectedSize, qty, true)}
                                    disabled={!isAvailable}
                                    className={`flex-1 font-black uppercase tracking-[0.2em] transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${isAvailable
                                        ? 'bg-white text-black hover:bg-zinc-200 hover:shadow-2xl hover:shadow-white/10'
                                        : 'bg-red-900/20 text-red-500 border border-red-900 cursor-not-allowed'
                                        }`}
                                >
                                    {isAvailable ? `Add to Cart — £${(product.price as number) * qty}` : 'SOLD OUT'}
                                </button>
                            </div>

                            {/* Low Stock Warning */}
                            {isAvailable && (currentVariant?.stock || 0) < 5 && (
                                <p className="text-red-500 text-[10px] uppercase font-bold mt-2 tracking-widest animate-pulse">
                                    Only {currentVariant?.stock} Left!
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-20">
                <GlobalFooter />
            </div>

            <SizeGuideModal
                isOpen={isSizeGuideOpen}
                onClose={() => setIsSizeGuideOpen(false)}
                sizeGuide={dbProduct?.sizeGuide || product.id}
            />
        </main>
    );
}
