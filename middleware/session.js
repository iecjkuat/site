const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { supabaseAdmin } = require('../lib/supabase');

/**
 * Secure Session Middleware Configuration
 * - httpOnly: true (prevents XSS access)
 * - secure: true in prod (HTTPS only)
 * - sameSite: 'strict'/'lax' (CSRF protection)
 * Replaces localStorage authToken entirely
 */

const sessionConfig = {
  store: new pgSession({
    pool: {
      // Use Supabase connection pool (create session DB table first)
      getConnection: async (cb) => {
        const { data: client, error } = await supabaseAdmin.rpc('get_pg_client');
        if (error) return cb(error);
        cb(null, client);
      }
    },
    tableName: 'user_sessions',
    createTableIfMissing: true
  }),
  name: 'jkuat.sid', // Avoid default 'connect.sid'
  secret: process.env.SESSION_SECRET || 'fallback-dev-secret-change-in-prod',
  resave: false,
  saveUninitialized: false,
  rolling: true, // Extend expiry on activity
  cookie: {
    httpOnly: true, // Critical: Prevents JS access (XSS safe)
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24h, rolling extends
  }
};

module.exports = {
  sessionConfig,
  sessionMiddleware: session(sessionConfig)
};
