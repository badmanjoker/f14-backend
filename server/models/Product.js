const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: mongoose.Schema.Types.Mixed, required: true }, // Number or "ARCHIVED"
    originalPrice: { type: Number, default: null }, // For sale display
    image: { type: String, required: true },
    images: [{ type: String }], // Array for multiple images/slideshow
    showSlideshow: { type: Boolean, default: true }, // [NEW] Toggle for automatic slideshow
    sizeGuide: { type: String, default: null }, // [NEW] Preset name or custom image path
    description: { type: String, required: true },
    badge: { type: String, default: null },
    badgeColor: { type: String, default: null },
    stock: { type: Number, default: 0 }, // Total stock cache
    variants: [{
        size: { type: String, required: true }, // S, M, L, XL
        color: { type: String, default: 'Black' },
        stock: { type: Number, default: 0 },
        sku: { type: String }
    }],
    history: [{
        action: String, // 'purchase', 'restock', 'correction'
        quantity: Number,
        variant: String,
        timestamp: { type: Date, default: Date.now },
        user: String, // 'admin' or 'system'
        note: String
    }],
    slug: { type: String, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
