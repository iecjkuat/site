const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { supabaseAdmin, supabaseAnon } = require('../lib/supabase');
const jkuatPortal = require('../utils/jkuatPortal');
const { logActivity } = require('../lib/audit');
const { generateSecureToken, requireAdmin, authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Create user profile (called after Supabase Auth registration)
router.post('/create-profile', async (req, res) => {
  try {
    const {
      id, name, email, registrationNumber, phone, course, yearOfStudy, college, emailVerified
    } = req.body;

    console.log('🔄 Creating user profile for:', email);

    // Check if profile already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', id)
      .single();

    if (existingUser) {
      return res.json({ message: 'Profile already exists' });
    }

    // Create user profile in database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: id,
        name: name,
        email: email,
        registration_number: registrationNumber,
        phone: phone,
        course: course,
        year_of_study: parseInt(yearOfStudy),
        college: college,
        email_verified: emailVerified,
        membership_status: emailVerified ? 'active' : 'pending',
        role: 'member',
        password_hash: null, // We use Supabase Auth, not custom passwords
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, name, email, role, membership_status')
      .single();

    if (userError) {
      console.error('Profile creation error:', userError);
      return res.status(400).json({
        message: 'Failed to create user profile',
        error: userError.message
      });
    }

    console.log('✅ User profile created successfully');

    res.json({
      message: 'Profile created successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        membershipStatus: user.membership_status
      }
    });

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
        throw new Error('Please use a valid JKUAT email address (@students.jkuat.ac.ke or @jkuat.ac.ke)');
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

    // Generate UUID and hash password
    const userId = require('crypto').randomUUID();
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user profile in database
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
        email_verified: true,
        membership_status: 'active',
        role: 'member',
        password_hash: passwordHash,
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

    res.status(201).json({
      message: 'Registration successful! You can now log in.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        membershipStatus: user.membership_status
      },
      canLoginImmediately: true
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
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

    // Check password if hash exists
    if (userData.password_hash) {
      const bcrypt = require('bcrypt');
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
      } catch (authFallbackError) {
        console.log('Auth fallback error:', authFallbackError.message);
        return res.status(400).json({ message: 'Invalid credentials' });
      }
    }

    // Update login stats
    await supabaseAdmin
      .from('users')
      .update({
        last_login: new Date().toISOString(),
        login_count: userData.login_count ? userData.login_count + 1 : 1
      })
      .eq('id', userData.id);

    // Generate JWT token using standard security module
    const token = generateSecureToken(userData.id, userData.role);

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
router.post('/logout', async (req, res) => {
  try {
    // With JWT, logout is handled client-side by removing the token
    // Optionally, you could maintain a blacklist of tokens
    res.json({ message: 'Logout successful' });
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { newPassword } = req.body;
    const userId = req.user.id;

    // Update password using Supabase Auth Admin API (service role)
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    );

    if (error) {
      console.error('Password update error:', error);
      return res.status(400).json({ message: 'Failed to update password' });
    }

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Profile picture upload placeholder
router.post('/profile-picture', authenticateToken, async (req, res) => {
  try {
    // This would handle file upload using multer
    // For now, we'll return a placeholder response
    res.json({
      message: 'Profile picture upload endpoint ready',
      profilePictureUrl: '/images/default-avatar.png'
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ message: 'Server error' });
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

// Delete account
router.delete('/delete-account', authenticateToken, async (req, res) => {
  try {
    // Delete user from database (foreign keys should handle cascade)
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', req.user.id);

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
      supabaseAdmin.from('users').select('*').eq('id', userId).single(),
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