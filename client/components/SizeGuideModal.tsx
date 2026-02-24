'use client';

import { useSettings } from '@/components/SettingsContext';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface SizeGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
    sizeGuide: string | null;
}

export default function SizeGuideModal({ isOpen, onClose, sizeGuide }: SizeGuideModalProps) {
    const { getSetting } = useSettings();
    const [activeGuide, setActiveGuide] = useState<string>(sizeGuide || 'hoodie');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Update active guide if prop changes
    useEffect(() => {
        if (sizeGuide) setActiveGuide(sizeGuide);
    }, [sizeGuide, isOpen]);

    if (!isOpen || !mounted) return null;

    const topChart = getSetting('size_chart_top', '/Size-chart-hoodie.png');
    const bottomChart = getSetting('size_chart_bottom', '/Size-chart-pants.jpg');
    const teeChart = getSetting('size_chart_tee', '/Size-chart-hoodie.png');

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const formatImgUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        if (path.startsWith('/uploads/')) return `${API_URL}${path}`;
        return path;
    };

    const chartImage = activeGuide === 'hoodie'
        ? topChart
        : activeGuide === 'pants'
            ? bottomChart
            : activeGuide === 'tee'
                ? teeChart
                : activeGuide;

    const modalContent = (
        <div className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
            <div
                className="bg-black border border-zinc-800 p-6 max-w-5xl w-full relative flex flex-col h-[80vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-start mb-6 flex-shrink-0">
                    <div>
                        <h3 className="text-xl font-black italic uppercase text-white mb-2">Size Guide</h3>

                        {/* Status Marker */}
                        <div className="flex gap-2">
                            <div className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] border border-red-600 bg-red-600/10 text-white">
                                {['hoodie', 'pants', 'tee'].includes(activeGuide) ? activeGuide : 'Custom Guide'}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white p-2 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-auto bg-zinc-900/10 border border-zinc-800/50 p-4 min-h-0 flex items-center justify-center rounded-sm">
                    <img
                        src={formatImgUrl(chartImage)}
                        alt="Size Chart"
                        className="max-h-full max-w-full object-contain"
                    />
                </div>

                <div className="mt-6 flex-shrink-0 pt-6 border-t border-zinc-900/50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-white text-black text-xs font-black uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
}
