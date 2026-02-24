const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendOrderConfirmation } = require('../utils/emailService');

// Match the raw body to the request object for signature verification
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    console.log('🔔 Webhook received. Signature present:', !!sig);

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        console.log('✅ Webhook Verified. Event Type:', event.type);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        console.log('💰 Payment Intent Succeeded:', paymentIntent.id);

        try {
            // Parse Metadata items
            // Format: "hoodie|M|1;pants|S|2"
            const rawItems = paymentIntent.metadata.items || "";
            const parsedItems = [];

            if (rawItems) {
                const itemStrings = rawItems.split(';');
                for (const str of itemStrings) {
                    const [productId, size, qtyStr] = str.split('|');
                    const qty = parseInt(qtyStr);
                    const productSlug = productId;

                    parsedItems.push({
                        productId: productSlug,
                        name: productSlug,
                        size: size,
                        quantity: qty,
                        price: 0
                    });

                    // -----------------------------------------
                    // ATOMIC STOCK DEDUCTION
                    // -----------------------------------------
                    try {
                        console.log(`🔍 Try finding product: ${JSON.stringify({ $or: [{ _id: (productId.match(/^[0-9a-fA-F]{24}$/) ? productId : null) }, { slug: productId }] })}`);

                        let product = await Product.findOne({ $or: [{ _id: (productId.match(/^[0-9a-fA-F]{24}$/) ? productId : null) }, { slug: productId }, { id: productId }] });

                        if (product) {
                            console.log(`   Found Product: ${product.name}, looking for variant: ${size}`);
                            const variantIndex = product.variants.findIndex(v => v.size === size);

                            if (variantIndex > -1) {
                                console.log(`   Found Variant. Current Stock: ${product.variants[variantIndex].stock}, Deducting: ${qty}`);
                                product.variants[variantIndex].stock -= qty;
                                if (product.variants[variantIndex].stock < 0) product.variants[variantIndex].stock = 0;
                                product.stock = product.variants.reduce((acc, v) => acc + v.stock, 0);
                                product.history.push({
                                    action: 'purchase',
                                    quantity: -qty,
                                    variant: size,
                                    user: 'customer',
                                    note: `Order ${paymentIntent.id.slice(-6)}`
                                });
                                await product.save();
                                console.log(`📉 Stock updated for ${product.name} (${size}) -${qty}. New Total: ${product.stock}`);
                            } else {
                                console.error(`❌ Variant ${size} not found in product ${product.name}`);
                            }
                        } else {
                            console.error(`❌ Product not found for ID: ${productId}`);
                        }
                    } catch (stockErr) {
                        console.error(`Failed to update stock for ${productId}:`, stockErr);
                    }
                }
            }

            const order = new Order({
                stripeSessionId: paymentIntent.id,
                totalAmount: paymentIntent.amount / 100,
                status: 'paid',
                customer: {
                    email: paymentIntent.metadata.customerEmail,
                },
                items: parsedItems
            });

            await order.save();
            console.log('✅ Order saved to DB:', order._id);

            // Send Email Confirmation
            if (paymentIntent.receipt_email || paymentIntent.metadata.customerEmail) {
                await sendOrderConfirmation(paymentIntent.receipt_email || paymentIntent.metadata.customerEmail, {
                    id: order._id.toString().slice(-6).toUpperCase(),
                    total: order.totalAmount
                });
            }

        } catch (dbErr) {
            console.error('❌ Failed to save order:', dbErr);
        }
    }

    res.json({ received: true });
});

module.exports = router;
