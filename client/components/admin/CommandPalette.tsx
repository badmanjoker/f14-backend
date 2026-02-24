'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Box,
    Truck,
    LogOut,
    Search,
    Zap,
    Map as MapIcon,
    BarChart2
} from 'lucide-react';
import { useAdmin } from './AdminContext';

export default function CommandPalette() {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const { logout } = useAdmin();

    // Toggle with Cmd+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command: () => void) => {
        setOpen(false);
        command();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setOpen(false)} />

            <div className="relative w-full max-w-2xl transform transition-all">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-xl blur opacity-20"></div>
                <Command
                    className="relative w-full bg-[#0a0a0a] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                    loop
                >
                    <div className="flex items-center border-b border-zinc-800/50 px-4 py-1">
                        <div className="flex gap-2 mr-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50"></div>
                        </div>
                        <Command.Input
                            placeholder="Search commands, orders, or products..."
                            className="w-full bg-transparent py-4 text-sm outline-none text-white placeholder:text-zinc-600 font-mono focus:placeholder:text-zinc-500"
                            autoFocus
                        />
                        <div className="flex gap-2 items-center">
                            <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-zinc-800 bg-zinc-900 px-1.5 font-mono text-[10px] font-medium text-zinc-500">
                                <span className="text-xs">ESC</span>
                            </kbd>
                        </div>
                    </div>

                    <Command.List className="max-h-[350px] overflow-y-auto p-2 scroll-py-2 custom-scrollbar">
                        <Command.Empty className="py-12 text-center">
                            <div className="text-4xl mb-2">🤔</div>
                            <p className="text-sm text-zinc-500 font-medium">No results found.</p>
                            <p className="text-xs text-zinc-700 mt-1">Try searching for 'dashboard' or 'map'</p>
                        </Command.Empty>

                        <Command.Group heading="Navigation" className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-2 px-2 mt-2">
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/admin/dashboard'))}
                                className="flex items-center gap-3 px-3 py-3 text-sm text-zinc-400 rounded-lg aria-selected:bg-zinc-900 aria-selected:text-white cursor-pointer transition-all mb-1"
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                <span className="font-medium">Dashboard</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/admin/orders'))}
                                className="flex items-center gap-3 px-3 py-3 text-sm text-zinc-400 rounded-lg aria-selected:bg-zinc-900 aria-selected:text-white cursor-pointer transition-all mb-1"
                            >
                                <Truck className="w-4 h-4" />
                                <span className="font-medium">Orders</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/admin/inventory'))}
                                className="flex items-center gap-3 px-3 py-3 text-sm text-zinc-400 rounded-lg aria-selected:bg-zinc-900 aria-selected:text-white cursor-pointer transition-all mb-1"
                            >
                                <Box className="w-4 h-4" />
                                <span className="font-medium">Inventory</span>
                            </Command.Item>
                        </Command.Group>

                        <Command.Group heading="Premium Tools" className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-2 px-2 mt-4">

                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/admin/dashboard?view=insights'))}
                                className="flex items-center gap-3 px-3 py-3 text-sm text-zinc-400 rounded-lg aria-selected:bg-zinc-900 aria-selected:text-white cursor-pointer transition-all mb-1 group"
                            >
                                <Zap className="w-4 h-4 group-aria-selected:text-purple-500 transition-colors" />
                                <span className="font-medium">AI Insights</span>
                            </Command.Item>
                            <Command.Item
                                onSelect={() => runCommand(() => router.push('/admin/dashboard?view=analytics'))}
                                className="flex items-center gap-3 px-3 py-3 text-sm text-zinc-400 rounded-lg aria-selected:bg-zinc-900 aria-selected:text-white cursor-pointer transition-all mb-1"
                            >
                                <BarChart2 className="w-4 h-4" />
                                <span className="font-medium">Revenue Report</span>
                            </Command.Item>
                        </Command.Group>

                        <Command.Separator className="my-2 h-px bg-zinc-900" />

                        <Command.Group heading="System" className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-2 px-2">
                            <Command.Item
                                onSelect={() => runCommand(logout)}
                                className="flex items-center gap-3 px-3 py-3 text-sm text-red-500/80 rounded-lg aria-selected:bg-red-500/10 aria-selected:text-red-500 cursor-pointer transition-all"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="font-medium">Log Out</span>
                            </Command.Item>
                        </Command.Group>
                    </Command.List>

                    <div className="border-t border-zinc-900 p-2 bg-zinc-950/50 flex justify-between items-center px-4">
                        <div className="text-[10px] text-zinc-600 font-mono">
                            VER 2.4.0 • PRO
                        </div>
                        <div className="flex gap-2">
                            <div className="text-[10px] text-zinc-600">Select <span className="text-zinc-400">↵</span></div>
                            <div className="text-[10px] text-zinc-600">Navigate <span className="text-zinc-400">↑↓</span></div>
                        </div>
                    </div>
                </Command>
            </div>
        </div>
    );
}
