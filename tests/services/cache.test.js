// Tests for cache service
const {
    cacheService,
    CacheService,
    MemoryCache,
    RedisCache
} = require('../../services/cache');

// Mock Redis
jest.mock('redis');

describe('MemoryCache', () => {
    let cache;

    beforeEach(() => {
        cache = new MemoryCache();
    });

    afterEach(async () => {
        await cache.clear();
    });

    describe('Basic Operations', () => {
        it('should set and get values', async () => {
            await cache.set('test-key', 'test-value', 60);
            const value = await cache.get('test-key');
            expect(value).toBe('test-value');
        });

        it('should return null for non-existent keys', async () => {
            const value = await cache.get('non-existent');
            expect(value).toBe(null);
        });

        it('should delete values', async () => {
            await cache.set('test-key', 'test-value');
            const deleted = await cache.delete('test-key');
            expect(deleted).toBe(true);
            
            const value = await cache.get('test-key');
            expect(value).toBe(null);
        });

        it('should check if key exists', async () => {
            await cache.set('test-key', 'test-value');
            expect(await cache.exists('test-key')).toBe(true);
            expect(await cache.exists('non-existent')).toBe(false);
        });

        it('should clear all values', async () => {
            await cache.set('key1', 'value1');
            await cache.set('key2', 'value2');
            
            await cache.clear();
            
            expect(await cache.get('key1')).toBe(null);
            expect(await cache.get('key2')).toBe(null);
        });
    });

    describe('TTL and Expiration', () => {
        it('should expire values after TTL', async () => {
            await cache.set('test-key', 'test-value', 0.1); // 100ms
            
            // Should exist immediately
            expect(await cache.get('test-key')).toBe('test-value');
            
            // Wait for expiration
            await testUtils.wait(150);
            
            // Should be expired
            expect(await cache.get('test-key')).toBe(null);
        });

        it('should use default TTL when not specified', async () => {
            await cache.set('test-key', 'test-value');
            const value = await cache.get('test-key');
            expect(value).toBe('test-value');
        });

        it('should update TTL when setting existing key', async () => {
            await cache.set('test-key', 'value1', 0.1);
            await cache.set('test-key', 'value2', 60); // Extend TTL
            
            await testUtils.wait(150);
            
            // Should still exist with new value
            expect(await cache.get('test-key')).toBe('value2');
        });
    });

    describe('Statistics', () => {
        it('should track cache hits and misses', async () => {
            await cache.set('test-key', 'test-value');
            
            // Hit
            await cache.get('test-key');
            
            // Miss
            await cache.get('non-existent');
            
            const stats = cache.getStats();
            expect(stats.hits).toBe(1);
            expect(stats.misses).toBe(1);
            expect(stats.sets).toBe(1);
            expect(stats.hitRate).toBe(0.5);
        });

        it('should track cache size', async () => {
            await cache.set('key1', 'value1');
            await cache.set('key2', 'value2');
            
            const stats = cache.getStats();
            expect(stats.size).toBe(2);
        });
    });

    describe('Data Types', () => {
        it('should handle different data types', async () => {
            const testData = {
                string: 'test',
                number: 42,
                boolean: true,
                object: { nested: 'value' },
                array: [1, 2, 3],
                null: null
            };
            
            for (const [key, value] of Object.entries(testData)) {
                await cache.set(key, value);
                const retrieved = await cache.get(key);
                expect(retrieved).toEqual(value);
            }
        });
    });
});

describe('RedisCache', () => {
    let cache;
    let mockClient;

    beforeEach(() => {
        const redis = require('redis');
        mockClient = {
            connect: jest.fn().mockResolvedValue(undefined),
            disconnect: jest.fn().mockResolvedValue(undefined),
            get: jest.fn(),
            setEx: jest.fn(),
            del: jest.fn(),
            exists: jest.fn(),
            flushDb: jest.fn(),
            on: jest.fn()
        };
        
        redis.createClient.mockReturnValue(mockClient);
        cache = new RedisCache('redis://localhost:6379');
    });

    describe('Connection Management', () => {
        it('should handle connection success', async () => {
            // Simulate successful connection
            const connectHandler = mockClient.on.mock.calls.find(call => call[0] === 'connect')[1];
            connectHandler();
            
            expect(cache.connected).toBe(true);
        });

        it('should handle connection errors', async () => {
            const errorHandler = mockClient.on.mock.calls.find(call => call[0] === 'error')[1];
            errorHandler(new Error('Connection failed'));
            
            expect(cache.connected).toBe(false);
        });
    });

    describe('Basic Operations', () => {
        beforeEach(() => {
            cache.connected = true;
        });

        it('should set and get values', async () => {
            const testValue = { test: 'data' };
            mockClient.get.mockResolvedValue(JSON.stringify(testValue));
            
            await cache.set('test-key', testValue, 60);
            const value = await cache.get('test-key');
            
            expect(mockClient.setEx).toHaveBeenCalledWith('test-key', 60, JSON.stringify(testValue));
            expect(value).toEqual(testValue);
        });

        it('should return null for non-existent keys', async () => {
            mockClient.get.mockResolvedValue(null);
            
            const value = await cache.get('non-existent');
            expect(value).toBe(null);
        });

        it('should delete values', async () => {
            mockClient.del.mockResolvedValue(1);
            
            const deleted = await cache.delete('test-key');
            expect(deleted).toBe(true);
            expect(mockClient.del).toHaveBeenCalledWith('test-key');
        });

        it('should check if key exists', async () => {
            mockClient.exists.mockResolvedValue(1);
            
            const exists = await cache.exists('test-key');
            expect(exists).toBe(true);
        });

        it('should clear all values', async () => {
            mockClient.flushDb.mockResolvedValue('OK');
            
            const cleared = await cache.clear();
            expect(cleared).toBe(true);
            expect(mockClient.flushDb).toHaveBeenCalled();
        });
    });

    describe('Error Handling', () => {
        beforeEach(() => {
            cache.connected = true;
        });

        it('should handle get errors gracefully', async () => {
            mockClient.get.mockRejectedValue(new Error('Redis error'));
            
            const value = await cache.get('test-key');
            expect(value).toBe(null);
        });

        it('should handle set errors gracefully', async () => {
            mockClient.setEx.mockRejectedValue(new Error('Redis error'));
            
            const result = await cache.set('test-key', 'value');
            expect(result).toBe(false);
        });

        it('should return false for operations when disconnected', async () => {
            cache.connected = false;
            
            expect(await cache.get('key')).toBe(null);
            expect(await cache.set('key', 'value')).toBe(false);
            expect(await cache.delete('key')).toBe(false);
            expect(await cache.exists('key')).toBe(false);
            expect(await cache.clear()).toBe(false);
        });
    });

    describe('Statistics', () => {
        beforeEach(() => {
            cache.connected = true;
        });

        it('should track operation statistics', async () => {
            mockClient.get.mockResolvedValue(JSON.stringify('value'));
            
            await cache.get('test-key'); // hit
            await cache.set('test-key', 'value');
            
            const stats = cache.getStats();
            expect(stats.hits).toBe(1);
            expect(stats.sets).toBe(1);
            expect(stats.connected).toBe(true);
        });
    });
});

describe('CacheService', () => {
    let service;
    let mockConfig;

    beforeEach(() => {
        // Mock config
        mockConfig = {
            getCacheConfig: jest.fn().mockReturnValue({
                enabled: true,
                ttl: 300,
                redisUrl: ''
            })
        };
        
        // Create service without Redis
        service = new CacheService();
    });

    describe('Key Generation', () => {
        it('should generate consistent cache keys', () => {
            const address = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
            
            expect(service.balanceKey('ethereum', address))
                .toBe('balance:ethereum:0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6');
            
            expect(service.nftKey('polygon', address))
                .toBe('nft:polygon:0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6');
            
            expect(service.portfolioKey(address))
                .toBe('portfolio:0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6');
            
            expect(service.historicalKey(address, 30))
                .toBe('historical:0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6:30');
        });

        it('should normalize addresses in keys', () => {
            const mixedCaseAddress = '0x742D35CC6634C0532925A3B8D4C9DB96C4B4D8B6';
            const key = service.balanceKey('ethereum', mixedCaseAddress);
            
            expect(key).toContain('0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6');
        });
    });

    describe('Cache Wrapper', () => {
        it('should execute function and cache result when cache miss', async () => {
            const mockFn = jest.fn().mockResolvedValue('function-result');
            const key = 'test-key';
            
            const result = await service.wrap(key, mockFn, 60);
            
            expect(mockFn).toHaveBeenCalled();
            expect(result).toBe('function-result');
            
            // Verify value was cached
            const cached = await service.get(key);
            expect(cached).toBe('function-result');
        });

        it('should return cached value without executing function on cache hit', async () => {
            const key = 'test-key';
            await service.set(key, 'cached-value');
            
            const mockFn = jest.fn().mockResolvedValue('function-result');
            const result = await service.wrap(key, mockFn);
            
            expect(mockFn).not.toHaveBeenCalled();
            expect(result).toBe('cached-value');
        });

        it('should propagate function errors', async () => {
            const error = new Error('Function error');
            const mockFn = jest.fn().mockRejectedValue(error);
            
            await expect(service.wrap('test-key', mockFn))
                .rejects.toThrow('Function error');
        });

        it('should not cache null or undefined results', async () => {
            const mockFn = jest.fn().mockResolvedValue(null);
            
            await service.wrap('test-key', mockFn);
            
            const cached = await service.get('test-key');
            expect(cached).toBe(null);
        });
    });

    describe('Health Check', () => {
        it('should perform health check on memory cache', async () => {
            const health = await service.healthCheck();
            
            expect(health).toHaveProperty('memory');
            expect(health).toHaveProperty('redis');
            expect(health.memory).toBe(true);
        });
    });

    describe('Statistics', () => {
        it('should aggregate statistics from all caches', async () => {
            await service.set('key1', 'value1');
            await service.get('key1'); // hit
            await service.get('key2'); // miss
            
            const stats = service.getStats();
            
            expect(stats).toHaveProperty('enabled');
            expect(stats).toHaveProperty('memory');
            expect(stats).toHaveProperty('combined');
            expect(stats.combined.hits).toBeGreaterThan(0);
            expect(stats.combined.misses).toBeGreaterThan(0);
        });
    });

    describe('Disabled Cache', () => {
        beforeEach(() => {
            service.enabled = false;
        });

        it('should bypass cache when disabled', async () => {
            const result = await service.get('any-key');
            expect(result).toBe(null);
            
            const setResult = await service.set('any-key', 'value');
            expect(setResult).toBe(false);
        });

        it('should execute function directly when cache is disabled', async () => {
            const mockFn = jest.fn().mockResolvedValue('direct-result');
            
            const result = await service.wrap('test-key', mockFn);
            
            expect(mockFn).toHaveBeenCalled();
            expect(result).toBe('direct-result');
        });
    });
});

describe('Cache Integration', () => {
    it('should handle concurrent operations safely', async () => {
        const cache = new MemoryCache();
        const promises = [];
        
        // Concurrent sets
        for (let i = 0; i < 10; i++) {
            promises.push(cache.set(`key-${i}`, `value-${i}`));
        }
        
        await Promise.all(promises);
        
        // Verify all values were set
        for (let i = 0; i < 10; i++) {
            const value = await cache.get(`key-${i}`);
            expect(value).toBe(`value-${i}`);
        }
    });

    it('should handle large data sets', async () => {
        const cache = new MemoryCache();
        const largeObject = {
            data: new Array(1000).fill(0).map((_, i) => ({ id: i, value: `item-${i}` }))
        };
        
        await cache.set('large-data', largeObject);
        const retrieved = await cache.get('large-data');
        
        expect(retrieved).toEqual(largeObject);
        expect(retrieved.data).toHaveLength(1000);
    });

    it('should cleanup expired entries automatically', async () => {
        const cache = new MemoryCache();
        
        // Set multiple keys with short TTL
        await cache.set('key1', 'value1', 0.05); // 50ms
        await cache.set('key2', 'value2', 0.05);
        await cache.set('key3', 'value3', 0.05);
        
        // Wait for expiration
        await testUtils.wait(100);
        
        // Trigger cleanup by accessing expired keys
        await cache.get('key1');
        await cache.get('key2');
        await cache.get('key3');
        
        const stats = cache.getStats();
        expect(stats.size).toBe(0);
    });
});