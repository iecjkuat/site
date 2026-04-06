const DEFAULT_ERROR_MESSAGES = {
    400: 'Bad request',
    401: 'Authentication required',
    403: 'Access denied',
    404: 'Resource not found',
    409: 'Conflict',
    422: 'Request validation failed',
    429: 'Too many requests',
    500: 'Internal server error',
    503: 'Service temporarily unavailable'
};

const getRequestId = (req, res) => {
    return req.requestId || res.getHeader('X-Request-ID') || null;
};

const buildSuccessResponse = (req, res, options = {}) => {
    const {
        message = 'Request completed successfully',
        data = null,
        meta,
        status = 200,
        includeRequestId = true
    } = options;

    const payload = {
        success: true,
        message
    };

    if (data !== undefined) {
        payload.data = data;
    }

    if (meta !== undefined) {
        payload.meta = meta;
    }

    if (includeRequestId) {
        const requestId = getRequestId(req, res);
        if (requestId) {
            payload.requestId = requestId;
        }
    }

    return { status, payload };
};

const sendSuccess = (req, res, options = {}) => {
    const response = buildSuccessResponse(req, res, options);
    return res.status(response.status).json(response.payload);
};

const normalizeErrorDetails = (errors) => {
    if (!errors) {
        return undefined;
    }

    if (Array.isArray(errors)) {
        return errors.map((error) => {
            if (typeof error === 'string') {
                return { message: error };
            }

            return {
                field: error.field || error.path,
                message: error.message || error.msg || 'Invalid value'
            };
        });
    }

    if (typeof errors === 'object') {
        return Object.entries(errors).map(([field, message]) => ({
            field,
            message: Array.isArray(message) ? message.join(', ') : String(message)
        }));
    }

    return [{ message: String(errors) }];
};

const buildErrorResponse = (req, res, options = {}) => {
    const {
        status = 500,
        message,
        errors,
        code,
        includeRequestId = true
    } = options;

    const payload = {
        success: false,
        message: message || DEFAULT_ERROR_MESSAGES[status] || DEFAULT_ERROR_MESSAGES[500]
    };

    const normalizedErrors = normalizeErrorDetails(errors);
    if (normalizedErrors && normalizedErrors.length) {
        payload.errors = normalizedErrors;
    }

    if (code) {
        payload.code = code;
    }

    if (includeRequestId) {
        const requestId = getRequestId(req, res);
        if (requestId) {
            payload.requestId = requestId;
        }
    }

    return { status, payload };
};

const sendError = (req, res, options = {}) => {
    const response = buildErrorResponse(req, res, options);
    return res.status(response.status).json(response.payload);
};

const asyncHandler = (handler) => {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
};

module.exports = {
    DEFAULT_ERROR_MESSAGES,
    getRequestId,
    buildSuccessResponse,
    sendSuccess,
    normalizeErrorDetails,
    buildErrorResponse,
    sendError,
    asyncHandler
};