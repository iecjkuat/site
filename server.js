'use strict';
require('dotenv').config();

const express    = require('express');
const path       = require('path');
const http       = require('http');
const { supabaseAdmin } = require('./lib/supabase');

// Config modules
const { helmetConfig, corsConfig, securityHeaders } = require('./config/security');
const limits = require('./config/rate-limit');
const { pages } = require('./config/routes');

// Middleware
const { sanitizeInput } = require('./middleware/validation');

// Routes
const authRoutes              = require('./routes/auth');
const clubsRoutes             = require('./routes/clubs');
const eventsRoutes            = require('./routes/events');
const eventRegistrationRoutes = require('./routes/event-registration');
const paymentsRoutes          = require('./routes/payments');
const membershipRoutes        = require('./routes/membership');
const leadershipRoutes        = require('./routes/leadership');
const projectsRoutes          = require('./routes/projects');
const ideasRoutes             = require('./routes/ideas');
const resourcesRoutes         = require('./routes/resources');
const opportunitiesRoutes     = require('./routes/opportunities');
const supportRoutes           = require('./routes/support');
const contentRoutes           = require('./routes/content');
const emailServiceRoutes      = require('./routes/email-service');
const paymentServiceRoutes    = require('./routes/payment-service');
const paymentLipanaRoutes     = require('./routes/payment-lipana');
const feedbackRoutes          = require('./routes/feedback');
const feedbackSimpleRoutes    = require('./routes/feedback-simple');
const notificationsRoutes     = require('./routes/notifications');
const meetingsRoutes          = require('./routes/meetings');
const votingRoutes            = require('./routes/voting');
const communicationRoutes     = require('./routes/communication');
const statsRoutes             = require('./routes/stats');
const testimonialsRoutes      = require('./routes/testimonials');
const activityFeedRoutes      = require('./routes/activity-feed');
const adminRoutes             = require('./routes/admin');
const adminNotificationsRoutes = require('./routes/admin-notifications');
const uploadRoutes            = require('./routes/upload');
const dashboardRoutes         = require('./routes/dashboard');

// ── App setup ─────────────────────────────────────────────────────────────────

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 3000;
const V1     = '/api/v1';

// Trust Vercel/proxy for accurate req.ip (required for rate limiting)
app.set('trust proxy', 1);

// WebSocket (disabled on Vercel serverless)
let wsService = null;
if (!process.env.VERCEL) {
  const WebSocketService = require('./routes/websocket-service');
  wsService = new WebSocketService(server);
}

// ── Security ──────────────────────────────────────────────────────────────────

app.use(helmetConfig);
app.use(corsConfig);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(securityHeaders);
app.use(sanitizeInput);

// ── Rate limiting ─────────────────────────────────────────────────────────────

app.use(`${V1}/auth/login`,               limits.authLogin);
app.use(`${V1}/auth/register`,            limits.authRegister);
app.use(`${V1}/auth/resend-verification`, limits.authResend);
app.use(`${V1}/email`,                    limits.email);
app.use(`${V1}/admin`,                    limits.admin);
app.use(`${V1}/payment-lipana/initiate`,  limits.payment);
app.use(V1,                               limits.general);

// ── Static assets ─────────────────────────────────────────────────────────────

// Trailing slash normalisation
app.use((req, res, next) => {
  if (req.path.length > 1 && req.path.endsWith('/') && !req.path.startsWith('/api/')) {
    return res.redirect(301, req.path.slice(0, -1));
  }
  next();
});

app.use('/shared', express.static('shared'));
app.use('/shared', express.static('pages/shared'));

const staticOpts = {
  setHeaders(res, fp) {
    if (fp.endsWith('.js'))  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    if (fp.endsWith('.css')) res.setHeader('Content-Type', 'text/css; charset=utf-8');
  },
  redirect: false,
  index: false
};

app.use('/cms',   express.static(path.join(__dirname, 'pages', 'cms'),   staticOpts));
app.use('/pages', express.static(path.join(__dirname, 'pages'),           staticOpts));

// Block direct .html access; serve other assets
app.use((req, res, next) => {
  if (req.path.endsWith('.html')) return res.status(404).send('Use clean URLs');
  if (/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot)$/.test(req.path)) {
    return express.static('pages')(req, res, next);
  }
  next();
});

// Essential files
app.get('/favicon.ico', (_, res) => res.sendFile(path.join(__dirname, 'pages/shared/assets/favicon.ico')));
app.get('/sitemap.xml', (_, res) => { res.setHeader('Content-Type', 'application/xml'); res.sendFile(path.join(__dirname, 'public/sitemap.xml')); });
app.get('/robots.txt',  (_, res) => { res.setHeader('Content-Type', 'text/plain');      res.sendFile(path.join(__dirname, 'public/robots.txt')); });
app.get('/manifest.json', (_, res) => res.sendFile(path.join(__dirname, 'pages/shared/assets/manifest.json')));
app.get('/sw.js',         (_, res) => res.sendFile(path.join(__dirname, 'pages/shared/assets/sw.js')));

// ── System endpoints ──────────────────────────────────────────────────────────

app.get('/health', async (_, res) => {
  try {
    const { error } = await supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).limit(1);
    if (error) throw error;
    res.json({ status: 'healthy', timestamp: new Date().toISOString(), database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'unhealthy', timestamp: new Date().toISOString(), error: err.message });
  }
});

app.get('/api/config/supabase', (_, res) => res.json({ url: process.env.SUPABASE_URL }));

if (process.env.NODE_ENV !== 'production') {
  app.get('/debug/users', async (_, res) => {
    try {
      const { data, error } = await supabaseAdmin.from('users').select('id, email, name, email_verified').limit(10);
      if (error) throw error;
      res.json({ users: data, count: data.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get('/api/websocket/stats', (_, res) => {
    res.json(wsService ? wsService.getStats() : { error: 'WebSocket not running' });
  });
}

// ── API routes (versioned only — no duplicates) ───────────────────────────────

app.use(`${V1}/auth`,               authRoutes);
app.use(`${V1}/clubs`,              clubsRoutes);
app.use(`${V1}/events`,             eventsRoutes);
app.use(`${V1}/events`,             eventRegistrationRoutes);
app.use(`${V1}/payments`,           paymentsRoutes);
app.use(`${V1}/membership`,         membershipRoutes);
app.use(`${V1}/leadership`,         leadershipRoutes);
app.use(`${V1}/projects`,           projectsRoutes);
app.use(`${V1}/ideas`,              ideasRoutes);
app.use(`${V1}/resources`,          resourcesRoutes);
app.use(`${V1}/opportunities`,      opportunitiesRoutes);
app.use(`${V1}/support`,            supportRoutes);
app.use(`${V1}/content`,            contentRoutes);
app.use(`${V1}/email`,              emailServiceRoutes);
app.use(`${V1}/payment-service`,    paymentServiceRoutes);
app.use(`${V1}/payment-lipana`,     paymentLipanaRoutes);
app.use(`${V1}/feedback`,           feedbackRoutes);
app.use(`${V1}/feedback-simple`,    feedbackSimpleRoutes);
app.use(`${V1}/notifications`,      notificationsRoutes);
app.use(`${V1}/meetings`,           meetingsRoutes);
app.use(`${V1}/voting`,             votingRoutes);
app.use(`${V1}/communication`,      communicationRoutes);
app.use(`${V1}/stats`,              statsRoutes);
app.use(`${V1}/testimonials`,       testimonialsRoutes);
app.use(`${V1}/activity-feed`,      activityFeedRoutes);
app.use(`${V1}/admin`,              adminRoutes);
app.use(`${V1}/admin/notifications`, adminNotificationsRoutes);
app.use(`${V1}/upload`,             express.json({ limit: '15mb' }), uploadRoutes);
app.use(`${V1}/dashboard`,          dashboardRoutes);

// Compatibility shims — redirect old paths to versioned ones
app.use('/api/auth',               (req, res) => res.redirect(307, req.url.replace('/api/auth', `${V1}/auth`)));
app.use('/api/payment-lipana',     (req, res) => res.redirect(307, req.url.replace('/api/payment-lipana', `${V1}/payment-lipana`)));
app.use('/api/admin/notifications',(req, res) => res.redirect(307, req.url.replace('/api/admin/notifications', `${V1}/admin/notifications`)));
app.use('/api/dashboard',          (req, res) => res.redirect(307, req.url.replace('/api/dashboard', `${V1}/dashboard`)));

// ── Page routes ───────────────────────────────────────────────────────────────

pages(app);

// ── Error handling ────────────────────────────────────────────────────────────

app.use((err, req, res, _next) => {
  console.error('Unhandled error:', { message: err.message, code: err.code, path: req.path });
  if (err.message === 'Origin not allowed') return res.status(403).json({ error: 'Origin not allowed' });
  if (err.type === 'entity.too.large')      return res.status(413).json({ error: 'Request payload too large' });
  if (err.type === 'entity.parse.failed')   return res.status(400).json({ error: 'Invalid JSON' });
  const isProd = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({ error: isProd ? 'An unexpected error occurred' : err.message });
});

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found', path: req.path });
  }
  res.status(404).sendFile(path.join(__dirname, 'pages/home/index.html'));
});

// ── Startup ───────────────────────────────────────────────────────────────────

if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  const shutdown = async (signal) => {
    console.log(`${signal} received — shutting down`);
    await new Promise(r => server.close(r));
    if (wsService?.close) await wsService.close();
    process.exit(0);
  };
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

module.exports = app;
