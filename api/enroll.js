const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      message: 'Method not allowed',
      success: false 
    });
  }

  const { name, email, phone, course } = req.body;

  // Validation
  if (!name || !email || !phone || !course) {
    return res.status(400).json({ 
      message: 'All fields are required',
      success: false 
    });
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    // Email to admin
    await transporter.sendMail({
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
        </div>
      `
    });

    // Email to user
    await transporter.sendMail({
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
            </p>
            <div style="background: #f1f5f9; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #3b82f6; margin-top: 0;">What's Next?</h3>
              <ul style="color: #64748b; line-height: 1.8;">
                <li>Our team will contact you within 24 hours</li>
                <li>You'll receive detailed course information</li>
                <li>Schedule a free consultation call</li>
              </ul>
            </div>
          </div>
        </div>
      `
    });

    res.status(200).json({ 
      message: 'Enrollment successful!',
      success: true 
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      message: 'Failed to process enrollment',
      success: false
    });
  }
};