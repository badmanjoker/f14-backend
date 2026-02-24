'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/components/SettingsContext';
import { useAdmin } from '@/components/admin/AdminContext';
import { Save, Truck, Percent, Power, Info, CheckCircle, Tag, Plus, Trash2, Edit2, X, ChevronDown, Package } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StoreSettingsPage() {
    const { getSetting, refreshSettings } = useSettings();
    const { getAuthHeaders } = useAdmin();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // State
    const [shippingThreshold, setShippingThreshold] = useState('130');

    // New Bundle State
    const [bundles, setBundles] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
    const [editingBundle, setEditingBundle] = useState<any>(null);

    // Bundle Form State
    const [bundleName, setBundleName] = useState('');
    const [bundleSelectedProducts, setBundleSelectedProducts] = useState<string[]>([]);
    const [bundleMinQuantity, setBundleMinQuantity] = useState('2');
    const [bundleAmount, setBundleAmount] = useState('10');
    const [bundleIsPercentage, setBundleIsPercentage] = useState(false);
    const [bundleActive, setBundleActive] = useState(true);

    // Upsell State
    const [upsells, setUpsells] = useState<any[]>([]);
    const [isUpsellModalOpen, setIsUpsellModalOpen] = useState(false);
    const [editingUpsell, setEditingUpsell] = useState<any>(null);
    const [upsellTriggerProduct, setUpsellTriggerProduct] = useState<string>('');
    const [upsellSuggestedProduct, setUpsellSuggestedProduct] = useState<string>('');
    const [upsellMessage, setUpsellMessage] = useState('Unlock £10 Off');
    const [upsellActive, setUpsellActive] = useState(true);

    const fetchBundles = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/bundles`);
            const data = await res.json();
            setBundles(data);
        } catch (err) {
            console.error('Failed to fetch bundles', err);
        }
    };

    const fetchProducts = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/products`);
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error('Failed to fetch products', err);
        }
    };

    const fetchUpsells = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const res = await fetch(`${apiUrl}/api/upsells`);
            const data = await res.json();
            setUpsells(data);
        } catch (err) {
            console.error('Failed to fetch upsells', err);
        }
    };

    const formatImgUrl = (path: string) => {
        if (!path) return '/cbr.png';
        if (path.startsWith('http')) return path;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        if (path.startsWith('/uploads/')) return `${apiUrl}${path}`;
        return path;
    };

    useEffect(() => {
        setShippingThreshold(getSetting('shipping_threshold', '130'));
        fetchBundles();
        fetchProducts();
        fetchUpsells();
        setLoading(false);
    }, [getSetting]);

    const handleSave = async () => {
        setSaving(true);
        setMessage('Sparar...');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        try {
            const headers = getAuthHeaders();
            const settingsToSave = [
                { key: 'shipping_threshold', value: shippingThreshold, label: 'Free Shipping Threshold' },
            ];

            for (const s of settingsToSave) {
                await fetch(`${apiUrl}/api/settings`, {
                    method: 'POST',
                    headers: headers as any,
                    body: JSON.stringify(s)
                });
            }

            await refreshSettings();
            setMessage('INSTÄLLNINGAR UPPDATERADE!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Failed to save settings', error);
            setMessage('ETT FEL UPPSTOD');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-white animate-pulse">LADDAR INSTÄLLNINGAR...</div>;

    return (
        <div className="pb-40 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-zinc-900 pb-8 gap-6">
                <div>
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white mb-2">Butiksinställningar</h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                        <Tag size={14} className="text-emerald-500" />
                        Hantera Frakt & Bundles
                    </p>
                </div>
                {message && (
                    <div className="bg-emerald-500 text-black px-6 py-3 rounded-full font-black uppercase tracking-widest text-xs shadow-lg flex items-center gap-3 animate-in slide-in-from-right fade-in">
                        <CheckCircle size={18} />
                        {message}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl">

                {/* 1. SHIPPING SETTINGS */}
                <div className="border border-zinc-800 bg-zinc-900/20 p-8 rounded-xl h-fit">
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black italic uppercase text-white mb-2">Fri Frakt</h2>
                            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
                                Ställ in vid vilket belopp kunden får gratis frakt.
                            </p>
                        </div>
                        <Truck size={32} className="text-zinc-700" />
                    </div>

                    <div className="space-y-4">
                        <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-widest mb-1">Tröskel (Gräns för fri frakt)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 font-mono italic">£</span>
                            <input
                                type="number"
                                value={shippingThreshold}
                                onChange={(e) => setShippingThreshold(e.target.value)}
                                className="w-full bg-black border border-zinc-700 text-white p-4 pl-8 font-mono text-lg rounded-md focus:border-white focus:outline-none transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. BUNDLE MANAGER */}
                <div className="border border-zinc-800 bg-zinc-900/10 p-8 rounded-xl lg:col-span-2">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
                        <div>
                            <h2 className="text-3xl font-black italic uppercase text-white mb-2">Bundle Manager</h2>
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                Skapa kombinations-rabatter för specifika varor
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingBundle(null);
                                setBundleName('');
                                setBundleSelectedProducts([]);
                                setBundleMinQuantity('2');
                                setBundleAmount('10');
                                setBundleIsPercentage(false);
                                setBundleActive(true);
                                fetchProducts(); // Ensure products are fresh
                                setIsBundleModalOpen(true);
                            }}
                            className="bg-emerald-600 text-white px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center gap-3 rounded-md shadow-xl"
                        >
                            <Plus size={16} /> Ny Bundle
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            {bundles.map(bundle => (
                                <div
                                    key={bundle._id}
                                    onClick={() => {
                                        setEditingBundle(bundle);
                                        setBundleName(bundle.name);
                                        setBundleSelectedProducts((bundle.products || []).map((p: any) => p._id));
                                        setBundleMinQuantity(bundle.minQuantity?.toString() || '2');
                                        setBundleAmount(bundle.discount.toString());
                                        setBundleIsPercentage(bundle.isPercentage || false);
                                        setBundleActive(bundle.active);
                                        fetchProducts(); // Ensure products are fresh
                                        setIsBundleModalOpen(true);
                                    }}
                                    className={`group relative flex flex-col md:flex-row bg-zinc-950/40 border rounded-xl overflow-hidden transition-all duration-300 cursor-pointer ${bundle.active ? 'border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-900/60' : 'border-zinc-900 opacity-50 grayscale'}`}
                                >
                                    <div className="flex-1 p-6 flex flex-col md:flex-row gap-6">
                                        <div className="flex -space-x-8 hover:space-x-1 transition-all">
                                            {(bundle.products || []).slice(0, 4).map((p: any, idx: number) => (
                                                <div
                                                    key={p._id}
                                                    className="w-16 h-20 bg-zinc-900 border-2 border-black rounded-lg overflow-hidden shadow-2xl relative"
                                                    style={{ zIndex: 4 - idx }}
                                                >
                                                    <img src={formatImgUrl(p.image)} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                            {(bundle.products || []).length > 4 && (
                                                <div className="w-16 h-20 bg-zinc-900 border-2 border-black rounded-lg flex items-center justify-center text-[10px] font-black text-zinc-500 z-0">
                                                    +{(bundle.products || []).length - 4}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-black italic uppercase text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{bundle.name}</h3>
                                                <div className={`px-2 py-0.5 rounded-sm text-[8px] font-black uppercase ${bundle.active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-500'}`}>
                                                    {bundle.active ? 'Aktiv' : 'Inaktiv'}
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-zinc-500">
                                                <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-md border border-zinc-800/50">
                                                    <Percent size={12} className="text-emerald-500" />
                                                    <span className="text-white">{bundle.isPercentage ? `${bundle.discount}%` : `£${bundle.discount}`} rabatt</span>
                                                </span>
                                                <span className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-md border border-zinc-800/50">
                                                    <Package size={12} className="text-emerald-500" />
                                                    <span className="text-white">Köp minst {bundle.minQuantity || 2} st</span>
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {(bundle.products || []).slice(0, 6).map((p: any) => (
                                                    <span key={p._id} className="text-[9px] text-zinc-600 font-bold uppercase tracking-tighter bg-zinc-900/50 px-2 py-0.5 rounded-sm border border-zinc-800/20">
                                                        {p.name}
                                                    </span>
                                                ))}
                                                {(bundle.products || []).length > 6 && <span className="text-[9px] text-zinc-700 font-bold">+{(bundle.products || []).length - 6} till</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-black/20 border-t md:border-t-0 md:border-l border-zinc-900/50 p-4 flex md:flex-col justify-end gap-2 md:w-16">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingBundle(bundle);
                                                setBundleName(bundle.name);
                                                setBundleSelectedProducts((bundle.products || []).map((p: any) => p._id));
                                                setBundleMinQuantity(bundle.minQuantity?.toString() || '2');
                                                setBundleAmount(bundle.discount.toString());
                                                setBundleIsPercentage(bundle.isPercentage || false);
                                                setBundleActive(bundle.active);
                                                fetchProducts(); // Ensure products are fresh
                                                setIsBundleModalOpen(true);
                                            }}
                                            className="p-2.5 bg-zinc-900 hover:bg-white hover:text-black transition-all rounded-lg border border-zinc-800 hover:border-white shadow-lg"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                if (!confirm('Ta bort bundle?')) return;
                                                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                                                await fetch(`${apiUrl}/api/bundles/${bundle._id}`, {
                                                    method: 'DELETE',
                                                    headers: getAuthHeaders() as any
                                                });
                                                fetchBundles();
                                            }}
                                            className="p-2.5 bg-zinc-900 hover:bg-red-600 hover:text-white transition-all rounded-lg border border-zinc-800 hover:border-red-500 shadow-lg"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {bundles.length === 0 && (
                                <div className="col-span-full py-20 text-center border border-zinc-900 border-dashed rounded-xl">
                                    <Package size={40} className="text-zinc-800 mx-auto mb-4" />
                                    <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest">Inga bundles konfigurerade</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. UPSELL MANAGER (COMPLETE THE LOOK) */}
                <div className="border border-zinc-800 bg-zinc-900/10 p-8 rounded-xl lg:col-span-2">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
                        <div>
                            <h2 className="text-3xl font-black italic uppercase text-white mb-2">Upsell Manager</h2>
                            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                Hantera "Complete the Look" förslag i kassan
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingUpsell(null);
                                setUpsellTriggerProduct('');
                                setUpsellSuggestedProduct('');
                                setUpsellMessage('Unlock £10 Off');
                                setUpsellActive(true);
                                fetchProducts();
                                setIsUpsellModalOpen(true);
                            }}
                            className="bg-zinc-100 text-black px-8 py-4 text-xs font-black uppercase tracking-widest hover:bg-white transition-all flex items-center gap-3 rounded-md shadow-xl"
                        >
                            <Plus size={16} /> Nytt Förslag
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {upsells.map(upsell => (
                            <div
                                key={upsell._id}
                                className={`group relative flex flex-col bg-zinc-950/40 border rounded-xl overflow-hidden transition-all duration-300 ${upsell.active ? 'border-zinc-800 hover:border-zinc-500 hover:bg-zinc-900/60' : 'border-zinc-900 opacity-50 grayscale'}`}
                            >
                                <div className="p-6 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Aktiv Upsell</span>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setEditingUpsell(upsell);
                                                    setUpsellTriggerProduct(upsell.triggerProductId?._id || '');
                                                    setUpsellSuggestedProduct(upsell.suggestedProductId?._id || '');
                                                    setUpsellMessage(upsell.message);
                                                    setUpsellActive(upsell.active);
                                                    fetchProducts();
                                                    setIsUpsellModalOpen(true);
                                                }}
                                                className="p-2 bg-zinc-900 hover:bg-white hover:text-black transition-all rounded-lg border border-zinc-800 shadow-lg"
                                            >
                                                <Edit2 size={12} />
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (!confirm('Radera detta förslag?')) return;
                                                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                                                    try {
                                                        await fetch(`${apiUrl}/api/upsells/${upsell._id}`, {
                                                            method: 'DELETE',
                                                            headers: getAuthHeaders() as any
                                                        });
                                                        fetchUpsells();
                                                    } catch (err) {
                                                        console.error('Delete upsell error:', err);
                                                    }
                                                }}
                                                className="p-2 bg-zinc-900 hover:bg-red-500/20 hover:text-red-500 transition-all rounded-lg border border-zinc-800 shadow-lg"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 space-y-2">
                                            <p className="text-[9px] font-black text-zinc-600 uppercase">Om i cart:</p>
                                            <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-zinc-900">
                                                <div className="w-8 h-10 bg-zinc-900 rounded overflow-hidden shrink-0">
                                                    <img src={formatImgUrl(upsell.triggerProductId?.image)} className="w-full h-full object-cover" />
                                                </div>
                                                <p className="text-[10px] font-bold text-white uppercase truncate">{upsell.triggerProductId?.name || 'Vara borttagen'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center p-2 rounded-full bg-zinc-900 border border-zinc-800">
                                            <ChevronDown className="rotate-[-90deg] text-zinc-500" size={12} />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <p className="text-[9px] font-black text-emerald-500 uppercase">Föreslå:</p>
                                            <div className="flex items-center gap-2 bg-black/40 p-2 rounded-lg border border-zinc-900">
                                                <div className="w-8 h-10 bg-zinc-900 rounded overflow-hidden shrink-0">
                                                    <img src={formatImgUrl(upsell.suggestedProductId?.image)} className="w-full h-full object-cover" />
                                                </div>
                                                <p className="text-[10px] font-bold text-white uppercase truncate">{upsell.suggestedProductId?.name || 'Vara borttagen'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 pt-4 border-t border-zinc-900/50">
                                        <p className="text-[9px] font-black text-zinc-500 uppercase mb-1">Cta Message:</p>
                                        <p className="text-xs font-bold text-zinc-300">{upsell.message}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {upsells.length === 0 && (
                            <div className="md:col-span-2 border-2 border-dashed border-zinc-900 rounded-2xl p-12 text-center text-zinc-500">
                                Inga upsell-regler skapade
                            </div>
                        )}
                    </div>
                </div>

                {/* BUNDLE MODAL */}
                {isBundleModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/80 animate-in fade-in duration-300">
                        <div className="bg-zinc-950 border border-zinc-800 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl">
                            <div className="p-8 border-b border-zinc-900 flex justify-between items-center sticky top-0 bg-zinc-950 z-10">
                                <div>
                                    <h2 className="text-3xl font-black italic uppercase text-white">{editingBundle ? 'Redigera Bundle' : 'Ny Bundle'}</h2>
                                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Konfigurera rabattregler</p>
                                </div>
                                <button onClick={() => setIsBundleModalOpen(false)} className="p-2 hover:bg-zinc-900 rounded-full transition-colors">
                                    <X size={24} className="text-zinc-400" />
                                </button>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-1">Namn på Bundle</label>
                                        <input
                                            type="text"
                                            value={bundleName}
                                            onChange={e => setBundleName(e.target.value)}
                                            placeholder="t.ex. Summer Hoodie Combo"
                                            className="w-full bg-black border border-zinc-800 p-4 text-white font-bold rounded-xl focus:border-emerald-500/50 outline-none transition-all shadow-inner"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-1">Kvantitets-krav</label>
                                        <div className="relative group">
                                            <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" size={16} />
                                            <input
                                                type="number"
                                                min="1"
                                                value={bundleMinQuantity}
                                                onChange={e => setBundleMinQuantity(e.target.value)}
                                                placeholder="Antal varor..."
                                                className="w-full bg-black border border-zinc-800 p-4 pl-12 text-white font-bold rounded-xl focus:border-emerald-500/50 outline-none transition-all shadow-inner"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-700 uppercase">ST</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest px-1">Rabattbelopp</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1 group">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 font-mono italic font-black group-focus-within:text-emerald-500 transition-colors">
                                                    {bundleIsPercentage ? '%' : '£'}
                                                </span>
                                                <input
                                                    type="number"
                                                    value={bundleAmount}
                                                    onChange={e => setBundleAmount(e.target.value)}
                                                    className="w-full bg-black border border-zinc-800 p-4 pl-8 text-white font-mono font-bold rounded-xl focus:border-emerald-500/50 outline-none transition-all shadow-inner"
                                                />
                                            </div>
                                            <button
                                                onClick={() => setBundleIsPercentage(!bundleIsPercentage)}
                                                className={`px-4 font-black text-[10px] uppercase border transition-all rounded-xl ${bundleIsPercentage ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-700'}`}
                                            >
                                                {bundleIsPercentage ? '%' : 'VALUTA'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end px-1">
                                        <div>
                                            <h4 className="text-sm font-black italic uppercase tracking-widest text-white">Välj ingående varor</h4>
                                            <p className="text-[10px] text-zinc-600 font-bold uppercase">Markera de varor som ska räknas mot bundlen</p>
                                        </div>
                                        <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase font-black border border-emerald-500/20">{bundleSelectedProducts.length} VALDA</span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                                        {products.map(p => (
                                            <div
                                                key={p._id}
                                                onClick={() => {
                                                    setBundleSelectedProducts(prev => prev.includes(p._id) ? prev.filter(id => id !== p._id) : [...prev, p._id]);
                                                }}
                                                className={`relative cursor-pointer group rounded-xl border-2 transition-all overflow-hidden aspect-[4/5] ${bundleSelectedProducts.includes(p._id) ? 'border-emerald-500' : 'border-zinc-900 grayscale-0 hover:grayscale-0 hover:border-zinc-700'}`}
                                            >
                                                <img src={formatImgUrl(p.image)} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                <div className={`absolute inset-0 transition-opacity ${bundleSelectedProducts.includes(p._id) ? 'bg-emerald-500/10' : 'bg-black/0 group-hover:bg-black/20'}`} />

                                                <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${bundleSelectedProducts.includes(p._id) ? 'bg-emerald-500 border-emerald-500 scale-100 shadow-lg' : 'bg-black/40 border-white/20 scale-90 opacity-0 group-hover:opacity-100'}`}>
                                                    <CheckCircle size={14} className={bundleSelectedProducts.includes(p._id) ? 'text-black' : 'text-white'} />
                                                </div>

                                                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
                                                    <p className="text-[10px] font-black uppercase text-white truncate drop-shadow-md">{p.name}</p>
                                                    <p className="text-[8px] font-bold text-emerald-500 uppercase">Valbar</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl flex items-center gap-4">
                                    <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center shrink-0">
                                        <Info size={20} className="text-emerald-500" />
                                    </div>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase leading-relaxed">
                                        Kunden får <span className="text-emerald-500">{bundleIsPercentage ? `${bundleAmount}%` : `£${bundleAmount}`} rabatt</span> när de lägger minst <span className="text-emerald-500">{bundleMinQuantity} st</span> av de valda varorna i varukorgen.
                                    </p>
                                </div>
                            </div>

                            <div className="p-8 border-t border-zinc-900 flex justify-between items-center">
                                <button
                                    onClick={() => setBundleActive(!bundleActive)}
                                    className={`flex items-center gap-3 px-6 py-3 rounded-md text-[10px] font-black uppercase transition-all ${bundleActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/50' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}
                                >
                                    <Power size={14} />
                                    {bundleActive ? 'Aktiv' : 'Inaktiv'}
                                </button>
                                <div className="flex gap-4">
                                    <button onClick={() => setIsBundleModalOpen(false)} className="px-8 py-3 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Avbryt</button>
                                    <button
                                        onClick={async () => {
                                            if (bundleSelectedProducts.length === 0) {
                                                return alert('Välj minst en vara!');
                                            }

                                            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                                            const payload = {
                                                name: bundleName,
                                                products: bundleSelectedProducts,
                                                minQuantity: parseInt(bundleMinQuantity) || 2,
                                                discount: parseFloat(bundleAmount) || 0,
                                                isPercentage: bundleIsPercentage,
                                                active: bundleActive
                                            };
                                            const method = editingBundle ? 'PUT' : 'POST';
                                            const url = editingBundle ? `${apiUrl}/api/bundles/${editingBundle._id}` : `${apiUrl}/api/bundles`;

                                            try {
                                                const res = await fetch(url, {
                                                    method,
                                                    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } as any,
                                                    body: JSON.stringify(payload)
                                                });
                                                if (!res.ok) {
                                                    const errData = await res.json().catch(() => ({ error: 'Kunde inte spara bundle' }));
                                                    throw new Error(errData.error);
                                                }
                                                setIsBundleModalOpen(false);
                                                fetchBundles();
                                            } catch (error: any) {
                                                console.error('Save bundle error:', error);
                                                alert(`Ett fel uppstod: ${error.message}`);
                                            }
                                        }}
                                        className="bg-white text-black px-10 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all rounded-md"
                                    >
                                        Spara Bundle
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* UPSELL MODAL */}
                {isUpsellModalOpen && (
                    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setIsUpsellModalOpen(false)} />
                        <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                            <div className="p-8 border-b border-zinc-900 flex justify-between items-center">
                                <div>
                                    <h3 className="text-2xl font-black italic uppercase text-white tracking-widest">{editingUpsell ? 'Redigera Förslag' : 'Nytt Förslag'}</h3>
                                    <p className="text-[10px] font-bold uppercase text-zinc-500 mt-1">Definiera trigger och förslag</p>
                                </div>
                                <button onClick={() => setIsUpsellModalOpen(false)} className="p-2 hover:bg-zinc-900 rounded-full transition-colors">
                                    <X size={24} className="text-zinc-400" />
                                </button>
                            </div>

                            <div className="p-8 space-y-8 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">1. Om kunden har dena vara:</label>
                                        <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                                            {products.map(p => (
                                                <div
                                                    key={`trigger-${p._id}`}
                                                    onClick={() => setUpsellTriggerProduct(p._id)}
                                                    className={`p-2 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${upsellTriggerProduct === p._id ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-900 bg-zinc-900/20 hover:border-zinc-700'}`}
                                                >
                                                    <div className="w-8 h-10 bg-zinc-900 rounded overflow-hidden shrink-0">
                                                        <img src={formatImgUrl(p.image)} className="w-full h-full object-cover" />
                                                    </div>
                                                    <p className="text-[9px] font-black uppercase text-white truncate">{p.name}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">2. Föreslå denna vara:</label>
                                        <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                                            {products.map(p => (
                                                <div
                                                    key={`suggested-${p._id}`}
                                                    onClick={() => setUpsellSuggestedProduct(p._id)}
                                                    className={`p-2 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3 ${upsellSuggestedProduct === p._id ? 'border-emerald-500 bg-emerald-500/5' : 'border-zinc-900 bg-zinc-900/20 hover:border-zinc-700'}`}
                                                >
                                                    <div className="w-8 h-10 bg-zinc-900 rounded overflow-hidden shrink-0">
                                                        <img src={formatImgUrl(p.image)} className="w-full h-full object-cover" />
                                                    </div>
                                                    <p className="text-[9px] font-black uppercase text-white truncate">{p.name}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">3. CTA Meddelande (t.ex. "Unlock £10 Off")</label>
                                    <input
                                        type="text"
                                        value={upsellMessage}
                                        onChange={e => setUpsellMessage(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 p-4 text-white font-bold rounded-xl focus:border-emerald-500/50 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="p-8 border-t border-zinc-900 flex justify-between items-center bg-black/50">
                                <button
                                    onClick={() => setUpsellActive(!upsellActive)}
                                    className={`flex items-center gap-3 px-6 py-3 rounded-md text-[10px] font-black uppercase transition-all ${upsellActive ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/50' : 'bg-zinc-900 text-zinc-500 border border-zinc-800'}`}
                                >
                                    <Power size={14} />
                                    {upsellActive ? 'Aktiv' : 'Inaktiv'}
                                </button>
                                <div className="flex gap-4">
                                    <button onClick={() => setIsUpsellModalOpen(false)} className="px-8 py-3 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Avbryt</button>
                                    <button
                                        onClick={async () => {
                                            if (!upsellTriggerProduct || !upsellSuggestedProduct) {
                                                return alert('Välj både trigger och förslag!');
                                            }
                                            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                                            const payload = {
                                                triggerProductId: upsellTriggerProduct,
                                                suggestedProductId: upsellSuggestedProduct,
                                                message: upsellMessage,
                                                active: upsellActive
                                            };
                                            const method = editingUpsell ? 'PUT' : 'POST';
                                            const url = editingUpsell ? `${apiUrl}/api/upsells/${editingUpsell._id}` : `${apiUrl}/api/upsells`;

                                            try {
                                                const res = await fetch(url, {
                                                    method,
                                                    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' } as any,
                                                    body: JSON.stringify(payload)
                                                });
                                                if (!res.ok) throw new Error('Kunde inte spara upsell');
                                                setIsUpsellModalOpen(false);
                                                fetchUpsells();
                                            } catch (error: any) {
                                                alert(error.message);
                                            }
                                        }}
                                        className="bg-white text-black px-10 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all rounded-md"
                                    >
                                        Spara Förslag
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* SAVE ACTION */}
                <div className="fixed bottom-8 right-8">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`h-16 px-10 rounded-full font-black uppercase tracking-widest text-sm flex items-center gap-4 shadow-2xl border border-white/10 backdrop-blur-xl transition-all hover:scale-105 active:scale-95 ${saving ? 'bg-zinc-800 text-zinc-500' : 'bg-white text-black hover:bg-zinc-200'}`}
                    >
                        {saving ? 'UPPDATERAR...' : 'SPARA INSTÄLLNINGAR'}
                        <Save size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
