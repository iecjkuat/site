/**
 * CSRF Protection Middleware
 * JKUAT Innovation Club
 */

const crypto = require('crypto');

class CSRFProtection {
    constructor() {
        this.tokens = new Map();
        this.tokenExpiry = 60 * 60 * 1000; // 1 hour
    }

    generateToken() {
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = Date.now() + this.tokenExpiry;
        this.tokens.set(token, expiry);
        
        // Clean up expired tokens
        this.cleanupExpiredTokens();
        
        return token;
    }

    validateToken(token) {
        if (!token || !this.tokens.has(token)) {
            return false;
        }

        const expiry = this.tokens.get(token);
        if (Date.now() > expiry) {
            this.tokens.delete(token);
            return false;
        }

        // Token is valid, remove it (one-time use)
        this.tokens.delete(token);
        return true;
    }

    cleanupExpiredTokens() {
        const now = Date.now();
        for (const [token, expiry] of this.tokens.entries()) {
            if (now > expiry) {
                this.tokens.delete(token);
            }
        }
    }

    middleware() {
        return (req, res, next) => {
            // Generate CSRF token for GET requests
            if (req.method === 'GET') {
                req.csrfToken = this.generateToken();
                res.locals.csrfToken = req.csrfToken;
                return next();
            }

            // Validate CSRF token for state-changing requests
            if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
                const token = req.body._csrf || req.headers['x-csrf-token'];
                
                if (!this.validateToken(token)) {
                    return res.status(403).json({
                        error: 'Invalid CSRF token',
                        code: 'CSRF_TOKEN_INVALID'
                    });
                }
            }

            next();
        };
    }
}

const csrfProtection = new CSRFProtection();

module.exports = {
    CSRFProtection,
    csrfMiddleware: csrfProtection.middleware()
};