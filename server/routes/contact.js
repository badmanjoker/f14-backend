const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const zod = require('zod');

// Schema for validation
const contactSchema = zod.object({
    name: zod.string().min(1, "Name is required"),
    phone: zod.string().optional(),
    email: zod.string().email("Invalid email address"),
    orderNumber: zod.string().optional(),
    message: zod.string().min(1, "Message is required")
});

// POST /api/contact
router.post('/', async (req, res) => {
    try {
        console.log('📨 Raw request body:', req.body);

        // Validate input
        const cleanData = contactSchema.parse(req.body);

        console.log('📨 Processing contact form submission for:', cleanData.email);

        // Check if email service is configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.error('❌ EMAIL_USER or EMAIL_PASS not set');
            return res.status(500).json({ error: 'Email service not configured' });
        }

        // Create Transporter (Gmail standard)
        // Remove spaces from App Password if present
        const cleanPass = process.env.EMAIL_PASS.replace(/\s+/g, '');

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: cleanPass
            }
        });

        // Email Content
        const mailOptions = {
            from: cleanData.email, // "From" the user (technically sent by our server on behalf)
            to: process.env.EMAIL_USER, // Send to Admin
            subject: `New Message from ${cleanData.name} - Floating Fourteen`,
            html: `
                <h2>New Contact Form Submission</h2>
                <p><strong>Name:</strong> ${cleanData.name}</p>
                <p><strong>Email:</strong> ${cleanData.email}</p>
                <p><strong>Phone:</strong> ${cleanData.phone || 'N/A'}</p>
                <p><strong>Order Number:</strong> ${cleanData.orderNumber || 'N/A'}</p>
                <br>
                <h3>Message:</h3>
                <p style="background-color: #f4f4f4; padding: 10px; border-left: 4px solid #333;">${cleanData.message.replace(/\n/g, '<br>')}</p>
            `
        };

        // Send Email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ success: true, message: 'Message sent successfully' });

    } catch (error) {
        console.error('Contact Form Error:', error);
        if (error instanceof zod.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(500).json({ error: 'Failed to send message' });
    }
});

module.exports = router;
