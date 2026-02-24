'use client';

import Image from 'next/image';
import { useState } from 'react';
import Lightbox from './Lightbox';

import { useSettings } from './SettingsContext';

export default function Visuals() {
    const { getSetting, settings } = useSettings();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Filter and sort VISUALS images
    const visuals = settings
        .filter(s => s.key.startsWith('visuals_'))
        .sort((a, b) => {
            const numA = parseInt(a.key.split('_')[1] || '0');
            const numB = parseInt(b.key.split('_')[1] || '0');
            return numA - numB;
        })
        .map(s => s.value);

    // Fallback if no images are uploaded
    const displayImages = visuals.length > 0 ? visuals : ['/Ducati.jpg', '/filip1.jpg', '/filip2.jpg', '/momo.jpg'];

    return (
        <section id="media" className="relative pt-24 md:pt-32 pb-12 md:pb-20 bg-black min-h-screen">
            <div className="max-w-7xl mx-auto px-6">
                <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-20 text-center animate-up street-font">
                    Visuals
                </h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-20">
                    {displayImages.map((src, i) => (
                        <div
                            key={i}
                            className="relative h-[700px] w-full overflow-hidden group cursor-zoom-in"
                            onClick={() => setSelectedImage(src)}
                        >
                            <Image
                                src={src}
                                alt="Visual Entry"
                                fill
                                className="object-cover grayscale group-hover:grayscale-0 transition duration-700 hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white text-xs font-bold uppercase tracking-widest border border-white px-4 py-2 bg-black/50 backdrop-blur-sm">View</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Lightbox src={selectedImage} onClose={() => setSelectedImage(null)} />
        </section>
    );
}
