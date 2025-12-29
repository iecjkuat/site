const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send verification email
const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/api/auth/verify-email/${token}`;
  
  const mailOptions = {
    from: `"JKUAT Innovation Club" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email - JKUAT Innovation Club',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">JKUAT Innovation Club</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Welcome to JKUAT Innovation Club!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Thank you for registering with JKUAT Innovation Club. To complete your registration and activate your account, please verify your email address by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${verificationUrl}" style="color: #667eea;">${verificationUrl}</a>
          </p>
          
          <p style="color: #666; font-size: 14px;">
            This verification link will expire in 24 hours. If you didn't create an account with us, please ignore this email.
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 JKUAT Innovation Club. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: `"JKUAT Innovation Club" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset - JKUAT Innovation Club',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">JKUAT Innovation Club</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Password Reset Request</h2>
          
          <p style="color: #666; line-height: 1.6;">
            We received a request to reset your password for your JKUAT Innovation Club account. Click the button below to reset your password.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            If the button doesn't work, copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #dc3545;">${resetUrl}</a>
          </p>
          
          <p style="color: #666; font-size: 14px;">
            This password reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you have concerns.
          </p>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 JKUAT Innovation Club. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// Send welcome email after membership activation
const sendWelcomeEmail = async (user) => {
  const mailOptions = {
    from: `"JKUAT Innovation Club" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Welcome to JKUAT Innovation Club!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">JKUAT Innovation Club</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">Welcome ${user.name}!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Congratulations! Your membership has been activated. You are now part of JKUAT's premier innovation community.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Your Membership Details:</h3>
            <p style="margin: 5px 0;"><strong>Membership Number:</strong> ${user.membershipNumber}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> ${user.membershipStatus}</p>
            <p style="margin: 5px 0;"><strong>Registration Date:</strong> ${new Date(user.registrationDate).toLocaleDateString()}</p>
          </div>
          
          <h3 style="color: #333;">What's Next?</h3>
          <ul style="color: #666; line-height: 1.6;">
            <li>Complete your profile to connect with other members</li>
            <li>Browse and participate in upcoming events</li>
            <li>Share your innovative ideas in our Ideas Hub</li>
            <li>Join project collaborations</li>
            <li>Access exclusive resources and workshops</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.BASE_URL || 'http://localhost:3000'}/dashboard" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Access Your Dashboard
            </a>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 JKUAT Innovation Club. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', user.email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
};

// Send event notification email
const sendEventNotification = async (user, event) => {
  const mailOptions = {
    from: `"JKUAT Innovation Club" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `New Event: ${event.title}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">JKUAT Innovation Club</h1>
        </div>
        
        <div style="padding: 30px; background: #f9f9f9;">
          <h2 style="color: #333;">${event.title}</h2>
          
          <p style="color: #666; line-height: 1.6;">
            ${event.description}
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Event Details:</h3>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(event.startDate).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${new Date(event.startDate).toLocaleTimeString()}</p>
            <p style="margin: 5px 0;"><strong>Venue:</strong> ${event.venue}</p>
            <p style="margin: 5px 0;"><strong>Category:</strong> ${event.category}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.BASE_URL || 'http://localhost:3000'}/events/${event._id}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Event Details
            </a>
          </div>
        </div>
        
        <div style="background: #333; color: white; padding: 20px; text-align: center; font-size: 14px;">
          <p style="margin: 0;">© 2024 JKUAT Innovation Club. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Event notification sent to:', user.email);
  } catch (error) {
    console.error('Error sending event notification:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendEventNotification
};