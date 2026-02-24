const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail', // or your preferred service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendOrderConfirmation = async (toEmail, orderDetails) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('⚠️  Email credentials not found. Skipping email send.');
        return;
    }

    const mailOptions = {
        from: `"Floating14" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: `Order Confirmation - Floating14 #${orderDetails.id}`,
        html: `
            <div style="font-family: Arial, sans-serif; bg-color: #000; color: #fff; padding: 20px;">
                <h1 style="text-transform: uppercase;">Order Confirmed</h1>
                <p>Thanks for your purchase!</p>
                <p>Order ID: <strong>${orderDetails.id}</strong></p>
                <p>Total: <strong>£${orderDetails.total}</strong></p>
                <hr style="border-color: #333;" />
                <p>We'll notify you when your order ships.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Order confirmation sent to ${toEmail}`);
    } catch (error) {
        console.error('❌ Failed to send email:', error);
    }
};

module.exports = { sendOrderConfirmation };
