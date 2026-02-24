const mongoose = require('mongoose');

const bundleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    minQuantity: { type: Number, default: 2 },
    discount: { type: Number, required: true },
    isPercentage: { type: Boolean, default: false },
    active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Bundle', bundleSchema);
