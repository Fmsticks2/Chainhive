// Tests for health check service
const { HealthCheckService } = require('../../services/health');
const { cacheService } = require('../../services/cache');
const { NoditService } = require('../../services/nodit-service');

// Mock dependencies
jest.mock('../../services/cache');
jest.mock('../../services/nodit-service');
jest.mock('fs', () => ({
    promises: {
        stat: jest.fn()
    }
}));

describe('HealthCheckService', () => {
    let healthService;
    let mockCacheService;
    let mockNoditService;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();
        
        // Mock cache service
        mockCacheService = {
            healthCheck: jest.fn().mockResolvedValue({ memory: true, redis: false })
        };
        cacheService.healthCheck = mockCacheService.healthCheck;
        
        // Mock Nodit service
        mockNoditService = {
            healthCheck: jest.fn().mockResolvedValue(true)
        };
        NoditService.prototype.healthCheck = mockNoditService.healthCheck;
        
        healthService = new HealthCheckService();
    });

    describe('Default Health Checks', () => {
        it('should perform memory usage check', async () => {
            const result = await healthService.runCheck('memory');
            
            expect(result).toHaveProperty('name', 'memory');
            expect(result).toHaveProperty('status');
            expect(result).toHaveProperty('details');
            expect(result.details).toHaveProperty('used');
            expect(result.details).toHaveProperty('total');
            expect(result.details).toHaveProperty('percentage');
        });

        it('should perform cache health check', async () => {
            const result = await healthService.runCheck('cache');
            
            expect(result).toHaveProperty('name', 'cache');
            expect(result).toHaveProperty('status', 'healthy');
            expect(mockCacheService.healthCheck).toHaveBeenCalled();
        });

        it('should perform Nodit API health check', async () => {
            const result = await healthService.runCheck('nodit-api');
            
            expect(result).toHaveProperty('name', 'nodit-api');
            expect(result).toHaveProperty('status', 'healthy');
            expect(mockNoditService.healthCheck).toHaveBeenCalled();
        });

        it('should perform disk space check', async () => {
            const fs = require('fs');
            fs.promises.stat.mockResolvedValue({
                size: 1000000000 // 1GB
            });
            
            const result = await healthService.runCheck('disk');
            
            expect(result).toHaveProperty('name', 'disk');
            expect(result).toHaveProperty('status');
        });

        it('should perform environment variables check', async () => {
            // Set required env vars
            process.env.NODIT_API_KEY = 'test-key';
            
            const result = await healthService.runCheck('environment');
            
            expect(result).toHaveProperty('name', 'environment');
            expect(result).toHaveProperty('status', 'healthy');
            expect(result.details).toHaveProperty('requiredVars');
        });
    });

    describe('Custom Health Checks', () => {
        it('should register and run custom health checks', async () => {
            const customCheck = jest.fn().mockResolvedValue({
                status: 'healthy',
                details: { custom: 'data' }
            });
            
            healthService.registerCheck('custom-service', customCheck);
            const result = await healthService.runCheck('custom-service');
            
            expect(result).toHaveProperty('name', 'custom-service');
            expect(result).toHaveProperty('status', 'healthy');
            expect(result.details).toHaveProperty('custom', 'data');
            expect(customCheck).toHaveBeenCalled();
        });

        it('should handle custom check errors', async () => {
            const failingCheck = jest.fn().mockRejectedValue(new Error('Custom check failed'));
            
            healthService.registerCheck('failing-service', failingCheck);
            const result = await healthService.runCheck('failing-service');
            
            expect(result).toHaveProperty('status', 'unhealthy');
            expect(result).toHaveProperty('error', 'Custom check failed');
        });

        it('should override default checks with custom ones', async () => {
            const customMemoryCheck = jest.fn().mockResolvedValue({
                status: 'custom',
                details: { custom: true }
            });
            
            healthService.registerCheck('memory', customMemoryCheck);
            const result = await healthService.runCheck('memory');
            
            expect(result).toHaveProperty('status', 'custom');
            expect(customMemoryCheck).toHaveBeenCalled();
        });
    });

    describe('Comprehensive Health Check', () => {
        it('should run all health checks', async () => {
            process.env.NODIT_API_KEY = 'test-key';
            
            const results = await healthService.checkHealth();
            
            expect(results).toHaveProperty('status');
            expect(results).toHaveProperty('timestamp');
            expect(results).toHaveProperty('checks');
            expect(results).toHaveProperty('summary');
            
            // Should include all default checks
            const checkNames = Object.keys(results.checks);
            expect(checkNames).toContain('memory');
            expect(checkNames).toContain('cache');
            expect(checkNames).toContain('nodit-api');
            expect(checkNames).toContain('disk');
            expect(checkNames).toContain('environment');
        });

        it('should determine overall status correctly', async () => {
            // Mock a failing check
            mockCacheService.healthCheck.mockRejectedValue(new Error('Cache failed'));
            
            const results = await healthService.checkHealth();
            
            expect(results.status).toBe('unhealthy');
            expect(results.summary.unhealthy).toBeGreaterThan(0);
        });

        it('should include performance metrics', async () => {
            const results = await healthService.checkHealth();
            
            expect(results).toHaveProperty('duration');
            expect(typeof results.duration).toBe('number');
            expect(results.duration).toBeGreaterThan(0);
        });

        it('should handle partial failures gracefully', async () => {
            // Mock some checks to fail
            mockNoditService.healthCheck.mockRejectedValue(new Error('API down'));
            
            const results = await healthService.checkHealth();
            
            expect(results).toHaveProperty('status');
            expect(results.checks['nodit-api']).toHaveProperty('status', 'unhealthy');
            expect(results.checks['memory']).toHaveProperty('status', 'healthy');
        });
    });

    describe('Continuous Monitoring', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
            healthService.stopMonitoring();
        });

        it('should start continuous monitoring', () => {
            const callback = jest.fn();
            
            healthService.startMonitoring(5000, callback);
            
            expect(healthService.monitoring).toBe(true);
            expect(healthService.monitoringInterval).toBeDefined();
        });

        it('should execute health checks at specified intervals', async () => {
            const callback = jest.fn();
            
            healthService.startMonitoring(1000, callback);
            
            // Fast-forward time
            jest.advanceTimersByTime(2500);
            
            // Wait for async operations
            await new Promise(resolve => setImmediate(resolve));
            
            expect(callback).toHaveBeenCalledTimes(2);
        });

        it('should stop monitoring', () => {
            const callback = jest.fn();
            
            healthService.startMonitoring(1000, callback);
            healthService.stopMonitoring();
            
            expect(healthService.monitoring).toBe(false);
            expect(healthService.monitoringInterval).toBe(null);
        });

        it('should handle monitoring callback errors', async () => {
            const failingCallback = jest.fn().mockImplementation(() => {
                throw new Error('Callback error');
            });
            
            // Should not throw
            expect(() => {
                healthService.startMonitoring(1000, failingCallback);
                jest.advanceTimersByTime(1500);
            }).not.toThrow();
        });
    });

    describe('Express Middleware', () => {
        let mockReq, mockRes;

        beforeEach(() => {
            mockReq = {};
            mockRes = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn().mockReturnThis(),
                setHeader: jest.fn()
            };
        });

        it('should create health endpoint middleware', async () => {
            const middleware = healthService.middleware();
            
            await middleware(mockReq, mockRes);
            
            expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalled();
            
            const responseData = mockRes.json.mock.calls[0][0];
            expect(responseData).toHaveProperty('status');
            expect(responseData).toHaveProperty('checks');
        });

        it('should return 503 status for unhealthy services', async () => {
            // Mock a failing check
            mockCacheService.healthCheck.mockRejectedValue(new Error('Service down'));
            
            const middleware = healthService.middleware();
            await middleware(mockReq, mockRes);
            
            expect(mockRes.status).toHaveBeenCalledWith(503);
        });

        it('should create readiness probe middleware', async () => {
            const middleware = healthService.readinessProbe(['cache', 'nodit-api']);
            
            await middleware(mockReq, mockRes);
            
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalled();
            
            const responseData = mockRes.json.mock.calls[0][0];
            expect(responseData).toHaveProperty('ready');
            expect(responseData).toHaveProperty('checks');
        });

        it('should create liveness probe middleware', async () => {
            const middleware = healthService.livenessProbe(['memory']);
            
            await middleware(mockReq, mockRes);
            
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalled();
            
            const responseData = mockRes.json.mock.calls[0][0];
            expect(responseData).toHaveProperty('alive', true);
        });

        it('should handle middleware errors gracefully', async () => {
            // Mock all checks to fail
            healthService.checks = {
                'failing-check': jest.fn().mockRejectedValue(new Error('Total failure'))
            };
            
            const middleware = healthService.middleware();
            
            // Should not throw
            await expect(middleware(mockReq, mockRes)).resolves.not.toThrow();
            expect(mockRes.status).toHaveBeenCalledWith(503);
        });
    });

    describe('Error Handling', () => {
        it('should handle missing health check gracefully', async () => {
            const result = await healthService.runCheck('non-existent-check');
            
            expect(result).toHaveProperty('name', 'non-existent-check');
            expect(result).toHaveProperty('status', 'unhealthy');
            expect(result).toHaveProperty('error');
        });

        it('should handle check timeout', async () => {
            const slowCheck = jest.fn().mockImplementation(() => 
                new Promise(resolve => setTimeout(resolve, 10000))
            );
            
            healthService.registerCheck('slow-check', slowCheck);
            
            const startTime = Date.now();
            const result = await healthService.runCheck('slow-check');
            const duration = Date.now() - startTime;
            
            expect(duration).toBeLessThan(6000); // Should timeout before 10s
            expect(result).toHaveProperty('status', 'unhealthy');
            expect(result.error).toContain('timeout');
        });

        it('should handle memory check errors', async () => {
            // Mock process.memoryUsage to throw
            const originalMemoryUsage = process.memoryUsage;
            process.memoryUsage = jest.fn().mockImplementation(() => {
                throw new Error('Memory check failed');
            });
            
            const result = await healthService.runCheck('memory');
            
            expect(result).toHaveProperty('status', 'unhealthy');
            expect(result).toHaveProperty('error', 'Memory check failed');
            
            // Restore original function
            process.memoryUsage = originalMemoryUsage;
        });
    });

    describe('Health Check Results', () => {
        it('should format check results consistently', async () => {
            const result = await healthService.runCheck('memory');
            
            expect(result).toHaveProperty('name');
            expect(result).toHaveProperty('status');
            expect(result).toHaveProperty('timestamp');
            expect(result).toHaveProperty('duration');
            expect(result).toHaveProperty('details');
            
            expect(typeof result.name).toBe('string');
            expect(['healthy', 'unhealthy', 'degraded']).toContain(result.status);
            expect(typeof result.timestamp).toBe('string');
            expect(typeof result.duration).toBe('number');
        });

        it('should include error information for failed checks', async () => {
            mockCacheService.healthCheck.mockRejectedValue(new Error('Cache connection failed'));
            
            const result = await healthService.runCheck('cache');
            
            expect(result).toHaveProperty('status', 'unhealthy');
            expect(result).toHaveProperty('error', 'Cache connection failed');
        });

        it('should measure check execution time', async () => {
            const slowCheck = jest.fn().mockImplementation(() => 
                new Promise(resolve => setTimeout(() => resolve({ status: 'healthy' }), 100))
            );
            
            healthService.registerCheck('slow-check', slowCheck);
            const result = await healthService.runCheck('slow-check');
            
            expect(result.duration).toBeGreaterThan(90);
            expect(result.duration).toBeLessThan(200);
        });
    });

    describe('Environment Variables Check', () => {
        const originalEnv = process.env;

        beforeEach(() => {
            process.env = { ...originalEnv };
        });

        afterEach(() => {
            process.env = originalEnv;
        });

        it('should detect missing required environment variables', async () => {
            delete process.env.NODIT_API_KEY;
            
            const result = await healthService.runCheck('environment');
            
            expect(result.status).toBe('unhealthy');
            expect(result.details.missing).toContain('NODIT_API_KEY');
        });

        it('should pass when all required variables are present', async () => {
            process.env.NODIT_API_KEY = 'test-key';
            process.env.NODE_ENV = 'test';
            
            const result = await healthService.runCheck('environment');
            
            expect(result.status).toBe('healthy');
            expect(result.details.missing).toHaveLength(0);
        });
    });
});