'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminIndex() {
    const router = useRouter();

    useEffect(() => {
        router.push('/admin/dashboard');
    }, [router]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 text-xs font-mono uppercase tracking-widest animate-pulse">
            Redirecting...
        </div>
    );
}
