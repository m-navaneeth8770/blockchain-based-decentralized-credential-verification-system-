require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory OTP storage (in production, use Redis or database)
const otpStore = new Map();

// Email transporter configuration
// For development, using Gmail (you'll need to enable "Less secure app access" or use App Password)
let transporter;
try {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, // Use TLS port instead of SSL
    secure: false, // Use STARTTLS
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password',
    },
    tls: {
      rejectUnauthorized: false // For development only
    },
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
  });
  console.log('📧 Email transporter configured successfully');
  console.log('📧 Using SMTP: smtp.gmail.com:587 (TLS)');
} catch (error) {
  console.error('❌ Error configuring email transporter:', error);
}

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send OTP endpoint
app.post('/api/send-otp', async (req, res) => {
  try {
    const { email, studentName, purpose } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiry (5 minutes)
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000,
      purpose,
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: 'BlockVerify - Student Details Update Verification',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px solid #4F46E5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #6B7280; font-size: 12px; }
            .warning { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 BlockVerify</h1>
              <p>Student Details Update Verification</p>
            </div>
            <div class="content">
              <h2>Hello ${studentName || 'Student'},</h2>
              <p>Your university is requesting to update your student details in the BlockVerify system.</p>
              
              <p><strong>Please use the following OTP to verify and approve this change:</strong></p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #6B7280;">This code expires in 5 minutes</p>
              </div>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul style="margin: 10px 0;">
                  <li>Only share this OTP with your university administrator</li>
                  <li>Do not share this code with anyone else</li>
                  <li>If you did not request this change, please contact your university immediately</li>
                </ul>
              </div>

              <p>If you have any questions, please contact your university administration.</p>
              
              <p>Best regards,<br><strong>BlockVerify Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated message from BlockVerify Academic Credential Verification System</p>
              <p>© 2025 BlockVerify. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    // Send email
    console.log(`📤 Attempting to send OTP to ${email}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent successfully to ${email}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`🔢 OTP: ${otp}`); // For development only
    
    res.json({ 
      success: true, 
      message: 'OTP sent successfully',
      // In development, you can return the OTP for testing
      ...(process.env.NODE_ENV === 'development' && { otp }),
    });

  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ 
      message: 'Failed to send OTP',
      error: error.message 
    });
  }
});

// Verify OTP endpoint
app.post('/api/verify-otp', (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({ message: 'No OTP found for this email' });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP has expired' });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // OTP is valid, remove it from store
    otpStore.delete(email);

    res.json({ 
      success: true, 
      message: 'OTP verified successfully' 
    });

  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ 
      message: 'Failed to verify OTP',
      error: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Email service is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Email OTP service running on http://localhost:${PORT}`);
  console.log(`📧 Make sure to configure EMAIL_USER and EMAIL_PASS environment variables`);
});
