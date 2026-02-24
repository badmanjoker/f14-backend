const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

const { protect } = require('../middleware/auth');

// GET /api/orders (Protected)
router.get('/', protect, async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).limit(50);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// PUT /api/orders/:id/status (Protected)
router.put('/:id/status', protect, async (req, res) => {
    try {
        const { status } = req.body;
        const updateData = { status };

        if (status === 'shipped') {
            updateData.shippedAt = new Date();
        }

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

module.exports = router;
