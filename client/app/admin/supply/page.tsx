'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/components/SettingsContext';
import { Plus, Edit2, Trash2, Tag, Book, Image as ImageIcon, Upload, Save, X, AlertCircle } from 'lucide-react';

interface Variant {
    size: string;
    stock: number;
    color: string;
}

interface Product {
    _id: string;
    name: string;
    price: number | "ARCHIVED";
    originalPrice?: number | null;
    image: string;
    images?: string[]; // Added images array
    showSlideshow: boolean; // [NEW]
    description: string;
    variants: Variant[];
    badge?: string;
    badgeColor?: string;
    sizeGuide?: string; // [NEW]
    slug: string;
}

export default function SupplyPage() {
    const { getSetting, updateSetting } = useSettings();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [error, setError] = useState('');

    // Form states for Add/Edit
    const [formName, setFormName] = useState('');
    const [formPrice, setFormPrice] = useState('');
    const [formOriginalPrice, setFormOriginalPrice] = useState('');
    const [formImage, setFormImage] = useState('');
    const [formImages, setFormImages] = useState<string[]>([]); // New state for multiple images
    const [formShowSlideshow, setFormShowSlideshow] = useState(true); // [NEW]
    const [formDescription, setFormDescription] = useState('');
    const [formSizeGuide, setFormSizeGuide] = useState(''); // [NEW]
    const [formVariants, setFormVariants] = useState<Variant[]>([
        { size: 'S', stock: 0, color: 'Black' },
        { size: 'M', stock: 0, color: 'Black' },
        { size: 'L', stock: 0, color: 'Black' },
        { size: 'XL', stock: 0, color: 'Black' },
    ]);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://f14-backend.onrender.com';

    const formatImgUrl = (path: string) => {
        if (!path) return '/cbr.png';
        if (path.startsWith('http')) return path;
        if (path.startsWith('/uploads/')) return `${API_URL}${path}`;
        return path;
    };

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_URL}/api/products`);
            const data = await res.json();
            setProducts(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch products:', err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setFormName(product.name);
        setFormPrice(product.price.toString());
        setFormOriginalPrice(product.originalPrice ? product.originalPrice.toString() : '');
        setFormImage(product.image);
        setFormImages(product.images || [product.image]); // Populate formImages
        setFormShowSlideshow(product.showSlideshow !== undefined ? product.showSlideshow : true); // Populate showSlideshow
        setFormSizeGuide(product.sizeGuide || ''); // [NEW]
        setFormDescription(product.description);
        setFormVariants(product.variants.length > 0 ? product.variants : [
            { size: 'S', stock: 0, color: 'Black' },
            { size: 'M', stock: 0, color: 'Black' },
            { size: 'L', stock: 0, color: 'Black' },
            { size: 'XL', stock: 0, color: 'Black' },
        ]);
        setIsProductModalOpen(true);
    };

    const openAddModal = () => {
        setEditingProduct(null);
        setFormName('');
        setFormPrice('');
        setFormOriginalPrice('');
        setFormImage('');
        setFormImages([]); // Initialize as empty for new product
        setFormShowSlideshow(true); // Default to true for new product
        setFormSizeGuide(''); // [NEW]
        setFormDescription('');
        setFormVariants([
            { size: 'S', stock: 0, color: 'Black' },
            { size: 'M', stock: 0, color: 'Black' },
            { size: 'L', stock: 0, color: 'Black' },
            { size: 'XL', stock: 0, color: 'Black' },
        ]);
        setIsProductModalOpen(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'product' | 'gallery' | 'sizeChartTop' | 'sizeChartBottom' | 'sizeChartTee') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        try {
            const token = sessionStorage.getItem('admin_token'); // Changed to sessionStorage
            const res = await fetch(`${API_URL}/api/settings/upload`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });
            const data = await res.json();
            if (data.filePath) {
                if (target === 'product') {
                    setFormImage(data.filePath);
                    if (formImages.length === 0) setFormImages([data.filePath]); // If no images, set as first
                } else if (target === 'gallery') {
                    setFormImages(prev => [...prev, data.filePath]); // Add to gallery
                }
                else if (target === 'sizeChartTop') updateSetting('size_chart_top', data.filePath);
                else if (target === 'sizeChartBottom') updateSetting('size_chart_bottom', data.filePath);
                else if (target === 'sizeChartTee') updateSetting('size_chart_tee', data.filePath);
            }
        } catch (err) {
            console.error('Upload failed:', err);
        }
    };

    const removeImage = (index: number) => {
        setFormImages(prev => prev.filter((_, i) => i !== index));
    };

    const saveProduct = async () => {
        const token = sessionStorage.getItem('admin_token');
        const url = editingProduct
            ? `${API_URL}/api/products/${editingProduct._id}`
            : `${API_URL}/api/products`;

        const method = editingProduct ? 'PUT' : 'POST';

        const priceNum = parseFloat(formPrice);
        if (isNaN(priceNum)) {
            setError('Vänligen fyll i ett giltigt pris');
            return;
        }

        if (formImages.length === 0 && !formImage) {
            setError('Vänligen lägg till minst en bild');
            return;
        }

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                variants: Array.isArray(formVariants) ? formVariants : []
            })
        });

        const data = await res.json();

        if (res.ok) {
            setIsProductModalOpen(false);
            fetchProducts();
        } else {
            setError(data.error || data.message || `Error ${res.status}: ${res.statusText}`);
        }
    } catch (err) {
        setError('Network error');
    }
};

const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const token = sessionStorage.getItem('admin_token'); // Changed to sessionStorage
    try {
        await fetch(`${API_URL}/api/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchProducts();
    } catch (err) {
        console.error('Delete failed:', err);
    }
};





return (
    <div className="space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-2">Supply Management</h1>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Manage products, prices, and visual assets</p>
            </div>
            <div className="flex gap-4">
                <button
                    onClick={openAddModal}
                    className="bg-white text-black px-6 py-3 text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-2 cursor-pointer"
                >
                    <Plus size={14} /> Add New Supply
                </button>
            </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Product List */}
            <div className="lg:col-span-2 space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
                    <Tag size={12} /> Active Inventory ({products.length})
                </h2>

                {loading ? (
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-zinc-900/50 border border-zinc-800"></div>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {Array.isArray(products) && products.filter(p => p !== null && p !== undefined).map((product) => (
                            <div key={product._id} className="group bg-zinc-950 border border-zinc-900 p-4 transition-all hover:border-zinc-700 flex flex-col md:flex-row gap-6 relative overflow-hidden">
                                <div className="w-full md:w-32 h-32 relative bg-black flex-shrink-0 overflow-hidden">
                                    <img src={formatImgUrl(product.image)} alt={product.name} className="absolute inset-0 w-full h-full object-contain p-2" />
                                    {product.images && product.images.length > 1 && (
                                        <div className="absolute bottom-1 right-1 bg-black/80 text-[8px] px-1 text-white font-bold">
                                            {product.images.length} IMGS
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-between py-1">
                                    <div>
                                        <div className="flex justify-between items-start mb-2 text-white">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-lg font-black uppercase tracking-tight leading-tight">{product.name}</h3>
                                                {product.originalPrice && product.originalPrice > (product.price as number) && (
                                                    <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 uppercase tracking-widest">SALE</span>
                                                )}
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="font-mono text-emerald-400">£{product.price}</span>
                                                {product.originalPrice && product.originalPrice > (product.price as number) && (
                                                    <span className="text-zinc-600 text-[9px] line-through font-mono italic">£{product.originalPrice}</span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider line-clamp-2 mb-4">{product.description}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        {Array.isArray(product.variants) && product.variants.map((v, vIdx) => (
                                            <div key={vIdx} className="text-[9px] font-mono bg-zinc-900 border border-zinc-800 px-2 py-1 flex flex-col items-center">
                                                <span className="text-zinc-500">{v?.size || '-'}</span>
                                                <span className={(v?.stock || 0) > 0 ? 'text-white' : 'text-red-500'}>{v?.stock || 0}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex md:flex-column justify-end md:justify-start gap-2 pt-4 md:pt-0">
                                    <button
                                        onClick={() => openEditModal(product)}
                                        className="p-3 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-sm transition-all cursor-pointer hover:scale-110 active:scale-90"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button
                                        onClick={() => deleteProduct(product._id)}
                                        className="p-3 bg-zinc-900 text-zinc-500 hover:text-red-500 hover:bg-red-950/20 rounded-sm transition-all cursor-pointer hover:scale-110 active:scale-90"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-8">
                <div className="bg-red-950/10 border border-red-900/30 p-8">
                    <h3 className="text-red-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                        <AlertCircle size={14} /> Quick Tip
                    </h3>
                    <p className="text-zinc-500 text-[10px] leading-normal uppercase">
                        Adding a badge like "MEMBER ONLY" or "ARCHIVED" to product descriptions helps filter bulk operations.
                    </p>
                </div>
            </div>
        </div>

        {/* Product Modal */}
        {isProductModalOpen && (
            <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-zinc-950 border border-zinc-800 w-full max-w-5xl max-h-[90vh] overflow-y-auto relative"> {/* Changed max-w-4xl to max-w-5xl */}
                    <div className="sticky top-0 bg-zinc-950/80 backdrop-blur-md z-10 p-6 border-b border-zinc-900 flex justify-between items-center">
                        <h3 className="text-xl font-black uppercase tracking-tighter text-white italic">
                            {editingProduct ? 'Redigera Produkt' : 'Skapa Ny Produkt'}
                        </h3>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={saveProduct}
                                className="bg-emerald-500 text-black px-6 py-2 text-xs font-black uppercase tracking-widest hover:bg-emerald-400 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                            >
                                <Save size={14} /> Spara
                            </button>
                            <button onClick={() => setIsProductModalOpen(false)} className="text-zinc-500 hover:text-white transition-all cursor-pointer hover:scale-110 active:scale-90">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Left: Info & Images */}
                        <div className="space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Produktnamn</label>
                                    <input
                                        type="text"
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        className="w-full bg-black border border-zinc-800 p-4 text-white focus:border-white transition-all outline-none uppercase font-bold"
                                        placeholder="t.ex. F14 SIGNATURE HOODIE"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Pris (£)</label>
                                        <input
                                            type="number"
                                            value={formPrice}
                                            onChange={(e) => setFormPrice(e.target.value)}
                                            className="w-full bg-black border border-zinc-800 p-4 text-white focus:border-white transition-all outline-none font-mono"
                                            placeholder="60"
                                        />
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Pris att betala</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-emerald-500">Original Pris (£)</label>
                                        <input
                                            type="number"
                                            value={formOriginalPrice}
                                            onChange={(e) => setFormOriginalPrice(e.target.value)}
                                            className="w-full bg-black border border-emerald-950/30 p-4 text-emerald-400 focus:border-emerald-500 transition-all outline-none font-mono"
                                            placeholder="120"
                                        />
                                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">För REA (Överkryssat)</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Beskrivning</label>
                                <textarea
                                    value={formDescription}
                                    onChange={(e) => setFormDescription(e.target.value)}
                                    rows={4}
                                    className="w-full bg-black border border-zinc-800 p-4 text-white focus:border-white transition-all outline-none text-xs font-bold leading-relaxed"
                                    placeholder="Material, fit, etc..."
                                />
                            </div>

                            {/* Size Guide selection */}
                            <div className="space-y-4 pt-4 border-t border-zinc-900/50">
                                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
                                    Size Guide Settings
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Select Template</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { id: 'hoodie', label: 'Hoodie' },
                                                { id: 'pants', label: 'Pants' },
                                                { id: 'tee', label: 'T-Shirt' },
                                                { id: 'custom', label: 'Custom' }
                                            ].map(template => (
                                                <button
                                                    key={template.id}
                                                    type="button"
                                                    onClick={() => {
                                                        if (template.id === 'custom') {
                                                            if (['hoodie', 'pants', 'tee'].includes(formSizeGuide)) setFormSizeGuide('');
                                                        } else {
                                                            setFormSizeGuide(template.id);
                                                        }
                                                    }}
                                                    className={`p-3 text-[10px] font-black uppercase tracking-wider border transition-all ${(template.id === 'custom' && !['hoodie', 'pants', 'tee'].includes(formSizeGuide)) || (template.id === formSizeGuide)
                                                        ? 'bg-red-600/10 border-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.2)]'
                                                        : 'bg-black border-zinc-800 text-zinc-500 hover:border-zinc-600'
                                                        }`}
                                                >
                                                    {template.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Custom Image / URL</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={['hoodie', 'pants', 'tee'].includes(formSizeGuide) ? '' : formSizeGuide}
                                                onChange={(e) => setFormSizeGuide(e.target.value)}
                                                placeholder="URL or Upload ->"
                                                className="flex-1 bg-black border border-zinc-800 p-3 text-white text-[10px] font-mono outline-none focus:border-red-600 transition-all placeholder:text-zinc-700"
                                            />
                                            <label className="bg-zinc-900 border border-zinc-800 w-12 flex items-center justify-center cursor-pointer hover:bg-zinc-800 hover:border-red-600 transition-all group">
                                                <Upload size={14} className="text-zinc-500 group-hover:text-red-600" />
                                                <input type="file" className="hidden" onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;
                                                    const formData = new FormData();
                                                    formData.append('image', file);
                                                    const token = sessionStorage.getItem('admin_token');
                                                    const res = await fetch(`${API_URL}/api/settings/upload`, {
                                                        method: 'POST',
                                                        headers: { 'Authorization': `Bearer ${token}` },
                                                        body: formData,
                                                    });
                                                    const data = await res.json();
                                                    if (data.filePath) setFormSizeGuide(data.filePath);
                                                }} />
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                {formSizeGuide && (
                                    <div className="p-3 border border-zinc-900 bg-black/50 rounded flex items-center gap-4">
                                        <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 flex-shrink-0 overflow-hidden rounded relative">
                                            <img
                                                src={formatImgUrl(formSizeGuide === 'hoodie' ? getSetting('size_chart_top', '/Size-chart-hoodie.png') : formSizeGuide === 'pants' ? getSetting('size_chart_bottom', '/Size-chart-pants.jpg') : formSizeGuide === 'tee' ? getSetting('size_chart_tee', '/Size-chart-hoodie.png') : formSizeGuide)}
                                                className="w-full h-full object-contain"
                                            />
                                            <div className="absolute inset-0 bg-red-600/5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Active Guide</div>
                                            <div className="text-[8px] font-mono text-zinc-600 truncate">{formSizeGuide}</div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setFormSizeGuide('')}
                                            className="text-[10px] font-black text-zinc-700 hover:text-red-500 transition-colors uppercase"
                                        >
                                            [REMOVE]
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Slideshow / Bilder - Moved inside Left Column */}
                            <div className="space-y-4 pt-4 border-t border-zinc-900/50">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                                        Slideshow / Bilder
                                        <span className="text-[10px] text-zinc-500 lowercase font-normal italic block mt-1">första bilden är huvudbild</span>
                                    </h4>
                                    <button
                                        onClick={() => setFormShowSlideshow(!formShowSlideshow)}
                                        className={`flex items-center gap-2 px-3 py-1.5 border transition-all cursor-pointer ${formShowSlideshow ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
                                    >
                                        <div className={`w-2 h-2 rounded-full ${formShowSlideshow ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`}></div>
                                        <span className="text-[9px] font-black uppercase tracking-widest">
                                            {formShowSlideshow ? 'Slideshow På' : 'Slideshow Av'}
                                        </span>
                                    </button>
                                </div>

                                <div className="grid grid-cols-4 gap-4">
                                    {formImages.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square bg-black border border-zinc-900 group cursor-default overflow-hidden">
                                            <img
                                                src={formatImgUrl(img)}
                                                alt={`Slide ${idx}`}
                                                className="absolute inset-0 w-full h-full object-cover p-1"
                                            />
                                            <button
                                                onClick={() => removeImage(idx)}
                                                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:scale-110 active:scale-90"
                                            >
                                                <X size={10} />
                                            </button>
                                            {idx === 0 && (
                                                <div className="absolute top-0 left-0 bg-emerald-500 text-black text-[6px] font-black px-1 uppercase tracking-tighter">MAIN</div>
                                            )}
                                        </div>
                                    ))}
                                    <label className="aspect-square bg-zinc-900 border border-zinc-800 border-dashed flex flex-col items-center justify-center gap-2 hover:bg-zinc-800 transition-all cursor-pointer">
                                        <Upload size={14} className="text-zinc-500" />
                                        <span className="text-[8px] font-black uppercase text-zinc-500">Add</span>
                                        <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, 'gallery')} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Live Preview Card */}
                        <div className="space-y-6 bg-zinc-900/10 p-6 border border-zinc-900/50">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 border-b border-zinc-900 pb-2">
                                Förhandsvisning
                            </h3>

                            <div className="bg-black border border-zinc-900 overflow-hidden group max-w-[280px] mx-auto shadow-2xl">
                                <div className="aspect-[4/5] relative bg-zinc-950 overflow-hidden">
                                    <img
                                        src={formatImgUrl(formImage || (formImages.length > 0 ? formImages[0] : ''))}
                                        alt="Preview"
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {(parseFloat(formPrice) && parseFloat(formOriginalPrice)) ? (
                                        <div className="absolute top-4 left-4 bg-red-600 text-white text-[10px] font-black px-2 py-1 uppercase tracking-widest z-10 shadow-2xl">
                                            SALE
                                        </div>
                                    ) : null}
                                </div>
                                <div className="p-4 space-y-2">
                                    <h3 className="text-white text-sm font-black uppercase tracking-tight leading-tight">
                                        {formName || 'PRODUKTNAMN'}
                                    </h3>

                                    {/* Description in Preview */}
                                    <p className="text-zinc-500 text-[9px] font-bold tracking-tight line-clamp-2">
                                        {formDescription || 'Ingen beskrivning angiven...'}
                                    </p>

                                    <div className="flex items-center gap-3 pt-1">
                                        <span className="text-emerald-400 font-mono text-sm leading-none font-bold">
                                            £{formPrice || '0'}
                                        </span>
                                        {parseFloat(formOriginalPrice) ? (
                                            <span className="text-zinc-600 text-[10px] line-through font-mono italic leading-none">
                                                £{formOriginalPrice}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-zinc-900/30 p-4 border-l-2 border-zinc-800">
                                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">
                                    Detta är hur produkten kommer att se ut i listvyn. Detaljerna uppdateras här direkt medan du ändrar dem.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer: Status & Save */}
                    <div className="p-8 border-t border-zinc-900 bg-zinc-950/50">
                        {error && (
                            <div className="bg-red-950/20 border border-red-900/50 p-4 text-red-500 text-[10px] font-black uppercase tracking-widest text-center mb-4">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={saveProduct}
                            className="w-full bg-white text-black py-4 text-xs font-black uppercase tracking-[0.3em] hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-white/10"
                        >
                            <Save size={14} />
                            Spara Supply
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
);
}
