# Email System Guide

## Overview

The email system handles:
1. **Email Verification** - Confirm user's email after signup
2. **Password Reset** - Send reset link when user forgets password
3. **Notifications** - Event reminders, payment confirmations, etc.

## Email Service Options

### Option 1: Gmail SMTP (Easiest for Development) ✅ RECOMMENDED

**Pros:**
- ✅ Free for up to 500 emails/day
- ✅ Easy to setup
- ✅ Works immediately
- ✅ Good for testing

**Cons:**
- ⚠️ Limited to 500 emails/day
- ⚠️ May go to spam if not configured properly
- ⚠️ Not ideal for production at scale

**Setup:**
```env
# .env file
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=jkuatinnovationclub@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=JKUAT Innovation Club <jkuatinnovationclub@gmail.com>
```

**How to get App Password:**
1. Go to Google Account settings
2. Security → 2-Step Verification (enable it)
3. App passwords → Generate new password
4. Use that password in EMAIL_PASSWORD

### Option 2: SendGrid (Best for Production) ✅ RECOMMENDED FOR LAUNCH

**Pros:**
- ✅ Free tier: 100 emails/day
- ✅ Professional delivery
- ✅ Better deliverability (won't go to spam)
- ✅ Email analytics
- ✅ Templates

**Cons:**
- ⚠️ Requires signup
- ⚠️ Need to verify domain

**Setup:**
```env
# .env file
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@jkuatinnovationclub.com
```

**Cost:**
- Free: 100 emails/day
- Essentials: $19.95/month - 50,000 emails/month
- Pro: $89.95/month - 100,000 emails/month

### Option 3: Resend (Modern Alternative)

**Pros:**
- ✅ Free tier: 3,000 emails/month
- ✅ Modern API
- ✅ Great documentation
- ✅ Easy to use

**Setup:**
```env
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=noreply@jkuatinnovationclub.com
```

### Option 4: Mailgun, AWS SES, Postmark

All good options with similar features and pricing.

## Current Setup Check

Let me check what you already have:

```javascript
// Check .env file
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-password
```

You already have email configuration! Let's use it.

## 1. Email Verification Flow

### How It Works:

```
1. User signs up
   ↓
2. Generate verification token (random string)
   ↓
3. Store token in database with expiration
   ↓
4. Send email with verification link
   ↓
5. User clicks link
   ↓
6. Verify token and mark email as verified
   ↓
7. User can now access full features
```

### Database Schema

```sql
-- Add to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
```

### Implementation

#### Step 1: Generate Token on Signup

```javascript
// routes/auth.js - Register endpoint
const crypto = require('crypto');

router.post('/register', async (req, res) => {
    // ... existing registration code ...
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Create user with token
    const { data: user } = await supabaseAdmin
        .from('users')
        .insert({
            // ... other fields ...
            email_verified: false,
            email_verification_token: verificationToken,
            email_verification_expires: verificationExpires.toISOString()
        })
        .select()
        .single();
    
    // Send verification email
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(user.email, user.name, verificationUrl);
    
    res.json({
        message: 'Registration successful! Please check your email to verify your account.',
        user: { id: user.id, email: user.email }
    });
});
```

#### Step 2: Send Verification Email

```javascript
// lib/email.js
const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

async function sendVerificationEmail(email, name, verificationUrl) {
    const mailOptions = {
        from: process.env.EMAIL_FROM || 'JKUAT Innovation Club <noreply@jkuatinnovationclub.com>',
        to: email,
        subject: 'Verify Your Email - JKUAT Innovation Club',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚀 Welcome to JKUAT Innovation Club!</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${name},</h2>
                        <p>Thank you for registering with JKUAT Innovation & Entrepreneurship Club!</p>
                        <p>Please verify your email address by clicking the button below:</p>
                        <center>
                            <a href="${verificationUrl}" class="button">Verify Email Address</a>
                        </center>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
                        <p><strong>This link will expire in 24 hours.</strong></p>
                        <p>If you didn't create an account, please ignore this email.</p>
                        <p>Best regards,<br>JKUAT Innovation Club Team</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 JKUAT Innovation & Entrepreneurship Club. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    
    try {
        await transporter.sendMail(mailOptions);
        console.log('✅ Verification email sent to:', email);
    } catch (error) {
        console.error('❌ Failed to send verification email:', error);
        throw error;
    }
}

module.exports = { sendVerificationEmail };
```

#### Step 3: Verify Email Endpoint

```javascript
// routes/auth.js
router.get('/verify-email', async (req, res) => {
    const { token } = req.query;
    
    if (!token) {
        return res.status(400).json({ error: 'Verification token is required' });
    }
    
    // Find user with this token
    const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email_verification_token', token)
        .single();
    
    if (error || !user) {
        return res.status(400).json({ error: 'Invalid or expired verification token' });
    }
    
    // Check if token expired
    if (new Date() > new Date(user.email_verification_expires)) {
        return res.status(400).json({ error: 'Verification token has expired' });
    }
    
    // Mark email as verified
    await supabaseAdmin
        .from('users')
        .update({
            email_verified: true,
            email_verification_token: null,
            email_verification_expires: null,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
    
    res.json({
        success: true,
        message: 'Email verified successfully! You can now login.'
    });
});
```

#### Step 4: Resend Verification Email

```javascript
// routes/auth.js
router.post('/resend-verification', async (req, res) => {
    const { email } = req.body;
    
    // Find user
    const { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
    
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.email_verified) {
        return res.status(400).json({ error: 'Email already verified' });
    }
    
    // Generate new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    // Update user
    await supabaseAdmin
        .from('users')
        .update({
            email_verification_token: verificationToken,
            email_verification_expires: verificationExpires.toISOString()
        })
        .eq('id', user.id);
    
    // Send email
    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(user.email, user.name, verificationUrl);
    
    res.json({
        success: true,
        message: 'Verification email sent! Please check your inbox.'
    });
});
```

## 2. Password Reset Flow

### How It Works:

```
1. User clicks "Forgot Password"
   ↓
2. Enters email address
   ↓
3. Generate reset token
   ↓
4. Send email with reset link
   ↓
5. User clicks link
   ↓
6. User enters new password
   ↓
7. Verify token and update password
   ↓
8. User can login with new password
```

### Database Schema

```sql
-- Add to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMP;
```

### Implementation

#### Step 1: Request Password Reset

```javascript
// routes/auth.js
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    
    // Find user
    const { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
    
    // Always return success (security: don't reveal if email exists)
    if (!user) {
        return res.json({
            success: true,
            message: 'If that email exists, a password reset link has been sent.'
        });
    }
    
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    
    // Update user
    await supabaseAdmin
        .from('users')
        .update({
            password_reset_token: resetToken,
            password_reset_expires: resetExpires.toISOString()
        })
        .eq('id', user.id);
    
    // Send reset email
    const resetUrl = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(user.email, user.name, resetUrl);
    
    res.json({
        success: true,
        message: 'If that email exists, a password reset link has been sent.'
    });
});
```

#### Step 2: Send Password Reset Email

```javascript
// lib/email.js
async function sendPasswordResetEmail(email, name, resetUrl) {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Reset Your Password - JKUAT Innovation Club',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
                    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔐 Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <h2>Hi ${name},</h2>
                        <p>We received a request to reset your password for your JKUAT Innovation Club account.</p>
                        <p>Click the button below to reset your password:</p>
                        <center>
                            <a href="${resetUrl}" class="button">Reset Password</a>
                        </center>
                        <p>Or copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
                        <div class="warning">
                            <strong>⚠️ Important:</strong>
                            <ul>
                                <li>This link will expire in 1 hour</li>
                                <li>If you didn't request this, please ignore this email</li>
                                <li>Your password won't change until you create a new one</li>
                            </ul>
                        </div>
                        <p>Best regards,<br>JKUAT Innovation Club Team</p>
                    </div>
                    <div class="footer">
                        <p>© 2024 JKUAT Innovation & Entrepreneurship Club. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };
    
    await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', email);
}
```

#### Step 3: Reset Password Endpoint

```javascript
// routes/auth.js
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required' });
    }
    
    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    
    // Find user with this token
    const { data: user } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('password_reset_token', token)
        .single();
    
    if (!user) {
        return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    
    // Check if token expired
    if (new Date() > new Date(user.password_reset_expires)) {
        return res.status(400).json({ error: 'Reset token has expired' });
    }
    
    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);
    
    // Update password and clear reset token
    await supabaseAdmin
        .from('users')
        .update({
            password_hash: passwordHash,
            password_reset_token: null,
            password_reset_expires: null,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
    
    // Send confirmation email
    await sendPasswordChangedEmail(user.email, user.name);
    
    res.json({
        success: true,
        message: 'Password reset successfully! You can now login with your new password.'
    });
});
```

## 3. Notification Emails

### Types of Notifications:

1. **Event Reminders**
2. **Payment Confirmations**
3. **Membership Expiry Warnings**
4. **New Event Announcements**
5. **Idea Voting Results**
6. **Project Updates**

### Implementation

```javascript
// lib/email.js

// Event Reminder
async function sendEventReminderEmail(email, name, event) {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Reminder: ${event.title} - Tomorrow!`,
        html: `
            <h2>Hi ${name},</h2>
            <p>This is a reminder that you're registered for:</p>
            <h3>${event.title}</h3>
            <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${event.time}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <p>We look forward to seeing you there!</p>
        `
    };
    
    await transporter.sendMail(mailOptions);
}

// Payment Confirmation
async function sendPaymentConfirmationEmail(email, name, payment) {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Payment Confirmation - JKUAT Innovation Club',
        html: `
            <h2>Hi ${name},</h2>
            <p>Your payment has been received successfully!</p>
            <p><strong>Amount:</strong> KES ${payment.amount}</p>
            <p><strong>Reference:</strong> ${payment.reference}</p>
            <p><strong>Date:</strong> ${new Date(payment.date).toLocaleDateString()}</p>
            <p>Your membership is now active. Welcome to the club!</p>
        `
    };
    
    await transporter.sendMail(mailOptions);
}

// Membership Expiry Warning
async function sendMembershipExpiryWarningEmail(email, name, expiryDate) {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Membership Expiring Soon - JKUAT Innovation Club',
        html: `
            <h2>Hi ${name},</h2>
            <p>Your membership will expire on ${new Date(expiryDate).toLocaleDateString()}.</p>
            <p>Renew now to continue enjoying all club benefits!</p>
            <a href="${process.env.APP_URL}/payment">Renew Membership</a>
        `
    };
    
    await transporter.sendMail(mailOptions);
}
```

## Email Configuration

### .env File

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=jkuatinnovationclub@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=JKUAT Innovation Club <jkuatinnovationclub@gmail.com>

# App URL (for links in emails)
APP_URL=http://localhost:3000
```

### For Production

```env
# Use your domain
APP_URL=https://innovation.jkuat.ac.ke
EMAIL_FROM=JKUAT Innovation Club <noreply@innovation.jkuat.ac.ke>
```

## Testing Emails

### Use Mailtrap for Development

Mailtrap catches all emails so they don't actually send:

```env
# Development - Mailtrap
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-username
EMAIL_PASSWORD=your-mailtrap-password
```

## Summary

### Email Sending From:
- **Development**: Your Gmail account or Mailtrap
- **Production**: SendGrid or professional email service

### Email Types:
1. ✅ Email Verification (after signup)
2. ✅ Password Reset (forgot password)
3. ✅ Payment Confirmation (after payment)
4. ✅ Event Reminders (before events)
5. ✅ Membership Expiry (renewal reminders)

### Cost:
- **Gmail**: Free (500/day limit)
- **SendGrid**: Free tier (100/day) or $19.95/month
- **Resend**: Free (3,000/month)

### Next Steps:
1. Choose email service (Gmail for now, SendGrid for launch)
2. Get credentials
3. Update .env file
4. I'll implement all email functions
5. Test with your email

Would you like me to implement this now? 📧
