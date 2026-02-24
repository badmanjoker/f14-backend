'use client';

import { CartProvider } from '@/context/CartContext';
import CartSidebar from '@/components/CartSidebar';
import { SettingsProvider } from '@/components/SettingsContext';

import ToastManager from '@/components/ToastManager';

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SettingsProvider>
            <CartProvider>
                {children}
                <CartSidebar />
                <ToastManager />
            </CartProvider>
        </SettingsProvider>
    );
}
