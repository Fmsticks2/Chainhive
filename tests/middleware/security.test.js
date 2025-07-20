// Tests for security middleware
const {
    RateLimiter,
    generalRateLimit,
    strictRateLimit,
    securityHeaders,
    corsMiddleware,
    sanitizeHeaders,
    validateApiKey,
    requestSizeLimit
} = require('../../middleware/security');

describe('RateLimiter', () => {
    let rateLimiter;

    beforeEach(() => {
        rateLimiter = new RateLimiter({
            windowMs: 60000, // 1 minute
            maxRequests: 10
        });
    });

    afterEach(() => {
        if (rateLimiter) {
            rateLimiter.destroy();
        }
    });

    describe('Rate Limiting Logic', () => {
        it('should allow requests within limit', () => {
            const mockReq = { ip: '192.168.1.1' };
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                setHeader: jest.fn()
            };
            const mockNext = jest.fn();

            const middleware = rateLimiter.middleware();
            middleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 10);
            expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 9);
        });

        it('should block requests exceeding limit', () => {
            const mockReq = { ip: '192.168.1.1' };
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                setHeader: jest.fn()
            };
            const mockNext = jest.fn();

            const middleware = rateLimiter.middleware();
            
            // Make 10 requests to reach the limit
            for (let i = 0; i < 10; i++) {
                middleware(mockReq, mockRes, jest.fn());
            }
            
            // 11th request should be blocked
            middleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
            expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 0);
        });

        it('should handle missing IP gracefully', () => {
            const mockReq = {}; // No IP
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                setHeader: jest.fn()
            };
            const mockNext = jest.fn();

            const middleware = rateLimiter.middleware();
            middleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 10);
        });

        it('should use IP from connection when available', () => {
            const mockReq = { 
                connection: { remoteAddress: '192.168.1.2' }
            };
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                setHeader: jest.fn()
            };
            const mockNext = jest.fn();

            const middleware = rateLimiter.middleware();
            middleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 10);
        });
    });

    describe('Rate Limit Headers', () => {
        it('should set rate limit headers', () => {
            const mockReq = { ip: '192.168.1.1' };
            const mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
                setHeader: jest.fn()
            };
            const mockNext = jest.fn();

            const middleware = rateLimiter.middleware();
            middleware(mockReq, mockRes, mockNext);

            expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', 10);
            expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', 9);
            expect(mockRes.setHeader).toHaveBeenCalledWith('X-RateLimit-Reset', expect.any(String));
        });
    });
});

describe('Security Headers Middleware', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {};
        mockRes = {
            setHeader: jest.fn(),
            removeHeader: jest.fn()
        };
        mockNext = jest.fn();
    });

    it('should set all security headers', () => {
        securityHeaders(mockReq, mockRes, mockNext);

        expect(mockRes.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
        expect(mockRes.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
        expect(mockRes.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
        expect(mockRes.setHeader).toHaveBeenCalledWith('Referrer-Policy', 'strict-origin-when-cross-origin');
        expect(mockRes.setHeader).toHaveBeenCalledWith(
            'Content-Security-Policy',
            "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        );
        expect(mockNext).toHaveBeenCalled();
    });

    it('should set HSTS header for HTTPS requests', () => {
        mockReq.secure = true;
        
        securityHeaders(mockReq, mockRes, mockNext);

        expect(mockRes.setHeader).toHaveBeenCalledWith(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains; preload'
        );
    });

    it('should not set HSTS header for HTTP requests', () => {
        mockReq.secure = false;
        
        securityHeaders(mockReq, mockRes, mockNext);

        expect(mockRes.setHeader).not.toHaveBeenCalledWith(
            'Strict-Transport-Security',
            expect.any(String)
        );
    });
});

describe('CORS Middleware', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            method: 'GET',
            headers: {}
        };
        mockRes = {
            setHeader: jest.fn(),
            status: jest.fn().mockReturnThis(),
            end: jest.fn()
        };
        mockNext = jest.fn();
    });

    it('should set CORS headers for allowed origins', () => {
        mockReq.headers.origin = 'http://localhost:3000';
        
        corsMiddleware(mockReq, mockRes, mockNext);

        expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Origin', 'http://localhost:3000');
        expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Credentials', 'true');
        expect(mockNext).toHaveBeenCalled();
    });

    it('should handle preflight OPTIONS requests', () => {
        mockReq.method = 'OPTIONS';
        mockReq.headers.origin = 'http://localhost:3000';
        
        corsMiddleware(mockReq, mockRes, mockNext);

        expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        expect(mockRes.setHeader).toHaveBeenCalledWith('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Correlation-ID, X-API-Key');
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.end).toHaveBeenCalled();
        expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject requests from disallowed origins', () => {
        mockReq.headers.origin = 'http://malicious-site.com';
        
        corsMiddleware(mockReq, mockRes, mockNext);

        expect(mockRes.setHeader).not.toHaveBeenCalledWith('Access-Control-Allow-Origin', expect.any(String));
        expect(mockNext).toHaveBeenCalled();
    });

    it('should allow requests without origin header', () => {
        // No origin header (same-origin requests)
        corsMiddleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
    });
});

describe('Header Sanitization Middleware', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            headers: {
                'user-agent': 'Mozilla/5.0',
                'x-forwarded-for': '192.168.1.1',
                'x-malicious-header': '<script>alert("xss")</script>',
                'content-type': 'application/json',
                'authorization': 'Bearer token123'
            }
        };
        mockRes = {};
        mockNext = jest.fn();
    });

    it('should sanitize potentially dangerous headers', () => {
        sanitizeHeaders(mockReq, mockRes, mockNext);

        expect(mockReq.headers['x-malicious-header']).toBe('alert("xss")');
        expect(mockReq.headers['user-agent']).toBe('Mozilla/5.0'); // Should remain unchanged
        expect(mockNext).toHaveBeenCalled();
    });

    it('should preserve safe headers', () => {
        sanitizeHeaders(mockReq, mockRes, mockNext);

        expect(mockReq.headers['content-type']).toBe('application/json');
        expect(mockReq.headers['authorization']).toBe('Bearer token123');
    });

    it('should handle missing headers gracefully', () => {
        mockReq.headers = undefined;
        
        expect(() => sanitizeHeaders(mockReq, mockRes, mockNext)).not.toThrow();
        expect(mockNext).toHaveBeenCalled();
    });
});

describe('API Key Validation Middleware', () => {
    let mockReq, mockRes, mockNext;
    const originalEnv = process.env;

    beforeEach(() => {
        mockReq = {
            headers: {},
            query: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockNext = jest.fn();
        
        // Set test API key
        process.env.VALID_API_KEYS = 'test-api-key-123';
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should accept valid API key in header', () => {
        mockReq.headers['x-api-key'] = 'test-api-key-123';
        
        validateApiKey(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should accept valid API key in query parameter', () => {
        mockReq.query.apiKey = 'test-api-key-123';
        
        validateApiKey(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject invalid API key', () => {
        mockReq.headers['x-api-key'] = 'invalid-key';
        
        validateApiKey(mockReq, mockRes, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            error: {
                code: 'INVALID_API_KEY',
                message: 'Valid API key required'
            }
        });
    });

    it('should reject missing API key', () => {
        validateApiKey(mockReq, mockRes, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should skip validation when no API key is configured', () => {
        delete process.env.VALID_API_KEYS;
        
        validateApiKey(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
    });
});

describe('Request Size Limit Middleware', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            headers: {},
            on: jest.fn(),
            pause: jest.fn(),
            resume: jest.fn()
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockNext = jest.fn();
    });

    it('should allow requests within size limit', () => {
        mockReq.headers['content-length'] = '1000'; // 1KB
        
        const middleware = requestSizeLimit(5 * 1024 * 1024); // 5MB limit
        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should reject requests exceeding size limit', () => {
        mockReq.headers['content-length'] = '10485760'; // 10MB
        
        const middleware = requestSizeLimit(5 * 1024 * 1024); // 5MB limit
        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(413);
        expect(mockRes.json).toHaveBeenCalledWith({
            success: false,
            error: {
                code: 'PAYLOAD_TOO_LARGE',
                message: 'Request size exceeds limit of 5242880'
            }
        });
    });

    it('should handle missing content-length header', () => {
        // No content-length header
        const middleware = requestSizeLimit(5 * 1024 * 1024);
        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
    });

    it('should use default size limit', () => {
        mockReq.headers['content-length'] = '2097152'; // 2MB
        
        const middleware = requestSizeLimit(); // Default 1MB limit
        middleware(mockReq, mockRes, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.status).toHaveBeenCalledWith(413);
    });
});

describe('Rate Limiter Instances', () => {
    it('should export general rate limiter with correct configuration', () => {
        expect(generalRateLimiter).toBeInstanceOf(RateLimiter);
        expect(generalRateLimiter.maxRequests).toBe(100);
        expect(generalRateLimiter.windowMs).toBe(15 * 60 * 1000); // 15 minutes
    });

    it('should export strict rate limiter with correct configuration', () => {
        expect(strictRateLimiter).toBeInstanceOf(RateLimiter);
        expect(strictRateLimiter.maxRequests).toBe(10);
        expect(strictRateLimiter.windowMs).toBe(60 * 1000); // 1 minute
    });
});

describe('Security Integration', () => {
    it('should handle multiple security middlewares together', async () => {
        const mockReq = {
            ip: '192.168.1.1',
            method: 'GET',
            headers: {
                'origin': 'http://localhost:3000',
                'x-api-key': 'test-api-key-123',
                'content-length': '1000'
            },
            secure: true
        };
        const mockRes = {
            setHeader: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockNext = jest.fn();

        process.env.VALID_API_KEYS = 'test-api-key-123';

        // Apply all security middlewares
        securityHeaders(mockReq, mockRes, mockNext);
        corsMiddleware(mockReq, mockRes, mockNext);
        sanitizeHeaders(mockReq, mockRes, mockNext);
        validateApiKey(mockReq, mockRes, mockNext);
        requestSizeLimit()(mockReq, mockRes, mockNext);

        // All should pass
        expect(mockNext).toHaveBeenCalledTimes(5);
        expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('should handle security middleware chain with failures', async () => {
        const mockReq = {
            ip: '192.168.1.1',
            method: 'GET',
            headers: {
                'origin': 'http://malicious-site.com',
                'x-api-key': 'invalid-key',
                'content-length': '10485760' // 10MB
            }
        };
        const mockRes = {
            setHeader: jest.fn(),
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const mockNext = jest.fn();

        process.env.VALID_API_KEYS = 'test-api-key-123';

        // Apply security middlewares - some should fail
        validateApiKey(mockReq, mockRes, mockNext);
        requestSizeLimit(1024 * 1024)(mockReq, mockRes, mockNext); // 1MB limit

        // Should have failures
        expect(mockRes.status).toHaveBeenCalledWith(401); // API key failure
        expect(mockRes.status).toHaveBeenCalledWith(413); // Size limit failure
    });
});