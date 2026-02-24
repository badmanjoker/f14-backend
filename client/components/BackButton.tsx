'use client';

import { useRouter } from 'next/navigation';

export default function BackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-zinc-500 hover:text-white transition-colors cursor-pointer"
        >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            Back
        </button>
    );
}
