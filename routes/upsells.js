const express = require('express');
const router = express.Router();
const Upsell = require('../models/Upsell');
const { protect, admin } = require('../middleware/auth');

// @route   GET /api/upsells
// @desc    Get all upsells
// @access  Public (so cart can fetch them)
router.get('/', async (req, res) => {
    try {
        const upsells = await Upsell.find()
            .populate('triggerProductId')
            .populate('suggestedProductId');
        res.json(upsells);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch upsells' });
    }
});

// @route   POST /api/upsells
// @desc    Create an upsell rule
// @access  Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const upsell = new Upsell(req.body);
        await upsell.save();
        res.status(201).json(upsell);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// @route   PUT /api/upsells/:id
// @desc    Update an upsell rule
// @access  Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const upsell = await Upsell.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!upsell) return res.status(404).json({ error: 'Upsell not found' });
        res.json(upsell);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// @route   DELETE /api/upsells/:id
// @desc    Delete an upsell rule
// @access  Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const upsell = await Upsell.findByIdAndDelete(req.params.id);
        if (!upsell) return res.status(404).json({ error: 'Upsell not found' });
        res.json({ message: 'Upsell deleted successfuly' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete upsell' });
    }
});

module.exports = router;
