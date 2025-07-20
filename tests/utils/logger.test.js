// Tests for logger utility
const {
    logger,
    measurePerformance,
    correlationMiddleware
} = require('../../utils/logger');

// Mock console methods
const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug
};

describe('Logger', () => {
    beforeEach(() => {
        // Mock console methods
        console.log = jest.fn();
        console.error = jest.fn();
        console.warn = jest.fn();
        console.info = jest.fn();
        console.debug = jest.fn();
        
        // Reset logger state
        logger.setLevel('debug');
    });

    afterEach(() => {
        // Restore console methods
        Object.assign(console, originalConsole);
    });

    describe('Basic Logging', () => {
        it('should log error messages', () => {
            logger.error('Test error message');
            
            expect(console.error).toHaveBeenCalled();
            const logCall = console.error.mock.calls[0][0];
            expect(logCall).toContain('ERROR');
            expect(logCall).toContain('Test error message');
        });

        it('should log warning messages', () => {
            logger.warn('Test warning message');
            
            expect(console.warn).toHaveBeenCalled();
            const logCall = console.warn.mock.calls[0][0];
            expect(logCall).toContain('WARN');
            expect(logCall).toContain('Test warning message');
        });

        it('should log info messages', () => {
            logger.info('Test info message');
            
            expect(console.info).toHaveBeenCalled();
            const logCall = console.info.mock.calls[0][0];
            expect(logCall).toContain('INFO');
            expect(logCall).toContain('Test info message');
        });

        it('should log debug messages', () => {
            logger.debug('Test debug message');
            
            expect(console.debug).toHaveBeenCalled();
            const logCall = console.debug.mock.calls[0][0];
            expect(logCall).toContain('DEBUG');
            expect(logCall).toContain('Test debug message');
        });

        it('should log trace messages', () => {
            logger.trace('Test trace message');
            
            expect(console.log).toHaveBeenCalled();
            const logCall = console.log.mock.calls[0][0];
            expect(logCall).toContain('TRACE');
            expect(logCall).toContain('Test trace message');
        });
    });

    describe('Log Levels', () => {
        it('should respect log level filtering', () => {
            logger.setLevel('warn');
            
            logger.error('Error message');
            logger.warn('Warning message');
            logger.info('Info message');
            logger.debug('Debug message');
            
            expect(console.error).toHaveBeenCalled();
            expect(console.warn).toHaveBeenCalled();
            expect(console.info).not.toHaveBeenCalled();
            expect(console.debug).not.toHaveBeenCalled();
        });

        it('should handle invalid log levels', () => {
            logger.setLevel('invalid');
            
            // Should default to 'info' level
            logger.info('Info message');
            logger.debug('Debug message');
            
            expect(console.info).toHaveBeenCalled();
            expect(console.debug).not.toHaveBeenCalled();
        });

        it('should support all log levels', () => {
            const levels = ['error', 'warn', 'info', 'debug', 'trace'];
            
            levels.forEach(level => {
                logger.setLevel(level);
                expect(logger.level).toBe(level);
            });
        });
    });

    describe('Structured Logging', () => {
        it('should log with metadata', () => {
            const metadata = {
                userId: 'user123',
                action: 'login',
                ip: '192.168.1.1'
            };
            
            logger.info('User logged in', metadata);
            
            expect(console.info).toHaveBeenCalled();
            const logCall = console.info.mock.calls[0][0];
            expect(logCall).toContain('userId');
            expect(logCall).toContain('user123');
            expect(logCall).toContain('action');
            expect(logCall).toContain('login');
        });

        it('should handle nested metadata objects', () => {
            const metadata = {
                user: {
                    id: 'user123',
                    email: 'test@example.com'
                },
                request: {
                    method: 'GET',
                    url: '/api/balance'
                }
            };
            
            logger.info('API request', metadata);
            
            expect(console.info).toHaveBeenCalled();
            const logCall = console.info.mock.calls[0][0];
            expect(logCall).toContain('user123');
            expect(logCall).toContain('test@example.com');
        });

        it('should handle circular references in metadata', () => {
            const obj = { name: 'test' };
            obj.self = obj; // Create circular reference
            
            expect(() => {
                logger.info('Test with circular reference', { obj });
            }).not.toThrow();
            
            expect(console.info).toHaveBeenCalled();
        });
    });

    describe('Correlation IDs', () => {
        it('should generate unique correlation IDs', () => {
            const id1 = logger.generateCorrelationId();
            const id2 = logger.generateCorrelationId();
            
            expect(id1).toBeDefined();
            expect(id2).toBeDefined();
            expect(id1).not.toBe(id2);
            expect(typeof id1).toBe('string');
            expect(id1.length).toBeGreaterThan(0);
        });

        it('should include correlation ID in logs when set', () => {
            const correlationId = 'test-correlation-123';
            logger.setCorrelationId(correlationId);
            
            logger.info('Test message');
            
            expect(console.info).toHaveBeenCalled();
            const logCall = console.info.mock.calls[0][0];
            expect(logCall).toContain(correlationId);
        });

        it('should clear correlation ID', () => {
            logger.setCorrelationId('test-id');
            logger.clearCorrelationId();
            
            logger.info('Test message');
            
            expect(console.info).toHaveBeenCalled();
            const logCall = console.info.mock.calls[0][0];
            expect(logCall).not.toContain('test-id');
        });
    });

    describe('Specialized Logging Methods', () => {
        it('should log API requests', () => {
            const requestData = {
                method: 'GET',
                url: '/api/balance/ethereum/0x123',
                headers: { 'user-agent': 'test' },
                query: { limit: 10 }
            };
            
            logger.logApiRequest(requestData);
            
            expect(console.info).toHaveBeenCalled();
            const logCall = console.info.mock.calls[0][0];
            expect(logCall).toContain('API_REQUEST');
            expect(logCall).toContain('GET');
            expect(logCall).toContain('/api/balance/ethereum/0x123');
        });

        it('should log API responses', () => {
            const responseData = {
                statusCode: 200,
                duration: 150,
                size: 1024
            };
            
            logger.logApiResponse(responseData);
            
            expect(console.info).toHaveBeenCalled();
            const logCall = console.info.mock.calls[0][0];
            expect(logCall).toContain('API_RESPONSE');
            expect(logCall).toContain('200');
            expect(logCall).toContain('150');
        });

        it('should log performance metrics', () => {
            const performanceData = {
                operation: 'database_query',
                duration: 250,
                metadata: { table: 'users', rows: 100 }
            };
            
            logger.logPerformance(performanceData);
            
            expect(console.info).toHaveBeenCalled();
            const logCall = console.info.mock.calls[0][0];
            expect(logCall).toContain('PERFORMANCE');
            expect(logCall).toContain('database_query');
            expect(logCall).toContain('250');
        });

        it('should log database operations', () => {
            const dbData = {
                operation: 'SELECT',
                table: 'transactions',
                duration: 45,
                rowsAffected: 10
            };
            
            logger.logDatabase(dbData);
            
            expect(console.debug).toHaveBeenCalled();
            const logCall = console.debug.mock.calls[0][0];
            expect(logCall).toContain('DATABASE');
            expect(logCall).toContain('SELECT');
            expect(logCall).toContain('transactions');
        });

        it('should log external API calls', () => {
            const apiData = {
                service: 'nodit',
                endpoint: '/balance',
                method: 'GET',
                duration: 300,
                statusCode: 200
            };
            
            logger.logExternalApi(apiData);
            
            expect(console.debug).toHaveBeenCalled();
            const logCall = console.debug.mock.calls[0][0];
            expect(logCall).toContain('EXTERNAL_API');
            expect(logCall).toContain('nodit');
            expect(logCall).toContain('/balance');
        });

        it('should log blockchain operations', () => {
            const blockchainData = {
                chain: 'ethereum',
                operation: 'getBalance',
                address: '0x123',
                blockNumber: 18500000,
                duration: 500
            };
            
            logger.logBlockchain(blockchainData);
            
            expect(console.debug).toHaveBeenCalled();
            const logCall = console.debug.mock.calls[0][0];
            expect(logCall).toContain('BLOCKCHAIN');
            expect(logCall).toContain('ethereum');
            expect(logCall).toContain('getBalance');
        });
    });

    describe('Error Logging', () => {
        it('should log Error objects with stack traces', () => {
            const error = new Error('Test error');
            error.code = 'TEST_ERROR';
            
            logger.error('An error occurred', { error });
            
            expect(console.error).toHaveBeenCalled();
            const logCall = console.error.mock.calls[0][0];
            expect(logCall).toContain('Test error');
            expect(logCall).toContain('TEST_ERROR');
            expect(logCall).toContain('stack');
        });

        it('should handle non-Error objects', () => {
            const errorLike = {
                message: 'Custom error',
                code: 'CUSTOM_ERROR'
            };
            
            logger.error('Custom error occurred', { error: errorLike });
            
            expect(console.error).toHaveBeenCalled();
            const logCall = console.error.mock.calls[0][0];
            expect(logCall).toContain('Custom error');
            expect(logCall).toContain('CUSTOM_ERROR');
        });
    });

    describe('Production vs Development Formatting', () => {
        const originalEnv = process.env.NODE_ENV;

        afterEach(() => {
            process.env.NODE_ENV = originalEnv;
        });

        it('should use JSON format in production', () => {
            process.env.NODE_ENV = 'production';
            
            // Create new logger instance to pick up env change
            const { logger: prodLogger } = require('../../utils/logger');
            prodLogger.info('Test message', { key: 'value' });
            
            expect(console.info).toHaveBeenCalled();
            const logCall = console.info.mock.calls[0][0];
            
            // Should be valid JSON
            expect(() => JSON.parse(logCall)).not.toThrow();
            const parsed = JSON.parse(logCall);
            expect(parsed).toHaveProperty('level', 'info');
            expect(parsed).toHaveProperty('message', 'Test message');
            expect(parsed).toHaveProperty('timestamp');
        });

        it('should use human-readable format in development', () => {
            process.env.NODE_ENV = 'development';
            
            logger.info('Test message');
            
            expect(console.info).toHaveBeenCalled();
            const logCall = console.info.mock.calls[0][0];
            
            // Should contain timestamp and level in readable format
            expect(logCall).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/); // ISO timestamp
            expect(logCall).toContain('INFO');
            expect(logCall).toContain('Test message');
        });
    });
});

describe('Performance Measurement', () => {
    it('should measure function execution time', async () => {
        const testFunction = async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
            return 'result';
        };
        
        const result = await measurePerformance('test-operation', testFunction);
        
        expect(result).toBe('result');
        expect(console.info).toHaveBeenCalled();
        
        const logCall = console.info.mock.calls[0][0];
        expect(logCall).toContain('PERFORMANCE');
        expect(logCall).toContain('test-operation');
    });

    it('should handle function errors and still log performance', async () => {
        const failingFunction = async () => {
            await new Promise(resolve => setTimeout(resolve, 50));
            throw new Error('Function failed');
        };
        
        await expect(measurePerformance('failing-operation', failingFunction))
            .rejects.toThrow('Function failed');
        
        expect(console.info).toHaveBeenCalled();
        const logCall = console.info.mock.calls[0][0];
        expect(logCall).toContain('PERFORMANCE');
        expect(logCall).toContain('failing-operation');
    });

    it('should include additional metadata in performance logs', async () => {
        const testFunction = async () => 'result';
        const metadata = { userId: 'user123', operation: 'data-fetch' };
        
        await measurePerformance('test-with-metadata', testFunction, metadata);
        
        expect(console.info).toHaveBeenCalled();
        const logCall = console.info.mock.calls[0][0];
        expect(logCall).toContain('user123');
        expect(logCall).toContain('data-fetch');
    });
});

describe('Correlation Middleware', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            headers: {},
            method: 'GET',
            url: '/api/test',
            ip: '192.168.1.1'
        };
        mockRes = {
            setHeader: jest.fn(),
            on: jest.fn()
        };
        mockNext = jest.fn();
    });

    it('should generate correlation ID for new requests', () => {
        correlationMiddleware(mockReq, mockRes, mockNext);
        
        expect(mockReq.correlationId).toBeDefined();
        expect(typeof mockReq.correlationId).toBe('string');
        expect(mockReq.correlationId.length).toBeGreaterThan(0);
        expect(mockRes.setHeader).toHaveBeenCalledWith('X-Correlation-ID', mockReq.correlationId);
        expect(mockNext).toHaveBeenCalled();
    });

    it('should use existing correlation ID from headers', () => {
        const existingId = 'existing-correlation-123';
        mockReq.headers['x-correlation-id'] = existingId;
        
        correlationMiddleware(mockReq, mockRes, mockNext);
        
        expect(mockReq.correlationId).toBe(existingId);
        expect(mockRes.setHeader).toHaveBeenCalledWith('X-Correlation-ID', existingId);
    });

    it('should log request start', () => {
        correlationMiddleware(mockReq, mockRes, mockNext);
        
        expect(console.info).toHaveBeenCalled();
        const logCall = console.info.mock.calls[0][0];
        expect(logCall).toContain('REQUEST_START');
        expect(logCall).toContain('GET');
        expect(logCall).toContain('/api/test');
        expect(logCall).toContain(mockReq.correlationId);
    });

    it('should log request completion on response finish', () => {
        correlationMiddleware(mockReq, mockRes, mockNext);
        
        // Simulate response finish
        const finishCallback = mockRes.on.mock.calls.find(call => call[0] === 'finish')[1];
        mockRes.statusCode = 200;
        finishCallback();
        
        expect(console.info).toHaveBeenCalledTimes(2); // Start + finish
        const finishLogCall = console.info.mock.calls[1][0];
        expect(finishLogCall).toContain('REQUEST_COMPLETE');
        expect(finishLogCall).toContain('200');
        expect(finishLogCall).toContain('duration');
    });

    it('should handle missing request properties gracefully', () => {
        mockReq = { headers: {} }; // Minimal request object
        
        expect(() => correlationMiddleware(mockReq, mockRes, mockNext)).not.toThrow();
        expect(mockNext).toHaveBeenCalled();
    });
});

describe('Logger Integration', () => {
    it('should work with correlation middleware', () => {
        const mockReq = {
            headers: {},
            method: 'POST',
            url: '/api/balance',
            ip: '10.0.0.1'
        };
        const mockRes = {
            setHeader: jest.fn(),
            on: jest.fn()
        };
        const mockNext = jest.fn();
        
        correlationMiddleware(mockReq, mockRes, mockNext);
        
        // Use logger with correlation ID set
        logger.setCorrelationId(mockReq.correlationId);
        logger.info('Processing request');
        
        expect(console.info).toHaveBeenCalledTimes(2); // Middleware + manual log
        const manualLogCall = console.info.mock.calls[1][0];
        expect(manualLogCall).toContain(mockReq.correlationId);
        expect(manualLogCall).toContain('Processing request');
    });

    it('should handle high-frequency logging without performance issues', () => {
        const startTime = Date.now();
        
        // Log 1000 messages
        for (let i = 0; i < 1000; i++) {
            logger.info(`Message ${i}`, { iteration: i });
        }
        
        const duration = Date.now() - startTime;
        
        // Should complete within reasonable time (adjust threshold as needed)
        expect(duration).toBeLessThan(1000); // 1 second
        expect(console.info).toHaveBeenCalledTimes(1000);
    });
});