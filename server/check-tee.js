const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const check = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const tee = await Product.findOne({ slug: 'krakken-tee' });
        console.log('--- KRAKKEN TEE DB STATE ---');
        console.log(JSON.stringify(tee, null, 2));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

check();
