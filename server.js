'use strict';
require('dotenv').config();

const express = require('express');
const path    = require('path');
const helmet  = require('helmet');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Trust proxy (Vercel / load balancer) ─────────────────────────────────────
app.set('trust proxy', 1);

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:  ["'self'"],
      scriptSrc:   [
        "'self'",
        "'unsafe-inline'",                    // needed for inline scripts — mitigated by strict host allowlist
        'https://cdnjs.cloudflare.com',
        'https://cdn.jsdelivr.net',
      ],
      styleSrc:    [
        "'self'",
        "'unsafe-inline'",                    // needed for inline styles + Google Fonts
        'https://fonts.googleapis.com',
        'https://cdnjs.cloudflare.com',
        'https://cdn.jsdelivr.net',
      ],
      scriptSrcAttr: ["'unsafe-inline'"],     // needed for onclick/onsubmit attributes
      fontSrc:     ["'self'", 'https://fonts.gstatic.com', 'https://cdnjs.cloudflare.com'],
      imgSrc:      ["'self'", 'data:', 'https:'],
      connectSrc:  [
        "'self'",
        'https://*.supabase.co',
        'wss://*.supabase.co',
        'https://api.lipana.dev',
        'https://sandbox.lipana.dev',
      ],
      frameSrc:    ["'none'"],
      objectSrc:   ["'none'"],
      baseUri:     ["'self'"],
      formAction:  ["'self'"],
      upgradeInsecureRequests: [],            // force HTTPS for all sub-resources
    },
  },
  frameguard:     { action: 'deny' },
  hsts:           { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff:        true,
  xssFilter:      true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  // Remove X-Powered-By (fingerprinting)
  hidePoweredBy:  true,
  // Prevent IE from opening downloads in site context
  ieNoOpen:       true,
  // Disable DNS prefetching (minor privacy/security improvement)
  dnsPrefetchControl: { allow: false },
  // Permissions policy — disable features we don't use
  permittedCrossDomainPolicies: { permittedPolicies: 'none' },
}));

// ── CORS — only allow your own domain to call the API ────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Allow server-to-server (no origin) and explicitly listed origins
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    // In development allow localhost
    if (process.env.NODE_ENV !== 'production' && /^https?:\/\/localhost/.test(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  methods:      ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-File-Name'],
  credentials:  false,
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
// Skip body parsing for raw file uploads — they stream binary directly
app.use((req, res, next) => {
  if (req.path.startsWith('/api/v1/admin/upload/')) return next();
  express.json({ limit: '50kb' })(req, res, next);
});
app.use((req, res, next) => {
  if (req.path.startsWith('/api/v1/admin/upload/')) return next();
  express.urlencoded({ extended: false, limit: '50kb' })(req, res, next);
});

// ── Static assets ─────────────────────────────────────────────────────────────
const root = __dirname;
// ── Admin config endpoint — serves Supabase public config to admin pages ──────
// This replaces the file injection approach which is unreliable on Vercel.
// The anon key is safe to expose (it's public by design — RLS protects the data).
app.get('/api/v1/admin/config', (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json({
        supabaseUrl:     process.env.SUPABASE_URL     || '',
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    });
});

// ── Admin static files — served directly, no injection needed ─────────────────
app.use('/iec-admin', express.static(path.join(root, 'pages', 'iec-admin'), { maxAge: '0', etag: true }));

// JS and CSS: no-cache (revalidate every request, use 304 if unchanged)
// This means users always get fresh content without needing a hard refresh
const jsOptions  = { maxAge: '0', etag: true, lastModified: true };
const imgOptions = { maxAge: '7d', etag: true };  // images rarely change

app.use('/shared',   express.static(path.join(root, 'shared'),            jsOptions));
app.use('/assets',   express.static(path.join(root, 'shared', 'assets'),  imgOptions));
app.use('/blog',     express.static(path.join(root, 'pages', 'blog'),     jsOptions));
app.use('/events',   express.static(path.join(root, 'pages', 'events'),   jsOptions));
app.use('/projects', express.static(path.join(root, 'pages', 'projects'), jsOptions));
app.use('/about',    express.static(path.join(root, 'pages', 'about'),    jsOptions));
app.use(express.static(path.join(root, 'public'), imgOptions));

// ── Health check ──────────────────────────────────────────────────────────────
// Defined after static middleware but before page routes so it doesn't
// interfere with the route tree. GET only.
app.get('/health', (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  res.json({ status: 'ok' });
});

// ── Retry-After middleware ────────────────────────────────────────────────────
// Automatically adds Retry-After: 60 to any 429 response so clients and
// crawlers know when to back off.
app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    if (res.statusCode === 429) {
      res.set('Retry-After', '60');
    }
    return originalJson(body);
  };
  next();
});

// ── Page routes ───────────────────────────────────────────────────────────────
const { pages } = require('./config/routes');
pages(app);

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/v1/membership', require('./api/membership'));
app.use('/api/v1/content',    require('./api/content'));
app.use('/api/v1/admin',      require('./api/admin'));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API route not found' });
  }
  res.status(404).send(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>404 - Not Found</title>
<style>body{font-family:Arial;background:#0f172a;color:#fff;text-align:center;padding:80px}a{color:#10b981}</style>
</head>
<body><h1>404 - Page Not Found</h1><p>The page you are looking for does not exist.</p><a href="/">Go Home</a></body>
</html>`);
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  // CORS errors
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ── Start (local dev only) ────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
}

module.exports = app;
