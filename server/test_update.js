const mongoose = require('mongoose');
const Product = require('./models/Product');

async function testUpdate() {
    try {
        const uri = "mongodb+srv://Admin:QRqVImfACUPNIznq@cluster0.ciwzdmd.mongodb.net/?appName=Cluster0";
        await mongoose.connect(uri);
        console.log('Connected to MongoDB');

        // Update the "ZIPPED HOODIE" (the first one in dump)
        const updated = await Product.findOneAndUpdate(
            { slug: 'hoodie' },
            { $set: { sizeGuide: 'pants' } },
            { new: true }
        );

        console.log('Updated product:', updated.name, 'SizeGuide:', updated.sizeGuide);

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

testUpdate();
