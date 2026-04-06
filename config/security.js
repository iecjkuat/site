'use strict';
/**
 * Security middleware configuration
 * Helmet CSP, CORS, body limits, headers
 */

const helmet = require('helmet');
const cors = require('cors');

const connectSrc = ["'self'", "https://*.supabase.co", "wss://*.supabase.co"];
if (process.env.SUPABASE_URL) connectSrc.push(process.env.SUPABASE_URL);

const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      scriptSrc:  ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
      fontSrc:    ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc:     ["'self'", "data:", "https:"],
      connectSrc,
      objectSrc:  ["'none'"],
      baseUri:    ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      mediaSrc:   ["'self'"],
      frameSrc:   ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: process.env.NODE_ENV === 'production'
    ? { maxAge: 31536000, includeSubDomains: true, preload: true }
    : false
});

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean)
  : ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5000'];

const corsConfig = cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) return callback(null, true);
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    console.warn('CORS blocked:', origin);
    return callback(new Error('Origin not allowed'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400
});

// Security response headers
const securityHeaders = (req, res, next) => {
  res.removeHeader('X-Powered-By');
  res.setHeader('X-Request-ID', require('crypto').randomUUID());
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store');
  }
  next();
};

module.exports = { helmetConfig, corsConfig, securityHeaders };
