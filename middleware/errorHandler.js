// Centralized error handling middleware for consistent API responses

class APIError extends Error {
    constructor(message = 'An API error occurred', statusCode = 500, code = 'API_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.name = 'APIError';
        this.isOperational = true;
    }
    
    toJSON() {
        return {
            name: this.name,
            message: this.message,
            statusCode: this.statusCode,
            code: this.code,
            isOperational: this.isOperational,
            ...(this.details && { details: this.details })
        };
    }
}

class ValidationError extends APIError {
    constructor(message, details = null) {
        super(message, 400, 'VALIDATION_ERROR');
        this.name = 'ValidationError';
        this.details = details;
        this.isOperational = true;
    }
}

class NotFoundError extends APIError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404, 'NOT_FOUND');
    }
}

class RateLimitError extends APIError {
    constructor() {
        super('Rate limit exceeded', 429, 'RATE_LIMIT_EXCEEDED');
    }
}

class AuthenticationError extends APIError {
    constructor(message = 'Authentication failed') {
        super(message, 401, 'AUTHENTICATION_FAILED');
    }
}

// Error handler middleware
function errorHandler(error, req, res, next) {
    // Generate correlation ID if not present
    const correlationId = req.correlationId || require('crypto').randomUUID();
    
    // Log error details
    console.error('API Error:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        correlationId
    });

    // Base response structure
    const baseResponse = {
        success: false,
        timestamp: new Date().toISOString(),
        correlationId
    };

    // Handle known API errors
    if (error instanceof APIError) {
        const errorResponse = {
            code: error.code,
            message: error.message
        };
        
        // Add field for ValidationError
        if (error instanceof ValidationError && error.field) {
            errorResponse.field = error.field;
        }
        
        // Add details for ValidationError
        if (error.details) {
            errorResponse.details = error.details;
        }
        
        return res.status(error.statusCode).json({
            ...baseResponse,
            error: errorResponse
        });
    }

    // Handle validation errors from external libraries (like Zod)
    if (error.name === 'ValidationError' || error.constructor.name === 'ValidationError') {
        return res.status(400).json({
            ...baseResponse,
            error: {
                code: 'VALIDATION_ERROR',
                message: error.message,
                details: error.details || []
            }
        });
    }

    // Handle unexpected errors
    const errorResponse = {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Internal server error'
    };
    
    // Add stack trace in development
    if (process.env.NODE_ENV === 'development') {
        errorResponse.details = {
            stack: error.stack,
            name: error.name
        };
    }
    
    res.status(500).json({
        ...baseResponse,
        error: errorResponse
    });
}

// Async error wrapper
function asyncHandler(fn) {
    return function(req, res, next) {
        try {
            Promise.resolve(fn.call(this, req, res, next)).catch(next);
        } catch (error) {
            next(error);
        }
    };
}

module.exports = {
    APIError,
    ValidationError,
    NotFoundError,
    RateLimitError,
    AuthenticationError,
    errorHandler,
    asyncHandler
};