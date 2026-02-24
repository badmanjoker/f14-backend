'use client';

import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/Sidebar';
import GlobalHeader from '@/components/GlobalHeader';
import { AdminProvider, useAdmin } from '@/components/admin/AdminContext';
import CommandPalette from '@/components/admin/CommandPalette';
import { useSettings } from '@/components/SettingsContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://f14-backend.onrender.com';

// Separate Inner Layout to consume Context
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, login, loading } = useAdmin();
    const { getSetting } = useSettings();
    const logo = getSetting('header_logo', '/F14 logga.png');

    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [shake, setShake] = useState(false);
    const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

    // Wake up Render server on mount
    useEffect(() => {
        if (isAuthenticated) return;
        let cancelled = false;

        const wakeServer = async () => {
            setServerStatus('checking');
            try {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 60000);
                const res = await fetch(`${API_URL}/api/health`, { signal: controller.signal });
                clearTimeout(timeout);
                if (!cancelled) setServerStatus(res.ok ? 'online' : 'offline');
            } catch {
                if (!cancelled) setServerStatus('offline');
            }
        };

        wakeServer();
        return () => { cancelled = true; };
    }, [isAuthenticated]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await login(password);
        if (!success) {
            setError('ACCESS DENIED');
            setShake(true);
            setTimeout(() => setShake(false), 500);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden z-[100]">
                <div className="fixed inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/40 via-black to-black opacity-50"></div>
                </div>

                <form
                    onSubmit={handleLogin}
                    className={`relative z-50 flex flex-col gap-8 p-12 border border-zinc-800 bg-zinc-950/80 backdrop-blur-md w-full max-w-md shadow-2xl shadow-zinc-900/50 ${shake ? 'animate-shake' : ''}`}
                >
                    <div className="text-center flex flex-col items-center">
                        <div className="w-24 h-24 mb-6 relative" style={{ perspective: '1000px' }}>
                            <div
                                className="silver-logo"
                                style={{
                                    WebkitMaskImage: `url('${logo}')`,
                                    maskImage: `url('${logo}')`
                                }}
                            ></div>
                        </div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2 text-white">Command Center</h1>
                        <p className="text-zinc-500 text-[10px] uppercase tracking-[0.3em] font-bold">Authorized Personnel Only</p>
                    </div>

                    {/* Server Status Indicator */}
                    <div className="flex items-center justify-center gap-2 text-[10px] font-mono uppercase tracking-widest">
                        {serverStatus === 'checking' && (
                            <>
                                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                                <span className="text-yellow-400">Waking up server... may take 30s</span>
                            </>
                        )}
                        {serverStatus === 'online' && (
                            <>
                                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                                <span className="text-green-400">Server online</span>
                            </>
                        )}
                        {serverStatus === 'offline' && (
                            <>
                                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                <span className="text-red-400">Server offline — try again in 1 min</span>
                            </>
                        )}
                    </div>

                    <div className="space-y-4">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            placeholder="ENTER PASSWORD"
                            className="w-full bg-black/50 border border-zinc-800 p-4 text-white text-center focus:border-white outline-none tracking-[0.5em] transition-all placeholder:tracking-normal font-mono text-lg focus:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            autoFocus
                        />
                        {error && (
                            <div className="text-red-500 text-[10px] text-center font-bold tracking-widest uppercase border border-red-900/50 bg-red-950/20 py-2">
                                {error}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={serverStatus === 'checking'}
                        className="bg-white text-black font-black uppercase py-4 hover:bg-zinc-200 transition-all tracking-[0.2em] text-xs hover:tracking-[0.3em] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {serverStatus === 'checking' ? 'Connecting...' : 'Authenticate'}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="h-screen bg-black text-white flex overflow-hidden">
            <CommandPalette />
            <GlobalHeader />
            <AdminSidebar />
            <main className="flex-1 md:ml-64 h-full relative overflow-y-auto">
                {/* Ambient Background for Dashboard */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute inset-0 bg-[#050505]"></div>
                </div>
                <div className="relative z-10 p-6 md:p-12 pt-24 md:pt-32 pb-40">
                    {children}
                </div>
            </main>
        </div>
    );
}

// Main Layout Component wrapping everything with Provider
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminProvider>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </AdminProvider>
    );
}
