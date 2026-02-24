require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function checkDB() {
    try {
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI missing');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const count = await Product.countDocuments();
        console.log(`Total products: ${count}`);

        if (count > 0) {
            const products = await Product.find().limit(5);
            products.forEach(p => console.log(`- ${p.name} (Stock: ${p.stock})`));
        } else {
            console.log('Database is EMPTY.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkDB();
