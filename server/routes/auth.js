const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

// Strict Rate Limiting for Login (Brute Force Protection)
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login requests per windowMs
    message: { error: 'Too many login attempts, please try again after 15 minutes' }
});

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
    const { password } = req.body;

    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Countersix7';
    const JWT_SECRET = process.env.JWT_SECRET || 'f14_jwt_super_secret_2026';

    if (password === ADMIN_PASSWORD) {
        const token = jwt.sign(
            { id: 'admin', role: 'admin' },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({
            token,
            user: {
                id: 'admin',
                name: 'Admin User',
                email: 'admin@floatingfourteen.com'
            }
        });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

module.exports = router;
