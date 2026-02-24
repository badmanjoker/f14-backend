'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SiteSetting {
    key: string;
    value: string;
    label: string;
}

interface SettingsContextType {
    settings: SiteSetting[];
    getSetting: (key: string, fallback?: string) => string;
    loading: boolean;
    refreshSettings: () => void;
    updateSetting: (key: string, value: string) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<SiteSetting[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://f14-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/settings?t=${Date.now()}`);
            if (!res.ok) throw new Error('Failed to fetch settings');
            const data = await res.json();

            // Normalize relative paths AND fix legacy localhost URLs
            const normalizedData = data.map((s: SiteSetting) => {
                let val = s.value;
                if (!val) return s;

                // If it's a local upload (either relative OR absolute localhost), make it relative first
                if (val.includes('/uploads/')) {
                    // Strip any domain prefix (e.g. http://localhost:5001/uploads/img.jpg -> /uploads/img.jpg)
                    const relativePath = val.substring(val.indexOf('/uploads/'));

                    // Prepend the CURRENT environment's API URL
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://f14-backend.onrender.com';
                    return { ...s, value: `${apiUrl}${relativePath}` };
                }
                return s;
            });

            setSettings(normalizedData);
        } catch (error) {
            console.error('Failed to fetch site settings', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const getSetting = (key: string, fallback: string = '') => {
        const found = settings.find(s => s.key === key);
        return found ? found.value : fallback;
    };

    const updateSetting = async (key: string, value: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://f14-backend.onrender.com';
            const res = await fetch(`${apiUrl}/api/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value })
            });

            if (!res.ok) throw new Error('Failed to update setting');
            await fetchSettings(); // Refresh local state
        } catch (error) {
            console.error('Update setting error:', error);
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, getSetting, loading, refreshSettings: fetchSettings, updateSetting }}>
            {children}
        </SettingsContext.Provider>
    );
}

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within a SettingsProvider');
    return context;
};
