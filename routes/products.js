const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /api/products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({}).sort({ createdAt: 1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

const { protect } = require('../middleware/auth');

// Update stock for a specific variant (Protected)
router.patch('/:id/stock', protect, async (req, res) => {
    try {
        const { variantSize, adjustment, newStock, reason, user } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) return res.status(404).json({ error: 'Product not found' });

        const variant = product.variants.find(v => v.size === variantSize);
        if (!variant) return res.status(404).json({ error: 'Variant not found' });

        // Update Stock
        if (newStock !== undefined) {
            // Absolute set
            variant.stock = newStock;
        } else {
            // Relative adjustment
            variant.stock += adjustment;
        }

        // Prevent negative stock
        if (variant.stock < 0) variant.stock = 0;

        // Update Total Stock Cache
        product.stock = product.variants.reduce((acc, v) => acc + v.stock, 0);

        // Add History Log
        product.history.push({
            action: newStock !== undefined ? 'correction' : (adjustment > 0 ? 'restock' : 'correction'),
            quantity: newStock !== undefined ? (newStock - variant.stock) : adjustment,
            variant: variantSize,
            user: user || 'admin',
            note: reason || 'Manual adjustment'
        });

        await product.save();
        console.log(`✅ Stock updated for ${product.name} [${variantSize}]: ${variant.stock}`);
        res.json(product);
    } catch (err) {
        console.error("❌ Stock Update Error:", err);
        res.status(500).json({ error: err.message || 'Server Internal Error' });
    }
});

// ------------------ ADMIN ROUTES ------------------

// POST /api/products - Create a new product (Protected)
router.post('/', protect, async (req, res) => {
    try {
        const { name, price, originalPrice, image, images, showSlideshow, sizeGuide, description, variants, badge, badgeColor } = req.body;

        // Basic slug generation
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now();

        const newProduct = new Product({
            name,
            price,
            originalPrice,
            image,
            images: images || [image], // Use primary image as first in array if none provided
            showSlideshow: showSlideshow !== undefined ? showSlideshow : true,
            sizeGuide,
            description,
            variants: variants || [],
            badge,
            badgeColor,
            slug,
            stock: (variants || []).reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0)
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        console.error("❌ Product Create Error:", err);
        res.status(500).json({ error: `Failed to create product: ${err.message}` });
    }
});

// PUT /api/products/:id - Update product details (Protected)
router.put('/:id', protect, async (req, res) => {
    try {
        const { name, price, originalPrice, image, images, showSlideshow, sizeGuide, description, variants, badge, badgeColor } = req.body;
        const product = await Product.findById(req.params.id);

        if (!product) return res.status(404).json({ error: 'Product not found' });

        if (name) product.name = name;
        if (price !== undefined) product.price = price;
        if (originalPrice !== undefined) product.originalPrice = originalPrice;
        if (image) product.image = image;
        if (images) product.images = images;
        if (showSlideshow !== undefined) product.showSlideshow = showSlideshow;
        if (sizeGuide !== undefined) product.sizeGuide = sizeGuide;
        if (description) product.description = description;
        if (variants) {
            product.variants = variants;
            product.stock = variants.reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0);
        }
        if (badge !== undefined) product.badge = badge;
        if (badgeColor !== undefined) product.badgeColor = badgeColor;

        await product.save();
        res.json(product);
    } catch (err) {
        console.error("❌ Product Update Error:", err);
        res.status(500).json({ error: `Failed to update product: ${err.message}` });
    }
});

// DELETE /api/products/:id - Delete product (Protected)
router.delete('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ error: 'Product not found' });
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

module.exports = router;
