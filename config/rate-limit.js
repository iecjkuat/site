'use strict';
/**
 * Rate limiting configuration
 * All limiters in one place — easy to swap for Redis later
 */

const rateLimit = require('express-rate-limit');

const isProd = process.env.NODE_ENV === 'production';

const createLimiter = (windowMs, max, message) => rateLimit({
  windowMs,
  max,
  message: { error: message, retryAfter: Math.ceil(windowMs / 1000) },
  standardHeaders: true,
  legacyHeaders: false,
  // req.ip is reliable because we set app.set('trust proxy', 1)
  keyGenerator: (req) => req.ip || 'unknown',
  skip: (req) => req.path === '/health'
});

module.exports = {
  authLogin:    createLimiter(15 * 60 * 1000, isProd ? 5   : 50,   'Too many login attempts. Try again in 15 minutes.'),
  authRegister: createLimiter(60 * 60 * 1000, isProd ? 3   : 20,   'Too many registration attempts. Try again in 1 hour.'),
  authResend:   createLimiter(60 * 60 * 1000, isProd ? 3   : 10,   'Too many resend attempts. Try again in 1 hour.'),
  email:        createLimiter(60 * 60 * 1000, isProd ? 10  : 100,  'Too many email requests. Try again in 1 hour.'),
  admin:        createLimiter(15 * 60 * 1000, isProd ? 100 : 500,  'Too many admin requests.'),
  payment:      createLimiter(60 * 60 * 1000, isProd ? 10  : 50,   'Too many payment attempts.'),
  general:      createLimiter(15 * 60 * 1000, isProd ? 300 : 5000, 'Too many requests. Please slow down.')
};
