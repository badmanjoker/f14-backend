const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Product = require('./models/Product');

async function dumpProducts() {
    try {
        const uri = "mongodb+srv://Admin:QRqVImfACUPNIznq@cluster0.ciwzdmd.mongodb.net/?appName=Cluster0";
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        const products = await Product.find({}, 'name sizeGuide slug');
        console.log('--- PRODUCT DATA ---');
        console.log(JSON.stringify(products, null, 2));
        console.log('--------------------');

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

dumpProducts();
