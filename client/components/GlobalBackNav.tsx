'use client';

import Image from 'next/image';

interface GlobalBackNavProps {
    onBack: () => void;
}

export default function GlobalBackNav({ onBack }: GlobalBackNavProps) {
    return (
        <div className="back-nav-container" onClick={onBack}>
            <Image
                src="/F14 logga.png"
                alt="Back Home"
                width={45}
                height={45}
                className="back-nav-logo"
            />
        </div>
    );
}
