'use client';

import { useAdmin } from '@/components/admin/AdminContext';
import { motion } from 'framer-motion';
import { RefreshCw, Check, X, AlertCircle } from 'lucide-react';

export default function ReturnsPage() {
    const { returns, updateReturnStatus } = useAdmin();

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Returns</h2>
                <div className="flex items-center gap-2">
                    <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold">Requests & Refunds</p>
                    <span className="bg-zinc-900 border border-zinc-800 text-zinc-500 text-[9px] px-2 py-0.5 rounded-full font-mono">DB CONNECTED</span>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-6 bg-zinc-950/50 border border-zinc-900 rounded-sm">
                    <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Pending Requests</div>
                    <div className="text-3xl font-black text-white font-mono mt-2">{Array.isArray(returns) ? returns.filter(r => r?.status === 'pending').length : 0}</div>
                </div>
                <div className="p-6 bg-zinc-950/50 border border-zinc-900 rounded-sm">
                    <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Approved (This Mo)</div>
                    <div className="text-3xl font-black text-emerald-500 font-mono mt-2">{Array.isArray(returns) ? returns.filter(r => r?.status === 'approved').length : 0}</div>
                </div>
                <div className="p-6 bg-zinc-950/50 border border-zinc-900 rounded-sm">
                    <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">Refund Value</div>
                    <div className="text-3xl font-black text-white font-mono mt-2">£{Array.isArray(returns) ? returns.filter(r => r?.status === 'approved' || r?.status === 'refunded').reduce((acc, r) => acc + (r?.amount || 0), 0) : 0}</div>
                </div>
            </div>

            {/* Main Returns List */}
            <div className="space-y-4">
                {(!Array.isArray(returns) || returns.length === 0) ? (
                    <div className="text-center py-20 text-zinc-700 border border-zinc-900/50 border-dashed rounded-sm text-xs uppercase tracking-widest">
                        No active return requests
                    </div>
                ) : (
                    returns.filter(r => r && r.id).map((request) => (
                        <div key={request.id} className="bg-zinc-950/40 border border-zinc-900 p-5 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-zinc-700 transition-colors">

                            {/* Info */}
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full ${request.status === 'pending' ? 'bg-orange-500/10 text-orange-500' : request.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                                    <RefreshCw size={20} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-white font-bold text-sm">{request.productName}</span>
                                        <span className="text-[10px] bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded-sm font-mono border border-zinc-800">{request.orderId}</span>
                                    </div>
                                    <div className="text-xs text-zinc-500">
                                        Customer: <span className="text-zinc-300">{request.customerName}</span> • Reason: <span className="text-zinc-300">{request.reason}</span>
                                    </div>
                                    <div className="text-[10px] text-zinc-600 font-mono mt-2">REQUESTED ON {request.date}</div>
                                </div>
                            </div>

                            {/* Status & Actions */}
                            <div className="flex items-center gap-4 border-t md:border-t-0 border-zinc-900 md:pl-6 md:border-l pt-4 md:pt-0">
                                {request.status === 'pending' ? (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => updateReturnStatus(request.id, 'approved')}
                                            className="bg-white text-black px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-400 transition-colors flex items-center gap-2"
                                        >
                                            <Check size={12} /> Approve
                                        </button>
                                        <button
                                            onClick={() => updateReturnStatus(request.id, 'rejected')}
                                            className="bg-zinc-900 text-zinc-400 border border-zinc-800 px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:text-white hover:border-white transition-colors flex items-center gap-2"
                                        >
                                            <X size={12} /> Reject
                                        </button>
                                    </div>
                                ) : (
                                    <div className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest border rounded-sm flex items-center gap-2 ${request.status === 'approved' ? 'border-emerald-900 text-emerald-500 bg-emerald-950/20' :
                                        request.status === 'rejected' ? 'border-red-900 text-red-500 bg-red-950/20' :
                                            'border-zinc-800 text-zinc-500'
                                        }`}>
                                        {request.status === 'approved' && <Check size={12} />}
                                        {request.status === 'rejected' && <AlertCircle size={12} />}
                                        {request.status}
                                    </div>
                                )}
                            </div>

                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
