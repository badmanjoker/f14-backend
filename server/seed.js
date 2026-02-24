require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

const products = [
    {
        name: 'ZIPPED HOODIE',
        price: 85,
        image: '/Hoodie.jpg',
        description: 'Heavyweight 230 GSM double-layer organic cotton. Features stainless steel hardware and drop-shoulder silhouette.',
        badge: 'Low Stock',
        badgeColor: 'bg-red-600',
        slug: 'zipper-hoodie',
        variants: [
            { size: 'S', stock: 15 },
            { size: 'M', stock: 24 },
            { size: 'L', stock: 5 },
            { size: 'XL', stock: 8 }
        ]
    },
    {
        name: 'BAGGY SWEATS',
        price: 110,
        image: '/Pants.jpg',
        description: 'Heavyweight 230 GSM fleece with an uncuffed straight-leg cut. Detailed with black metal hardware and embroidery.',
        badge: null,
        badgeColor: null,
        slug: 'baggy-sweats',
        variants: [
            { size: 'S', stock: 10 },
            { size: 'M', stock: 10 },
            { size: 'L', stock: 10 },
            { size: 'XL', stock: 10 }
        ]
    },
    {
        name: 'KRAKKEN TEE',
        price: 30,
        image: '/festbild.jpg',
        description: 'The Kraken, Crafted from 100% Premium 220 GSM cotton for exceptional comfort. Boxy fit offers a modern,relaxed silhouette.',
        badge: null,
        badgeColor: null,
        slug: 'krakken-tee',
        stock: 40,
        variants: [
            { size: 'S', stock: 10 },
            { size: 'M', stock: 10 },
            { size: 'L', stock: 10 },
            { size: 'XL', stock: 10 }
        ]
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        await Product.deleteMany({});
        console.log('🧹 Cleared existing products');

        await Product.insertMany(products);
        console.log('🌱 Seeded products successfully');

        process.exit();
    } catch (err) {
        console.error('❌ Seeding Error:', err);
        process.exit(1);
    }
};

seedDB();
