const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../lib/supabase');

// Simple in-memory cache for user profiles
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Rate limiting for authentication attempts
const authAttempts = new Map();
const MAX_AUTH_ATTEMPTS = 10;
const AUTH_WINDOW = 60 * 1000;

// Sweep stale entries every 5 minutes to prevent memory leak (#44)
setInterval(() => {
    const now = Date.now();
    for (const [key, timestamps] of authAttempts.entries()) {
        const recent = timestamps.filter(t => now - t < AUTH_WINDOW);
        if (recent.length === 0) authAttempts.delete(key);
        else authAttempts.set(key, recent);
    }
}, 5 * 60 * 1000);

// Token blacklist for logout (in production, use Redis)
const tokenBlacklist = new Set();

// Function to check rate limit
const checkRateLimit = (identifier) => {
    const now = Date.now();
    const attempts = authAttempts.get(identifier) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(timestamp => now - timestamp < AUTH_WINDOW);
    
    if (recentAttempts.length >= MAX_AUTH_ATTEMPTS) {
        return false; // Rate limit exceeded
    }
    
    // Add current attempt
    recentAttempts.push(now);
    authAttempts.set(identifier, recentAttempts);
    
    return true; // Within rate limit
};

// Function to add token to blacklist
const blacklistToken = (tokenId) => {
    if (tokenId) {
        tokenBlacklist.add(tokenId);
        console.log(`Token blacklisted: ${tokenId.substring(0, 8)}...`);
    }
};

// Function to check if token is blacklisted
const isTokenBlacklisted = (tokenId) => {
    return tokenBlacklist.has(tokenId);
};

// Function to clear user cache (for logout, role changes, etc.)
const clearUserCache = (userId) => {
    if (userId) {
        userCache.delete(userId);
        console.log(`Cache cleared for user: ${userId.substring(0, 8)}...`);
    }
};

// Function to clear all cache (for security incidents)
const clearAllCache = () => {
    userCache.clear();
    console.log('All user cache cleared');
};

// Function to generate secure JWT token
const generateSecureToken = (userId, userRole, options = {}) => {
    const payload = {
        userId,
        role: userRole,
        iss: 'jkuat-innovation-club',
        aud: 'jkuat-platform',
        jti: require('crypto').randomUUID()
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: options.expiresIn || '24h'
    });
};

// Middleware to authenticate JWT tokens (backend-issued)
const authenticateToken = async (req, res, next) => {
    const requestId = require('crypto').randomUUID().substring(0, 8);
    const clientIp = req.ip || req.connection.remoteAddress;
    
    try {
        // Rate limiting check
        if (!checkRateLimit(clientIp)) {
            console.warn(`⚠️ [${requestId}] Rate limit exceeded for IP: ${clientIp}`);
            return res.status(429).json({ 
                message: 'Too many authentication attempts. Please try again later.' 
            });
        }

        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (process.env.NODE_ENV !== 'production') {
            console.log(`🔐 [${requestId}] Auth attempt:`, {
                hasAuthHeader: !!authHeader,
                hasToken: !!token,
                path: req.path,
                method: req.method,
                ip: clientIp
            });
        }

        if (!token) {
            console.log(`❌ [${requestId}] No token provided`);
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Validate token format (basic check before verification)
        if (typeof token !== 'string' || token.split('.').length !== 3) {
            console.warn(`⚠️ [${requestId}] Invalid token format`);
            return res.status(403).json({ message: 'Invalid authentication token' });
        }

        // Verify JWT token with proper options
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256'],
            maxAge: '24h', // Token expires in 24 hours
            issuer: 'jkuat-innovation-club',
            audience: 'jkuat-platform'
        });

        console.log(`✅ [${requestId}] Token verified for user ${decoded.userId.substring(0, 8)}...`);

        // Validate token structure
        if (!decoded.userId || !decoded.exp || !decoded.jti) {
            console.warn(`⚠️ [${requestId}] Invalid token structure`);
            return res.status(401).json({ message: 'Invalid authentication token' });
        }

        // Check if token is blacklisted (logout)
        if (isTokenBlacklisted(decoded.jti)) {
            console.warn(`⚠️ [${requestId}] Token is blacklisted (logged out)`);
            return res.status(401).json({ message: 'Token has been revoked' });
        }

        // Check cache first
        const now = Date.now();
        const cached = userCache.get(decoded.userId);

        if (cached && (now - cached.timestamp < CACHE_TTL)) {
            // Validate cached user is still active
            if (cached.user.membership_status === 'inactive') {
                userCache.delete(decoded.userId);
                return res.status(401).json({ message: 'Account inactive' });
            }
            
            // Check if token was issued before password change
            if (cached.user.last_password_change && 
                decoded.iat * 1000 < new Date(cached.user.last_password_change).getTime()) {
                console.warn(`⚠️ [${requestId}] Token issued before password change`);
                return res.status(401).json({ message: 'Session expired. Please log in again.' });
            }
            
            req.user = cached.user;
            req.requestId = requestId;
            return next();
        }

        // Get user from database with timeout
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database query timeout')), 30000)
        );
        
        const queryPromise = supabaseAdmin
            .from('users')
            .select('id, name, email, role, membership_status, email_verified, created_at, updated_at, last_password_change')
            .eq('id', decoded.userId)
            .single();

        const { data: user, error } = await Promise.race([queryPromise, timeoutPromise]);

        if (error || !user) {
            console.error(`❌ [${requestId}] User not found:`, error?.message);
            return res.status(401).json({ message: 'Invalid authentication token' });
        }

        // Check if user account is active
        if (user.membership_status === 'inactive' || user.membership_status === 'suspended') {
            console.warn(`⚠️ [${requestId}] Account inactive/suspended: ${user.id.substring(0, 8)}...`);
            return res.status(401).json({ message: 'Account inactive or suspended' });
        }

        // Check if token was issued before password change
        if (user.last_password_change && 
            decoded.iat * 1000 < new Date(user.last_password_change).getTime()) {
            console.warn(`⚠️ [${requestId}] Token issued before password change`);
            return res.status(401).json({ message: 'Session expired. Please log in again.' });
        }

        // Check if email is verified for sensitive operations
        if (!user.email_verified && req.path.includes('/admin')) {
            console.warn(`⚠️ [${requestId}] Email not verified for admin access`);
            return res.status(401).json({ message: 'Email verification required for admin access' });
        }

        // Update cache with security timestamp
        userCache.set(decoded.userId, {
            user: user,
            timestamp: now,
            tokenIssued: decoded.iat * 1000
        });

        req.user = user;
        req.requestId = requestId;
        req.tokenData = {
            issued: decoded.iat * 1000,
            expires: decoded.exp * 1000,
            tokenId: decoded.jti
        };

        next();
    } catch (error) {
        console.error(`❌ [${requestId}] Auth verification failed:`, {
            errorName: error.name,
            path: req.path,
            ip: clientIp
        });

        // Clear potentially compromised cache entry
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: 'Invalid authentication token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Session expired. Please log in again.' });
        }
        if (error.name === 'NotBeforeError') {
            return res.status(401).json({ message: 'Token not yet valid' });
        }
        if (error.message === 'Database query timeout') {
            return res.status(503).json({ message: 'Service temporarily unavailable' });
        }

        return res.status(403).json({ message: 'Authentication failed' });
    }
};

// Middleware to check user roles with enhanced security
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const userRole = req.user.role || 'member';

        // Validate role is not null/undefined
        if (!userRole) {
            return res.status(403).json({ message: 'User role not defined' });
        }

        // Check if user has required role
        if (!roles.includes(userRole)) {
            // Log unauthorized access attempt
            console.warn('Unauthorized access attempt:', {
                userId: req.user.id,
                userRole: userRole,
                requiredRoles: roles,
                path: req.path,
                method: req.method,
                ip: req.ip,
                timestamp: new Date().toISOString()
            });

            return res.status(403).json({
                message: `Access denied. Insufficient permissions.`
            });
        }

        // Additional security check for admin operations
        if (roles.includes('admin') && req.path.includes('/admin')) {
            // Verify admin account is not compromised
            if (!req.user.email_verified) {
                return res.status(403).json({ message: 'Admin account requires email verification' });
            }

            // Check for recent password change (optional additional security)
            const accountAge = Date.now() - new Date(req.user.created_at).getTime();
            const daysSinceCreation = accountAge / (1000 * 60 * 60 * 24);

            if (daysSinceCreation < 1 && !req.user.profile_completed) {
                return res.status(403).json({ message: 'New admin accounts must complete profile setup' });
            }
        }

        next();
    };
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    return requireRole(['admin'])(req, res, next);
};

// Middleware to check if user is executive or admin
const requireExecutive = (req, res, next) => {
    return requireRole(['admin', 'executive'])(req, res, next);
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
    isTokenBlacklisted
};
