'use client';

import { useAdmin } from '@/components/admin/AdminContext';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Plus, Minus, AlertTriangle, CheckCircle, Package } from 'lucide-react';

export default function InventoryPage() {
    const { inventory, updateStock } = useAdmin();
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://f14-backend.onrender.com';

    const formatImgUrl = (path: string) => {
        if (!path) return '/cbr.png';
        if (path.startsWith('http')) return path;
        if (path.startsWith('/uploads/')) return `${API_URL}${path}`;
        return path;
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Inventory</h2>
                <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Stock & Variant Management</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-950/50 border border-zinc-900 p-4 rounded-sm flex items-center justify-between">
                    <div>
                        <div className="text-zinc-500 text-[9px] uppercase font-bold tracking-widest">Total Items</div>
                        <div className="text-2xl font-black font-mono text-white">
                            {Array.isArray(inventory) ? inventory.reduce((acc, p) => acc + ((p?.variants || []).reduce((vAcc, v) => vAcc + (v?.stock || 0), 0) || 0), 0) : 0}
                        </div>
                    </div>
                    <Package className="text-zinc-700" size={24} />
                </div>
                <div className="bg-zinc-950/50 border border-zinc-900 p-4 rounded-sm flex items-center justify-between">
                    <div>
                        <div className="text-2xl font-black font-mono text-white">
                            {Array.isArray(inventory) ? inventory.reduce((acc, p) => acc + ((p?.variants || []).filter(v => (v?.stock || 0) < 10).length || 0), 0) : 0}
                        </div>
                    </div>
                    <AlertTriangle className="text-orange-900" size={24} />
                </div>
                <div className="bg-zinc-950/50 border border-zinc-900 p-4 rounded-sm flex items-center justify-between">
                    <div>
                        <div className="text-zinc-500 text-[9px] uppercase font-bold tracking-widest">In Stock</div>
                        <div className="text-2xl font-black font-mono text-emerald-500">100%</div>
                    </div>
                    <CheckCircle className="text-emerald-900" size={24} />
                </div>
            </div>

            {/* Inventory Table */}
            <div className="space-y-6 pb-40">
                {Array.isArray(inventory) && inventory.filter(p => p).map((product) => (
                    <div key={product._id} className="bg-zinc-950/30 border border-zinc-900 rounded-sm overflow-hidden">
                        {/* Product Header */}
                        <div className="bg-zinc-900/50 p-4 flex items-center gap-4">
                            <div className="relative w-12 h-12 bg-zinc-800 rounded-sm overflow-hidden">
                                <img src={formatImgUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold uppercase text-white tracking-wider">{product.name}</h3>
                                <p className="text-[10px] text-zinc-500 font-mono">ID: {product._id.substring(0, 8).toUpperCase()}</p>
                            </div>
                        </div>

                        {/* Variants Grid */}
                        <div className="divide-y divide-zinc-900">
                            {Array.isArray(product.variants) && product.variants.map((variant, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 hover:bg-zinc-900/20 transition-colors">

                                    <div className="flex items-center gap-6">
                                        <div className="w-12">
                                            <div className="text-[10px] text-zinc-500 uppercase font-bold">Size</div>
                                            <div className="text-sm font-bold text-white">{variant.size}</div>
                                        </div>
                                        <div className="w-24">
                                            <div className="text-[10px] text-zinc-500 uppercase font-bold">Color</div>
                                            <div className="text-sm font-bold text-white">{variant.color}</div>
                                        </div>
                                        <div className="w-32">
                                            <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Status</div>
                                            {(variant.stock || 0) === 0 ? (
                                                <span className="bg-red-950 text-red-500 text-[9px] px-2 py-1 rounded-sm uppercase font-bold">Out of Stock</span>
                                            ) : (variant.stock || 0) < 10 ? (
                                                <span className="bg-orange-950 text-orange-500 text-[9px] px-2 py-1 rounded-sm uppercase font-bold animate-pulse">Low Stock</span>
                                            ) : (
                                                <span className="bg-emerald-950 text-emerald-500 text-[9px] px-2 py-1 rounded-sm uppercase font-bold">In Stock</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stock Controls */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border border-zinc-800 rounded-sm bg-black">
                                            <button
                                                onClick={() => updateStock(product._id, idx, Math.max(0, (variant.stock || 0) - 1))}
                                                className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer hover:scale-110 active:scale-90"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <input
                                                type="number"
                                                value={variant.stock || 0}
                                                onChange={(e) => updateStock(product._id, idx, Math.max(0, parseInt(e.target.value) || 0))}
                                                className="w-14 bg-transparent text-center text-sm font-mono font-bold text-white focus:outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <button
                                                onClick={() => updateStock(product._id, idx, (variant.stock || 0) + 1)}
                                                className="p-2 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer hover:scale-110 active:scale-90"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {inventory.length === 0 && (
                    <div className="text-center py-20 text-zinc-600 text-xs uppercase font-mono tracking-widest animate-pulse">
                        Loading Inventory...
                    </div>
                )}
            </div>
        </div>
    );
}
