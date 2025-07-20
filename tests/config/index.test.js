// Tests for configuration management
const { ConfigManager, config } = require('../../config/index');

describe('ConfigManager', () => {
    let configManager;
    const originalEnv = process.env;

    beforeEach(() => {
        // Reset environment variables
        process.env = { ...originalEnv };
        // Ensure test environment variables override .env file
        process.env.NODE_ENV = 'test';
        process.env.NODIT_API_KEY = 'test-key';
        configManager = new ConfigManager();
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('Environment Variable Loading', () => {
        it('should load configuration with default values', () => {
            const config = configManager.getConfig();
            
            expect(config).toHaveProperty('server');
            expect(config).toHaveProperty('api');
            expect(config).toHaveProperty('rateLimiting');
            expect(config).toHaveProperty('security');
            expect(config).toHaveProperty('cache');
            expect(config).toHaveProperty('logging');
            expect(config).toHaveProperty('blockchain');
            expect(config).toHaveProperty('performance');
            expect(config).toHaveProperty('monitoring');
        });

        it('should use environment variables when provided', () => {
            process.env.PORT = '8080';
            process.env.NODE_ENV = 'production';
            process.env.NODIT_API_KEY = 'test-key-123';
            process.env.REDIS_URL = 'redis://localhost:6380';
            
            const newConfig = new ConfigManager();
            const config = newConfig.getConfig();
            
            expect(config.server.port).toBe(8080);
            expect(config.server.env).toBe('production');
            expect(config.api.noditApiKey).toBe('test-key-123');
            expect(config.cache.redisUrl).toBe('redis://localhost:6380');
        });

        it('should handle boolean environment variables correctly', () => {
            process.env.CACHE_ENABLED = 'false';
            process.env.RATE_LIMITING_ENABLED = 'true';
            process.env.CORS_ENABLED = 'false';
            
            const newConfig = new ConfigManager();
            const config = newConfig.getConfig();
            
            expect(config.cache.enabled).toBe(false);
            expect(config.rateLimiting.enabled).toBe(true);
            expect(config.security.cors.enabled).toBe(false);
        });

        it('should handle numeric environment variables correctly', () => {
            process.env.RATE_LIMIT_WINDOW_MS = '30000';
            process.env.RATE_LIMIT_MAX_REQUESTS = '50';
            process.env.CACHE_TTL = '600';
            
            const newConfig = new ConfigManager();
            const config = newConfig.getConfig();
            
            expect(config.rateLimiting.windowMs).toBe(30000);
            expect(config.rateLimiting.maxRequests).toBe(50);
            expect(config.cache.ttl).toBe(600);
        });

        it('should handle array environment variables correctly', () => {
            process.env.CORS_ALLOWED_ORIGINS = 'http://localhost:3000,https://app.chainhive.com,https://chainhive.vercel.app';
            process.env.SUPPORTED_CHAINS = 'ethereum,polygon,bsc,arbitrum';
            
            const newConfig = new ConfigManager();
            const config = newConfig.getConfig();
            
            expect(config.security.cors.allowedOrigins).toEqual([
                'http://localhost:3000',
                'https://app.chainhive.com',
                'https://chainhive.vercel.app'
            ]);
            expect(config.blockchain.supportedChains).toEqual([
                'ethereum',
                'polygon',
                'bsc',
                'arbitrum'
            ]);
        });
    });

    describe('Configuration Validation', () => {
        it('should validate required configuration fields', () => {
            delete process.env.NODIT_API_KEY;
            
            expect(() => new ConfigManager()).toThrow('Missing required environment variable: NODIT_API_KEY');
        });

        it('should validate port number range', () => {
            process.env.PORT = '70000'; // Invalid port
            
            expect(() => new ConfigManager()).toThrow('PORT must be between 1 and 65535');
        });

        it('should validate positive numbers', () => {
            process.env.CACHE_TTL = '-100';
            
            expect(() => new ConfigManager()).toThrow('CACHE_TTL must be a positive number');
        });

        it('should validate URL format', () => {
            process.env.REDIS_URL = 'invalid-url';
            
            expect(() => new ConfigManager()).toThrow('REDIS_URL must be a valid URL');
        });

        it('should validate enum values', () => {
            process.env.NODE_ENV = 'invalid-env';
            
            expect(() => new ConfigManager()).toThrow('NODE_ENV must be one of: development, production, test');
        });

        it('should validate log level', () => {
            process.env.LOG_LEVEL = 'invalid-level';
            
            expect(() => new ConfigManager()).toThrow('LOG_LEVEL must be one of: error, warn, info, debug, trace');
        });
    });

    describe('Configuration Sections', () => {
        beforeEach(() => {
            process.env.NODIT_API_KEY = 'test-key';
        });

        it('should return server configuration', () => {
            const serverConfig = configManager.getServerConfig();
            
            expect(serverConfig).toHaveProperty('port');
            expect(serverConfig).toHaveProperty('host');
            expect(serverConfig).toHaveProperty('env');
            expect(typeof serverConfig.port).toBe('number');
            expect(typeof serverConfig.host).toBe('string');
        });

        it('should return API configuration', () => {
            const apiConfig = configManager.getApiConfig();
            
            expect(apiConfig).toHaveProperty('noditApiKey');
            expect(apiConfig).toHaveProperty('noditBaseUrl');
            expect(apiConfig).toHaveProperty('timeout');
            expect(apiConfig).toHaveProperty('retries');
        });

        it('should return rate limiting configuration', () => {
            const rateLimitConfig = configManager.getRateLimitConfig();
            
            expect(rateLimitConfig).toHaveProperty('enabled');
            expect(rateLimitConfig).toHaveProperty('windowMs');
            expect(rateLimitConfig).toHaveProperty('maxRequests');
            expect(rateLimitConfig).toHaveProperty('skipSuccessfulRequests');
        });

        it('should return security configuration', () => {
            const securityConfig = configManager.getSecurityConfig();
            
            expect(securityConfig).toHaveProperty('cors');
            expect(securityConfig).toHaveProperty('headers');
            expect(securityConfig).toHaveProperty('apiKey');
            expect(securityConfig.cors).toHaveProperty('enabled');
            expect(securityConfig.cors).toHaveProperty('allowedOrigins');
        });

        it('should return cache configuration', () => {
            const cacheConfig = configManager.getCacheConfig();
            
            expect(cacheConfig).toHaveProperty('enabled');
            expect(cacheConfig).toHaveProperty('ttl');
            expect(cacheConfig).toHaveProperty('redisUrl');
            expect(cacheConfig).toHaveProperty('maxMemoryItems');
        });

        it('should return logging configuration', () => {
            const loggingConfig = configManager.getLoggingConfig();
            
            expect(loggingConfig).toHaveProperty('level');
            expect(loggingConfig).toHaveProperty('format');
            expect(loggingConfig).toHaveProperty('enableConsole');
            expect(loggingConfig).toHaveProperty('enableFile');
        });

        it('should return blockchain configuration', () => {
            const blockchainConfig = configManager.getBlockchainConfig();
            
            expect(blockchainConfig).toHaveProperty('supportedChains');
            expect(blockchainConfig).toHaveProperty('defaultChain');
            expect(blockchainConfig).toHaveProperty('rpcUrls');
            expect(Array.isArray(blockchainConfig.supportedChains)).toBe(true);
        });

        it('should return performance configuration', () => {
            const performanceConfig = configManager.getPerformanceConfig();
            
            expect(performanceConfig).toHaveProperty('requestTimeout');
            expect(performanceConfig).toHaveProperty('maxConcurrentRequests');
            expect(performanceConfig).toHaveProperty('enableCompression');
        });

        it('should return monitoring configuration', () => {
            const monitoringConfig = configManager.getMonitoringConfig();
            
            expect(monitoringConfig).toHaveProperty('enabled');
            expect(monitoringConfig).toHaveProperty('healthCheckInterval');
            expect(monitoringConfig).toHaveProperty('metricsEnabled');
        });
    });

    describe('Environment Detection', () => {
        it('should detect development environment', () => {
            process.env.NODE_ENV = 'development';
            process.env.NODIT_API_KEY = 'test-key';
            
            const newConfig = new ConfigManager();
            
            expect(newConfig.isDevelopment()).toBe(true);
            expect(newConfig.isProduction()).toBe(false);
            expect(newConfig.isTest()).toBe(false);
        });

        it('should detect production environment', () => {
            process.env.NODE_ENV = 'production';
            process.env.NODIT_API_KEY = 'test-key';
            
            const newConfig = new ConfigManager();
            
            expect(newConfig.isDevelopment()).toBe(false);
            expect(newConfig.isProduction()).toBe(true);
            expect(newConfig.isTest()).toBe(false);
        });

        it('should detect test environment', () => {
            process.env.NODE_ENV = 'test';
            process.env.NODIT_API_KEY = 'test-key';
            
            const newConfig = new ConfigManager();
            
            expect(newConfig.isDevelopment()).toBe(false);
            expect(newConfig.isProduction()).toBe(false);
            expect(newConfig.isTest()).toBe(true);
        });
    });

    describe('Configuration Updates', () => {
        beforeEach(() => {
            process.env.NODIT_API_KEY = 'test-key';
        });

        it('should allow updating configuration values', () => {
            configManager.updateConfig('cache.enabled', false);
            
            const config = configManager.getConfig();
            expect(config.cache.enabled).toBe(false);
        });

        it('should allow updating nested configuration values', () => {
            configManager.updateConfig('security.cors.enabled', false);
            
            const config = configManager.getConfig();
            expect(config.security.cors.enabled).toBe(false);
        });

        it('should validate updated configuration values', () => {
            expect(() => {
                configManager.updateConfig('server.port', 70000);
            }).toThrow('PORT must be between 1 and 65535');
        });

        it('should not allow updating non-existent paths', () => {
            expect(() => {
                configManager.updateConfig('nonexistent.path', 'value');
            }).toThrow('Configuration path does not exist: nonexistent.path');
        });
    });

    describe('Configuration Serialization', () => {
        beforeEach(() => {
            process.env.NODIT_API_KEY = 'test-key';
        });

        it('should serialize configuration to JSON', () => {
            const json = configManager.toJSON();
            const parsed = JSON.parse(json);
            
            expect(parsed).toHaveProperty('server');
            expect(parsed).toHaveProperty('api');
            expect(parsed.api.noditApiKey).toBe('[REDACTED]'); // Should be redacted
        });

        it('should include sensitive data when requested', () => {
            const json = configManager.toJSON(true);
            const parsed = JSON.parse(json);
            
            expect(parsed.api.noditApiKey).toBe('test-key'); // Should not be redacted
        });
    });

    describe('Error Handling', () => {
        it('should handle malformed environment variables gracefully', () => {
            process.env.CACHE_TTL = 'not-a-number';
            process.env.NODIT_API_KEY = 'test-key';
            
            expect(() => new ConfigManager()).toThrow('CACHE_TTL must be a valid number');
        });

        it('should handle empty environment variables', () => {
            process.env.NODIT_API_KEY = '';
            
            expect(() => new ConfigManager()).toThrow('NODIT_API_KEY cannot be empty');
        });

        it('should handle whitespace-only environment variables', () => {
            process.env.NODIT_API_KEY = '   ';
            
            expect(() => new ConfigManager()).toThrow('NODIT_API_KEY cannot be empty');
        });
    });

    describe('Default Configuration Values', () => {
        beforeEach(() => {
            process.env.NODIT_API_KEY = 'test-key';
            // In test environment, NODE_ENV is 'test' by default
            process.env.NODE_ENV = 'test';
        });

        it('should use correct default values', () => {
            const config = configManager.getConfig();
            
            expect(config.server.port).toBe(3000);
            expect(config.server.host).toBe('0.0.0.0');
            expect(config.server.env).toBe('test'); // Jest sets NODE_ENV to 'test'
            expect(config.cache.enabled).toBe(true);
            expect(config.cache.ttl).toBe(300);
            expect(config.rateLimiting.enabled).toBe(true);
            expect(config.rateLimiting.windowMs).toBe(15 * 60 * 1000);
            expect(config.rateLimiting.maxRequests).toBe(100);
        });

        it('should use correct default arrays', () => {
            const config = configManager.getConfig();
            
            expect(config.security.cors.allowedOrigins).toEqual([
                'http://localhost:3000',
                'http://localhost:5173',
                'https://chainhive.vercel.app'
            ]);
            expect(config.blockchain.supportedChains).toEqual([
                'ethereum',
                'polygon',
                'bsc',
                'arbitrum',
                'optimism',
                'avalanche'
            ]);
        });
    });
});

describe('Global Config Instance', () => {
    it('should export a singleton config instance', () => {
        expect(config).toBeInstanceOf(ConfigManager);
    });

    it('should maintain the same instance across imports', () => {
        const { config: config2 } = require('../../config/index');
        expect(config).toBe(config2);
    });

    it('should have all required methods', () => {
        expect(typeof config.getConfig).toBe('function');
        expect(typeof config.getServerConfig).toBe('function');
        expect(typeof config.getApiConfig).toBe('function');
        expect(typeof config.getRateLimitConfig).toBe('function');
        expect(typeof config.getSecurityConfig).toBe('function');
        expect(typeof config.getCacheConfig).toBe('function');
        expect(typeof config.getLoggingConfig).toBe('function');
        expect(typeof config.getBlockchainConfig).toBe('function');
        expect(typeof config.getPerformanceConfig).toBe('function');
        expect(typeof config.getMonitoringConfig).toBe('function');
    });
});

describe('Configuration Integration', () => {
    beforeEach(() => {
        process.env.NODIT_API_KEY = 'test-key';
    });

    it('should work with different environment configurations', () => {
        const environments = ['development', 'production', 'test'];
        
        environments.forEach(env => {
            process.env.NODE_ENV = env;
            const configManager = new ConfigManager();
            const config = configManager.getConfig();
            
            expect(config.server.env).toBe(env);
            expect(config.logging.level).toBeDefined();
            expect(config.cache.enabled).toBeDefined();
        });
    });

    it('should handle complex configuration scenarios', () => {
        // Set up a complex environment
        process.env.NODE_ENV = 'production';
        process.env.PORT = '8080';
        process.env.REDIS_URL = 'redis://prod-redis:6379';
        process.env.CACHE_ENABLED = 'true';
        process.env.CACHE_TTL = '600';
        process.env.RATE_LIMITING_ENABLED = 'true';
        process.env.RATE_LIMIT_MAX_REQUESTS = '1000';
        process.env.LOG_LEVEL = 'warn';
        process.env.CORS_ALLOWED_ORIGINS = 'https://app.chainhive.com,https://admin.chainhive.com';
        
        const configManager = new ConfigManager();
        const config = configManager.getConfig();
        
        expect(config.server.port).toBe(8080);
        expect(config.server.env).toBe('production');
        expect(config.cache.redisUrl).toBe('redis://prod-redis:6379');
        expect(config.cache.ttl).toBe(600);
        expect(config.rateLimiting.maxRequests).toBe(1000);
        expect(config.logging.level).toBe('warn');
        expect(config.security.cors.allowedOrigins).toEqual([
            'https://app.chainhive.com',
            'https://admin.chainhive.com'
        ]);
    });
});