import Link from 'next/link';
import { notFound } from 'next/navigation';
import BackButton from '@/components/BackButton';

export async function generateStaticParams() {
    return [
        { slug: 'refund-policy' },
        { slug: 'shipping-policy' },
        { slug: 'privacy-policy' },
        { slug: 'terms-of-service' },
        { slug: 'size-guide' },
        { slug: 'cookie-policy' },
    ];
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const policies: Record<string, { title: string; content: string }> = {
        'refund-policy': {
            title: 'Refund Policy',
            content: `
                <div class="space-y-8">
                    <section>
                        <h2 class="text-2xl font-bebas text-white mb-4">14 DAYS TO CHANGE YOUR MIND</h2>
                        <p>Changed your mind? No problem. It’s okay if it didn’t fit or wasn't your style. You have <strong>14 days</strong> after receiving your order to return it for a full refund.</p>
                    </section>
                    
                    <section>
                        <h2 class="text-2xl font-bebas text-white mb-4">HOW TO RETURN</h2>
                        <ol class="list-decimal pl-5 space-y-2 text-zinc-400">
                            <li><strong>Email Us:</strong> Send a quick note to <a href="mailto:Floatingfourteen@gmail.com" class="text-white hover:underline">Floatingfourteen@gmail.com</a> so we know it’s coming.</li>
                            <li><strong>Pack It:</strong> Ensure the item is unworn, unwashed, and generally in the same condition you received it (tags on, please!).</li>
                            <li><strong>Send It:</strong> Ship the package to: <br/><strong class="text-white block mt-2">[RETURN ADDRESS]</strong></li>
                        </ol>
                        <p class="mt-4 text-sm italic text-zinc-500">*We ask that you cover the return shipping cost, unless the item was faulty when it arrived.*</p>
                    </section>

                    <section>
                        <h2 class="text-2xl font-bebas text-white mb-4">GETTING YOUR MONEY BACK</h2>
                        <p>Once we receive your return, we’ll process a refund to your original payment method within 14 days. Easy.</p>
                    </section>

                    <section>
                        <h2 class="text-2xl font-bebas text-white mb-4">DAMAGED ITEM?</h2>
                        <p>Did something arrive broken? We’re so sorry. Email us a photo at <a href="mailto:Floatingfourteen@gmail.com" class="text-white hover:underline">Floatingfourteen@gmail.com</a> and we’ll send a replacement or refund immediately.</p>
                    </section>
                </div>
            `,
        },
        'shipping-policy': {
            title: 'Shipping Policy',
            content: `
                <div class="space-y-8">
                    <section>
                        <h2 class="text-2xl font-bebas text-white mb-4">WHERE WE SHIP</h2>
                        <p>We ship to all countries in the <strong>European Union (EU)</strong> and the <strong>United Kingdom (UK)</strong>.</p>
                    </section>

                    <section>
                        <h2 class="text-2xl font-bebas text-white mb-4">DELIVERY TIMES</h2>
                        <p class="mb-2">We aim to pack your order within 1-3 days.</p>
                        <ul class="list-disc pl-5 space-y-2 text-zinc-400">
                            <li><strong>EU:</strong> 3-7 business days.</li>
                            <li><strong>UK:</strong> 4-8 business days.</li>
                        </ul>
                        <p class="mt-2 text-sm italic text-zinc-500">*Times are estimates, but we always do our best to get your gear to you fast!*</p>
                    </section>

                    <section>
                        <h2 class="text-2xl font-bebas text-white mb-4">CUSTOMS & DUTIES</h2>
                        <div class="space-y-4">
                            <div>
                                <h3 class="text-lg font-bold text-white mb-2">EU</h3>
                                <p>Smooth sailing. No customs fees or extra taxes for you.</p>
                            </div>
                            <div>
                                <h3 class="text-lg font-bold text-white mb-2">UK</h3>
                                <ul class="list-disc pl-5 space-y-2 text-zinc-400">
                                    <li><strong>Orders under £135:</strong> We include VAT in the price. You pay nothing extra at the door.</li>
                                    <li><strong>Orders over £135:</strong> We remove VAT at checkout. However, you will need to pay Import VAT and Customs Duty to the courier upon delivery.</li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>
            `,
        },
        'privacy-policy': {
            title: 'Privacy Policy',
            content: `
                <div class="space-y-8">
                    <section>
                        <h2 class="text-2xl font-bebas text-white mb-4">WE RESPECT YOUR DATA</h2>
                        <p>At Floating Fourteen, we treat your data the way we’d want our own to be treated – with respect and security. We comply fully with GDPR (EU) and UK GDPR.</p>
                    </section>

                    <section>
                        <h2 class="text-2xl font-bebas text-white mb-4">WHAT WE COLLECT & WHY</h2>
                        <p class="mb-2">We only collect what we need to get your gear to you:</p>
                        <ul class="list-disc pl-5 space-y-2 text-zinc-400">
                            <li><strong>Your Name & Address:</strong> So we know where to send your package.</li>
                            <li><strong>Your Email:</strong> To send you your order confirmation and tracking updates.</li>
                            <li><strong>Payment Info:</strong> Handled securely by our partners (Stripe/PayPal/Klarna). <strong>We never see or store your full card details.</strong></li>
                        </ul>
                    </section>

                    <section>
                        <h2 class="text-2xl font-bebas text-white mb-4">SHARING</h2>
                        <p>We never sell your data. We only share it with the partners who help us run the shop, such as the courier delivering your parcel and the bank processing your payment.</p>
                    </section>

                    <section>
                        <h2 class="text-2xl font-bebas text-white mb-4">YOUR RIGHTS</h2>
                        <p class="mb-2">It’s your data. You have the right to:</p>
                        <ul class="list-disc pl-5 space-y-2 text-zinc-400">
                            <li>See what info we hold about you.</li>
                            <li>Ask us to delete it ("Right to be forgotten").</li>
                            <li>Unsubscribe from our emails at any time.</li>
                        </ul>
                        <p class="mt-4">Questions? Drop us a line at <a href="mailto:Floatingfourteen@gmail.com" class="text-white hover:underline">Floatingfourteen@gmail.com</a>.</p>
                    </section>
                </div>
            `,
        },
        'terms-of-service': {
            title: 'Terms of Service',
            content: `
                <div class="space-y-8">
                    <section>
                        <h2 class="text-2xl font-bebas text-white mb-4">1. WELCOME</h2>
                        <p>Welcome to Floating Fourteen! When you shop with us, you’re buying from <strong>Floating Fourteen</strong> ("we", "us"). We follow all consumer protection laws in the EU and UK because we believe in fair play and happy customers.</p>
                    </section>

                    <section>
                        <h2 class="text-2xl font-bebas text-white mb-4">2. PRICES & TAXES (NO HIDDEN FEES)</h2>
                        <p>We want everything to be clear before you pay.</p>
                        <ul class="list-disc pl-5 space-y-2 text-zinc-400 mt-2">
                            <li><strong>EU Customers:</strong> The price you see includes VAT. No extra fees.</li>
                            <li><strong>UK Customers:</strong>
                                <ul class="list-disc pl-5 mt-2 space-y-1">
                                    <li>Orders under £135: We include VAT. No nasty surprises at delivery.</li>
                                    <li>Orders over £135: We remove VAT at checkout. You will pay Import VAT and Customs Duty directly to the courier when your package arrives.</li>
                                </ul>
                            </li>
                        </ul>
                    </section>

                    <section>
                        <h2 class="text-2xl font-bebas text-white mb-4">3. YOUR RIGHT TO CANCEL (14 DAYS)</h2>
                        <p>You have <strong>14 days</strong> from the day you receive your order to tell us you want to return it. You don't need a reason – maybe it just wasn't the right vibe. See our Refunds Policy for details.</p>
                    </section>

                    <section>
                        <h2 class="text-2xl font-bebas text-white mb-4">4. IF SOMETHING IS WRONG</h2>
                        <p>We carefully check every piece, but sometimes things happen. If your item is faulty or not as described, let us know immediately.</p>
                        <ul class="list-disc pl-5 space-y-2 text-zinc-400 mt-2">
                            <li><strong>EU:</strong> You have a 3-year legal guarantee.</li>
                            <li><strong>UK:</strong> You are protected by the Consumer Rights Act 2015.</li>
                        </ul>
                        <p class="mt-4">Just email us at <a href="mailto:Floatingfourteen@gmail.com" class="text-white hover:underline">Floatingfourteen@gmail.com</a> and we’ll sort it out instantly.</p>
                    </section>
                </div>
            `,
        },
        'cookie-policy': {
            title: 'Cookie Policy',
            content: `<p class="text-zinc-500 italic">Content coming soon.</p>`,
        },
        'size-guide': {
            title: 'Size Guide',
            content: `
                <div class="text-center mb-10">
                    <p class="text-xl text-zinc-300 italic font-medium">"Designed to be slightly oversized for that signature streetwear fit."</p>
                </div>
                
                <div class="grid md:grid-cols-2 gap-8">
                    <div class="bg-zinc-900 p-8 border border-zinc-800 relative overflow-hidden group">
                        <div class="absolute top-0 right-0 bg-white text-black text-[10px] font-bold px-2 py-1 uppercase">T-Shirts</div>
                        <h3 class="text-3xl font-bebas text-white mb-6">T-Shirts</h3>
                        <ul class="space-y-3 text-sm text-zinc-400 font-mono">
                            <li class="flex justify-between border-b border-zinc-800 pb-2"><span>SMALL</span> <span>W: 50cm / L: 70cm</span></li>
                            <li class="flex justify-between border-b border-zinc-800 pb-2"><span>MEDIUM</span> <span>W: 53cm / L: 72cm</span></li>
                            <li class="flex justify-between border-b border-zinc-800 pb-2"><span>LARGE</span> <span>W: 56cm / L: 74cm</span></li>
                            <li class="flex justify-between text-white"><span>X-LARGE</span> <span>W: 60cm / L: 76cm</span></li>
                        </ul>
                    </div>

                    <div class="bg-zinc-900 p-8 border border-zinc-800 relative overflow-hidden group">
                        <div class="absolute top-0 right-0 bg-white text-black text-[10px] font-bold px-2 py-1 uppercase">Hoodies</div>
                        <h3 class="text-3xl font-bebas text-white mb-6">Hoodies</h3>
                        <ul class="space-y-3 text-sm text-zinc-400 font-mono">
                            <li class="flex justify-between border-b border-zinc-800 pb-2"><span>SMALL</span> <span>W: 55cm / L: 68cm</span></li>
                            <li class="flex justify-between border-b border-zinc-800 pb-2"><span>MEDIUM</span> <span>W: 58cm / L: 70cm</span></li>
                            <li class="flex justify-between border-b border-zinc-800 pb-2"><span>LARGE</span> <span>W: 61cm / L: 72cm</span></li>
                            <li class="flex justify-between text-white"><span>X-LARGE</span> <span>W: 64cm / L: 74cm</span></li>
                        </ul>
                    </div>
                </div>

                <div class="mt-8 text-center bg-zinc-900/30 py-4 border border-zinc-800/50 text-zinc-500 text-xs uppercase tracking-widest">
                    If you prefer a tighter fit, size down. For the intended look, stick to your normal size.
                </div>
            `,
        },
    };

    const policy = policies[slug];

    if (!policy) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-black text-zinc-300 pt-32 pb-20 px-6 animate-up">
            <div className="max-w-4xl mx-auto">
                <div className="mb-12 flex items-center justify-between border-b border-zinc-900 pb-8">
                    <BackButton />
                    <span className="text-[10px] uppercase tracking-widest text-zinc-700">Floating Fourteen Policy</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black italic uppercase mb-12 text-white tracking-tighter loading-reveal">
                    {policy.title}
                </h1>

                <div
                    className="prose prose-invert prose-zinc max-w-none text-zinc-400 leading-relaxed prose-headings:font-bebas prose-headings:tracking-wide prose-a:text-white prose-a:no-underline hover:prose-a:underline"
                    dangerouslySetInnerHTML={{ __html: policy.content }}
                />
            </div>
        </div>
    );
}
