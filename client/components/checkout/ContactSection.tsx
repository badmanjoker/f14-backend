'use client';

import FloatingInput from './inputs/FloatingInput';

interface ContactSectionProps {
    email: string;
    onChange: (email: string) => void;
    error?: string;
}

export default function ContactSection({ email, onChange, error }: ContactSectionProps) {
    return (
        <div className="space-y-4 animate-up">
            <div className="flex justify-between items-baseline mb-2">
                <h2 className="text-lg font-black italic uppercase text-white">Contact</h2>
                <div className="text-xs text-zinc-500">
                    Already have an account? <button className="text-white hover:underline decoration-red-600 underline-offset-4">Log in</button>
                </div>
            </div>

            <FloatingInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => onChange(e.target.value)}
                error={error}
                autoComplete="email"
            />

            <div className="flex items-start gap-3">
                <input
                    type="checkbox"
                    id="newsletter"
                    className="w-4 h-4 mt-0.5 rounded-sm bg-zinc-900 border-zinc-700 accent-red-600 focus:ring-0 cursor-pointer"
                />
                <div className="space-y-1">
                    <label htmlFor="newsletter" className="text-sm text-zinc-400 select-none cursor-pointer block">
                        Email me with news and offers
                    </label>
                    <p className="text-xs text-zinc-500 italic border-b border-zinc-500/30 pb-0.5 inline-block">
                        We don't spam. You'll only receive crucial updates and exclusive campaign access (e.g. Black Friday giveaways).
                    </p>
                </div>
            </div>
        </div>
    );
}
