'use client';

import { useCart } from '@/context/CartContext';
import Toast from './Toast';

export default function ToastManager() {
    const { showToast, setShowToast, toggleCart, toastId } = useCart();

    return (
        <Toast
            message="ADDED TO BAG"
            isActive={showToast}
            onClose={() => setShowToast(false)}
            onCheckout={() => {
                setShowToast(false);
                toggleCart();
            }}
            toastId={toastId}
        />
    );
}
