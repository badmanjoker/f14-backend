import Link from 'next/link';
import Image from 'next/image';

export default function CheckoutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black text-zinc-300 selection:bg-red-900 selection:text-white">
            {/* Minimal Header */}
            <header className="border-b border-zinc-900 py-6 px-4 md:px-8">
                <div className="max-w-7xl mx-auto relative flex items-center justify-center">
                    <Link href="/" className="hover:opacity-80 transition-opacity text-center z-10 px-4">
                        <span className="font-black italic uppercase text-lg md:text-2xl text-white tracking-tighter block">
                            FINAL STEP FOR SOME FIRE CLOTHING
                        </span>
                    </Link>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block">
                        <Link href="/" className="text-xs uppercase font-bold tracking-widest text-zinc-500 hover:text-white transition-colors">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            </header>

            <main>
                {children}
            </main>

            {/* Minimal Footer */}
            <footer className="py-8 border-t border-zinc-900 mt-auto bg-black">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-center gap-6 text-[10px] uppercase tracking-widest text-zinc-600">
                    <span>© 2026 FloatingFourteen</span>
                    <span className="flex gap-4">
                        <Link href="/policies/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/policies/terms-of-service" className="hover:text-white transition-colors">Terms of Service</Link>
                    </span>
                </div>
            </footer>
        </div>
    );
}
