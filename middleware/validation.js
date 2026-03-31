const { body, param, query, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

// Enhanced validation error handler
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Log validation failures for security monitoring
        console.warn('Validation failed:', {
            path: req.path,
            method: req.method,
            ip: req.ip,
            errors: errors.array(),
            timestamp: new Date().toISOString()
        });
        
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
                value: typeof err.value === 'string' ? err.value.substring(0, 50) : err.value
            }))
        });
    }
    next();
};

// Common validation rules
const commonValidations = {
    // UUID validation
    uuid: param('id').isUUID().withMessage('Invalid ID format'),
    
    // Email validation
    email: body('email')
        .isEmail()
        .normalizeEmail()
        .isLength({ max: 254 })
        .withMessage('Valid email required (max 254 characters)'),
    
    // Password validation
    password: body('password')
        .isLength({ min: 12, max: 128 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/)
        .withMessage('Password must be 12-128 characters with uppercase, lowercase, numbers, and special characters'),
    
    // Name validation
    name: body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .matches(/^[a-zA-Z\s'-]+$/)
        .withMessage('Name must be 2-100 characters, letters only'),
    
    // Amount validation (for payments)
    amount: body('amount')
        .isFloat({ min: 0.01, max: 1000000 })
        .withMessage('Amount must be between 0.01 and 1,000,000'),
    
    // Date validation
    date: body('date')
        .isISO8601()
        .toDate()
        .withMessage('Valid date required (ISO 8601 format)'),
    
    // Pagination validation
    pagination: [
        query('page').optional().isInt({ min: 1, max: 1000 }).withMessage('Page must be 1-1000'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100')
    ],
    
    // Search query validation
    searchQuery: query('q')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .matches(/^[a-zA-Z0-9\s\-_]+$/)
        .withMessage('Search query must be 1-100 characters, alphanumeric only'),
    
    // Status validation
    status: body('status')
        .isIn(['active', 'inactive', 'pending', 'completed', 'cancelled'])
        .withMessage('Invalid status value'),
    
    // Role validation
    role: body('role')
        .isIn(['admin', 'executive', 'member', 'treasurer', 'secretary'])
        .withMessage('Invalid role value'),
    
    // Phone validation
    phone: body('phone')
        .optional()
        .matches(/^\+254[0-9]{9}$/)
        .withMessage('Phone must be in format +254XXXXXXXXX'),
    
    // URL validation
    url: body('url')
        .optional()
        .isURL({ protocols: ['http', 'https'], require_protocol: true })
        .isLength({ max: 2048 })
        .withMessage('Valid URL required (max 2048 characters)')
};

// Rate limiting configurations
const rateLimits = {
    // Strict rate limiting for auth endpoints
    auth: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 5, // 5 attempts per window
        message: {
            message: 'Too many authentication attempts, please try again later',
            retryAfter: '15 minutes'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            console.warn('Rate limit exceeded for auth:', {
                ip: req.ip,
                path: req.path,
                timestamp: new Date().toISOString()
            });
            res.status(429).json({
                message: 'Too many authentication attempts, please try again later',
                retryAfter: '15 minutes'
            });
        }
    }),
    
    // Moderate rate limiting for API endpoints
    api: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // 100 requests per window
        message: {
            message: 'Too many requests, please try again later',
            retryAfter: '15 minutes'
        }
    }),
    
    // Strict rate limiting for admin endpoints
    admin: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 50, // 50 requests per window
        message: {
            message: 'Too many admin requests, please try again later',
            retryAfter: '15 minutes'
        }
    }),
    
    // Very strict for password reset
    passwordReset: rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 3, // 3 attempts per hour
        message: {
            message: 'Too many password reset attempts, please try again later',
            retryAfter: '1 hour'
        }
    })
};

// Sanitization middleware — strips dangerous patterns from all string inputs
const sanitizeInput = (req, res, next) => {
    const sanitizeString = (str) => {
        if (typeof str !== 'string') return str;
        return str
            .replace(/<script[\s\S]*?<\/script>/gi, '')   // script tags
            .replace(/javascript\s*:/gi, '')               // javascript: protocol
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')  // inline event handlers
            .replace(/data\s*:\s*text\/html/gi, '')        // data: URIs with HTML
            .trim();
    };

    const sanitizeObject = (obj, depth = 0) => {
        if (depth > 10) return obj; // prevent prototype pollution via deep nesting
        if (obj === null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(item => sanitizeObject(item, depth + 1));

        const clean = {};
        for (const key of Object.keys(obj)) {
            // Block prototype pollution keys
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
            const val = obj[key];
            clean[key] = typeof val === 'string'
                ? sanitizeString(val)
                : typeof val === 'object'
                    ? sanitizeObject(val, depth + 1)
                    : val;
        }
        return clean;
    };

    if (req.body) req.body = sanitizeObject(req.body);
    if (req.query) req.query = sanitizeObject(req.query);
    if (req.params) req.params = sanitizeObject(req.params);

    next();
};

// SQL injection prevention for raw queries
const preventSQLInjection = (input) => {
    if (typeof input !== 'string') return input;
    
    // List of dangerous SQL keywords and patterns
    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|SCRIPT)\b)/gi,
        /(--|\/\*|\*\/|;|'|"|`)/g,
        /(\bOR\b|\bAND\b).*?[=<>]/gi
    ];
    
    for (const pattern of sqlPatterns) {
        if (pattern.test(input)) {
            throw new Error('Potentially malicious input detected');
        }
    }
    
    return input;
};

module.exports = {
    handleValidationErrors,
    commonValidations,
    rateLimits,
    sanitizeInput,
    preventSQLInjection
};