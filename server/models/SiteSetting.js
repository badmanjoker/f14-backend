const mongoose = require('mongoose');

const SiteSettingSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // e.g., 'header_logo'
    value: { type: String, required: true }, // e.g., '/uploads/logo-123.png'
    label: { type: String }, // e.g., 'Header Logo'
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SiteSetting', SiteSettingSchema);
