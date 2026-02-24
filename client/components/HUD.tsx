'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/components/SettingsContext';

export default function HUD() {
    const { getSetting, loading } = useSettings();
    const [timeLeft, setTimeLeft] = useState({ d: '00', h: '00', m: '00', s: '00' });
    const [isLive, setIsLive] = useState(false);

    useEffect(() => {
        if (loading) return;

        // Custom Settings
        const launchDateStr = getSetting('launch_date', '');
        const timerActive = getSetting('timer_active', 'false') === 'true';

        // If timer is NOT active, show LIVE status immediately
        if (!timerActive) {
            setIsLive(true);
            return;
        }

        // If no date set but timer is active, default to "PENDING"
        if (!launchDateStr) {
            return;
        }

        const targetDate = new Date(launchDateStr).getTime();

        // Safety check for invalid date
        if (isNaN(targetDate)) {
            return;
        }

        const calculateTime = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;

            if (distance < 0) {
                setIsLive(true);
                setTimeLeft({ d: '00', h: '00', m: '00', s: '00' });
            } else {
                setIsLive(false);
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                setTimeLeft({
                    d: days < 10 ? `0${days}` : `${days}`,
                    h: hours < 10 ? `0${hours}` : `${hours}`,
                    m: minutes < 10 ? `0${minutes}` : `${minutes}`,
                    s: seconds < 10 ? `0${seconds}` : `${seconds}`
                });
            }
        };

        // Initial call
        calculateTime();

        // Interval
        const interval = setInterval(calculateTime, 1000);
        return () => clearInterval(interval);
    }, [loading, getSetting]);

    // Render Logic
    if (loading) return null;

    return (
        <div className="bottom-hud-container mt-20 text-center">
            <div className="digital-hud inline-block p-6">
                <div className={`text-[9px] uppercase tracking-[0.2em] mb-1 font-bold ${isLive ? 'text-emerald-500 animate-pulse' : 'text-red-600 opacity-60'}`}>
                    {isLive ? 'SYSTEM ONLINE :: SHOP OPEN' : 'LAUNCH SEQUENCE INITIATED'}
                </div>

                {!isLive && (
                    <div className="text-sm md:text-base text-zinc-400 font-mono font-bold tracking-widest tabular-nums">
                        <span>{timeLeft.d}</span>:<span>{timeLeft.h}</span>:<span>{timeLeft.m}</span>:<span>{timeLeft.s}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
