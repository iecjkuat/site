const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../lib/supabase');
const { sendError } = require('../lib/api-response');

// Simple in-memory cache for user profiles
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// In-memory token revocation store
const tokenBlacklist = new Map();
const TOKEN_BLACKLIST_TTL = 24 * 60 * 60 * 1000; // 24 hours

const pruneExpiredBlacklistedTokens = () => {
    const now = Date.now();

    for (const [tokenId, expiresAt] of tokenBlacklist.entries()) {
        if (!expiresAt || expiresAt <= now) {
            tokenBlacklist.delete(tokenId);
        }
    }
};

const blacklistToken = (tokenId, expiresAt) => {
    if (!tokenId) {
        return;
    }

    pruneExpiredBlacklistedTokens();
    tokenBlacklist.set(tokenId, expiresAt || (Date.now() + TOKEN_BLACKLIST_TTL));
};

const isTokenBlacklisted = (tokenId) => {
    if (!tokenId) {
        return false;
    }

    pruneExpiredBlacklistedTokens();
    const expiresAt = tokenBlacklist.get(tokenId);

    if (!expiresAt) {
        return false;
    }

    if (expiresAt <= Date.now()) {
        tokenBlacklist.delete(tokenId);
        return false;
    }

    return true;
};

const clearUserCache = (userId) => {
    if (!userId) {
        return;
    }

    userCache.delete(userId);
};

const clearAllCache = () => {
    userCache.clear();
    pruneExpiredBlacklistedTokens();
};

const buildFingerprint = (req) => {
    return crypto
        .createHash('sha256')
        .update(`${req.headers['user-agent'] || ''}:${req.ip || ''}`)
        .digest('hex')
        .slice(0, 16);
};

const generateSecureToken = (userId, userRole, options = {}, req = null) => {
    const payload = {
        userId,
        role: userRole,
        iss: 'jkuat-innovation-club',
        aud: 'jkuat-platform',
        jti: crypto.randomUUID()
    };

    if (req) {
        payload.fp = buildFingerprint(req);
    }

    return jwt.sign(payload, process.env.JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: options.expiresIn || '24h'
    });
};

const getBearerToken = (req) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || typeof authHeader !== 'string') {
        return null;
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return null;
    }

    return token;
};

const getCachedUser = (userId) => {
    const cached = userCache.get(userId);

    if (!cached) {
        return null;
    }

    if ((Date.now() - cached.timestamp) >= CACHE_TTL) {
        userCache.delete(userId);
        return null;
    }

    return cached.user;
};

const setCachedUser = (userId, user) => {
    userCache.set(userId, {
        user,
        timestamp: Date.now()
    });
};

const authenticateToken = async (req, res, next) => {
    try {
        const token = getBearerToken(req);

        if (!token) {
            return sendError(req, res, { status: 401, message: 'Authentication required' });
        }

        if (typeof token !== 'string' || token.split('.').length !== 3) {
            return sendError(req, res, { status: 403, message: 'Invalid authentication token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256'],
            issuer: 'jkuat-innovation-club',
            audience: 'jkuat-platform'
        });

        if (!decoded.userId || !decoded.jti) {
            return sendError(req, res, { status: 401, message: 'Invalid authentication token' });
        }

        if (decoded.fp && decoded.fp !== buildFingerprint(req)) {
            return sendError(req, res, { status: 401, message: 'Session invalid. Please log in again.' });
        }

        if (isTokenBlacklisted(decoded.jti)) {
            return sendError(req, res, { status: 401, message: 'Token has been revoked' });
        }

        let user = getCachedUser(decoded.userId);

        if (!user) {
            const { data, error } = await supabaseAdmin
                .from('users')
                .select('id, name, email, role, membership_status, email_verified, created_at, updated_at, last_password_change')
                .eq('id', decoded.userId)
                .single();

            if (error || !data) {
                return sendError(req, res, { status: 401, message: 'Invalid authentication token' });
            }

            user = data;
            setCachedUser(decoded.userId, user);
        }

        if (user.membership_status === 'inactive' || user.membership_status === 'suspended') {
            clearUserCache(decoded.userId);
            return sendError(req, res, { status: 401, message: 'Account inactive or suspended' });
        }

        if (user.last_password_change) {
            const passwordChangedAt = new Date(user.last_password_change).getTime();
            if (decoded.iat && (decoded.iat * 1000) < passwordChangedAt) {
                return sendError(req, res, { status: 401, message: 'Session expired. Please log in again.' });
            }
        }

        req.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || decoded.role || 'member',
            membership_status: user.membership_status,
            email_verified: user.email_verified,
            created_at: user.created_at,
            updated_at: user.updated_at,
            last_password_change: user.last_password_change
        };

        req.auth = {
            token,
            tokenId: decoded.jti,
            issuedAt: decoded.iat ? decoded.iat * 1000 : null,
            expiresAt: decoded.exp ? decoded.exp * 1000 : null
        };

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return sendError(req, res, { status: 401, message: 'Session expired. Please log in again.' });
        }

        if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
            return sendError(req, res, { status: 403, message: 'Invalid authentication token' });
        }

        return sendError(req, res, { status: 503, message: 'Authentication service temporarily unavailable' });
    }
};

const requireRole = (roles) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    return (req, res, next) => {
        if (!req.user) {
            return sendError(req, res, { status: 401, message: 'Authentication required' });
        }

        const userRole = req.user.role || 'member';

        if (!allowedRoles.includes(userRole)) {
            return sendError(req, res, { status: 403, message: 'Access denied. Insufficient permissions.' });
        }

        next();
    };
};

const requireAdmin = (req, res, next) => requireRole(['admin'])(req, res, next);

const requireExecutive = (req, res, next) => requireRole(['admin', 'executive'])(req, res, next);

const canActOnBehalf = (req, allowedRoles = ['admin', 'treasurer']) => {
    if (!req.user) {
        return false;
    }

    return allowedRoles.includes(req.user.role);
};

const resolveActingUserId = (req, options = {}) => {
    const {
        allowActingOnBehalf = false,
        allowedRoles = ['admin', 'treasurer'],
        explicitUserIdFields = ['userId', 'targetUserId', 'memberId']
    } = options;

    if (!req.user || !req.user.id) {
        const error = new Error('Authentication required');
        error.status = 401;
        throw error;
    }

    let requestedUserId = null;

    for (const field of explicitUserIdFields) {
        if (req.body && req.body[field]) {
            requestedUserId = req.body[field];
            break;
        }

        if (req.query && req.query[field]) {
            requestedUserId = req.query[field];
            break;
        }

        if (req.params && req.params[field]) {
            requestedUserId = req.params[field];
            break;
        }
    }

    if (!requestedUserId || requestedUserId === req.user.id) {
        return req.user.id;
    }

    if (!allowActingOnBehalf) {
        const error = new Error('Authenticated users may only act on their own account');
        error.status = 403;
        throw error;
    }

    if (!canActOnBehalf(req, allowedRoles)) {
        const error = new Error('Access denied. Acting on behalf of another user is not permitted.');
        error.status = 403;
        throw error;
    }

    return requestedUserId;
};

module.exports = {
    authenticateToken,
    requireRole,
    requireAdmin,
    requireExecutive,
    generateSecureToken,
    clearUserCache,
    clearAllCache,
    blacklistToken,
    isTokenBlacklisted,
    canActOnBehalf,
    resolveActingUserId
};