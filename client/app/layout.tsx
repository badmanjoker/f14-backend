import type { Metadata } from 'next';
import { Inter, Archivo } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import AudioPlayer from '@/components/AudioPlayer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const street = Archivo({ subsets: ['latin'], variable: '--font-street', display: 'swap' });

export const metadata: Metadata = {
  title: 'FLOATING FOURTEEN | Supply',
  description: 'Underground Streetwear. Stockholm - Manchester.',
};

import GlobalHeader from '@/components/GlobalHeader';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${street.variable} bg-black text-white antialiased overflow-x-hidden`}>
        <Providers>
          <div className="noise-overlay fixed inset-0 z-[9998] pointer-events-none opacity-[0.15] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
          <GlobalHeader />
          {/* <AudioPlayer /> Removed */}
          {children}
        </Providers>
      </body>
    </html>
  );
}
