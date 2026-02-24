const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const SiteSetting = require('../models/SiteSetting');
const { protect } = require('../middleware/auth');

// Configure Multer for disk storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads')); // Absolute path to server/uploads
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// GET /api/settings - Retrieve all settings (Public)
router.get('/', async (req, res) => {
    try {
        const settings = await SiteSetting.find();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// POST /api/settings/upload - Upload an image (Protected)
router.post('/upload', protect, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const filePath = `/uploads/${req.file.filename}`;
    res.json({ filePath });
});

// POST /api/settings - Update or Create a setting (Protected)
router.post('/', protect, async (req, res) => {
    try {
        const { key, value, label } = req.body;

        const setting = await SiteSetting.findOneAndUpdate(
            { key },
            { value, label, updatedAt: new Date() },
            { new: true, upsert: true }
        );

        res.json(setting);
    } catch (err) {
        res.status(500).json({ error: 'Failed to save setting' });
    }
});

// DELETE /api/settings/:key - Remove a setting (Protected)
router.delete('/:key', protect, async (req, res) => {
    try {
        const { key } = req.params;
        await SiteSetting.findOneAndDelete({ key });
        res.json({ message: 'Setting deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete setting' });
    }
});

// Initialize default settings (Protected)
router.post('/init', protect, async (req, res) => {
    try {
        const defaults = [
            { key: 'header_logo', label: 'Header Logo', value: '/F14 logga.png' },
            { key: 'hero_bg', label: 'Hero Background', value: '/hero-bg.jpg' },
            { key: 'auth_bg', label: 'Auth Background', value: '/auth-bg.jpg' }
        ];

        for (const def of defaults) {
            await SiteSetting.findOneAndUpdate(
                { key: def.key },
                { $setOnInsert: def },
                { upsert: true }
            );
        }
        res.json({ message: 'Default settings initialized' });
    } catch (err) {
        res.status(500).json({ error: 'Init failed' });
    }
});

module.exports = router;
