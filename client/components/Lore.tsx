'use client';

import { motion } from 'framer-motion';

export default function Lore() {
    return (
        <section id="lore" className="relative py-40 bg-black flex items-center justify-center overflow-hidden">
            {/* Subtle Background Element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-zinc-900/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 text-center z-10">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter mb-12 text-white/90"
                >
                    Floating Fourteen
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    className="space-y-8"
                >
                    <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto font-light">
                        Founded by three friends from <span className="text-white font-medium">Stockholm</span>, now operating between Sweden and <span className="text-white font-medium">Manchester</span>.
                    </p>
                    <p className="text-lg md:text-xl text-zinc-500 leading-relaxed max-w-2xl mx-auto font-light">
                        What began as an obsession with fashion & culture evolved into a canvas for our shared ideas and aesthetics.
                        We don't just sell clothes; we build a world.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.4 }}
                    className="mt-16 w-16 h-1 bg-white mx-auto"
                />
            </div>
        </section>
    );
}
