const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    stripeSessionId: { type: String, required: true, unique: true },
    customer: {
        name: String,
        email: String,
        address: {
            line1: String,
            city: String,
            postal_code: String,
            country: String,
        }
    },
    items: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            name: String,
            size: String,
            quantity: Number,
            price: Number
        }
    ],
    totalAmount: Number,
    status: { type: String, default: 'paid' }, // paid, shipped, etc.
    shippedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
