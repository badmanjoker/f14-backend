'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/components/SettingsContext';
import { useAdmin } from '@/components/admin/AdminContext';
import { Save, Power, Calendar, Info, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LaunchControlPage() {
    const { getSetting, refreshSettings } = useSettings();
    const { getAuthHeaders } = useAdmin(); // Use Admin Context for Auth
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // State
    const [isActive, setIsActive] = useState(false);
    const [launchDate, setLaunchDate] = useState('');

    useEffect(() => {
        // Load settings
        const timerActive = getSetting('timer_active', 'false') === 'true';
        const date = getSetting('launch_date', '');

        setIsActive(timerActive); // "true" string from DB -> boolean
        setLaunchDate(date); // ISO string or empty
        setLoading(false);
    }, [getSetting]);

    const handleSave = async () => {
        setSaving(true);
        setMessage('Saving...');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

        try {
            const headers = getAuthHeaders(); // Get Auth Headers

            // Save Timer Status
            const res1 = await fetch(`${apiUrl}/api/settings`, {
                method: 'POST',
                headers: headers as any,
                body: JSON.stringify({ key: 'timer_active', value: String(isActive), label: 'Timer Active Status' })
            });
            if (!res1.ok) throw new Error('Failed to save status');

            // Save Date
            const res2 = await fetch(`${apiUrl}/api/settings`, {
                method: 'POST',
                headers: headers as any,
                body: JSON.stringify({ key: 'launch_date', value: launchDate, label: 'Launch Date' })
            });
            if (!res2.ok) throw new Error('Failed to save date');

            await refreshSettings();
            setMessage('LAUNCH SETTINGS UPDATED!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Failed to save settings', error);
            setMessage('ERROR SAVING');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-white animate-pulse">LOADING CONTROL PANEL...</div>;

    return (
        <div className="pb-40 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-zinc-900 pb-8 gap-6">
                <div>
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white mb-2">Launch Control</h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                        <Calendar size={14} className="text-red-600" />
                        Manage Drop Timing & Access
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

                {/* 1. MASTER SWITCH */}
                <div className={`border p-8 rounded-xl transition-all duration-300 ${isActive ? 'bg-red-950/20 border-red-900' : 'bg-zinc-900/20 border-zinc-800'}`}>
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black italic uppercase text-white mb-2">Shop Access</h2>
                            <p className="text-zinc-400 text-xs leading-relaxed max-w-sm">
                                Controls the visibility of products. If "LOCKED", the shop is hidden and only the countdown is shown.
                            </p>
                        </div>
                        <Power size={32} className={isActive ? 'text-red-500' : 'text-emerald-500'} />
                    </div>

                    <div className="flex bg-black rounded-lg p-1 border border-zinc-800 relative">
                        <motion.div
                            className={`absolute top-1 bottom-1 w-1/2 rounded-md transition-colors ${isActive ? 'bg-red-600' : 'bg-emerald-600'}`}
                            animate={{ x: isActive ? '0%' : '100%' }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                        <button
                            onClick={() => setIsActive(true)}
                            className={`relative z-10 w-1/2 py-3 text-xs font-black uppercase tracking-widest transition-colors ${isActive ? 'text-white' : 'text-zinc-500'}`}
                        >
                            LOCKED (TIMER ON)
                        </button>
                        <button
                            onClick={() => setIsActive(false)}
                            className={`relative z-10 w-1/2 py-3 text-xs font-black uppercase tracking-widest transition-colors ${!isActive ? 'text-white' : 'text-zinc-500'}`}
                        >
                            OPEN (SHOP LIVE)
                        </button>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-zinc-500">
                        <Info size={12} />
                        Current Status: <span className={isActive ? 'text-red-500' : 'text-emerald-500'}>{isActive ? 'Store is Hidden' : 'Store is Visible'}</span>
                    </div>
                </div>

                {/* 2. DATE SETTINGS */}
                <div className="border border-zinc-800 bg-zinc-900/20 p-8 rounded-xl">
                    <h2 className="text-2xl font-black italic uppercase text-white mb-2">Launch Date</h2>
                    <p className="text-zinc-400 text-xs leading-relaxed mb-6">
                        Set the precise date and time for the countdown to reach zero.
                    </p>

                    <div className="space-y-4">
                        <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-widest mb-1">Select Date & Time</label>
                        <input
                            type="datetime-local"
                            value={launchDate}
                            onChange={(e) => setLaunchDate(e.target.value)}
                            className="w-full bg-black border border-zinc-700 text-white p-4 font-mono text-lg rounded-md focus:border-white focus:outline-none transition-colors uppercase"
                        />
                        <p className="text-[10px] text-zinc-600 italic">
                            * Uses your local timezone. Will be converted to universal time automatically.
                        </p>
                    </div>
                </div>

            </div>

            {/* SAVE ACTION */}
            <div className="fixed bottom-8 right-8">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`h-16 px-10 rounded-full font-black uppercase tracking-widest text-sm flex items-center gap-4 shadow-2xl border border-white/10 backdrop-blur-xl transition-all ${saving ? 'bg-zinc-800 text-zinc-500' : 'bg-white text-black hover:scale-105 hover:bg-zinc-200'}`}
                >
                    {saving ? 'UPDATING SYSTEM...' : 'SAVE CONFIGURATION'}
                    <Save size={18} />
                </button>
            </div>
        </div>
    );
}
