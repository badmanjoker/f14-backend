require('dotenv').config();
// Deploy Trigger: Flattened Repo Sync
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// const xss = require('xss-clean'); // Removed due to read-only query error

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware (Standard)
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());

// Rate Limiting (Basic DDoS Protection)
// Rate Limiting (Basic DDoS Protection)
/*
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // Limit each IP to 10000 requests per windowMs (Increased for dev)
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
*/

// WEBHOOKS MUST BE BEFORE BODY PARSERS
const webhookRoutes = require('./routes/webhook');
app.use('/api/webhook', webhookRoutes);

// JSON Parsing for other routes
app.use(express.json());

// GLOBAL DEBUG LOGGER (Verify connectivity)
// Custom NoSQL Sanitizer (Simple & Robust)
const sanitizeNoSQL = (input) => {
    if (input instanceof Object) {
        for (const key in input) {
            if (/^\$/.test(key)) {
                delete input[key];
            } else {
                sanitizeNoSQL(input[key]);
            }
        }
    }
};

// Custom XSS Sanitizer
const sanitizeXSS = (input) => {
    if (typeof input === 'string') {
        return input.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    if (input instanceof Object) {
        for (const key in input) {
            input[key] = sanitizeXSS(input[key]);
        }
    }
    return input;
};

app.use((req, res, next) => {
    // 1. NoSQL Sanitization
    if (req.body) sanitizeNoSQL(req.body);
    if (req.params) sanitizeNoSQL(req.params);
    try { if (req.query) sanitizeNoSQL(req.query); } catch (e) { }

    // 2. XSS Sanitization
    if (req.body) sanitizeXSS(req.body);
    if (req.params) sanitizeXSS(req.params);
    try { if (req.query) sanitizeXSS(req.query); } catch (e) { }

    next();
});

// Routes
const paymentRoutes = require('./routes/payment');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
// Auth Routes
app.use('/api/auth', require('./routes/auth'));

const { protect } = require('./middleware/auth');

// Protected Routes
app.use('/api/payment', paymentRoutes); // Payment is public (create-intent)
app.use('/api/products', productRoutes); // GET is public, but we need to protect modifications inside the route file or here? 
// Actually products.js has GET (public) and PATCH (admin).
// We should apply middleware inside the route file for granular control, 
// OR split them. For now, let's keep GET public in the router, but protect PATCH.
// Since I can't easily change the router structure without rewriting the file,
// I will leave it here and modify products.js to use protect.

app.use('/api/orders', protect, orderRoutes); // PROTECT ALL ORDER ROUTES (contains customer data)
app.use('/api/newsletter', require('./routes/newsletter')); // Public (subscribe)
app.use('/api/settings', require('./routes/settings')); // Should be protected? mostly yes. GET might be public for some settings?
// usage: settings.js has GET / (public?) and POST (admin).
// Let's modify settings.js to protect sensitive routes.

app.use('/api/contact', require('./routes/contact'));
app.use('/api/bundles', require('./routes/bundles'));
app.use('/api/upsells', require('./routes/upsells'));

const path = require('path');

// Serve Uploads Static Folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send('Floating Fourteen API is running');
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Database Connection
const promptDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            console.log('⚠️  MONGO_URI not defined in .env. Skipping DB connection for now.');
            return;
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('❌ Database Connection Error:', err);
    }
};

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    promptDB();
});
