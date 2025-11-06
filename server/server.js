const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../public'));

// Verify environment variables on startup
console.log('=== Environment Variables Check ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✓ Set' : '✗ Missing');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✓ Set' : '✗ Missing');
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? '✓ Set' : '✗ Missing');
console.log('===================================\n');

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify transporter configuration on startup
transporter.verify(function(error, success) {
    if (error) {
        console.error('❌ Email configuration error:', error);
        console.log('\nTroubleshooting tips:');
        console.log('1. Check if EMAIL_USER and EMAIL_PASS are set in .env file');
        console.log('2. Make sure you\'re using an App Password, not your regular Gmail password');
        console.log('3. Generate a new App Password at: https://myaccount.google.com/apppasswords\n');
    } else {
        console.log('✅ Email server is ready to send messages\n');
    }
});

// Enrollment endpoint
app.post('/api/enroll', async (req, res) => {
    console.log('\n=== New Enrollment Request ===');
    console.log('Received data:', req.body);
    
    const { name, email, phone, course } = req.body;

    if (!name || !email || !phone || !course) {
        console.log('❌ Validation failed: Missing fields');
        return res.status(400).json({ 
            message: 'All fields are required',
            success: false 
        });
    }

    try {
        // Email to admin
        const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: 'New Enrollment - CodedgeAcademy',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #3b82f6;">New Enrollment Request</h2>
                    <div style="background: #f1f5f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Phone:</strong> ${phone}</p>
                        <p><strong>Course:</strong> ${course}</p>
                    </div>
                    <p style="color: #64748b;">Please contact them within 24 hours.</p>
                </div>
            `
        };

        console.log('Sending email to admin...');
        await transporter.sendMail(adminMailOptions);
        console.log('✅ Admin email sent successfully');

        // Email to user
        const userMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to CodedgeAcademy! 🎓',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #3b82f6, #a855f7); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0;">Welcome to CodedgeAcademy!</h1>
                    </div>
                    <div style="padding: 40px; background: white;">
                        <h2 style="color: #0f172a;">Hi ${name},</h2>
                        <p style="color: #64748b; line-height: 1.6;">
                            Thank you for your interest in our <strong>${course}</strong> course! 
                            We're excited to have you join our learning community.
                        </p>
                        <div style="background: #f1f5f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <h3 style="color: #3b82f6; margin-top: 0;">What's Next?</h3>
                            <ul style="color: #64748b; line-height: 1.8;">
                                <li>Our team will contact you within 24 hours</li>
                                <li>You'll receive detailed course information</li>
                                <li>Schedule a free consultation call</li>
                                <li>Get started with your learning journey</li>
                            </ul>
                        </div>
                        <p style="color: #64748b;">
                            If you have any immediate questions, feel free to reply to this email 
                            or call us at <strong>+91 98765 43210</strong>
                        </p>
                        <div style="text-align: center; margin-top: 30px;">
                            <a href="https://codedgeacademy.com" 
                               style="background: linear-gradient(135deg, #3b82f6, #a855f7); 
                                      color: white; padding: 15px 30px; text-decoration: none; 
                                      border-radius: 10px; display: inline-block; font-weight: bold;">
                                Visit Our Website
                            </a>
                        </div>
                    </div>
                    <div style="background: #0f172a; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
                        <p style="color: #64748b; margin: 0;">© 2024 CodedgeAcademy. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        console.log('Sending email to user...');
        await transporter.sendMail(userMailOptions);
        console.log('✅ User email sent successfully');

        console.log('=== Enrollment Completed Successfully ===\n');
        res.status(200).json({ 
            message: 'Enrollment successful!',
            success: true 
        });

    } catch (error) {
        console.error('❌ Error details:', error);
        console.error('Error message:', error.message);
        if (error.code) console.error('Error code:', error.code);
        console.log('==============================\n');
        
        res.status(500).json({ 
            message: 'Failed to process enrollment. Check server console for details.',
            success: false,
            error: error.message // Include error message for debugging
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log('Ready to accept enrollment requests!\n');
});