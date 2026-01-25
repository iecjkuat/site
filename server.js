const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
require('dotenv').config();

// Import Supabase client
const { supabaseAdmin } = require('./lib/supabase');

// Import WebSocket service
const WebSocketService = require('./routes/websocket-service');

// Import routes
const authRoutes = require('./routes/auth');
const clubsRoutes = require('./routes/clubs');
const eventsRoutes = require('./routes/events');
const paymentsRoutes = require('./routes/payments');
const membershipRoutes = require('./routes/membership');
const leadershipRoutes = require('./routes/leadership');
const projectsRoutes = require('./routes/projects');
const ideasRoutes = require('./routes/ideas');
const resourcesRoutes = require('./routes/resources');
const opportunitiesRoutes = require('./routes/opportunities');
const supportRoutes = require('./routes/support');
const contentRoutes = require('./routes/content');
const emailServiceRoutes = require('./routes/email-service');
const paymentServiceRoutes = require('./routes/payment-service');
const feedbackRoutes = require('./routes/feedback');
const notificationsRoutes = require('./routes/notifications');
const meetingsRoutes = require('./routes/meetings');
const votingRoutes = require('./routes/voting');
const communicationRoutes = require('./routes/communication');
const analyticsRoutes = require('./routes/analytics');
const statsRoutes = require('./routes/stats');
const testimonialsRoutes = require('./routes/testimonials');
const adminRoutes = require('./routes/admin');

// Import validation middleware
const { rateLimits, sanitizeInput } = require('./middleware/validation');
const { csrfMiddleware } = require('./middleware/csrf');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize WebSocket service
const wsService = new WebSocketService(server);

// Security middleware - Apply before other middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // Remove 'unsafe-inline' for better security
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.supabase.co", "wss://*.supabase.co", process.env.SUPABASE_URL || ""],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      mediaSrc: ["'self'", "https://sample-videos.com"],
      frameSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false, // Allow embedding for development
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// CORS configuration with environment-specific origins
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean)
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or file:// protocol)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }

    // In development, be more permissive but don't log for null origins
    if (process.env.NODE_ENV !== 'production') {
      // Only log warnings for actual origins that are not allowed
      if (origin) {
        console.warn('⚠️ CORS: Allowing origin in development mode:', origin);
      }
      return callback(null, true);
    }

    // In production, block unknown origins
    console.warn('❌ CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Input sanitization - Apply after body parsing
app.use(sanitizeInput);

// CSRF Protection - Apply after sanitization, but skip for API endpoints in development
app.use((req, res, next) => {
  // Skip CSRF for API endpoints in development
  if (process.env.NODE_ENV === 'development' && req.path.startsWith('/api/')) {
    return next();
  }
  return csrfMiddleware(req, res, next);
});

// Rate limiting - Different limits for different endpoints and roles
const createRoleBasedLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max: (req, res) => {
      // Check user role from token (simplified)
      const token = req.headers.authorization?.replace('Bearer ', '');
      // In real implementation, decode token and check role
      const isAdmin = req.path.includes('/admin') && token; // Simplified check
      return isAdmin ? max * 2 : max; // Admins get higher limits
    },
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

app.use('/api/auth', createRoleBasedLimiter(15 * 60 * 1000, 10, 'Too many auth attempts'));
app.use('/api/admin', createRoleBasedLimiter(15 * 60 * 1000, 100, 'Too many admin requests'));
app.use('/api/', createRoleBasedLimiter(15 * 60 * 1000, 1000, 'Too many API requests'));

// Static files - serve pages from new structure
// Add cache control for JavaScript files to prevent caching issues
app.use('/shared', (req, res, next) => {
  if (req.path.endsWith('.js')) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
}, express.static('pages/shared'));

app.use((req, res, next) => {
  if (req.path.endsWith('.js')) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
}, express.static('pages'));

// Serve essential files from shared assets
app.get('/favicon.ico', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'shared', 'assets', 'favicon.ico'));
});

app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'shared', 'assets', 'manifest.json'));
});

app.get('/sw.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'shared', 'assets', 'sw.js'));
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const { data, error } = await supabaseAdmin.from('clubs').select('count').limit(1);
    if (error) throw error;

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: '2.0.0-supabase'
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// Debug endpoint to check users table
app.get('/debug/users', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('users').select('id, email, name, email_verified').limit(10);
    if (error) throw error;

    res.json({
      users: data,
      count: data.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API versioning - Add v1 prefix to routes
const apiVersion = '/api/v1';

// Supabase configuration endpoint for frontend
app.get('/api/config/supabase', (req, res) => {
  res.json({
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY
  });
});

// API Routes
app.use(`${apiVersion}/auth`, authRoutes);
app.use('/api/auth', authRoutes); // Compatibility route for frontend
app.use(`${apiVersion}/clubs`, clubsRoutes);
app.use(`${apiVersion}/events`, eventsRoutes);
app.use(`${apiVersion}/payments`, paymentsRoutes);
app.use(`${apiVersion}/membership`, membershipRoutes);
app.use(`${apiVersion}/leadership`, leadershipRoutes);
app.use(`${apiVersion}/projects`, projectsRoutes);
app.use(`${apiVersion}/ideas`, ideasRoutes);
app.use(`${apiVersion}/resources`, resourcesRoutes);
app.use(`${apiVersion}/opportunities`, opportunitiesRoutes);
app.use(`${apiVersion}/support`, supportRoutes);
app.use(`${apiVersion}/content`, contentRoutes);
app.use(`${apiVersion}/email`, emailServiceRoutes);
app.use(`${apiVersion}/payment-service`, paymentServiceRoutes);
app.use(`${apiVersion}/feedback`, feedbackRoutes);
app.use(`${apiVersion}/notifications`, notificationsRoutes);
app.use(`${apiVersion}/meetings`, meetingsRoutes);
app.use(`${apiVersion}/voting`, votingRoutes);
app.use(`${apiVersion}/communication`, communicationRoutes);
app.use(`${apiVersion}/analytics`, analyticsRoutes);
app.use(`${apiVersion}/stats`, statsRoutes);
app.use(`${apiVersion}/testimonials`, testimonialsRoutes);
app.use(`${apiVersion}/admin`, adminRoutes);

// Compatibility redirect for stats
app.get('/api/stats', (req, res) => res.redirect(`${apiVersion}/stats`));

// Serve HTML pages from new structure
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'home', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'dashboard', 'dashboard.html'));
});

app.get('/events', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'events', 'events.html'));
});

app.get('/projects', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'projects', 'projects.html'));
});

app.get('/ideas', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'ideas', 'ideas.html'));
});


app.get('/payment', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'payment', 'payment.html'));
});

app.get('/resources', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'resources', 'resources.html'));
});

app.get('/opportunities', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'opportunities', 'opportunities.html'));
});

app.get('/analytics', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'analytics', 'analytics.html'));
});

app.get('/support', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'support', 'support.html'));
});

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'settings', 'settings.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'admin', 'admin.html'));
});

app.get('/complete-registration', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'complete-registration', 'complete-registration.html'));
});



app.get('/verify-email', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'verify-email', 'verify-email.html'));
});

app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'reset-password', 'reset-password.html'));
});

app.get('/cms', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'cms', 'cms.html'));
});

app.get('/complete-profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'complete-profile', 'complete-profile.html'));
});

app.get('/leadership', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'leadership', 'leadership.html'));
});

app.get('/voting', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'voting', 'voting.html'));
});
app.get('/feedback', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'feedback', 'feedback.html'));
});



app.get('/terms', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'terms', 'terms.html'));
});

app.get('/privacy', (req, res) => {
  res.sendFile(path.join(__dirname, 'pages', 'privacy', 'privacy.html'));
});

// WebSocket stats endpoint
app.get('/api/websocket/stats', (req, res) => {
  res.json({
    websocket: wsService.getStats(),
    timestamp: new Date().toISOString()
  });
});

// API documentation endpoint
app.get(`${apiVersion}`, (req, res) => {
  res.json({
    name: 'JKUAT Clubs Platform API',
    version: '2.0.0-postgresql',
    description: 'Multi-club platform API with PostgreSQL + Supabase backend',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login user',
        'POST /api/auth/validate-student': 'Validate JKUAT student',
        'GET /api/auth/verify': 'Verify user session',
        'POST /api/auth/logout': 'Logout user',
        'GET /api/auth/profile': 'Get user profile',
        'PUT /api/auth/profile': 'Update user profile',
        'PUT /api/auth/academic': 'Update academic information',
        'GET /api/auth/preferences': 'Get notification preferences',
        'PUT /api/auth/preferences': 'Update notification preferences',
        'POST /api/auth/profile-picture': 'Upload profile picture',
        'GET /api/auth/activity': 'Get user activity log'
      },
      clubs: {
        'GET /api/clubs': 'Get all clubs',
        'GET /api/clubs/:id': 'Get club by ID',
        'POST /api/clubs/register': 'Register new club',
        'GET /api/clubs/:id/members': 'Get club members',
        'GET /api/clubs/:id/stats': 'Get club statistics'
      },
      events: {
        'GET /api/events': 'Get all events',
        'GET /api/events/:id': 'Get event by ID',
        'POST /api/events': 'Create new event',
        'POST /api/events/:id/register': 'Register for event',
        'GET /api/events/:id/attendees': 'Get event attendees'
      },
      payments: {
        'GET /api/payments': 'Get all payments',
        'POST /api/payments/mpesa/initiate': 'Initiate M-Pesa payment',
        'POST /api/payments/card/process': 'Process card payment',
        'GET /api/payments/:id/receipt': 'Get payment receipt'
      },
      leadership: {
        'GET /api/leadership/executive-committee': 'Get executive committee',
        'GET /api/leadership/patrons': 'Get club patrons',
        'GET /api/leadership/executive-committee/:id': 'Get single executive member',
        'POST /api/leadership/executive-committee': 'Add executive member (admin)',
        'PUT /api/leadership/executive-committee/:id': 'Update executive member (admin)',
        'DELETE /api/leadership/executive-committee/:id': 'Remove executive member (admin)',
        'POST /api/leadership/patrons': 'Add club patron (admin)',
        'GET /api/leadership/stats': 'Get leadership statistics'
      },
      ideas: {
        'GET /api/ideas': 'Get all ideas',
        'POST /api/ideas': 'Submit new idea',
        'POST /api/ideas/:id/vote': 'Vote on idea',
        'PUT /api/ideas/:id/status': 'Update idea status'
      },
      resources: {
        'GET /api/resources': 'Get all resources',
        'POST /api/resources': 'Upload new resource',
        'POST /api/resources/:id/download': 'Download resource',
        'GET /api/resources/search/:query': 'Search resources'
      },
      opportunities: {
        'GET /api/opportunities': 'Get all opportunities',
        'POST /api/opportunities': 'Post new opportunity',
        'GET /api/opportunities/search/:query': 'Search opportunities',
        'GET /api/opportunities/urgent/:clubId': 'Get urgent opportunities'
      },
      support: {
        'GET /api/support': 'Get all support tickets',
        'POST /api/support': 'Create new ticket',
        'PUT /api/support/:id/status': 'Update ticket status',
        'PUT /api/support/:id/assign': 'Assign ticket'
      },
      email: {
        'POST /api/email/registration-confirmation': 'Send event registration confirmation',
        'POST /api/email/send-reminders': 'Send event reminders',
        'POST /api/email/event-update': 'Send event update notifications'
      },
      websocket: {
        'WS /': 'WebSocket connection for real-time updates',
        'GET /api/websocket/stats': 'Get WebSocket connection statistics'
      }
    },
    database: 'PostgreSQL with Supabase',
    features: [
      'Multi-club architecture',
      'JKUAT portal integration',
      'Real-time messaging & WebSocket updates',
      'Payment processing (M-Pesa & Card)',
      'Event management with live updates',
      'Email notifications & reminders',
      'QR code attendance tracking',
      'Ideas hub with voting',
      'Resource sharing',
      'Opportunity board',
      'Support ticket system',
      'Comprehensive analytics'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  if (err.code === 'P2002') {
    return res.status(400).json({
      message: 'Duplicate entry. This record already exists.',
      field: err.meta?.target
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      message: 'Record not found'
    });
  }

  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ message: 'API endpoint not found' });
  } else if (req.path.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    // Don't redirect static assets, return 404
    res.status(404).send('File not found');
  } else {
    // Redirect to home page for unknown routes (HTML pages only)
    res.redirect('/');
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Graceful shutdown...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Graceful shutdown...');
  process.exit(0);
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 JKUAT Clubs Platform (Supabase) running on port ${PORT}`);
  console.log(`🔌 WebSocket server enabled for real-time updates`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`🏛️ Clubs: http://localhost:${PORT}/clubs`);
  console.log(`🏛️ Leadership: http://localhost:${PORT}/leadership`);
  console.log(`📅 Events: http://localhost:${PORT}/events`);
  console.log(`💡 Ideas Hub: http://localhost:${PORT}/dashboard#ideas`);
  console.log(`💳 Payments: http://localhost:${PORT}/payment`);
  console.log(`📚 Resources: http://localhost:${PORT}/resources`);
  console.log(`🎯 Opportunities: http://localhost:${PORT}/opportunities`);
  console.log(`🎧 Support: http://localhost:${PORT}/support`);
  console.log(`⚙️ Settings: http://localhost:${PORT}/settings`);
  console.log(`🔧 Admin: http://localhost:${PORT}/admin`);
  console.log(`📖 API Docs: http://localhost:${PORT}/api`);
  console.log(`❤️ Health: http://localhost:${PORT}/health`);
  console.log(`\n🎯 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗃️ Database: Supabase PostgreSQL`);
  console.log(`🔐 Auth: Supabase Auth + Direct SQL`);
  console.log(`📧 Email: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`);
  console.log(`💰 M-Pesa: ${process.env.MPESA_CONSUMER_KEY ? 'Configured' : 'Mock mode'}`);
});

module.exports = app;