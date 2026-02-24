'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Plus, Package, ArrowRight } from 'lucide-react';
import { useAdmin } from './AdminContext';
import { useState } from 'react';

interface LowStockModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function LowStockModal({ isOpen, onClose }: LowStockModalProps) {
    const { inventory, updateStock } = useAdmin();
    const [restockingIds, setRestockingIds] = useState<string[]>([]);

    const lowStockItems = inventory.flatMap(product =>
        product.variants
            .filter(v => v.stock <= 5)
            .map(v => ({
                id: product._id,
                name: product.name,
                image: product.image, // Ensure this exists in your data
                size: v.size,
                color: v.color,
                stock: v.stock,
                variantIndex: product.variants.indexOf(v) // Need index for update
            }))
    );

    const handleQuickRestock = async (productId: string, variantIndex: number, currentStock: number) => {
        const key = `${productId}-${variantIndex}`;
        setRestockingIds(prev => [...prev, key]);

        // Add +10 stock
        await updateStock(productId, variantIndex, currentStock + 10);

        // Remove loading state after short delay
        setTimeout(() => {
            setRestockingIds(prev => prev.filter(k => k !== key));
        }, 500);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center z-[70] pointer-events-none p-4"
                    >
                        <div className="bg-zinc-950 border border-zinc-800 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col rounded-sm shadow-2xl pointer-events-auto">
                            {/* Header */}
                            <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/30">
                                <div>
                                    <h3 className="text-xl font-black italic uppercase text-white flex items-center gap-2">
                                        <AlertTriangle className="text-red-500" size={20} />
                                        Critical Inventory Alerts
                                    </h3>
                                    <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-1">
                                        Action Required: {lowStockItems.length} items below threshold
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-3">
                                {lowStockItems.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-40 text-zinc-500">
                                        <Package size={40} className="mb-4 opacity-20" />
                                        <p className="text-sm font-bold uppercase tracking-widest">All Systems Operational</p>
                                        <p className="text-xs mt-2">No low stock items detected.</p>
                                    </div>
                                ) : (
                                    lowStockItems.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-zinc-900/20 border border-zinc-900 p-4 hover:border-zinc-700 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-zinc-800 rounded-sm overflow-hidden relative">
                                                    {/* Simple fallback if image missing/loading, assumes updated context includes images */}
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-500 font-bold">IMG</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white uppercase">{item.name}</div>
                                                    <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-2">
                                                        SIZE: <span className="text-white">{item.size}</span>
                                                        <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                                                        STOCK: <span className={`font-bold ${item.stock === 0 ? 'text-red-500' : 'text-orange-500'}`}>{item.stock}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleQuickRestock(item.id, item.variantIndex, item.stock)}
                                                disabled={restockingIds.includes(`${item.id}-${item.variantIndex}`)}
                                                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-white hover:text-black hover:border-white transition-all text-[10px] font-bold uppercase tracking-widest group/btn disabled:opacity-50 disabled:cursor-wait"
                                            >
                                                {restockingIds.includes(`${item.id}-${item.variantIndex}`) ? (
                                                    'Updating...'
                                                ) : (
                                                    <>
                                                        <Plus size={12} /> Quick Restock (+10)
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-zinc-950 border-t border-zinc-900 text-center">
                                <button onClick={onClose} className="text-[10px] text-zinc-500 hover:text-white uppercase font-bold tracking-widest flex items-center justify-center gap-2 mx-auto">
                                    Full Inventory Report <ArrowRight size={12} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
