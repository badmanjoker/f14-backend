'use client';

import Image from 'next/image';

import { useSettings } from '@/components/SettingsContext';

export default function Archive() {
    const { getSetting, settings } = useSettings();
    const bgImage = getSetting('archive_bg', '/modo.jpg');

    // Dynamic Archive Grid: Filter keys starting with 'archive_', exclude 'archive_bg', sort, and map.
    const archiveGrid = settings
        .filter(s => s.key.startsWith('archive_') && s.key !== 'archive_bg')
        .sort((a, b) => {
            const numA = parseInt(a.key.split('_')[1] || '0');
            const numB = parseInt(b.key.split('_')[1] || '0');
            return numA - numB;
        })
        .map(s => s.value);

    return (
        <section id="archive" className="relative pt-24 md:pt-32 pb-12 md:pb-20 bg-black min-h-screen flex items-center">
            {/* Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <Image
                    src={bgImage}
                    alt="Archive Background"
                    fill
                    className="object-cover opacity-30 grayscale"
                />
                <div className="absolute inset-0 bg-black/60"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 text-center w-full">
                <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-10 animate-up">
                    The Archive
                </h1>
                <p className="text-sm text-zinc-400 max-w-2xl mx-auto mb-20">
                    Visual documentation of past operations.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {archiveGrid.map((src, i) => (
                        <div key={i} className="relative h-[500px] w-full border border-zinc-800 group overflow-hidden">
                            <Image
                                src={src}
                                alt="Archive Visual"
                                fill
                                className="object-cover grayscale group-hover:grayscale-0 transition duration-500"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
