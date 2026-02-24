'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAdmin } from './AdminContext';
import { LogOut } from 'lucide-react';

export default function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAdmin();

    const links = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
        { name: 'Supply', href: '/admin/supply', icon: '⚡' },
        { name: 'Orders', href: '/admin/orders', icon: '📦' },
        { name: 'Inventory', href: '/admin/inventory', icon: '👕' },
        { name: 'Returns', href: '/admin/returns', icon: '↩️' },
    ];

    const isActive = (path: string) => pathname?.startsWith(path);

    return (
        <aside className="w-64 bg-[#0a0a0a] h-screen fixed left-0 top-0 pt-24 hidden md:flex flex-col z-40">
            <div className="px-6 mb-8">
                <div className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-2">Navigation</div>
                <nav className="flex flex-col gap-1">
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all group ${isActive(link.href)
                                ? 'bg-zinc-900 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                                : 'text-zinc-500 hover:text-white hover:bg-zinc-900/50'
                                }`}
                        >
                            <span className="opacity-70 group-hover:opacity-100 transition-opacity">{link.icon}</span>
                            {link.name}
                        </Link>
                    ))}
                </nav>

                <div className="text-xs font-black uppercase tracking-widest text-zinc-600 mb-2 mt-8">Tools</div>
                <nav className="flex flex-col gap-1">

                    <Link href="/admin/dashboard?view=insights" className="flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-white hover:bg-zinc-900/50 transition-all group">
                        <span className="opacity-70 group-hover:opacity-100 transition-opacity">🤖</span>
                        Pro Insights
                    </Link>
                    <Link href="/admin/images" className="flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-white hover:bg-zinc-900/50 transition-all group">
                        <span className="opacity-70 group-hover:opacity-100 transition-opacity">🖼️</span>
                        Image Settings
                    </Link>
                    <Link href="/admin/launch" className="flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-white hover:bg-zinc-900/50 transition-all group">
                        <span className="opacity-70 group-hover:opacity-100 transition-opacity">🚀</span>
                        Launch Control
                    </Link>
                    <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-bold uppercase tracking-wider text-zinc-500 hover:text-white hover:bg-zinc-900/50 transition-all group">
                        <span className="opacity-70 group-hover:opacity-100 transition-opacity">⚙️</span>
                        Butiksinställningar
                    </Link>
                </nav>
            </div>

            <div className="mt-auto px-6 pb-8">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 text-zinc-500 hover:text-red-500 transition-colors p-2 mb-4 w-full text-left uppercase tracking-widest text-[10px] font-bold border border-zinc-900 bg-zinc-950/50 hover:bg-zinc-900 rounded-sm group"
                >
                    <LogOut size={14} className="group-hover:text-red-500 transition-colors" />
                    <span>Terminera Session</span>
                </button>

                <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-mono border border-zinc-900 p-2 rounded-sm bg-zinc-950">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <div>STATUS: ONLINE</div>
                </div>
            </div>
        </aside >
    );
}
