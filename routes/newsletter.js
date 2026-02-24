const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

router.post('/', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        // Transporter configuration - Requires EMAIL_USER and EMAIL_APP_PASSWORD in .env
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS // Use EMAIL_PASS to match .env
            }
        });

        // Email Content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to the Family - Floating Fourteen',
            html: `
                <div style="font-family: Arial, sans-serif; color: #000;">
                    <h1>WELCOME TO THE FAMILY.</h1>
                    <p>Thank you for joining us.</p>
                    <p>As requested, here is your exclusive code:</p>
                    <h2 style="color: #dc2626; border: 1px solid #000; display: inline-block; padding: 10px 20px;">FAMILY14</h2>
                    <p>Use it at checkout for your discount.</p>
                    <br>
                    <p>Regards,<br>FLOATING FOURTEEN</p>
                </div>
            `
        };

        // Send Email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Welcome email sent successfully' });

    } catch (error) {
        console.error('Newsletter Error:', error);
        // If credentials are missing, we still want to simulate success for the user if it's just a config issue in dev, 
        // OR we return error to let them know. 
        // Given the user asked to "check if it works", we should probably return the error if it fails so they know.
        res.status(500).json({ error: 'Failed to send email. Check server logs/credentials.' });
    }
});

module.exports = router;
