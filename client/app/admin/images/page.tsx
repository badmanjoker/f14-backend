'use client';

/**
 * IMAGE SETTINGS (Master Fix)
 * 
 * - Cleaned up logic
 * - Universal Delete/Reset button
 * - Working File Inputs
 */

import { useState, useEffect, useRef } from 'react';
import { Save, RotateCcw, Upload, CheckCircle, Info, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '@/components/SettingsContext';

interface SiteSetting {
    key: string;
    value: string;
    label: string;
    description: string;
}

const CATEGORIES = {
    'Global & Logos': ['header_logo', 'enter_logo', 'auth_bg', 'about_img', 'collection_banner'],
    'Home Slideshow': ['hero_bg', 'slide_1', 'slide_2', 'slide_3', 'slide_4', 'slide_5', 'slide_6', 'slide_7', 'slide_8'],
    'Supply Page': ['supply_bg'],
    'Archive Page': ['archive_bg', 'archive_1', 'archive_2', 'archive_3', 'archive_4', 'archive_5', 'archive_6'],
    'Visuals Page': ['visuals_1', 'visuals_2', 'visuals_3', 'visuals_4'],
    'Size Guides': ['size_chart_top', 'size_chart_bottom', 'size_chart_tee']
};

export default function ImageSettingsPage() {
    const { refreshSettings } = useSettings();

    // --- DEFAULT DATA (Fallback) ---
    const defaultSlots: SiteSetting[] = [
        // GLOBAL
        { key: 'header_logo', label: 'Huvudlogotyp (Meny)', description: 'Logotypen som visas i menyn högst upp.', value: '/F14 logga.png' },
        { key: 'enter_logo', label: 'Startsida Logotyp', description: 'Logotypen på den svarta "Enter"-skärmen.', value: '/F14 logga.png' },
        { key: 'auth_bg', label: 'Bakgrund: Admin Inloggning', description: 'Bakgrundsbilden när du loggar in här.', value: '/leofilip.jpg' },
        { key: 'about_img', label: 'Bild: Om Oss', description: 'Visas på informationssidorna.', value: '/filip.jpg' },
        { key: 'collection_banner', label: 'Banner: Senaste Kollektion', description: 'Stor bannerbild för senaste släppet.', value: '/festbild.jpg' },

        // HOME
        { key: 'hero_bg', label: 'BAKGRUND (VID LADDNING/FEL)', description: 'Visas om bildspelet laddar långsamt eller går sönder.', value: '/Ducati.jpg' },
        // Slides are dynamic

        // SUPPLY
        { key: 'supply_bg', label: 'Bakgrund: Supply-sidan', description: 'Bakgrundsbilden för Supply-sidan.', value: '/cbr.png' },

        // ARCHIVE
        { key: 'archive_bg', label: 'Bakgrund: Arkiv-sidan', description: 'Bakgrundsbilden för hela Arkiv-sidan.', value: '/modo.jpg' },
        // Archive grids are dynamic

        // VISUALS
        { key: 'visuals_1', label: 'Visuals: Bild 1', description: 'Första bilden i Visuals-flödet', value: '/Ducati.jpg' },
        { key: 'visuals_2', label: 'Visuals: Bild 2', description: 'Andra bilden i Visuals-flödet', value: '/filip1.jpg' },

        // SIZE GUIDE
        { key: 'size_chart_top', label: 'Storleksguide (Överdelar)', description: 'Bild för hoodies/t-shirts.', value: '/Size-chart hoodie.png' },
        { key: 'size_chart_bottom', label: 'Storleksguide (Underdelar)', description: 'Bild för byxor.', value: '/Size-chart-pants.jpg' },
        { key: 'size_chart_tee', label: 'Storleksguide (T-Shirt)', description: 'Bild för t-shirts (Krakeen).', value: '/Size-chart hoodie.png' },
    ];

    // --- STATE ---
    const [settings, setSettings] = useState<SiteSetting[]>(defaultSlots);
    const [previews, setPreviews] = useState<Record<string, string>>({});
    const [selectedFiles, setSelectedFiles] = useState<Record<string, File>>({});
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [expandedCategory, setExpandedCategory] = useState<string | null>('Global & Logos');

    // --- FETCH ---
    const fetchSettings = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`);
            if (!res.ok) throw new Error('Serverfel');
            const data = await res.json();

            setSettings(currentSlots => {
                // 1. Map over defaults to update their values from DB
                const baseSlots = defaultSlots.map(slot => {
                    const found = data.find((s: any) => s.key === slot.key);
                    if (found) {
                        // Normalize URL for display
                        let val = found.value;
                        if (val && val.startsWith('/uploads/')) {
                            val = `${process.env.NEXT_PUBLIC_API_URL}${val}`;
                        }
                        return { ...slot, value: val };
                    }
                    return slot;
                });

                // 2. Find custom slots (slides/archives) that are NOT in defaults
                const customSlots = data.filter((d: any) => !defaultSlots.some(s => s.key === d.key));
                const formattedCustomSlots = customSlots.map((d: any) => {
                    // Normalize URL for display
                    let val = d.value;
                    if (val && val.startsWith('/uploads/')) {
                        val = `${process.env.NEXT_PUBLIC_API_URL}${val}`;
                    }

                    return {
                        key: d.key,
                        value: val,
                        label: d.label || d.key.replace('_', ' ').toUpperCase(),
                        description: 'Custom added slot'
                    };
                });

                return [...baseSlots, ...formattedCustomSlots];
            });

        } catch (error) {
            console.log('Offline / Fetch Error', error);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    // --- HANDLERS ---

    const handleAddSlot = (category: string) => {
        let prefix = '';
        let baseLabel = '';

        if (category === 'Home Slideshow') {
            prefix = 'slide_';
            baseLabel = 'Slide';
        } else if (category === 'Archive Page') {
            prefix = 'archive_';
            baseLabel = 'Archive Grid';
        } else if (category === 'Visuals Page') {
            prefix = 'visuals_';
            baseLabel = 'Visuals Image';
        } else {
            return;
        }

        // Find highest index
        const existingKeys = settings.filter(s => s.key.startsWith(prefix));
        let maxIndex = 0;
        existingKeys.forEach(s => {
            const num = parseInt(s.key.replace(prefix, '') || '0');
            if (!isNaN(num) && num > maxIndex) maxIndex = num;
        });

        const nextIndex = maxIndex + 1;
        const newKey = `${prefix}${nextIndex}`;
        const newLabel = `${baseLabel} ${nextIndex}`;

        const newSlot: SiteSetting = {
            key: newKey,
            value: '/placeholder.svg',
            label: newLabel,
            description: `Custom ${baseLabel} slot.`
        };

        setSettings(prev => [...prev, newSlot]);
    };

    const handleFileChange = (key: string, file: File | null) => {
        if (!file) return;
        const objectUrl = URL.createObjectURL(file);
        setPreviews(prev => ({ ...prev, [key]: objectUrl }));
        setSelectedFiles(prev => ({ ...prev, [key]: file }));
    };

    const handleReset = (key: string) => {
        setPreviews(prev => { const n = { ...prev }; delete n[key]; return n; });
        setSelectedFiles(prev => { const n = { ...prev }; delete n[key]; return n; });
    };

    const handleDeleteSlot = async (key: string) => {
        // Optimistic UI update
        setSettings(prev => prev.filter(s => s.key !== key));

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings/${key}`, { method: 'DELETE' });
            await refreshSettings();
            setMessage('Deleted!');
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Failed to delete', error);
            setMessage('Error deleting');
            fetchSettings(); // Revert on error
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage('Saving...');
        try {
            const promises = Object.entries(selectedFiles).map(async ([key, file]) => {
                // Upload
                const formData = new FormData();
                formData.append('image', file);
                const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings/upload`, { method: 'POST', body: formData });
                if (!uploadRes.ok) throw new Error('Upload failed');
                const { filePath } = await uploadRes.json();

                // SAVE RELATIVE PATH TO DB (Fixes localhost issue for remote users)
                const relativePath = filePath;
                const fullPath = `${process.env.NEXT_PUBLIC_API_URL}${filePath}`; // For local display update

                // Determine Label
                let label = settings.find(s => s.key === key)?.label;
                if (!label) {
                    if (key.startsWith('slide_')) label = `Slide ${key.split('_')[1]}`;
                    else if (key.startsWith('archive_')) label = `Archive Grid ${key.split('_')[1]}`;
                    else if (key.startsWith('visuals_')) label = `Visuals Image ${key.split('_')[1]}`;
                    else label = key;
                }

                // Save to DB
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ key, value: relativePath, label })
                });

                return { key, value: fullPath }; // Return full path for local state update
            });

            await Promise.all(promises);

            setPreviews({});
            setSelectedFiles({});
            setMessage('SAVED!');
            await refreshSettings();
            fetchSettings(); // Refresh full state

            setTimeout(() => setMessage(''), 4000);

        } catch (error) {
            console.error(error);
            setMessage('Error saving.');
        } finally {
            setSaving(false);
        }
    };

    const getFilename = (path: string) => {
        try { return path.split('/').pop() || path; } catch { return path; }
    };

    const toggleCategory = (cat: string) => setExpandedCategory(expandedCategory === cat ? null : cat);


    // --- RENDER CARD ---
    const renderSettingCard = (setting: SiteSetting) => {
        return (
            <div key={setting.key} className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-lg hover:border-zinc-600 transition-all group relative overflow-hidden">

                {/* DELETE BUTTON - UNIVERSAL */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // Instant delete (No confirmation)
                        handleDeleteSlot(setting.key);
                    }}
                    className="absolute top-4 right-4 bg-red-600 text-white p-2 rounded-full shadow-lg z-20 hover:scale-125 hover:bg-red-500 transition-all cursor-pointer group"
                    title="Delete Slot Immediately"
                >
                    <Trash2 size={16} />
                    <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Remove
                    </span>
                </button>

                <div className="flex flex-col xl:flex-row gap-6 items-start xl:items-center">

                    {/* INFO */}
                    <div className="w-full xl:w-1/4 shrink-0">
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight mb-1">{setting.label}</h3>
                        <p className="text-zinc-400 text-xs leading-relaxed mb-3">{setting.description}</p>
                    </div>

                    {/* IMAGES */}
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* CURRENT */}
                        <div className="relative aspect-video bg-zinc-800/50 rounded-md overflow-hidden flex items-center justify-center border border-zinc-700/50">
                            {setting.value !== '/placeholder.svg' ? (
                                <img src={setting.value} className="max-w-full max-h-full object-contain" alt="Current" onError={(e) => (e.target as HTMLImageElement).src = '/F14 logga.png'} />
                            ) : (
                                <span className="text-zinc-600 font-mono text-xs">EMPTY</span>
                            )}
                            <div className="absolute bottom-0 left-0 bg-black/70 text-white text-[10px] px-2 py-1 font-mono">
                                CURRENT: {getFilename(setting.value)}
                            </div>
                        </div>

                        {/* NEW / UPLOAD */}
                        <div className="relative aspect-video bg-zinc-900/50 rounded-md overflow-hidden flex items-center justify-center border-2 border-dashed border-zinc-700 hover:border-emerald-500 transition-colors">
                            {previews[setting.key] ? (
                                <>
                                    <img src={previews[setting.key]} className="max-w-full max-h-full object-contain" alt="Preview" />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleReset(setting.key); }}
                                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"
                                    >
                                        <RotateCcw size={14} />
                                    </button>
                                </>
                            ) : (
                                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                                    <Upload className="text-zinc-500 mb-2" size={24} />
                                    <span className="text-zinc-500 font-bold text-xs uppercase tracking-widest">VÄLJ FIL</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden image-input" // Explicit class as requested
                                        onChange={(e) => handleFileChange(setting.key, e.target.files?.[0] || null)}
                                    />
                                </label>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="pb-40 animate-in fade-in duration-500">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-zinc-900 pb-8 gap-6">
                <div>
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white mb-2">Image Assets</h1>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                        <Info size={14} className="text-emerald-500" />
                        Master Control Panel
                    </p>
                </div>
                {message && (
                    <div className="bg-emerald-500 text-black px-6 py-3 rounded-full font-black uppercase tracking-widest text-xs shadow-lg flex items-center gap-3">
                        <CheckCircle size={18} />
                        {message}
                    </div>
                )}
            </div>

            {/* CATEGORIES */}
            <div className="space-y-6">
                {Object.entries(CATEGORIES).map(([category, _]) => {
                    let categorySettings: SiteSetting[] = [];

                    // FILTER LOGIC
                    if (category === 'Home Slideshow') {
                        categorySettings = settings.filter(s => s.key.startsWith('slide_') || s.key === 'hero_bg');
                        // Sort
                        categorySettings.sort((a, b) => {
                            if (a.key === 'hero_bg') return -1;
                            if (b.key === 'hero_bg') return 1;
                            const numA = parseInt(a.key.split('_')[1] || '0');
                            const numB = parseInt(b.key.split('_')[1] || '0');
                            return numA - numB;
                        });
                    } else if (category === 'Archive Page') {
                        categorySettings = settings.filter(s => s.key.startsWith('archive_'));
                        categorySettings.sort((a, b) => {
                            if (a.key === 'archive_bg') return -1;
                            if (b.key === 'archive_bg') return 1;
                            const numA = parseInt(a.key.split('_')[1] || '0');
                            const numB = parseInt(b.key.split('_')[1] || '0');
                            return numA - numB;
                        });
                    } else if (category === 'Supply Page') {
                        categorySettings = settings.filter(s => s.key === 'supply_bg');
                    } else if (category === 'Size Guides') {
                        categorySettings = settings.filter(s => s.key.startsWith('size_chart'));
                    } else if (category === 'Global & Logos') {
                        categorySettings = settings.filter(s => ['header_logo', 'enter_logo', 'auth_bg', 'about_img', 'collection_banner'].includes(s.key));
                    } else if (category === 'Visuals Page') {
                        categorySettings = settings.filter(s => s.key.startsWith('visuals_'));
                        categorySettings.sort((a, b) => {
                            const numA = parseInt(a.key.split('_')[1] || '0');
                            const numB = parseInt(b.key.split('_')[1] || '0');
                            return numA - numB;
                        });
                    }

                    const isOpen = expandedCategory === category;

                    return (
                        <div key={category} className={`border rounded-xl transition-all duration-300 ${isOpen ? 'border-zinc-800 bg-zinc-950/30' : 'border-zinc-900 bg-transparent'}`}>
                            <div onClick={() => toggleCategory(category)} className="flex justify-between items-center p-6 cursor-pointer select-none">
                                <div className="flex items-center gap-4">
                                    <h2 className={`text-2xl font-black uppercase italic tracking-tighter ${isOpen ? 'text-white' : 'text-zinc-500'}`}>{category}</h2>
                                    <span className="text-xs font-mono text-zinc-600 bg-zinc-900 px-2 py-1 rounded-md border border-zinc-800">{categorySettings.length}</span>
                                </div>
                                {isOpen ? <ChevronUp className="text-zinc-500" /> : <ChevronDown className="text-zinc-700" />}
                            </div>

                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                        <div className="p-6 pt-0 grid gap-4">
                                            {categorySettings.map((setting) => {
                                                // Dynamic Labels
                                                let displaySetting = { ...setting };
                                                if (category === 'Home Slideshow' && setting.key.startsWith('slide_')) {
                                                    const slideIndex = categorySettings.filter(s => s.key.startsWith('slide_')).indexOf(setting);
                                                    displaySetting.label = `Slide ${slideIndex + 1}`;
                                                }
                                                return renderSettingCard(displaySetting);
                                            })}

                                            {/* ADD BUTTONS */}
                                            {category === 'Home Slideshow' && (
                                                <button onClick={() => handleAddSlot('Home Slideshow')} className="w-full py-4 border-2 border-dashed border-zinc-900 hover:border-emerald-500 text-zinc-600 hover:text-emerald-500 rounded-lg font-bold uppercase tracking-widest">
                                                    + Add New Slide
                                                </button>
                                            )}
                                            {category === 'Archive Page' && (
                                                <button onClick={() => handleAddSlot('Archive Page')} className="w-full py-4 border-2 border-dashed border-zinc-900 hover:border-emerald-500 text-zinc-600 hover:text-emerald-500 rounded-lg font-bold uppercase tracking-widest">
                                                    + Add New Archive Grid
                                                </button>
                                            )}
                                            {category === 'Visuals Page' && (
                                                <button onClick={() => handleAddSlot('Visuals Page')} className="w-full py-4 border-2 border-dashed border-zinc-900 hover:border-emerald-500 text-zinc-600 hover:text-emerald-500 rounded-lg font-bold uppercase tracking-widest">
                                                    + Add New Visuals Image
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* SAVE BUTTON */}
            <div className="fixed bottom-8 right-8 z-50">
                <button
                    onClick={handleSave}
                    disabled={saving || Object.keys(selectedFiles).length === 0}
                    className={`h-16 px-10 rounded-full font-black uppercase tracking-widest text-sm flex items-center gap-4 shadow-2xl border border-white/10 backdrop-blur-xl transition-all ${Object.keys(selectedFiles).length > 0 ? 'bg-emerald-500 text-black hover:scale-105' : 'bg-zinc-900/90 text-zinc-500 cursor-not-allowed'}`}
                >
                    {saving ? 'Publishing...' : `Save Changes (${Object.keys(selectedFiles).length})`}
                </button>
            </div>
        </div>
    );
}
