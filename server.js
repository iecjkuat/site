const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
require('dotenv').config();

// Import Supabase client
const { supabase } = require('./lib/supabase');

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
const messagesRoutes = require('./routes/messages');
const resourcesRoutes = require('./routes/resources');
const opportunitiesRoutes = require('./routes/opportunities');
const supportRoutes = require('./routes/support');
const contentRoutes = require('./routes/content');
const emailServiceRoutes = require('./routes/email-service');
const paymentServiceRoutes = require('./routes/payment-service');
const feedbackRoutes = require('./routes/feedback');
const notificationsRoutes = require('./routes/notifications');
const meetingsRoutes = require('./routes/meetings');
const electionsRoutes = require('./routes/elections');
const governanceRoutes = require('./routes/governance');
const financialRoutes = require('./routes/financial');
const communicationRoutes = require('./routes/communication');
const analyticsRoutes = require('./routes/analytics');
const statsRoutes = require('./routes/stats');
const testimonialsRoutes = require('./routes/testimonials');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize WebSocket service
const wsService = new WebSocketService(server);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static('public'));

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const { data, error } = await supabase.from('clubs').select('count').limit(1);
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/clubs', clubsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/membership', membershipRoutes);
app.use('/api/leadership', leadershipRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/ideas', ideasRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/email', emailServiceRoutes);
app.use('/api/payments', paymentServiceRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/meetings', meetingsRoutes);
app.use('/api/elections', electionsRoutes);
app.use('/api/governance', governanceRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/testimonials', testimonialsRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/events', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'events.html'));
});

app.get('/leadership', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'leadership.html'));
});

app.get('/projects', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'projects.html'));
});

app.get('/clubs', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'clubs.html'));
});

app.get('/ideas', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'ideas.html'));
});

app.get('/governance', (req, res) => {
  console.log('📋 Governance route accessed');
  console.log('📁 Serving file:', path.join(__dirname, 'public', 'governance.html'));
  res.sendFile(path.join(__dirname, 'public', 'governance.html'));
});

app.get('/financial', (req, res) => {
  console.log('💰 Financial route accessed');
  console.log('📁 Serving file:', path.join(__dirname, 'public', 'financial.html'));
  res.sendFile(path.join(__dirname, 'public', 'financial.html'));
});

app.get('/messages', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'messages.html'));
});

app.get('/payment', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'payment.html'));
});

app.get('/resources', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'resources.html'));
});

app.get('/opportunities', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'opportunities.html'));
});

app.get('/analytics', (req, res) => {
  console.log('📊 Analytics route accessed');
  console.log('📁 Serving file:', path.join(__dirname, 'public', 'analytics.html'));
  res.sendFile(path.join(__dirname, 'public', 'analytics.html'));
});

app.get('/support', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'support.html'));
});

app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/database', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'database.html'));
});

app.get('/debug', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'debug.html'));
});

app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

app.get('/test-routes', (req, res) => {
  console.log('🧪 Test routes page accessed');
  res.sendFile(path.join(__dirname, 'public', 'test-routes.html'));
});

app.get('/test-governance', (req, res) => {
  console.log('🧪 Governance test page accessed');
  res.sendFile(path.join(__dirname, 'public', 'test-governance.html'));
});

app.get('/verify-email', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'verify-email.html'));
});

app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reset-password.html'));
});

app.get('/cms', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'cms.html'));
});

app.get('/complete-profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'complete-profile.html'));
});

app.get('/debug-modal', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'debug-modal.html'));
});

app.get('/simple-test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'simple-test.html'));
});

app.get('/test-auth', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test-auth.html'));
});

// WebSocket stats endpoint
app.get('/api/websocket/stats', (req, res) => {
  res.json({
    websocket: wsService.getStats(),
    timestamp: new Date().toISOString()
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
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
      messages: {
        'GET /api/messages/inbox/:userId': 'Get user inbox',
        'GET /api/messages/sent/:userId': 'Get sent messages',
        'POST /api/messages': 'Send new message',
        'PUT /api/messages/:id/read': 'Mark message as read'
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
  } else {
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
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
  console.log(`📅 Events: http://localhost:${PORT}/events`);
  console.log(`💡 Ideas Hub: http://localhost:${PORT}/dashboard#ideas`);
  console.log(`💬 Messages: http://localhost:${PORT}/messages`);
  console.log(`💳 Payments: http://localhost:${PORT}/payment`);
  console.log(`📚 Resources: http://localhost:${PORT}/resources`);
  console.log(`🎯 Opportunities: http://localhost:${PORT}/opportunities`);
  console.log(`🎧 Support: http://localhost:${PORT}/support`);
  console.log(`⚙️ Settings: http://localhost:${PORT}/settings`);
  console.log(`🔧 Admin: http://localhost:${PORT}/admin`);
  console.log(`🗄️ Database: http://localhost:${PORT}/database`);
  console.log(`📖 API Docs: http://localhost:${PORT}/api`);
  console.log(`❤️ Health: http://localhost:${PORT}/health`);
  console.log(`\n🎯 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗃️ Database: Supabase PostgreSQL`);
  console.log(`🔐 Auth: Supabase Auth + Direct SQL`);
  console.log(`📧 Email: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured'}`);
  console.log(`💰 M-Pesa: ${process.env.MPESA_CONSUMER_KEY ? 'Configured' : 'Mock mode'}`);
});

module.exports = app;