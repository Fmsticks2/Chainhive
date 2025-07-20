// Security middleware for API protection
const { RateLimitError } = require('./errorHandler');
const { logger } = require('../utils/logger');

// Rate limiting implementation
class RateLimiter {
    constructor(options = {}) {
        this.windowMs = options.windowMs || 60000; // 1 minute
        this.maxRequests = options.maxRequests || 100;
        this.requests = new Map();
        this.skipSuccessfulRequests = options.skipSuccessfulRequests || false;
        this.skipFailedRequests = options.skipFailedRequests || false;
        
        // Clean up old entries every minute (skip in test environment)
        if (process.env.NODE_ENV !== 'test') {
            this.cleanupInterval = setInterval(() => this.cleanup(), this.windowMs);
        }
    }

    getKey(req) {
        return req.ip || req.connection.remoteAddress || 'unknown';
    }

    isAllowed(req) {
        const key = this.getKey(req);
        const now = Date.now();
        const userRequests = this.requests.get(key) || [];
        
        // Remove old requests outside the window
        const validRequests = userRequests.filter(time => now - time < this.windowMs);
        
        if (validRequests.length >= this.maxRequests) {
            logger.warn('Rate limit exceeded', {
                ip: key,
                requestCount: validRequests.length,
                maxRequests: this.maxRequests,
                windowMs: this.windowMs
            });
            return false;
        }
        
        validRequests.push(now);
        this.requests.set(key, validRequests);
        return true;
    }

    cleanup() {
        const now = Date.now();
        for (const [key, requests] of this.requests.entries()) {
            const validRequests = requests.filter(time => now - time < this.windowMs);
            if (validRequests.length === 0) {
                this.requests.delete(key);
            } else {
                this.requests.set(key, validRequests);
            }
        }
    }

    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.requests.clear();
    }

    middleware() {
        return (req, res, next) => {
            if (!this.isAllowed(req)) {
                const resetTime = new Date(Date.now() + this.windowMs);
                res.setHeader('X-RateLimit-Limit', this.maxRequests);
                res.setHeader('X-RateLimit-Remaining', 0);
                res.setHeader('X-RateLimit-Reset', resetTime.toISOString());
                return next(new RateLimitError());
            }

            const key = this.getKey(req);
            const userRequests = this.requests.get(key) || [];
            const remaining = Math.max(0, this.maxRequests - userRequests.length);
            
            res.setHeader('X-RateLimit-Limit', this.maxRequests);
            res.setHeader('X-RateLimit-Remaining', remaining);
            res.setHeader('X-RateLimit-Reset', new Date(Date.now() + this.windowMs).toISOString());
            
            next();
        };
    }
}

// Security headers middleware
function securityHeaders(req, res, next) {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Content Security Policy
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:",
        "connect-src 'self' https:",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'"
    ].join('; ');
    res.setHeader('Content-Security-Policy', csp);
    
    // HSTS (only in production with HTTPS)
    if (process.env.NODE_ENV === 'production' && req.secure) {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }
    
    // Remove server information
    if (res.removeHeader) {
        res.removeHeader('X-Powered-By');
    }
    
    next();
}

// CORS configuration
function corsMiddleware(req, res, next) {
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://chainhive.vercel.app',
        process.env.FRONTEND_URL
    ].filter(Boolean);
    
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'X-Correlation-ID',
        'X-API-Key'
    ].join(', '));
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    next();
}

// Input sanitization for security
function sanitizeHeaders(req, res, next) {
    // Ensure headers object exists
    if (!req.headers) {
        req.headers = {};
    }
    
    // Remove potentially dangerous headers
    delete req.headers['x-forwarded-host'];
    delete req.headers['x-original-host'];
    
    // Validate and sanitize custom headers
    if (req.headers['x-api-key']) {
        req.headers['x-api-key'] = req.headers['x-api-key'].replace(/[^a-zA-Z0-9-_]/g, '');
    }
    
    // Sanitize other potentially dangerous headers
    Object.keys(req.headers).forEach(key => {
        if (typeof req.headers[key] === 'string') {
            // Remove script tags and other dangerous content
            req.headers[key] = req.headers[key]
                .replace(/<script[^>]*>.*?<\/script>/gi, '')
                .replace(/<[^>]*>/g, '');
        }
    });
    
    next();
}

// API key validation middleware
function validateApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    const validApiKeys = (process.env.VALID_API_KEYS || '').split(',').filter(Boolean);
    
    // Skip validation in development or if no keys configured
    if (process.env.NODE_ENV === 'development' || validApiKeys.length === 0) {
        return next();
    }
    
    if (!apiKey || !validApiKeys.includes(apiKey)) {
        logger.warn('Invalid API key attempt', {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            providedKey: apiKey ? `${apiKey.slice(0, 4)}...` : 'none'
        });
        
        return res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_API_KEY',
                message: 'Valid API key required'
            }
        });
    }
    
    next();
}

// Request size limiting
function requestSizeLimit(maxSize = '10mb') {
    const maxBytes = typeof maxSize === 'string' 
        ? parseSize(maxSize)
        : maxSize;
    
    return (req, res, next) => {
        const contentLength = parseInt(req.headers['content-length'] || '0');
        
        if (contentLength > maxBytes) {
            return res.status(413).json({
                success: false,
                error: {
                    code: 'PAYLOAD_TOO_LARGE',
                    message: `Request size exceeds limit of ${maxSize}`
                }
            });
        }
        
        next();
    };
}

function parseSize(size) {
    const units = {
        b: 1,
        kb: 1024,
        mb: 1024 * 1024,
        gb: 1024 * 1024 * 1024
    };
    
    const match = size.toLowerCase().match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/);
    if (!match) return 0;
    
    const value = parseFloat(match[1]);
    const unit = match[2] || 'b';
    
    return Math.floor(value * units[unit]);
}

// Create rate limiter instances
const generalRateLimit = new RateLimiter({
    windowMs: 60000, // 1 minute
    maxRequests: 100
});

const strictRateLimit = new RateLimiter({
    windowMs: 60000, // 1 minute
    maxRequests: 20
});

module.exports = {
    RateLimiter,
    securityHeaders,
    corsMiddleware,
    sanitizeHeaders,
    validateApiKey,
    requestSizeLimit,
    generalRateLimit: generalRateLimit.middleware(),
    strictRateLimit: strictRateLimit.middleware()
};