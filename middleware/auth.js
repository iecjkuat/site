const jwt = require('jsonwebtoken');
const { supabase } = require('../lib/supabase');

// Simple in-memory cache for user profiles
const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Middleware to authenticate JWT tokens
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ message: 'Access token required' });
        }

        // Verify JWT token with proper options
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            algorithms: ['HS256'],
            maxAge: '24h', // Token expires in 24 hours
            issuer: 'jkuat-innovation-club',
            audience: 'jkuat-platform'
        });

        // Validate token structure
        if (!decoded.userId || !decoded.exp) {
            return res.status(401).json({ message: 'Invalid token structure' });
        }

        // Check if token is expired (additional check)
        if (Date.now() >= decoded.exp * 1000) {
            return res.status(401).json({ message: 'Token expired' });
        }

        // Check cache first
        const now = Date.now();
        const cached = userCache.get(decoded.userId);

        if (cached && (now - cached.timestamp < CACHE_TTL)) {
            // Validate cached user is still active
            if (cached.user.status === 'inactive' || cached.user.deleted_at) {
                userCache.delete(decoded.userId);
                return res.status(401).json({ message: 'User account inactive' });
            }
            req.user = cached.user;
            return next();
        }

        // Get user from database with security checks
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, role, status, email_verified, created_at, updated_at')
            .eq('id', decoded.userId)
            .is('deleted_at', null) // Ensure user is not deleted
            .single();

        if (error || !user) {
            return res.status(401).json({ message: 'Invalid token - user not found' });
        }

        // Check if user account is active
        if (user.status === 'inactive' || user.status === 'suspended') {
            return res.status(401).json({ message: 'Account inactive or suspended' });
        }

        // Check if email is verified for sensitive operations
        if (!user.email_verified && req.path.includes('/admin')) {
            return res.status(401).json({ message: 'Email verification required for admin access' });
        }

        // Update cache with security timestamp
        userCache.set(decoded.userId, {
            user: user,
            timestamp: now,
            tokenIssued: decoded.iat * 1000
        });

        req.user = user;
        req.tokenData = {
            issued: decoded.iat * 1000,
            expires: decoded.exp * 1000
        };
        
        next();
    } catch (error) {
        // Clear potentially compromised cache entry
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: 'Invalid token format' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired' });
        }
        if (error.name === 'NotBeforeError') {
            return res.status(401).json({ message: 'Token not active yet' });
        }
        
        console.error('Auth middleware error:', {
            name: error.name,
            message: error.message,
            path: req.path,
            ip: req.ip
        });
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
                message: `Access denied. Required roles: ${roles.join(', ')}`,
                userRole: userRole
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
    requireExecutive
};

// Function to clear user cache (for logout, role changes, etc.)
const clearUserCache = (userId) => {
    if (userId) {
        userCache.delete(userId);
        console.log(`Cache cleared for user: ${userId}`);
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
        userId: userId,
        role: userRole,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (options.expiresIn || 24 * 60 * 60), // 24 hours default
        iss: 'jkuat-innovation-club',
        aud: 'jkuat-platform',
        jti: require('crypto').randomUUID() // Unique token ID
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        algorithm: 'HS256'
    });
};

module.exports = {
    authenticateToken,
    requireRole,
    requireAdmin,
    requireExecutive,
    clearUserCache,
    clearAllCache,
    generateSecureToken
};