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

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check cache first
        const now = Date.now();
        const cached = userCache.get(decoded.userId);

        if (cached && (now - cached.timestamp < CACHE_TTL)) {
            req.user = cached.user;
            return next();
        }

        // Get user from database
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', decoded.userId)
            .single();

        if (error || !user) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        // Update cache
        userCache.set(decoded.userId, {
            user: user,
            timestamp: now
        });

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

// Middleware to check user roles
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const userRole = req.user.role || 'member';

        if (!roles.includes(userRole)) {
            return res.status(403).json({
                message: `Access denied. Required roles: ${roles.join(', ')}`
            });
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