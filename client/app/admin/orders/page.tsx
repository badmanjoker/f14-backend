'use client';

import { useAdmin } from '@/components/admin/AdminContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { useState } from 'react';

export default function OrdersPage() {
    const { orders, markAsShipped } = useAdmin();
    const [filter, setFilter] = useState<'all' | 'pending' | 'shipped'>('all');

    // Filter Logic
    const filteredOrders = orders.filter(o =>
        filter === 'all' ? true : o.status === filter
    );

    return (
        <div className="max-w-5xl mx-auto space-y-8 font-sans">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Order Management</h2>
                    <p className="text-zinc-500 text-xs font-medium tracking-wide uppercase">Real-time Order Flow</p>
                </div>

                {/* Status Filter */}
                <div className="flex gap-2 bg-[#121212] p-1 rounded-xl border border-zinc-800/50">
                    {['all', 'pending', 'shipped'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f as any)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${filter === f ? 'bg-white text-black shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                    {filteredOrders.map((order) => (
                        <OrderCard key={order._id} order={order} onShip={() => markAsShipped(order._id)} />
                    ))}
                </AnimatePresence>

                {filteredOrders.length === 0 && (
                    <div className="text-center py-20 text-zinc-600">
                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="text-sm font-medium uppercase tracking-widest">No orders found</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function OrderCard({ order, onShip }: { order: any, onShip: () => void }) {
    const [loading, setLoading] = useState(false);

    const handleShip = async () => {
        setLoading(true);
        await onShip();
        setLoading(false);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`p-6 rounded-2xl border flex items-center justify-between group transition-colors ${order.status === 'pending' ? 'bg-[#121212] border-zinc-900 shadow-xl' : 'bg-zinc-950/30 border-zinc-900/30 opacity-60 hover:opacity-100'}`}
        >
            {/* Left: Info */}
            <div className="flex items-center gap-6">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${order.status === 'pending' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {order.status === 'pending' ? <Clock size={20} /> : <CheckCircle size={20} />}
                </div>

                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <span className="text-white font-bold text-sm tracking-tight">{order.customer?.name || 'Guest Customer'}</span>
                        <span className="text-zinc-600 text-[10px] bg-zinc-900 px-2 py-0.5 rounded-full font-mono">#{order._id.substring(0, 6).toUpperCase()}</span>
                    </div>
                    <div className="text-zinc-400 text-xs flex items-center gap-2">
                        <span>{order.items?.length || 1} Item(s)</span>
                        <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                        <span>£{order.totalAmount}</span>
                        <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                        <span className="text-zinc-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            {/* Middle: Product Preview (Real Data) */}
            <div className="hidden md:block flex-1 px-8">
                {order.items && order.items.length > 0 ? (
                    <div className="bg-[#0a0a0a] p-3 rounded-lg border border-zinc-900/50 flex items-center gap-4">
                        <div className="w-8 h-8 bg-zinc-800 rounded-md flex items-center justify-center text-[10px] text-zinc-500 overflow-hidden">
                            {/* Placeholder for item image if we have one, otherwise just first letter */}
                            {order.items[0].name.charAt(0)}
                        </div>
                        <div>
                            <div className="text-xs text-white font-medium">{order.items[0].name}</div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-wide">
                                {order.items[0].size && `Size ${order.items[0].size}`}
                                {order.items.length > 1 && ` + ${order.items.length - 1} more`}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-zinc-600 text-xs italic">No items data</div>
                )}
            </div>

            {/* Right: Actions */}
            <div>
                {order.status === 'pending' ? (
                    <button
                        onClick={handleShip}
                        disabled={loading}
                        className="bg-white hover:bg-zinc-200 text-black px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <Truck size={14} /> Mark Shipped
                            </>
                        )}
                    </button>
                ) : (
                    <div className="flex items-center gap-2 text-emerald-500 px-6 py-3">
                        <Truck size={14} />
                        <span className="text-xs font-bold uppercase tracking-wider">Shipped</span>
                    </div>
                )}
            </div>

        </motion.div>
    );
}
