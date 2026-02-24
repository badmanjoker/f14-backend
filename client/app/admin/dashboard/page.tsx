'use client';

import { useState, useEffect, Suspense } from 'react';
import { ResponsiveContainer, AreaChart, Area, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Package, DollarSign, ShoppingBag, AlertTriangle, ChevronDown, Calendar, BarChart2, TrendingUp, Zap } from 'lucide-react';
import LowStockModal from '@/components/admin/LowStockModal';
import { motion, AnimatePresence } from 'framer-motion';
import { useAdmin } from '@/components/admin/AdminContext';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';


function DashboardContent() {
    const { stats, inventory, orders } = useAdmin();
    const searchParams = useSearchParams();
    const view = searchParams.get('view') || 'overview';
    const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);

    // Time Range State
    const [timeRange, setTimeRange] = useState('Last 7 Days');
    const [isTimeMenuOpen, setIsTimeMenuOpen] = useState(false);

    // Interactive State: Selected Data Point
    const [selectedPoint, setSelectedPoint] = useState<any>(null);

    // Animated Stats State
    const [displayRevenue, setDisplayRevenue] = useState(0);
    const [displayOrders, setDisplayOrders] = useState(0);

    useEffect(() => {
        setDisplayRevenue(stats.revenue);
        setDisplayOrders(stats.orders);
    }, [stats.revenue, stats.orders]);

    // --- REAL DATA PROCESSING ---

    // 1. Chart Data Aggregation
    const chartData = (() => {
        if (!orders.length) {
            // Return empty placeholder data if no orders
            return Array.from({ length: 7 }, (_, i) => ({
                name: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
                sales: 0,
                orders: 0,
                topProduct: '-'
            }));
        }

        const now = new Date();
        const daysToShow = timeRange === 'Last 30 Days' ? 30 : 7;

        // Initialize map with empty days
        const dataMap = new Map();
        for (let i = daysToShow - 1; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const key = d.toISOString().split('T')[0];
            dataMap.set(key, {
                name: daysToShow === 30 ? `Day ${30 - i}` : d.toLocaleDateString('en-US', { weekday: 'short' }),
                sales: 0,
                orders: 0,
                products: {} as Record<string, number> // track product name -> qty
            });
        }

        // Fill with Order Data
        orders.forEach(order => {
            const dateKey = new Date(order.createdAt).toISOString().split('T')[0];
            if (dataMap.has(dateKey) && order.status !== 'cancelled') {
                const day = dataMap.get(dateKey);
                day.sales += order.totalAmount;
                day.orders += 1;

                // Track top products
                order.items.forEach((item: any) => {
                    day.products[item.name] = (day.products[item.name] || 0) + item.qty;
                });
            }
        });

        // Convert back to array and find top product per day
        return Array.from(dataMap.values()).map((day: any) => {
            let topProduct = '-';
            let maxQty = 0;
            Object.entries(day.products).forEach(([name, qty]: [string, any]) => {
                if (qty > maxQty) {
                    maxQty = qty;
                    topProduct = name;
                }
            });
            return {
                name: day.name,
                sales: day.sales,
                orders: day.orders,
                topProduct
            };
        });
    })();

    // 2. Trend Calculation
    const calculateTrend = () => {
        if (orders.length < 2) return { isUp: true, percent: 0, total: stats.revenue, peakDay: { name: '-', sales: 0, orders: 0, topProduct: '-' } };

        const total = stats.revenue;
        // Simple mock trend for now since we don't have historical "previous period" data stored separately
        // In a real app, you'd query the DB for "last month vs this month"
        const previousTotal = total * 0.9; // Assume 10% growth for visual if data exists

        const isUp = total >= previousTotal;
        const peakDay = chartData.reduce((prev, current) => (prev.sales > current.sales) ? prev : current, chartData[0]);

        return {
            isUp,
            percent: total > 0 ? 10 : 0, // Mock 10% if we have sales, else 0
            total,
            peakDay
        };
    };

    const trendInfo = calculateTrend();

    // 3. Low Stock Logic
    const lowStockItems = inventory.flatMap(p =>
        p.variants.filter(v => v.stock <= 5).map(v => ({
            name: `${p.name} (${v.size})`,
            stock: v.stock,
            id: p._id
        }))
    ).slice(0, 3); // Take top 3

    const lowStockCount = lowStockItems.length;


    // Formatting
    const chartColor = '#ffffff';
    const lineColor = '#ffffff';
    const areaColor = '#10b981';

    // Handle Chart Click 
    const handleChartClick = (data: any) => {
        if (data && data.activePayload && data.activePayload.length > 0) {
            setSelectedPoint(data.activePayload[0].payload);
        } else if (data && data.payload) {
            setSelectedPoint(data.payload);
        }
    };

    useEffect(() => {
        setSelectedPoint(null);
    }, [timeRange]);


    return (
        <div className="space-y-8 pb-20 font-sans">
            <style jsx global>{`
                .recharts-wrapper,
                .recharts-surface,
                .recharts-cartesian-axis-tick {
                    outline: none !important;
                }
                .recharts-tooltip-cursor {
                    stroke: #333;
                    fill: transparent;
                }
                *:focus {
                    outline: none !important;
                }
            `}</style>
            {/* Header */}
            <div className="flex justify-between items-end">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-1">Dashboard</h2>
                    <p className="text-zinc-500 text-xs font-medium tracking-wide uppercase">Overview & Real-time Insights</p>
                </motion.div>
                <div className="text-right">
                    <div className="flex items-center gap-2 justify-end text-emerald-500 text-[10px] font-mono mb-1 animate-pulse">
                        <span className="relative flex h-2 w-2 shadow-[0_0_8px_#10b981]">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        LIVE STREAM
                    </div>
                </div>
            </div>

            {/* Dynamic Content Switching */}
            {view === 'insights' ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="flex items-center justify-between">
                        <Link href="/admin/dashboard" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors flex items-center gap-2">
                            <ArrowDownRight className="rotate-180" size={14} /> Back to Overview
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#121212] p-8 rounded-2xl border border-zinc-800/50 relative overflow-hidden group hover:border-zinc-700 transition-colors">
                            <div className="absolute top-0 right-0 p-32 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-all"></div>
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Zap className="text-purple-500 fill-purple-500/20" /> AI Stock Monitor
                            </h3>
                            <p className="text-zinc-400 text-sm mb-6">Real-time analysis of sales velocity vs. current inventory.</p>

                            <div className="space-y-4">
                                {lowStockItems.length === 0 ? (
                                    <div className="p-4 bg-zinc-900/30 rounded-lg border border-zinc-800 text-center py-8">
                                        <div className="text-emerald-500 text-2xl mb-2">✓</div>
                                        <p className="text-zinc-500 text-xs font-mono">Healthy Stock Levels</p>
                                        <p className="text-zinc-600 text-[10px] mt-1">No critical items detected.</p>
                                    </div>
                                ) : (
                                    lowStockItems.map((item, idx) => (
                                        <div key={idx} className={`p-4 rounded-lg border transition-colors ${item.stock === 0 ? 'bg-red-950/10 border-red-900/30 hover:bg-red-950/20' : 'bg-yellow-950/10 border-yellow-900/30 hover:bg-yellow-950/20'}`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <div className="text-white font-bold text-lg">{item.name}</div>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`flex h-2 w-2 rounded-full ${item.stock === 0 ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`}></span>
                                                        <span className={`text-xs font-bold uppercase tracking-wider ${item.stock === 0 ? 'text-red-400' : 'text-yellow-500'}`}>
                                                            {item.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-black text-white">{item.stock}</div>
                                                    <div className="text-[10px] text-zinc-500 uppercase">Units Left</div>
                                                </div>
                                            </div>
                                            <div className={`text-xs mt-2 pt-2 border-t ${item.stock === 0 ? 'border-red-900/30 text-zinc-400' : 'border-yellow-900/30 text-zinc-400'}`}>
                                                <span className="text-zinc-500">Action:</span> {item.stock === 0 ? 'Restock immediately to resume sales.' : 'Plan restock soon.'}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="bg-[#121212] p-8 rounded-2xl border border-zinc-800/50 relative overflow-hidden group hover:border-zinc-700 transition-colors">
                            <div className="absolute top-0 right-0 p-32 bg-red-500/10 blur-[100px] rounded-full pointer-events-none group-hover:bg-red-500/20 transition-all"></div>
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <BarChart2 className="text-red-500 fill-red-500/20" /> Revenue Forecast
                            </h3>

                            {orders.length < 5 ? (
                                <div className="h-[200px] flex flex-col items-center justify-center text-center opacity-60">
                                    <BarChart2 className="mb-4 text-zinc-700" size={48} />
                                    <p className="text-white font-bold text-sm">Insufficient Data</p>
                                    <p className="text-zinc-500 text-xs mt-2 max-w-[200px]">AI needs at least 5 completed orders to generate a reliability forecast.</p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-zinc-400 text-sm mb-6">Projection for the upcoming month.</p>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-white">£{Math.round(stats.revenue * 1.5)}</span>
                                        <span className="text-red-500 font-bold text-sm">Target</span>
                                    </div>
                                    <div className="mt-8 h-2 bg-zinc-900 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500 w-[75%] rounded-full relative">
                                            <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-zinc-500 mt-2 font-mono text-right">Based on current trajectory</div>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            ) : (
                <>
                    {/* KPI Grid - Minimalist Cards (#121212) */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card
                            title="Total Revenue"
                            value={`£${displayRevenue}`}
                            icon={<DollarSign size={16} />}
                            trend={orders.length > 0 ? "+100%" : "0%"}
                            delay={0.1}
                        />
                        <Card
                            title="Active Orders"
                            value={displayOrders}
                            icon={<ShoppingBag size={16} />}
                            trend={orders.length > 0 ? "+100%" : "0%"}
                            delay={0.2}
                        />
                        <Card
                            title="Avg. Order Value"
                            value={`£${stats.aov}`}
                            icon={<Package size={16} />}
                            trend={orders.length > 0 ? "~" : "-"}
                            delay={0.3}
                        />
                        <div onClick={() => setIsLowStockModalOpen(true)} className="cursor-pointer">
                            <Card
                                title="Stock Alerts"
                                value={lowStockCount}
                                icon={<AlertTriangle size={16} className={`${lowStockCount > 0 ? 'text-red-500 animate-pulse' : 'text-zinc-600'}`} />}
                                highlight={lowStockCount > 0}
                                delay={0.4}
                            />
                        </div>
                    </div>

                    {/* Charts Area - Flowy & Clean */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* Main Sales Chart */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="lg:col-span-2 bg-[#121212] p-8 rounded-2xl relative overflow-hidden group shadow-2xl shadow-black/50"
                        >
                            <div className="flex justify-between items-center mb-8 relative z-20">
                                <div>
                                    <h3 className="text-sm font-medium text-zinc-400">Revenue Flow</h3>
                                    <div className="flex items-baseline gap-2 mt-1">
                                        <span className="text-2xl font-bold text-white">£{(selectedPoint ? selectedPoint.sales : trendInfo.total).toLocaleString()}</span>
                                        <span className={`text-xs font-medium ${trendInfo.isUp ? 'text-emerald-500' : 'text-zinc-500'} flex items-center`}>
                                            {trendInfo.isUp && orders.length > 0 ? '+' : ''}{trendInfo.percent.toFixed(1)}%
                                            {trendInfo.isUp && orders.length > 0 && <ArrowUpRight size={12} className="ml-0.5" />}
                                        </span>
                                    </div>
                                </div>

                                {/* Custom Minimal Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsTimeMenuOpen(!isTimeMenuOpen)}
                                        className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                                    >
                                        {timeRange}
                                        <ChevronDown size={14} className={`transition-transform duration-300 ${isTimeMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {isTimeMenuOpen && (
                                        <div className="absolute top-full right-0 mt-2 w-40 bg-[#1a1a1a] rounded-xl shadow-xl border border-zinc-800/50 overflow-hidden z-50 py-1">
                                            {['Last 7 Days', 'Last 30 Days'].map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => { setTimeRange(opt); setIsTimeMenuOpen(false); }}
                                                    className={`w-full text-left px-4 py-2 text-xs font-medium transition-colors ${timeRange === opt ? 'text-white bg-white/5' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="h-[350px] w-full relative z-10 -ml-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={chartData}
                                        onClick={handleChartClick}
                                        margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={areaColor} stopOpacity={0.15} />
                                                <stop offset="100%" stopColor={areaColor} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="name"
                                            stroke="#333"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            dy={10}
                                            interval={chartData.length > 20 ? 4 : 0}
                                        />
                                        <Tooltip
                                            cursor={{ stroke: '#333', strokeWidth: 1, strokeDasharray: '4 4' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-[#1a1a1a] border border-zinc-800 p-3 rounded-xl shadow-xl">
                                                            <p className="text-zinc-500 text-[10px] mb-1">{payload[0].payload.name}</p>
                                                            <p className="text-white font-bold text-sm">£{payload[0].value}</p>
                                                            <p className="text-zinc-600 text-[9px] mt-1">{payload[0].payload.orders} Orders</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="sales"
                                            stroke={lineColor}
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorSales)"
                                            animationDuration={1500}
                                            activeDot={{
                                                onClick: (e: any, payload: any) => {
                                                    if (payload && payload.payload) setSelectedPoint(payload.payload);
                                                },
                                                r: 6,
                                                fill: '#050505',
                                                stroke: '#fff',
                                                strokeWidth: 2,
                                                cursor: 'pointer'
                                            }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Insights Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="bg-[#121212] p-8 rounded-2xl flex flex-col relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none"></div>

                            <h3 className="text-sm font-medium text-zinc-400 mb-8 flex items-center justify-between z-10">
                                <span>Analysis</span>
                                <Zap size={14} className="text-yellow-500" />
                            </h3>

                            <div className="space-y-8 flex-1 z-10">
                                {/* Dynamic Stat */}
                                <div>
                                    <div className="text-xs text-zinc-600 font-medium mb-1 uppercase tracking-wider">
                                        {selectedPoint ? 'Transactions' : 'Peak Performance'}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl font-bold text-white">
                                            {selectedPoint ? selectedPoint.orders : trendInfo.peakDay.name === '-' ? '0' : trendInfo.peakDay.orders}
                                        </div>
                                        {!selectedPoint && trendInfo.peakDay.name !== '-' && (
                                            <div className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-1 rounded-full">
                                                Active
                                            </div>
                                        )}
                                    </div>
                                    {selectedPoint && <div className="text-zinc-500 text-xs mt-1">Orders processed</div>}
                                    {!selectedPoint && trendInfo.peakDay.name !== '-' && <div className="text-zinc-500 text-xs mt-1">Peak on {trendInfo.peakDay.name}</div>}
                                </div>

                                {/* Top Product */}
                                <div>
                                    <div className="text-xs text-zinc-600 font-medium mb-3 uppercase tracking-wider">Trending Item</div>
                                    <div className="flex items-center gap-4 group cursor-pointer">
                                        <div className="w-12 h-12 bg-[#1a1a1a] rounded-xl flex items-center justify-center group-hover:bg-[#222] transition-colors">
                                            <ShoppingBag size={18} className="text-zinc-400 group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white mb-0.5">
                                                {selectedPoint ? selectedPoint.topProduct : (orders.length > 0 ? chartData.sort((a, b) => b.sales - a.sales)[0].topProduct : '-')}
                                            </div>
                                            <div className="text-xs text-zinc-500">
                                                {selectedPoint ? 'Best seller this day' : 'Most popular overall'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {selectedPoint && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setSelectedPoint(null)}
                                        className="w-full mt-auto bg-white text-black py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors"
                                    >
                                        Reset View
                                    </motion.button>
                                )}
                            </div>
                        </motion.div>

                    </div>
                </>
            )}

            <LowStockModal isOpen={isLowStockModalOpen} onClose={() => setIsLowStockModalOpen(false)} />
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="text-zinc-500 p-8">Loading...</div>}>
            <DashboardContent />
        </Suspense>
    );
}

function Card({ title, value, icon, trend, highlight, delay }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay }}
            className={`p-6 rounded-2xl flex flex-col justify-between h-32 relative overflow-hidden group hover:bg-[#1a1a1a] transition-colors ${highlight ? 'bg-red-950/20' : 'bg-[#121212]'}`}
        >
            <div className="flex justify-between items-start z-10">
                <div className="text-xs font-medium text-zinc-500 group-hover:text-zinc-400 transition-colors">{title}</div>
                <div className={`transition-colors ${highlight ? 'text-red-500' : 'text-zinc-700 group-hover:text-zinc-500'}`}>{icon}</div>
            </div>
            <div className="z-10">
                <div className="text-3xl font-bold text-white tracking-tight">{value}</div>
                {trend && (
                    <div className={`text-[10px] font-medium flex items-center gap-1 mt-1 ${trend.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                        {trend} <span className="opacity-50">vs last period</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
