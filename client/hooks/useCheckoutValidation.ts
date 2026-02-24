import { useState } from 'react';
import { AddressData } from '@/components/checkout/DeliverySection';

export interface ValidationErrors extends Partial<AddressData> {
    email?: string;
}

export function useCheckoutValidation() {
    const [errors, setErrors] = useState<ValidationErrors>({});

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return 'Email is required';
        if (!emailRegex.test(email)) return 'Please enter a valid email';
        return '';
    };

    const validateAddress = (data: AddressData) => {
        const newErrors: Partial<AddressData> = {};

        if (!data.firstName.trim()) newErrors.firstName = 'First name required';
        if (!data.lastName.trim()) newErrors.lastName = 'Last name required';
        if (!data.address.trim()) newErrors.address = 'Address required';
        if (!data.city.trim()) newErrors.city = 'City required';

        // Postal Code: Digits only, 3-6 chars typically (SE is 5)
        const postalRegex = /^\d+$/;
        if (!data.postalCode) {
            newErrors.postalCode = 'Postal code required';
        } else if (!postalRegex.test(data.postalCode.replace(/\s/g, ''))) {
            newErrors.postalCode = 'Digits only';
        }

        // Phone: Digits + plus sign allowed
        const phoneRegex = /^[\d+\s-]+$/;
        if (!data.phone) {
            newErrors.phone = 'Phone required';
        } else if (!phoneRegex.test(data.phone)) {
            newErrors.phone = 'Invalid phone format';
        }

        return newErrors;
    };

    const validateAll = (email: string, address: AddressData) => {
        const emailError = validateEmail(email);
        const addressErrors = validateAddress(address);

        const allErrors = { ...addressErrors, email: emailError || undefined };
        // Remove undefined keys
        Object.keys(allErrors).forEach(key => {
            if (allErrors[key as keyof ValidationErrors] === undefined) {
                delete allErrors[key as keyof ValidationErrors];
            }
        });

        setErrors(allErrors);
        return Object.keys(allErrors).length === 0;
    };

    const clearError = (field: keyof ValidationErrors) => {
        setErrors(prev => ({ ...prev, [field]: undefined }));
    };

    return {
        errors,
        validateAll,
        validateEmail,
        validateAddress,
        setErrors,
        clearError
    };
}
