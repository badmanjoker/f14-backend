const express = require('express');
const router = express.Router();
const Bundle = require('../models/Bundle');
const { protect } = require('../middleware/auth');

// GET all bundles (Public or Protected? Let's make it public for cart usage)
router.get('/', async (req, res) => {
    try {
        const bundles = await Bundle.find().populate('products');
        res.json(bundles);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch bundles' });
    }
});

// ADMIN ROUTES

// POST /api/bundles
router.post('/', protect, async (req, res) => {
    try {
        console.log('📦 Creating bundle:', JSON.stringify(req.body, null, 2));
        const bundle = new Bundle(req.body);
        await bundle.save();
        res.status(201).json(bundle);
    } catch (err) {
        console.error('❌ Bundle Creation Error:', err);
        res.status(500).json({ error: 'Failed to create bundle' });
    }
});

// PUT /api/bundles/:id
router.put('/:id', protect, async (req, res) => {
    try {
        console.log('📦 Updating bundle:', req.params.id, 'Data:', JSON.stringify(req.body, null, 2));
        const bundle = await Bundle.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(bundle);
    } catch (err) {
        console.error('❌ Bundle Update Error:', err);
        res.status(500).json({ error: 'Failed to update bundle' });
    }
});

// DELETE /api/bundles/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        await Bundle.findByIdAndDelete(req.params.id);
        res.json({ message: 'Bundle deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete bundle' });
    }
});

module.exports = router;
