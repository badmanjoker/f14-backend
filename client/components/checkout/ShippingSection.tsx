'use client';

interface ShippingSectionProps {
    shippingCost: number;
}

export default function ShippingSection({ shippingCost }: ShippingSectionProps) {
    return (
        <div className="space-y-4 pt-8 animate-up" style={{ animationDelay: '200ms' }}>
            <h2 className="text-lg font-black italic uppercase text-white mb-2">Shipping Method</h2>

            <div className="border border-zinc-800 rounded-md bg-zinc-900 overflow-hidden">
                <div className="p-4 flex items-center justify-between cursor-pointer border border-white bg-zinc-800 relative z-10">
                    <div className="flex items-center gap-3">
                        <input
                            type="radio"
                            checked
                            readOnly
                            className="w-4 h-4 text-black bg-white border-zinc-600 focus:ring-0"
                        />
                        <div className="flex flex-col">
                            <span className="text-sm text-white font-bold">Standard Shipping</span>
                            <span className="text-xs text-zinc-400">3-5 business days</span>
                        </div>
                    </div>
                    <span className="text-sm font-bold text-white">
                        {shippingCost === 0 ? 'Free' : `£${shippingCost}.00`}
                    </span>
                </div>
            </div>
        </div>
    );
}
