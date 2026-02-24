const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const products = await Product.find({});
        console.log(`Found ${products.length} products`);

        for (const p of products) {
            // Only update if no variants exist OR if it's the Krakken Tee we want to fix
            if (!p.variants || p.variants.length === 0 || p.slug === 'krakken-tee') {
                console.log(`Migrating ${p.name}...`);
                p.variants = [
                    { size: 'S', color: 'Black', stock: 10, sku: `${p.slug}-S` },
                    { size: 'M', color: 'Black', stock: 10, sku: `${p.slug}-M` },
                    { size: 'L', color: 'Black', stock: 10, sku: `${p.slug}-L` },
                    { size: 'XL', color: 'Black', stock: 10, sku: `${p.slug}-XL` }
                ];
                // Set total stock
                p.stock = 40;
                // Fix price content text if it was 'ARCHIVED'
                if (p.slug === 'krakken-tee') {
                    p.price = 30;
                    p.badge = null;
                    p.description = 'The Kraken, Crafted from 100% Premium 220 GSM cotton for exceptional comfort. Boxy fit offers a modern,relaxed silhouette.';
                }

                await p.save();
                console.log(`Saved ${p.name}`);
            }
        }
        console.log('Migration Complete');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

migrate();
