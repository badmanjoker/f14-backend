'use client';

import { useSettings } from '@/components/SettingsContext';

interface EnterScreenProps {
    onEnter: () => void;
}

export default function EnterScreen({ onEnter }: EnterScreenProps) {
    const { getSetting } = useSettings();
    const logo = getSetting('enter_logo', '/F14 logga.png');

    return (
        <div
            id="enter-screen"
            onClick={onEnter}
            className="fixed inset-0 z-[9999] bg-black flex items-center justify-center cursor-pointer"
        >
            <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-8 relative" style={{ perspective: '1000px' }}>
                    <div
                        className="silver-logo pointer-events-none"
                        style={{
                            WebkitMaskImage: `url('${logo}')`,
                            maskImage: `url('${logo}')`
                        }}
                    ></div>
                </div>
                <p className="text-[12px] font-black uppercase tracking-[0.5em] animate-pulse text-white">
                    Click to Enter
                </p>
            </div>
        </div>
    );
}
