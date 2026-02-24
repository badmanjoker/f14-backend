import { useState } from 'react';

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export default function FloatingInput({ label, error, className = '', ...props }: FloatingInputProps) {
    const [focused, setFocused] = useState(false);
    const hasValue = props.value && props.value.toString().length > 0;

    return (
        <div className={`relative ${className}`}>
            <div className={`relative rounded-md border transition-colors duration-200 bg-zinc-900 overflow-hidden
                ${error ? 'border-red-500' : focused ? 'border-white' : 'border-zinc-800 hover:border-zinc-700'}
            `}>
                <input
                    {...props}
                    onFocus={(e) => {
                        setFocused(true);
                        props.onFocus?.(e);
                    }}
                    onBlur={(e) => {
                        setFocused(false);
                        props.onBlur?.(e);
                    }}
                    className={`
                        peer block w-full bg-transparent px-4 pt-5 pb-2 text-sm text-white focus:outline-none placeholder-transparent
                    `}
                    placeholder={label} // Required for :placeholder-shown trick if we used CSS, but we use state
                />
                <label
                    className={`
                        absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm transition-all duration-200 pointer-events-none origin-left
                        ${(focused || hasValue) ? 'top-3.5 scale-75' : ''}
                    `}
                >
                    {label}
                </label>
            </div>
            {error && <p className="mt-1 text-xs text-red-500 font-bold ml-1">{error}</p>}
        </div>
    );
}
