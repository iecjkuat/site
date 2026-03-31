const express = require('express');
const bcrypt = require('bcryptjs');
const BCRYPT_ROUNDS = 12; // consistent across all password operations
const jwt = require('jsonwebtoken');
const path = require('path');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin, supabaseAnon } = require('../lib/supabase');
const jkuatPortal = require('../utils/jkuatPortal');
const { logActivity } = require('../lib/audit');
const { generateSecureToken, requireAdmin, authenticateToken } = require('../middleware/auth');
const { Resend } = require('resend');
const _resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || 'JKUAT Innovation Club <noreply@iecjkuat.com>';

async function resend_welcome(userId) {
    if (!_resend) { console.warn('Resend not configured — skipping welcome email'); return; }
    const { supabaseAdmin } = require('../lib/supabase');
    const { data: user } = await supabaseAdmin.from('users').select('name,email').eq('id', userId).single();
    if (!user) return;
    await _resend.emails.send({
        from: FROM,
        to: user.email,
        subject: 'Welcome to JKUAT Innovation Club!',
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:40px auto;background:#0f172a;color:#f9fafb;border-radius:12px;overflow:hidden">
            <div style="background:linear-gradient(135deg,#10b981,#059669);padding:28px 32px">
                <h1 style="margin:0;color:#fff">Welcome, ${user.name}! 🎉</h1>
            </div>
            <div style="padding:32px">
                <p>Your account is ready. Start exploring projects, events, and ideas.</p>
                <a href="${process.env.FRONTEND_URL || 'https://iecjkuat.com'}/dashboard" 
                   style="display:inline-block;background:#10b981;color:#fff;padding:12px 28px;text-decoration:none;border-radius:8px;font-weight:600;margin-top:16px">
                   Go to Dashboard
                </a>
            </div>
        </div>`
    });
}

async function sendVerificationEmail(email, name, token) {
    if (!_resend) { console.warn('Resend not configured — skipping verification email'); return; }
    const site = process.env.FRONTEND_URL || 'https://iecjkuat.com';
    const link = `${site}/verify-email?token=${token}`;
    await _resend.emails.send({
        from: FROM,
        to: email,
        subject: 'Verify your JKUAT Innovation Club email',
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:40px auto;background:#0f172a;color:#f9fafb;border-radius:12px;overflow:hidden">
            <div style="background:linear-gradient(135deg,#10b981,#059669);padding:28px 32px">
                <h1 style="margin:0;color:#fff">Verify your email</h1>
                <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);">JKUAT Innovation &amp; Entrepreneurship Club</p>
            </div>
            <div style="padding:32px">
                <p>Hi <strong>${name}</strong>,</p>
                <p>Thanks for signing up! Click the button below to verify your email. This link expires in <strong>24 hours</strong>.</p>
                <a href="${link}" style="display:inline-block;background:#10b981;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:700;margin:20px 0;font-size:1rem;">
                    Verify Email Address
                </a>
                <p style="color:rgba(255,255,255,0.5);font-size:0.85rem;">Or copy this link: ${link}</p>
                <p style="color:rgba(255,255,255,0.5);font-size:0.85rem;">If you didn't create an account, ignore this email.</p>
            </div>
        </div>`
    });
}

// Create user profile — requires authentication (admin or self only)
const router = express.Router();

router.post('/create-profile', authenticateToken, async (req, res) => {
  try {
    const { id, name, email, registrationNumber, phone, course, yearOfStudy, college } = req.body;

    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { data: existingUser } = await supabaseAdmin
      .from('users').select('id').eq('id', id).single();

    if (existingUser) return res.json({ message: 'Profile already exists' });

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id, name, email,
        registration_number: registrationNumber,
        phone, course,
        year_of_study: parseInt(yearOfStudy),
        college,
        email_verified: false,       // never trust client
        membership_status: 'pending', // always start pending
        role: 'member',
        password_hash: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, name, email, role, membership_status')
      .single();

    if (userError) {
      return res.status(400).json({ message: 'Failed to create user profile', error: userError.message });
    }

    res.json({ message: 'Profile created successfully', user });
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({ message: 'Server error during profile creation' });
  }
});
// Register new user (database-only approach)
router.post('/register', [
  body('email').isEmail().withMessage('Valid email is required')
    .custom((email) => {
      if (!email.includes('@students.jkuat.ac.ke') && !email.includes('@jkuat.ac.ke')) {
        throw new Error('Please use your JKUAT email address (@students.jkuat.ac.ke or @jkuat.ac.ke)');
      }
      return true;
    }),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').notEmpty().withMessage('Name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      email, password, name, registrationNumber, phone, course, yearOfStudy, college
    } = req.body;

    console.log('🔄 Database registration for:', email);

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email'
      });
    }

    // Generate UUID, hash password, and create verification token
    const userId = require('crypto').randomUUID();
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const verificationToken = require('crypto').randomBytes(32).toString('hex');
    const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h

    // Create user — unverified until they click the email link
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: email,
        name: name,
        registration_number: registrationNumber || null,
        phone: phone || null,
        course: course || null,
        year_of_study: yearOfStudy ? parseInt(yearOfStudy) : null,
        college: college || null,
        email_verified: false,
        membership_status: 'pending',
        role: 'member',
        password_hash: passwordHash,
        verification_token: verificationToken,
        verification_token_expiry: tokenExpiry,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, name, email, registration_number, membership_status, role')
      .single();

    if (userError) {
      console.error('User profile creation error:', userError);
      return res.status(400).json({
        message: 'Failed to create user profile',
        error: userError.message
      });
    }

    console.log('✅ User created successfully in database');

    // Send verification email (non-blocking)
    sendVerificationEmail(user.email, user.name, verificationToken).catch(err =>
      console.error('Verification email failed:', err)
    );

    res.status(201).json({
      message: 'Registration successful! Please check your JKUAT email to verify your account.',
      requiresVerification: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        membershipStatus: user.membership_status
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    console.error('Registration error stack:', error.stack);
    res.status(500).json({ message: 'Server error during registration', detail: error.message });
  }
});

// Login user (database-only approach for now)
router.post('/login', [
  body('identifier').notEmpty().withMessage('Email or registration number is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { identifier, password } = req.body;

    // Determine if identifier is email or registration number
    const isEmail = identifier.includes('@');
    const column = isEmail ? 'email' : 'registration_number';

    console.log('Attempting database login with:', { column, identifier });

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select(`
        id, name, email, role, membership_status, email_verified,
        registration_number, password_hash
      `)
      .eq(column, identifier)
      .single();

    console.log('User query result:', { userData: userData ? 'found' : 'not found', userError });

    if (userError || !userData) {
      console.log('User not found or error:', userError);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Block login if email not verified — use same status as invalid credentials
    // to avoid leaking whether the account exists
    if (!userData.email_verified) {
      return res.status(400).json({
        message: 'Invalid credentials or unverified account.',
        requiresVerification: true,
        email: userData.email
      });
    }

    // Check password if hash exists
    if (userData.password_hash) {
      const passwordValid = await bcrypt.compare(password, userData.password_hash);
      
      if (!passwordValid) {
        console.log('Password validation failed');
        return res.status(400).json({ message: 'Invalid credentials' });
      }
    } else {
      // For users without password hash, we'll need to create Supabase Auth user
      console.log('No password hash found, this might be a Supabase Auth user');
      
      // Try Supabase Auth login as fallback
      try {
        const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
          email: userData.email,
          password: password
        });

        if (authError) {
          console.log('Supabase Auth fallback failed:', authError.message);
          return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        console.log('✅ Supabase Auth fallback successful');
        // Re-check email_verified after Supabase fallback (same rule applies)
        if (!userData.email_verified) {
          return res.status(403).json({
            message: 'Please verify your email before logging in.',
            requiresVerification: true,
            email: userData.email
          });
        }
      } catch (authFallbackError) {
        console.log('Auth fallback error:', authFallbackError.message);
        return res.status(400).json({ message: 'Invalid credentials' });
      }
    }

    // Update login stats and detect new device
    const currentAgent = (req.headers['user-agent'] || '').slice(0, 200);
    const isNewDevice = userData.last_user_agent &&
        !currentAgent.startsWith(userData.last_user_agent.slice(0, 30));

    await supabaseAdmin
      .from('users')
      .update({
        last_login: new Date().toISOString(),
        last_user_agent: currentAgent,
        login_count: (userData.login_count || 0) + 1
      })
      .eq('id', userData.id);

    // Non-blocking security alert on new device
    if (isNewDevice && _resend) {
      _resend.emails.send({
        from: FROM,
        to: userData.email,
        subject: 'New login detected — JKUAT Innovation Club',
        html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:40px auto;background:#0f172a;color:#f9fafb;border-radius:12px;padding:32px">
          <h2 style="color:#f59e0b;">⚠️ New Login Detected</h2>
          <p>A login to your account was detected from a new device or browser.</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString('en-KE')}</p>
          <p>If this was you, no action needed. If not,
            <a href="${process.env.FRONTEND_URL || 'https://iecjkuat.com'}/settings" style="color:#10b981;">
              secure your account immediately
            </a>.
          </p>
        </div>`
      }).catch(err => console.error('Security alert email failed:', err));
    }

    // Generate JWT token with device fingerprint
    const token = generateSecureToken(userData.id, userData.role, {}, req);

    // Audit Log
    logActivity(userData.id, 'LOGIN', {
      ip: req.ip,
      method: 'DATABASE'
    }, 'USER', userData.id).catch(console.error);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        membershipStatus: userData.membership_status,
        profileCompleted: userData.profile_completed || false
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Verify email address via token
router.get('/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: 'Verification token required' });

    // Find user with this token
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, verification_token_expiry, email_verified')
      .eq('verification_token', token)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: 'Invalid or expired verification link. Please request a new one.' });
    }

    if (user.email_verified) {
      return res.json({ message: 'Email already verified. You can log in.', alreadyVerified: true });
    }

    // Check token expiry
    if (user.verification_token_expiry && new Date(user.verification_token_expiry) < new Date()) {
      return res.status(400).json({ message: 'Verification link has expired. Please sign up again or request a new link.', expired: true });
    }

    // Mark as verified
    await supabaseAdmin
      .from('users')
      .update({
        email_verified: true,
        membership_status: 'active',
        verification_token: null,
        verification_token_expiry: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    // Send welcome email now that they're verified
    resend_welcome(user.id).catch(err => console.error('Welcome email failed:', err));

    console.log('✅ Email verified for:', user.email);
    res.json({ message: 'Email verified successfully! You can now log in.', verified: true });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, name, email, email_verified')
      .eq('email', email)
      .single();

    if (!user) return res.status(404).json({ message: 'No account found with this email' });
    if (user.email_verified) return res.json({ message: 'Email already verified. You can log in.' });

    // Generate new token
    const newToken = require('crypto').randomBytes(32).toString('hex');
    const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    await supabaseAdmin
      .from('users')
      .update({ verification_token: newToken, verification_token_expiry: newExpiry })
      .eq('id', user.id);

    await sendVerificationEmail(user.email, user.name, newToken);

    res.json({ message: 'Verification email resent. Check your JKUAT inbox.' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Refresh token — issues a new JWT if the current one is still valid
router.post('/refresh', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'],
        issuer: 'jkuat-innovation-club',
        audience: 'jkuat-platform',
        // Allow tokens up to 7 days past expiry for refresh
        ignoreExpiration: true
      });
    } catch {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Check token isn't too old to refresh (7 day window)
    const issuedAt = decoded.iat * 1000;
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - issuedAt > sevenDays) {
      return res.status(401).json({ message: 'Token too old to refresh. Please log in again.' });
    }

    // Check token hasn't been blacklisted (logged out)
    const { isTokenBlacklisted } = require('../middleware/auth');
    if (decoded.jti && isTokenBlacklisted(decoded.jti)) {
      return res.status(401).json({ message: 'Token has been revoked. Please log in again.' });
    }

    // Verify user still exists and is active
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, role, membership_status, email_verified')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) return res.status(401).json({ message: 'User not found' });
    if (user.membership_status === 'inactive' || user.membership_status === 'suspended') {
      return res.status(401).json({ message: 'Account inactive' });
    }

    // Issue fresh token
    const newToken = generateSecureToken(user.id, user.role);

    res.json({
      token: newToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        membershipStatus: user.membership_status
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Server error during token refresh' });
  }
});

// Verify user session
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user details from database
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select(`
        id, name, email, role, membership_status
      `)
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        membershipStatus: user.membership_status,
        profileCompleted: false // Default for now since column might not exist
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Complete user profile
router.post('/complete-profile', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const {
      bio, dateOfBirth, gender, linkedinUrl, interests, skills,
      experienceLevel, goals, preferredCommunication, additionalComments
    } = req.body;

    // Update user profile
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        bio,
        date_of_birth: dateOfBirth,
        gender,
        linkedin_url: linkedinUrl,
        interests: interests || [],
        skills: skills || [],
        experience_level: experienceLevel,
        goals: goals || [],
        preferred_communication: preferredCommunication,
        additional_comments: additionalComments,
        profile_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', decoded.userId)
      .select('id, name, email, profile_completed')
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return res.status(500).json({ message: 'Failed to update profile' });
    }

    res.json({
      message: 'Profile completed successfully!',
      user: updatedUser
    });

  } catch (error) {
    console.error('Complete profile error:', error);
    res.status(500).json({ message: 'Server error during profile completion' });
  }
});

// Debug endpoint to check user status (requires admin authentication)
router.get('/debug/:identifier', requireAdmin, async (req, res) => {
  try {
    const { identifier } = req.params;
    const isEmail = identifier.includes('@');
    const column = isEmail ? 'email' : 'registration_number';

    console.log(`🔍 Debugging user: ${identifier} (${isEmail ? 'email' : 'registration'})`);

    // Get user from database
    const { data: dbUser, error: dbError } = await supabaseAdmin
      .from('users')
      .select('id, email, name, email_verified, membership_status, created_at')
      .eq(column, identifier)
      .single();

    let authUser = null;
    let authError = null;
    if (dbUser && isEmail) {
      // Try to get user from Supabase Auth
      try {
        const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.listUsers();
        authUser = authData.users.find(u => u.email === identifier);
        authError = authErr;
      } catch (error) {
        authError = error;
        console.log('No auth user found:', error.message);
      }
    }

    // Test login capability
    let loginTest = null;
    if (dbUser) {
      if (authUser && dbUser.email_verified) {
        loginTest = {
          type: 'registered_user',
          method: 'supabase_auth',
          can_login: true,
          note: 'Uses Supabase Auth verification'
        };
      } else if (authUser && !dbUser.email_verified) {
        loginTest = {
          type: 'registered_user',
          method: 'supabase_auth',
          can_login: false,
          note: 'Email verification required'
        };
      } else {
        loginTest = {
          type: 'incomplete_registration',
          method: 'none',
          can_login: false,
          note: 'User exists in DB but not in Supabase Auth'
        };
      }
    }

    res.json({
      identifier,
      timestamp: new Date().toISOString(),
      database: {
        found: !!dbUser,
        user: dbUser ? {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          email_verified: dbUser.email_verified,
          membership_status: dbUser.membership_status,
          created_at: dbUser.created_at
        } : null,
        error: dbError?.message
      },
      supabase_auth: {
        found: !!authUser,
        user: authUser ? {
          id: authUser.id,
          email: authUser.email,
          email_confirmed_at: authUser.email_confirmed_at,
          created_at: authUser.created_at,
          last_sign_in_at: authUser.last_sign_in_at
        } : null,
        error: authError?.message
      },
      login_analysis: loginTest,
      recommendations: dbUser ? [
        ...(!dbUser.email_verified && authUser ? ['Verify email address'] : []),
        ...(dbUser && !authUser ? ['User exists in DB but not in Auth - data inconsistency'] : [])
      ] : ['User not found - register first']
    });

  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Logout user
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { blacklistToken, clearUserCache } = require('../middleware/auth');
    
    // Blacklist the current token
    if (req.tokenData && req.tokenData.tokenId) {
      blacklistToken(req.tokenData.tokenId);
      console.log(`🚪 User logged out: ${req.user.id.substring(0, 8)}...`);
    }
    
    // Clear user cache
    clearUserCache(req.user.id);
    
    res.json({ 
      message: 'Logout successful',
      action: 'token_blacklisted'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});



// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // Return user data
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select(`
        id, name, email, phone, registration_number, course, year_of_study,
        college, role, membership_status, profile_picture, bio, date_of_birth,
        gender, linkedin_url, skills, interests, experience_level, goals,
        preferred_communication, social_links, email_verified, phone_verified,
        profile_completed, created_at, updated_at
      `)
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch profile' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('linkedin_url').optional().isURL().withMessage('Valid LinkedIn URL required'),
  body('skills').optional().isArray().withMessage('Skills must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const allowedFields = [
      'name', 'email', 'phone', 'bio', 'date_of_birth', 'gender',
      'linkedin_url', 'skills', 'interests', 'goals', 'preferred_communication',
      'social_links'
    ];

    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key) && req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    });

    updateData.updated_at = new Date().toISOString();

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select(`
        id, name, email, phone, registration_number, course, year_of_study,
        college, role, membership_status, profile_picture, bio, date_of_birth,
        gender, linkedin_url, skills, interests, experience_level, goals,
        preferred_communication, social_links, email_verified, phone_verified,
        profile_completed, created_at, updated_at
      `)
      .single();

    if (error) {
      console.error('Profile update error:', error);
      return res.status(500).json({ message: 'Failed to update profile' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update academic information
router.put('/academic', authenticateToken, [
  body('registration_number').optional().trim().notEmpty().withMessage('Registration number is required'),
  body('course').optional().trim().notEmpty().withMessage('Course is required'),
  body('year_of_study').optional().isInt({ min: 1, max: 6 }).withMessage('Valid year of study required'),
  body('college').optional().trim().notEmpty().withMessage('College is required'),
  body('experience_level').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']).withMessage('Valid experience level required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const allowedFields = [
      'registration_number', 'course', 'year_of_study', 'college', 'experience_level'
    ];

    const updateData = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key) && req.body[key] !== undefined) {
        updateData[key] = req.body[key];
      }
    });

    updateData.updated_at = new Date().toISOString();

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', req.user.id)
      .select('registration_number, course, year_of_study, college, experience_level')
      .single();

    if (error) {
      console.error('Academic update error:', error);
      return res.status(500).json({ message: 'Failed to update academic information' });
    }

    res.json({ message: 'Academic information updated successfully', data: updatedUser });
  } catch (error) {
    console.error('Academic update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update notification preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const preferences = req.body;

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update({
        preferences: preferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select('preferences')
      .single();

    if (error) {
      console.error('Preferences update error:', error);
      return res.status(500).json({ message: 'Failed to update preferences' });
    }

    res.json({ message: 'Preferences updated successfully', preferences: updatedUser.preferences });
  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notification preferences
router.get('/preferences', authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('preferences')
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch preferences' });
    }

    res.json(user.preferences || {});
  } catch (error) {
    console.error('Preferences fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.post('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    console.log('🔐 Password change request received');
    console.log('📥 Request body keys:', Object.keys(req.body));
    console.log('📥 Has currentPassword:', !!req.body.currentPassword);
    console.log('📥 Has newPassword:', !!req.body.newPassword);
    console.log('📥 User ID from token:', req.user?.id);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // First, get the user's current password hash from database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('password_hash')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('❌ User fetch error:', userError);
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
    
    if (!isPasswordValid) {
      console.log('❌ Current password is incorrect');
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash the new password
    const newPasswordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

    // Update password in database
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Password update error:', updateError);
      return res.status(400).json({ message: 'Failed to update password' });
    }

    console.log(`✅ Password changed successfully for user ${userId}`);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Profile picture upload
const multer = require('multer');
const storage = multer.memoryStorage();
const profilePictureUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for profile pictures
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

router.post('/profile-picture', authenticateToken, profilePictureUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const userId = req.user.id;
    const file = req.file;

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `profile-pictures/${userId}/${timestamp}-${sanitizedName}`;

    console.log('📤 Uploading profile picture:', fileName);

    // Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from('avatars')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('❌ Upload error:', error);
      return res.status(500).json({ 
        message: 'Failed to upload profile picture',
        error: error.message 
      });
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const publicUrl = urlData.publicUrl;

    // Update user profile with new picture URL
    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({ 
        profile_picture: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ Profile update error:', updateError);
      return res.status(500).json({ 
        message: 'Failed to update profile',
        error: updateError.message 
      });
    }

    console.log('✅ Profile picture uploaded successfully:', publicUrl);

    res.json({
      success: true,
      profilePictureUrl: publicUrl,
      message: 'Profile picture updated successfully'
    });

  } catch (error) {
    console.error('❌ Profile picture upload error:', error);
    res.status(500).json({ 
      message: 'Server error during upload',
      error: error.message 
    });
  }
});

// Get user activity log
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    // This would fetch user activity from various tables
    // For now, we'll return sample data
    const activities = [
      {
        id: 1,
        type: 'event_attendance',
        title: 'Attended Innovation Workshop',
        description: 'Participated in 2-hour innovation workshop',
        date: new Date().toISOString(),
        points: 50
      },
      {
        id: 2,
        type: 'project_join',
        title: 'Joined Project Team',
        description: 'Joined Smart Campus App project as Frontend Developer',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        points: 30
      }
    ];

    res.json(activities);
  } catch (error) {
    console.error('Activity fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID (for messaging and other features)
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select(`
        id, name, email, phone, registration_number, course, year_of_study,
        college, role, membership_status, profile_picture, bio,
        linkedin_url, created_at
      `)
      .eq('id', userId)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('User lookup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete account — requires password confirmation
router.delete('/delete-account', authenticateToken, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Password confirmation required to delete account' });
    }

    // Verify password before deletion
    const { data: user } = await supabaseAdmin
      .from('users').select('password_hash').eq('id', req.user.id).single();

    if (!user?.password_hash) {
      return res.status(400).json({ message: 'Cannot delete account — no password set' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const { error: dbError } = await supabaseAdmin
      .from('users').delete().eq('id', req.user.id);

    if (dbError) throw dbError;

    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

// Export user data
router.get('/export-data', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all user related data in parallel
    const [
      { data: profile },
      { data: preferences },
      { data: notifications },
      { data: payments },
      { data: activity }
    ] = await Promise.all([
      supabaseAdmin.from('users').select('id, name, email, phone, registration_number, course, year_of_study, college, role, membership_status, bio, linkedin_url, skills, interests, created_at, updated_at').eq('id', userId).single(),
      supabaseAdmin.from('notification_preferences').select('*').eq('user_id', userId).single(),
      supabaseAdmin.from('notifications').select('*').eq('user_id', userId),
      supabaseAdmin.from('financial_transactions').select('*').eq('user_id', userId),
      supabaseAdmin.from('user_sessions').select('*').eq('user_id', userId) // Assuming this tracks activity
    ]);

    const exportData = {
      profile: profile || {},
      preferences: preferences || {},
      notifications: notifications || [],
      payments: payments || [],
      activity_log: activity || [],
      export_date: new Date().toISOString()
    };

    res.json(exportData);
  } catch (error) {
    console.error('Data export error:', error);
    res.status(500).json({ message: 'Failed to export data' });
  }
});

module.exports = router;