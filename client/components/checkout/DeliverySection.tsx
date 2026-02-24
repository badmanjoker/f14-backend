'use client';

import FloatingInput from './inputs/FloatingInput';
import CountrySelect from './inputs/CountrySelect';

// Define the shape of address data
export interface AddressData {
    firstName: string;
    lastName: string;
    address: string;
    apartment: string;
    postalCode: string;
    city: string;
    country: string;
    phone: string;
}

interface DeliverySectionProps {
    data: AddressData;
    onChange: (field: keyof AddressData, value: string) => void;
    errors: Partial<Record<keyof AddressData, string>>;
}

export default function DeliverySection({ data, onChange, errors }: DeliverySectionProps) {
    return (
        <div className="space-y-4 pt-8 animate-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-lg font-black italic uppercase text-white mb-2">Delivery</h2>

            {/* Country Select (Simplified for now) */}
            {/* Country Select */}
            <CountrySelect
                value={data.country}
                onChange={(val) => onChange('country', val)}
                error={errors.country}
            />

            <div className="grid grid-cols-2 gap-4">
                <FloatingInput
                    label="First name"
                    value={data.firstName}
                    onChange={(e) => onChange('firstName', e.target.value)}
                    error={errors.firstName}
                />
                <FloatingInput
                    label="Last name"
                    value={data.lastName}
                    onChange={(e) => onChange('lastName', e.target.value)}
                    error={errors.lastName}
                />
            </div>

            <FloatingInput
                label="Address"
                value={data.address}
                onChange={(e) => onChange('address', e.target.value)}
                error={errors.address}
            />

            <FloatingInput
                label="Apartment, suite, etc. (optional)"
                value={data.apartment}
                onChange={(e) => onChange('apartment', e.target.value)}
            />

            <div className="grid grid-cols-2 gap-4">
                <FloatingInput
                    label="Postal code"
                    value={data.postalCode}
                    onChange={(e) => onChange('postalCode', e.target.value)}
                    error={errors.postalCode}
                    maxLength={5} // E.g. for SE
                    inputMode="numeric"
                />
                <FloatingInput
                    label="City"
                    value={data.city}
                    onChange={(e) => onChange('city', e.target.value)}
                    error={errors.city}
                />
            </div>

            <div className="relative">
                <FloatingInput
                    label="Phone"
                    value={data.phone}
                    onChange={(e) => onChange('phone', e.target.value)}
                    error={errors.phone}
                    type="tel"
                    inputMode="tel"
                />
                {/* Tooltip Icon Mock */}
                <div className="absolute right-3 top-3.5 group cursor-help z-10">
                    <span className="text-zinc-600 text-xs hover:text-white transition-colors">?</span>
                    <div className="absolute bottom-full right-0 mb-2 w-48 bg-zinc-800 text-[10px] text-zinc-300 p-2 rounded hidden group-hover:block transition-opacity shadow-xl border border-zinc-700">
                        In case we need to contact you about your order.
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <input
                    type="checkbox"
                    id="sms_news"
                    className="w-4 h-4 rounded-sm bg-zinc-900 border-zinc-700 accent-red-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="sms_news" className="text-sm text-zinc-400 select-none cursor-pointer">
                    Text me with news and offers
                </label>
            </div>
        </div>
    );
}
