// Tests for error handling middleware
const {
    APIError,
    ValidationError,
    NotFoundError,
    RateLimitError,
    AuthenticationError,
    errorHandler,
    asyncHandler
} = require('../../middleware/errorHandler');

describe('Error Classes', () => {
    describe('APIError', () => {
        it('should create an APIError with default values', () => {
            const error = new APIError();
            expect(error.name).toBe('APIError');
            expect(error.message).toBe('An API error occurred');
            expect(error.statusCode).toBe(500);
            expect(error.code).toBe('API_ERROR');
            expect(error.isOperational).toBe(true);
        });

        it('should create an APIError with custom values', () => {
            const error = new APIError('Custom message', 400, 'CUSTOM_CODE');
            expect(error.message).toBe('Custom message');
            expect(error.statusCode).toBe(400);
            expect(error.code).toBe('CUSTOM_CODE');
        });
    });

    describe('ValidationError', () => {
        it('should create a ValidationError with correct defaults', () => {
            const error = new ValidationError('Invalid input');
            expect(error.name).toBe('ValidationError');
            expect(error.message).toBe('Invalid input');
            expect(error.statusCode).toBe(400);
            expect(error.code).toBe('VALIDATION_ERROR');
        });

        it('should include validation details', () => {
            const details = { field: 'email', issue: 'invalid format' };
            const error = new ValidationError('Validation failed', details);
            expect(error.details).toEqual(details);
        });
    });

    describe('NotFoundError', () => {
        it('should create a NotFoundError with correct defaults', () => {
            const error = new NotFoundError();
            expect(error.statusCode).toBe(404);
            expect(error.code).toBe('NOT_FOUND');
            expect(error.message).toBe('Resource not found');
        });
    });

    describe('RateLimitError', () => {
        it('should create a RateLimitError with correct defaults', () => {
            const error = new RateLimitError();
            expect(error.statusCode).toBe(429);
            expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
            expect(error.message).toBe('Rate limit exceeded');
        });
    });

    describe('AuthenticationError', () => {
        it('should create an AuthenticationError with correct defaults', () => {
            const error = new AuthenticationError();
            expect(error.statusCode).toBe(401);
            expect(error.code).toBe('AUTHENTICATION_FAILED');
            expect(error.message).toBe('Authentication failed');
        });
    });
});

describe('errorHandler middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = testUtils.createMockReq();
        res = testUtils.createMockRes();
        next = testUtils.createMockNext();
    });

    it('should handle APIError correctly', () => {
        const error = new APIError('Test error', 400, 'TEST_ERROR');
        
        errorHandler(error, req, res, next);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: {
                code: 'TEST_ERROR',
                message: 'Test error'
            },
            timestamp: expect.any(String),
            correlationId: expect.any(String)
        });
    });

    it('should handle ValidationError with details', () => {
        const details = { field: 'address', issue: 'invalid format' };
        const error = new ValidationError('Validation failed', details);
        
        errorHandler(error, req, res, next);
        
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details
            },
            timestamp: expect.any(String),
            correlationId: expect.any(String)
        });
    });

    it('should handle generic Error as internal server error', () => {
        const error = new Error('Generic error');
        
        errorHandler(error, req, res, next);
        
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message: 'Internal server error'
            },
            timestamp: expect.any(String),
            correlationId: expect.any(String)
        });
    });

    it('should include error details in development mode', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        
        const error = new Error('Development error');
        error.stack = 'Error stack trace';
        
        errorHandler(error, req, res, next);
        
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.objectContaining({
                details: expect.objectContaining({
                    stack: 'Error stack trace'
                })
            })
        }));
        
        process.env.NODE_ENV = originalEnv;
    });

    it('should use correlation ID from request if available', () => {
        req.correlationId = 'test-correlation-id';
        const error = new APIError('Test error');
        
        errorHandler(error, req, res, next);
        
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            correlationId: 'test-correlation-id'
        }));
    });

    it('should not call next() after handling error', () => {
        const error = new APIError('Test error');
        
        errorHandler(error, req, res, next);
        
        expect(next).not.toHaveBeenCalled();
    });
});

describe('asyncHandler wrapper', () => {
    let req, res, next;

    beforeEach(() => {
        req = testUtils.createMockReq();
        res = testUtils.createMockRes();
        next = testUtils.createMockNext();
    });

    it('should handle successful async function', async () => {
        const asyncFn = jest.fn().mockResolvedValue('success');
        const wrappedFn = asyncHandler(asyncFn);
        
        await wrappedFn(req, res, next);
        
        expect(asyncFn).toHaveBeenCalledWith(req, res, next);
        expect(next).not.toHaveBeenCalled();
    });

    it('should catch and forward async errors', async () => {
        const error = new Error('Async error');
        const asyncFn = jest.fn().mockRejectedValue(error);
        const wrappedFn = asyncHandler(asyncFn);
        
        await wrappedFn(req, res, next);
        
        expect(asyncFn).toHaveBeenCalledWith(req, res, next);
        expect(next).toHaveBeenCalledWith(error);
    });

    it('should handle synchronous errors', async () => {
        const error = new Error('Sync error');
        const asyncFn = jest.fn().mockImplementation(() => {
            throw error;
        });
        const wrappedFn = asyncHandler(asyncFn);
        
        await wrappedFn(req, res, next);
        
        expect(next).toHaveBeenCalledWith(error);
    });

    it('should preserve function context', async () => {
        const context = { value: 'test' };
        const asyncFn = jest.fn(function() {
            expect(this).toBe(context);
            return Promise.resolve();
        });
        const wrappedFn = asyncHandler(asyncFn);
        
        await wrappedFn.call(context, req, res, next);
        
        expect(asyncFn).toHaveBeenCalled();
    });
});

describe('Error serialization', () => {
    it('should properly serialize APIError to JSON', () => {
        const error = new APIError('Test message', 400, 'TEST_CODE');
        const serialized = JSON.parse(JSON.stringify(error));
        
        expect(serialized).toEqual({
            name: 'APIError',
            message: 'Test message',
            statusCode: 400,
            code: 'TEST_CODE',
            isOperational: true
        });
    });

    it('should include details in ValidationError serialization', () => {
        const details = { field: 'test', issue: 'required' };
        const error = new ValidationError('Validation failed', details);
        const serialized = JSON.parse(JSON.stringify(error));
        
        expect(serialized.details).toEqual(details);
    });
});