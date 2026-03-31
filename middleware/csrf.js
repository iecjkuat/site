/**
 * CSRF Middleware — stub
 *
 * This app uses JWT in Authorization headers (not cookies).
 * Browsers cannot auto-send Authorization headers cross-origin,
 * so CSRF attacks do not apply. This file is kept as a no-op
 * to avoid breaking any existing imports.
 */

const csrfMiddleware = (req, res, next) => next();

module.exports = { csrfMiddleware };
