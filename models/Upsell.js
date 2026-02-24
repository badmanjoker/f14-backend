const mongoose = require('mongoose');

const upsellSchema = new mongoose.Schema({
    triggerProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    suggestedProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    message: { type: String, default: 'Unlock £10 Off' },
    active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Upsell', upsellSchema);
