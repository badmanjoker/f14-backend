'use client';

import { useEffect, useRef } from 'react';

export default function AudioVisualizer({ isPlaying }: { isPlaying: boolean }) {
    const barsRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            barsRef.current.forEach(bar => {
                if (bar) {
                    const h = Math.floor(Math.random() * 75) + 5;
                    bar.style.height = `${h}px`;
                }
            });
        }, 80);

        return () => clearInterval(interval);
    }, [isPlaying]);

    return (
        <div id="visualizer" className={`visualizer-container ${!isPlaying ? 'paused' : ''}`}>
            {[...Array(5)].map((_, i) => (
                <div
                    key={i}
                    ref={el => { if (el) barsRef.current[i] = el; }}
                    className="vis-bar"
                ></div>
            ))}
        </div>
    );
}
