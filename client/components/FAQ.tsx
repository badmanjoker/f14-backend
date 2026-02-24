'use client';

import { useState, useEffect } from 'react';

const FAQS = [
    {
        q: "TERMS OF SERVICE",
        a: `OVERVIEW
This website is operated by FloatingFourteen. Throughout the site, the terms “we”, “us” and “our” refer to FloatingFourteen. Floating Fourteen offers this website, including all information, tools and Services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.

By visiting our site and/ or purchasing something from us, you engage in our “Service” and agree to be bound by the following terms and conditions (“Terms of Service”, “Terms”), including those additional terms and conditions and policies referenced herein and/or available by hyperlink. These Terms of Service apply to all users of the site, including without limitation users who are browsers, vendors, customers, merchants, and/ or contributors of content.

Please read these Terms of Service carefully before accessing or using our website. By accessing or using any part of the site, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any Services. If these Terms of Service are considered an offer, acceptance is expressly limited to these Terms of Service.

Any new features or tools which are added to the current store shall also be subject to the Terms of Service. You can review the most current version of the Terms of Service at any time on this page. We reserve the right to update, change or replace any part of these Terms of Service by posting updates and/or changes to our website. It is your responsibility to check this page periodically for changes. Your continued use of or access to the website following the posting of any changes constitutes acceptance of those.`
    },
    {
        q: "PRIVACY POLICY",
        a: `FloatingFourteen We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website Floatingfourteen.co.uk, make a purchase, or interact with our services.

Information We Collect

Personal Information:
Name
Email address
Mailing address
Phone number

Non-Personal Information:
Browser type
Device information
IP address
Time and date of visits

How We Use Your Information
We use the information we collect in the following ways:
To process and manage your orders
To improve our website and services
To personalize your shopping experience
To send you promotional offers and updates (you can opt-out at any time)
To respond to your inquiries and provide customer support
To prevent fraudulent transactions and ensure security

Sharing Your Information
We may share your information with third parties only in the following circumstances:
With service providers that help us operate our business (e.g., payment processors, shipping companies)
To comply with legal obligations or protect our rights
In the event of a business transfer (e.g., merger, acquisition)

Cookies and Tracking Technologies
We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookies through your browser settings.

Data Security
We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction.

Your Rights
You have the right to:
Access the personal information we hold about you
Request the correction of inaccurate information
Request the deletion of your personal information
Opt-out of marketing communications`
    },
    {
        q: "SHIPPING INFORMATION",
        a: `Shipping Policy
Welcome to FloatingFourteen! We aim to provide you with the best shopping experience, including fast and reliable shipping services.

Domestic Shipping

Processing Time:
All orders are processed within 1-3 business days.
Orders are not processed or shipped on weekends or holidays.

Shipping Rates and Delivery Estimates:
Standard Shipping (5-7 business days): $5.99 or free for orders over $75.
Expedited Shipping (2-3 business days): $14.99`
    },
    {
        q: "WASHING INSTRUCTIONS",
        a: `Take the shirt inside-out
Machine wash with similar colors
Hang dry is the best but you can use dry machine
Do not bleach
Use cool iron inside-out`
    }
];

export default function FAQ({ defaultOpen }: { defaultOpen?: string }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [status, setStatus] = useState<'IDLE' | 'SENDING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (defaultOpen) {
            if (defaultOpen === 'terms') setOpenIndex(0); // Terms of Service
            else if (defaultOpen === 'privacy') setOpenIndex(1); // Privacy Policy
            else if (defaultOpen === 'shipping') setOpenIndex(2); // Shipping Info
            else if (defaultOpen === 'washing') setOpenIndex(3); // Washing Instructions
        }
    }, [defaultOpen]);

    const toggleFaq = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('SENDING');
        setErrorMessage('');

        const form = e.currentTarget;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Use environment variable for production, fallback to 5000 locally
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        console.log('🚀 Sending message to:', `${API_URL}/api/contact`);

        try {
            const res = await fetch(`${API_URL}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                setStatus('SUCCESS');
                form.reset();
                setMessage(''); // Reset message char count
                setTimeout(() => setStatus('IDLE'), 5000);
            } else {
                const errorData = await res.json();
                setErrorMessage(errorData.error || 'SERVER ERROR');
                setStatus('ERROR');
            }
        } catch (error: any) {
            console.error(error);
            setErrorMessage(`NETWORK ERROR: ${error.message}`);
            setStatus('ERROR');
        }
    };

    const [message, setMessage] = useState('');
    const MAX_CHARS = 300;

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        if (val.length <= MAX_CHARS) {
            setMessage(val);
        }
    };

    return (
        <section id="faq" className="relative pt-32 pb-20 bg-black min-h-screen">
            <div className="max-w-4xl mx-auto px-6">
                <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter mb-16 text-center animate-up">
                    FAQ
                </h1>
                <div className="border-t border-zinc-800">
                    {FAQS.map((faq, index) => (
                        <div key={index} className="border-b border-zinc-800">
                            <button
                                onClick={() => toggleFaq(index)}
                                className="w-full text-left py-4 text-base md:text-lg font-black italic uppercase tracking-wider text-zinc-500 hover:text-white transition-colors flex justify-between items-center"
                            >
                                {faq.q}
                                <span className="text-sm">{openIndex === index ? '-' : '+'}</span>
                            </button>
                            {openIndex === index && (
                                <div className="pb-4 text-[10px] md:text-xs text-zinc-400 leading-relaxed font-bold uppercase tracking-wide whitespace-pre-line overflow-y-auto max-h-[400px] pr-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                                    {faq.a}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="text-center mt-20 mb-32 max-w-2xl mx-auto">
                    <p className="text-xs md:text-sm uppercase text-zinc-500 mb-8 font-bold tracking-widest">Still have questions?</p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest">Name</label>
                                <input name="name" required type="text" className="bg-transparent border border-zinc-800 p-3 text-xs text-white font-bold tracking-wider outline-none focus:border-white transition-colors placeholder-zinc-800" placeholder="Your Name" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest">Phone (Optional)</label>
                                <input name="phone" type="tel" pattern="[0-9]*" onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '') }} className="bg-transparent border border-zinc-800 p-3 text-xs text-white font-bold tracking-wider outline-none focus:border-white transition-colors placeholder-zinc-800" placeholder="Phone Number" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest">Email</label>
                                <input name="email" required type="email" className="bg-transparent border border-zinc-800 p-3 text-xs text-white font-bold tracking-wider outline-none focus:border-white transition-colors placeholder-zinc-800" placeholder="Email Address" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest">Order Number (Optional)</label>
                                <input name="orderNumber" type="text" className="bg-transparent border border-zinc-800 p-3 text-xs text-white font-bold tracking-wider outline-none focus:border-white transition-colors placeholder-zinc-800" placeholder="#12345" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-end">
                                <label className="text-[10px] uppercase font-bold text-zinc-600 tracking-widest">Message</label>
                                <span className={`text-[10px] font-mono font-bold ${message.length >= MAX_CHARS ? 'text-red-500' : 'text-zinc-600'}`}>
                                    {message.length} / {MAX_CHARS} LETTERS
                                </span>
                            </div>
                            <textarea
                                name="message"
                                required
                                rows={4}
                                value={message}
                                onChange={handleMessageChange}
                                className="bg-transparent border border-zinc-800 p-3 text-xs text-white font-bold tracking-wider outline-none focus:border-white transition-colors placeholder-zinc-800 resize-none"
                                placeholder="How can we help?"
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            disabled={status === 'SENDING' || status === 'SUCCESS'}
                            className={`font-black italic uppercase tracking-widest py-4 mt-4 transition-all ${status === 'SUCCESS' ? 'bg-emerald-500 text-black' : 'bg-white text-black hover:bg-zinc-200 hover:-translate-y-1'} disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shadow-lg hover:shadow-xl`}
                        >
                            {status === 'SENDING' ? 'SENDING...' : status === 'SUCCESS' ? 'MESSAGE SENT' : 'SEND MESSAGE'}
                        </button>

                        {status === 'ERROR' && (
                            <p className="text-red-500 text-[10px] font-bold text-center mt-2 uppercase">{errorMessage || 'SOMETHING WENT WRONG. PLEASE TRY AGAIN.'}</p>
                        )}
                    </form>
                </div>
            </div>
        </section>
    );
}

