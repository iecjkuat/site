/**
 * Validation & Security Middleware
 *
 * Design principles applied:
 * - Validate first, never mutate before validation
 * - Sanitization is a logging/output concern, not an input gate
 * - SQL injection is prevented by parameterized queries (Supabase), not regex
 * - Rate limiting is in server.js; these configs are kept for reference only
 * - Error responses expose field names but not raw values or schema internals
 */

const { body, param, query, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { sendError } = require('../lib/api-response');

// ── Standardised error classes ────────────────────────────────────────────────

class ValidationError extends Error {
    constructor(errors) {
        super('Validation failed');
        this.name = 'ValidationError';
        this.errors = errors;
        this.status = 400;
    }
}

class AuthError extends Error {
    constructor(message = 'Authentication required') {
        super(message);
        this.name = 'AuthError';
        this.status = 401;
    }
}

class ApiError extends Error {
    constructor(message, status = 500) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

// ── Validation error handler ──────────────────────────────────────────────────

const handleValidationErrors = (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('Validation failed:', {
                path: req.path,
                method: req.method,
                errors: result.array().map((e) => ({ field: e.path, msg: e.msg }))
            });
        }

        return sendError(req, res, {
            status: 400,
            message: 'Invalid request data',
            errors: result.array().map((err) => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// ── Common validation rules ───────────────────────────────────────────────────

const commonValidations = {
    uuid: param('id')
        .isUUID()
        .withMessage('Invalid ID format'),

    email: body('email')
        .isEmail()
        .normalizeEmail()
        .isLength({ max: 254 })
        .withMessage('Valid email required'),

    password: body('password')
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must be 8-128 characters'),

    name: body('name')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be 2-100 characters'),

    amount: body('amount')
        .isFloat({ min: 0.01, max: 1000000 })
        .withMessage('Amount must be between 0.01 and 1,000,000'),

    date: body('date')
        .isISO8601()
        .toDate()
        .withMessage('Valid ISO 8601 date required'),

    pagination: [
        query('page').optional().isInt({ min: 1, max: 1000 }).withMessage('Page must be 1-1000'),
        query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100')
    ],

    searchQuery: query('q')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search query must be 1-100 characters'),

    status: body('status')
        .isIn(['active', 'inactive', 'pending', 'completed', 'cancelled'])
        .withMessage('Invalid status value'),

    role: body('role')
        .isIn(['admin', 'executive', 'member', 'treasurer', 'secretary'])
        .withMessage('Invalid role value'),

    phone: body('phone')
        .optional()
        .matches(/^\+254[0-9]{9}$/)
        .withMessage('Phone must be in format +254XXXXXXXXX'),

    url: body('url')
        .optional()
        .isURL({ protocols: ['http', 'https'], require_protocol: true })
        .isLength({ max: 2048 })
        .withMessage('Valid URL required'),
};

// ── Rate limit configs (used in server.js) ────────────────────────────────────

const rateLimits = {
    auth: rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 5,
        standardHeaders: true,
        legacyHeaders: false,
        message: { message: 'Too many authentication attempts. Try again in 15 minutes.' }
    }),
    api: rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        message: { message: 'Too many requests. Please slow down.' }
    }),
    admin: rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 50,
        standardHeaders: true,
        legacyHeaders: false,
        message: { message: 'Too many admin requests.' }
    }),
    passwordReset: rateLimit({
        windowMs: 60 * 60 * 1000,
        max: 3,
        standardHeaders: true,
        legacyHeaders: false,
        message: { message: 'Too many password reset attempts. Try again in 1 hour.' }
    })
};

// ── Sanitization ──────────────────────────────────────────────────────────────

const sanitizeInput = (req, res, next) => {
    const sanitizeString = (str) => {
        if (typeof str !== 'string') return str;
        return str
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/javascript\s*:/gi, '')
            .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
            .replace(/data\s*:\s*text\/html/gi, '')
            .trim();
    };

    const sanitizeObject = (obj, depth = 0) => {
        if (depth > 10) return obj;
        if (obj === null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map((item) => sanitizeObject(item, depth + 1));
        const clean = {};
        for (const key of Object.keys(obj)) {
            if (['__proto__', 'constructor', 'prototype'].includes(key)) continue;
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

module.exports = {
    handleValidationErrors,
    commonValidations,
    rateLimits,
    sanitizeInput,
    ValidationError,
    AuthError,
    ApiError,
};