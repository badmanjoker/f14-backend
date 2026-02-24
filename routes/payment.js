const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const Product = require('../models/Product');

router.post('/create-payment-intent', async (req, res) => {
    try {
        const { items, currency = 'gbp' } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Invalid items payload' });
        }

        // 1. Fetch all products involved in the order from DB
        // We map the unique product IDs from the cart items
        const rawIds = items.map(i => i.productId || i._id);

        // Build a query that finds products by _id (if valid ObjectId) OR by slug/id (string)
        // This handles mixed input types robustly
        const queryConditions = rawIds.map(id => ({
            $or: [
                { _id: (typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/)) ? id : null },
                { slug: id },
                { id: id } // Some schemas use 'id' field for slug-like identifiers
            ]
        }));

        const dbProducts = await Product.find({ $or: queryConditions });

        if (!dbProducts || dbProducts.length === 0) {
            console.error("Products not found for IDs:", rawIds);
            return res.status(400).json({ error: 'Products not found' });
        }

        // 2. Calculate Server-Side Total
        let subtotal = 0;
        let validItems = [];
        let hasHoodie = false;
        let hasPants = false;

        for (const item of items) {
            const itemId = item.productId || item._id;
            // Find matching product in dbProducts array
            const dbProduct = dbProducts.find(p =>
                p._id.toString() === itemId ||
                p.slug === itemId ||
                p.id === itemId
            );

            if (!dbProduct) {
                console.error(`Product not found for ID: ${itemId}`);
                continue; // Skip invalid items or throw error
            }

            // Ensure price is a number (handle "ARCHIVED" or other strings if necessary)
            const price = typeof dbProduct.price === 'number' ? dbProduct.price : 0;

            if (price === 0 && dbProduct.price !== 0) {
                // Safety check for invalid price data
                console.warn(`Invalid price for product ${dbProduct.name}`);
            }

            const qty = parseInt(item.qty) || 1;
            subtotal += price * qty;

            // Check for Bundle Logic (Hoodie + Sweats) based on DB Name
            // specific logic: "HOODIE" and "SWEATS" keyword search in uppercase name
            const upperName = dbProduct.name.toUpperCase();
            if (upperName.includes('HOODIE')) hasHoodie = true;
            if (upperName.includes('SWEATS') || upperName.includes('JOGGERS') || upperName.includes('PANTS')) hasPants = true;

            validItems.push({
                productId: dbProduct._id.toString(),
                name: dbProduct.name, // Use DB name for metadata
                size: item.size,
                qty: qty
            });
        }

        // 3. Apply Bundle Discount
        const discount = (hasHoodie && hasPants) ? 10 : 0;
        const adjustedSubtotal = subtotal - discount;

        // 4. Apply Shipping Logic
        const shipping = adjustedSubtotal >= 130 ? 0 : 15;

        // 5. Final Amount (in pence)
        const amount = Math.round((adjustedSubtotal + shipping) * 100);

        if (amount < 50) {
            return res.status(400).json({ error: 'Total amount is too low to process' });
        }

        // 6. Create Metadata
        const metadataItems = validItems.map(i => `${i.productId}|${i.size}|${i.qty}`).join(';');

        // 7. Create Stripe Payment Intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            payment_method_types: ['card'],
            metadata: {
                items: metadataItems,
                customerEmail: req.body.email || 'guest@example.com'
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            serverCalculatedTotal: amount / 100 // Optional: send back for UI verification
        });

    } catch (error) {
        console.error('Stripe/Server Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
