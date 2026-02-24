'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Hero from '@/components/Hero';
import Supply from '@/components/Supply';
import Archive from '@/components/Archive';
import Lore from '@/components/Lore';
import Visuals from '@/components/Visuals';
import FAQ from '@/components/FAQ';
import SizeGuideModal from '@/components/SizeGuideModal';
import GlobalFooter from '@/components/GlobalFooter';
import EnterScreen from '@/components/EnterScreen';
import AudioPlayer from '@/components/AudioPlayer';

import EmailModal from '@/components/EmailModal';
import GlobalBackNav from '@/components/GlobalBackNav';
import Toast from '@/components/Toast';
import { useCart } from '@/context/CartContext';

function HomeContent() {
  const searchParams = useSearchParams();
  const shouldSkipEnter = searchParams.get('skipEnter') === 'true';
  const [view, setView] = useState(shouldSkipEnter ? 'home' : 'enter'); // 'enter', 'home', 'supply', 'archive', 'lore', 'visuals', 'faq'
  const { showToast, setShowToast } = useCart();


  const [faqTarget, setFaqTarget] = useState<string | undefined>(undefined);

  const handleEnter = () => {
    setView('home');
    // AudioPlayer self-manages via DOM events or auto-play
  };

  const handleNavigate = (target: string, subTarget?: string) => {
    // Basic routing
    setView(target);

    // Handle specific sub-sections
    if (target === 'faq' && subTarget) {
      setFaqTarget(subTarget);
    } else {
      setFaqTarget(undefined);
    }
  };

  const [showEmailModal, setShowEmailModal] = useState(false);

  // Auto-Open Newsletter Logic
  useEffect(() => {
    // Check if user has already seen the popup
    const hasSeen = localStorage.getItem('has_seen_newsletter');
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setShowEmailModal(true);
      }, 10000); // 10 seconds delay
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseEmail = () => {
    setShowEmailModal(false);
    localStorage.setItem('has_seen_newsletter', 'true');
  };

  const handleBack = () => {
    setView('home');
    setFaqTarget(undefined);
  };

  return (
    <main className="bg-black min-h-screen text-white overflow-hidden active-section">
      {view === 'enter' && <EnterScreen onEnter={handleEnter} />}

      <EmailModal isOpen={showEmailModal} onClose={handleCloseEmail} />


      {/* Persistent Audio (mounted in layout, but we can control it here if needed, or just let it autoplay after interaction) */}
      {view !== 'home' && view !== 'enter' && <GlobalBackNav onBack={handleBack} />}

      {view === 'home' && <Hero onNavigate={handleNavigate} />}

      {view === 'supply' && (
        <div className="fixed inset-0 overflow-y-auto bg-black z-50 animate-up">
          <Supply onBack={handleBack} />
        </div>
      )}

      {view === 'archive' && (
        <div className="fixed inset-0 overflow-y-auto bg-black z-50 animate-up">

          <Archive />
          <GlobalFooter onNavigate={handleNavigate} />
        </div>
      )}

      {view === 'lore' && (
        <div className="fixed inset-0 overflow-y-auto bg-black z-50 animate-up">

          <Lore />
          <GlobalFooter onNavigate={handleNavigate} />
        </div>
      )}

      {view === 'visuals' && (
        <div className="fixed inset-0 overflow-y-auto bg-black z-50 animate-up">

          <Visuals />
          <GlobalFooter onNavigate={handleNavigate} />
        </div>
      )}

      {view === 'faq' && (
        <div className="fixed inset-0 overflow-y-auto bg-black z-50 animate-up">
          <FAQ defaultOpen={faqTarget} />
          <GlobalFooter onNavigate={handleNavigate} />
        </div>
      )}

      {/* Global Size Guide View (Triggered from Footer) */}
      <SizeGuideModal
        isOpen={view === 'size-guide'}
        onClose={() => handleBack()}
        sizeGuide="hoodie" // Default to hoodie for global view
      />
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="bg-black min-h-screen" />}>
      <HomeContent />
    </Suspense>
  );
}
