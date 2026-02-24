'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

import { useSettings } from '@/components/SettingsContext';

interface HeroProps {
    onNavigate: (view: string) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
    const { getSetting, settings } = useSettings();
    const [currentSlide, setCurrentSlide] = useState(0);

    // Dynamic Slides: Filter all keys starting with 'slide_', sort by number, and map to values.
    const slides = settings
        .filter(s => s.key.startsWith('slide_'))
        .sort((a, b) => {
            const numA = parseInt(a.key.split('_')[1] || '0');
            const numB = parseInt(b.key.split('_')[1] || '0');
            return numA - numB;
        })
        .map(s => s.value);

    // Fallback if no slides exist yet
    if (slides.length === 0) {
        slides.push('/festbild.jpg', '/filip.jpg');
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
            {/* Slideshow */}
            <AnimatePresence>
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    className="absolute inset-0 z-0"
                >
                    <Image
                        src={slides[currentSlide]}
                        alt="Hero Background"
                        fill
                        className="object-cover brightness-[0.4] grayscale contrast-110"
                        priority
                    />
                </motion.div>
            </AnimatePresence>

            {/* Slider Controls */}
            <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 z-20 text-white/50 hover:text-white transition-all p-2 hover:-translate-x-2 active:scale-75 duration-300 cursor-pointer">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M15 18l-6-6 6-6" />
                </svg>
            </button>
            <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 z-20 text-white/50 hover:text-white transition-all p-2 hover:translate-x-2 active:scale-75 duration-300 cursor-pointer">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M9 18l6-6-6-6" />
                </svg>
            </button>

            <div className="relative z-10 text-center flex flex-col items-center w-full max-w-4xl mx-auto px-4">
                {/* Logo / Branding */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="mb-6"
                >
                    <div className="flex flex-col items-center">
                        <Image
                            src="/F14 logga.png"
                            alt="FLOATING FOURTEEN"
                            width={180}
                            height={180}
                            className="invert mix-blend-overlay opacity-90 pointer-events-none select-none"
                            draggable={false}
                            priority
                        />
                        <p className="text-[9px] tracking-[0.8em] font-bold uppercase mb-4 text-zinc-400 mt-6">
                            STOCKHOLM SWEDEN TO MANCHESTER UK
                        </p>
                    </div>

                    {/* Button Removed as per request */}
                </motion.div>

                {/* Main Navigation - RESTORED */}
                <nav className="flex flex-col md:flex-row gap-6 md:gap-12 justify-center items-center text-[12px] md:text-[11px] uppercase tracking-[0.3em] font-black cursor-pointer mb-8 text-zinc-300">
                    {['Supply', 'Archive', 'About Us', 'Visuals', 'FAQ'].map((item, i) => (
                        <motion.a
                            key={item}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            onClick={() => onNavigate(item === 'About Us' ? 'lore' : item.toLowerCase())}
                            className="hover:text-white hover:scale-105 transition duration-300 relative group"
                        >
                            {item}
                            <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-red-600 transition-all duration-300 group-hover:w-full"></span>
                        </motion.a>
                    ))}
                </nav>

                {/* Social Icons */}
                <div className="flex justify-center gap-6 mt-2 relative z-50">
                    <a href="https://www.instagram.com/floatingfourteen/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-red-600 transition duration-300 transform hover:scale-125 opacity-80 hover:opacity-100">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                    </a>
                    <a href="https://www.tiktok.com/@floatingfourteen" target="_blank" rel="noopener noreferrer" className="text-white hover:text-red-600 transition duration-300 transform hover:scale-125 opacity-80 hover:opacity-100">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                        </svg>
                    </a>
                </div>
            </div>
        </div>
    );
}
