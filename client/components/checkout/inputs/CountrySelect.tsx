'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountrySelectProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
}

const COUNTRIES = [
    {
        label: "Europe",
        options: [
            "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic",
            "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary",
            "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands",
            "Norway", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", "Spain",
            "Svalbard and Jan Mayen", "Sweden", "Switzerland", "United Kingdom", "Åland"
        ]
    },
    {
        label: "North America",
        options: ["Canada", "United States"]
    },
    {
        label: "Rest of the World",
        options: ["Anguilla", "Australia", "Brazil", "India", "Japan"]
    }
];

export default function CountrySelect({ value, onChange, error }: CountrySelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Filter countries based on search
    const filteredGroups = COUNTRIES.map(group => ({
        ...group,
        options: group.options.filter(c => c.toLowerCase().includes(search.toLowerCase()))
    })).filter(group => group.options.length > 0);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearch(''); // Reset search on close
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when opened
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = (country: string) => {
        onChange(country);
        setIsOpen(false);
        setSearch('');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-zinc-900 border ${error ? 'border-red-500' : 'border-zinc-800'} rounded-md px-4 py-3.5 text-sm text-left appearance-none focus:outline-none transition-colors flex justify-between items-center ${value ? 'text-white' : 'text-zinc-500'}`}
            >
                <span className={value ? 'text-white' : 'text-transparent'}>{value || 'Select Country'}</span>
                <span className="text-[10px] text-zinc-500 transform transition-transform duration-200" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
            </button>

            {/* Floating Label */}
            <label className={`absolute left-4 transition-all duration-200 pointer-events-none ${value || isOpen ? 'top-1 text-[10px] text-zinc-500' : 'top-3.5 text-sm text-zinc-500'}`}>
                Country/Region
            </label>

            {/* Dropdown Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.1 }}
                        className="absolute z-50 w-full mt-1 bg-black border border-zinc-800 rounded-md shadow-2xl max-h-[300px] overflow-hidden flex flex-col"
                    >
                        {/* Search Input */}
                        <div className="p-2 border-b border-zinc-900 sticky top-0 bg-black z-10">
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search country..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-zinc-900 text-white text-xs p-2 rounded-sm outline-none border border-transparent focus:border-zinc-700 placeholder-zinc-600"
                            />
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                            {filteredGroups.length === 0 ? (
                                <div className="p-4 text-center text-xs text-zinc-600">No results found</div>
                            ) : (
                                filteredGroups.map((group) => (
                                    <div key={group.label}>
                                        <div className="px-4 py-2 text-[10px] uppercase font-bold text-zinc-600 bg-zinc-900/50 sticky top-0 backdrop-blur-sm">
                                            {group.label}
                                        </div>
                                        {group.options.map((country) => (
                                            <button
                                                key={country}
                                                type="button"
                                                onClick={() => handleSelect(country)}
                                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${value === country
                                                    ? 'bg-white text-black font-bold'
                                                    : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                                                    }`}
                                            >
                                                {country}
                                            </button>
                                        ))}
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
