// Caching service with Redis and in-memory fallback
const { logger } = require('../utils/logger');
const { config } = require('../config');

// In-memory cache implementation
class MemoryCache {
    constructor() {
        this.cache = new Map();
        this.timers = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0
        };
    }

    async get(key) {
        const item = this.cache.get(key);
        if (item && item.expiry > Date.now()) {
            this.stats.hits++;
            logger.debug('Cache hit', { key, type: 'memory' });
            return item.value;
        }
        
        if (item) {
            // Expired item
            this.delete(key);
        }
        
        this.stats.misses++;
        logger.debug('Cache miss', { key, type: 'memory' });
        return null;
    }

    async set(key, value, ttlSeconds = 300) {
        const expiry = Date.now() + (ttlSeconds * 1000);
        
        // Clear existing timer
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
        }
        
        // Set new value
        this.cache.set(key, { value, expiry });
        
        // Set expiry timer (skip in test environment)
        if (process.env.NODE_ENV !== 'test') {
            const timer = setTimeout(() => {
                this.delete(key);
            }, ttlSeconds * 1000);
            
            this.timers.set(key, timer);
        }
        this.stats.sets++;
        
        logger.debug('Cache set', { key, ttl: ttlSeconds, type: 'memory' });
        return true;
    }

    async delete(key) {
        const deleted = this.cache.delete(key);
        
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
            this.timers.delete(key);
        }
        
        if (deleted) {
            this.stats.deletes++;
            logger.debug('Cache delete', { key, type: 'memory' });
        }
        
        return deleted;
    }

    async clear() {
        // Clear all timers
        for (const timer of this.timers.values()) {
            clearTimeout(timer);
        }
        
        this.cache.clear();
        this.timers.clear();
        
        logger.info('Memory cache cleared');
        return true;
    }

    async exists(key) {
        const item = this.cache.get(key);
        return item && item.expiry > Date.now();
    }

    getStats() {
        return {
            ...this.stats,
            size: this.cache.size,
            hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0
        };
    }
}

// Redis cache implementation
class RedisCache {
    constructor(redisUrl) {
        this.client = null;
        this.connected = false;
        this.redisUrl = redisUrl;
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            errors: 0
        };
        
        this.connect();
    }

    async connect() {
        try {
            // Dynamic import for Redis (optional dependency)
            const redis = require('redis');
            
            this.client = redis.createClient({
                url: this.redisUrl,
                retry_strategy: (options) => {
                    if (options.error && options.error.code === 'ECONNREFUSED') {
                        logger.error('Redis connection refused');
                        return new Error('Redis connection refused');
                    }
                    if (options.total_retry_time > 1000 * 60 * 60) {
                        logger.error('Redis retry time exhausted');
                        return new Error('Retry time exhausted');
                    }
                    if (options.attempt > 10) {
                        logger.error('Redis max retry attempts reached');
                        return undefined;
                    }
                    return Math.min(options.attempt * 100, 3000);
                }
            });

            this.client.on('error', (err) => {
                logger.error('Redis error', { error: err.message });
                this.stats.errors++;
                this.connected = false;
            });

            this.client.on('connect', () => {
                logger.info('Redis connected');
                this.connected = true;
            });

            this.client.on('disconnect', () => {
                logger.warn('Redis disconnected');
                this.connected = false;
            });

            await this.client.connect();
        } catch (error) {
            logger.error('Failed to initialize Redis', { error: error.message });
            this.connected = false;
        }
    }

    async get(key) {
        if (!this.connected || !this.client) {
            return null;
        }

        try {
            const value = await this.client.get(key);
            if (value) {
                this.stats.hits++;
                logger.debug('Cache hit', { key, type: 'redis' });
                return JSON.parse(value);
            }
            
            this.stats.misses++;
            logger.debug('Cache miss', { key, type: 'redis' });
            return null;
        } catch (error) {
            logger.error('Redis get error', { key, error: error.message });
            this.stats.errors++;
            return null;
        }
    }

    async set(key, value, ttlSeconds = 300) {
        if (!this.connected || !this.client) {
            return false;
        }

        try {
            const serialized = JSON.stringify(value);
            await this.client.setEx(key, ttlSeconds, serialized);
            this.stats.sets++;
            logger.debug('Cache set', { key, ttl: ttlSeconds, type: 'redis' });
            return true;
        } catch (error) {
            logger.error('Redis set error', { key, error: error.message });
            this.stats.errors++;
            return false;
        }
    }

    async delete(key) {
        if (!this.connected || !this.client) {
            return false;
        }

        try {
            const result = await this.client.del(key);
            if (result > 0) {
                this.stats.deletes++;
                logger.debug('Cache delete', { key, type: 'redis' });
            }
            return result > 0;
        } catch (error) {
            logger.error('Redis delete error', { key, error: error.message });
            this.stats.errors++;
            return false;
        }
    }

    async clear() {
        if (!this.connected || !this.client) {
            return false;
        }

        try {
            await this.client.flushDb();
            logger.info('Redis cache cleared');
            return true;
        } catch (error) {
            logger.error('Redis clear error', { error: error.message });
            this.stats.errors++;
            return false;
        }
    }

    async exists(key) {
        if (!this.connected || !this.client) {
            return false;
        }

        try {
            const result = await this.client.exists(key);
            return result === 1;
        } catch (error) {
            logger.error('Redis exists error', { key, error: error.message });
            this.stats.errors++;
            return false;
        }
    }

    getStats() {
        return {
            ...this.stats,
            connected: this.connected,
            hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) || 0
        };
    }

    async disconnect() {
        if (this.client) {
            await this.client.disconnect();
            this.connected = false;
        }
    }
}

// Main cache service
class CacheService {
    constructor() {
        this.memoryCache = new MemoryCache();
        this.redisCache = null;
        this.enabled = config.getCacheConfig().enabled;
        this.defaultTtl = config.getCacheConfig().ttl;
        
        // Initialize Redis if URL is provided
        const redisUrl = config.getCacheConfig().redisUrl;
        if (redisUrl && this.enabled) {
            this.redisCache = new RedisCache(redisUrl);
        }
        
        logger.info('Cache service initialized', {
            enabled: this.enabled,
            redis: !!this.redisCache,
            defaultTtl: this.defaultTtl
        });
    }

    async get(key) {
        if (!this.enabled) {
            return null;
        }

        // Try Redis first, then memory cache
        if (this.redisCache) {
            const value = await this.redisCache.get(key);
            if (value !== null) {
                // Also store in memory cache for faster access
                await this.memoryCache.set(key, value, Math.min(this.defaultTtl, 60));
                return value;
            }
        }

        return await this.memoryCache.get(key);
    }

    async set(key, value, ttlSeconds = null) {
        if (!this.enabled) {
            return false;
        }

        const ttl = ttlSeconds || this.defaultTtl;
        let success = false;

        // Set in both caches
        if (this.redisCache) {
            success = await this.redisCache.set(key, value, ttl) || success;
        }
        
        success = await this.memoryCache.set(key, value, Math.min(ttl, 300)) || success;
        
        return success;
    }

    async delete(key) {
        if (!this.enabled) {
            return false;
        }

        let success = false;
        
        if (this.redisCache) {
            success = await this.redisCache.delete(key) || success;
        }
        
        success = await this.memoryCache.delete(key) || success;
        
        return success;
    }

    async clear() {
        if (!this.enabled) {
            return false;
        }

        let success = false;
        
        if (this.redisCache) {
            success = await this.redisCache.clear() || success;
        }
        
        success = await this.memoryCache.clear() || success;
        
        return success;
    }

    async exists(key) {
        if (!this.enabled) {
            return false;
        }

        if (this.redisCache && await this.redisCache.exists(key)) {
            return true;
        }
        
        return await this.memoryCache.exists(key);
    }

    // Cache key generators
    generateKey(prefix, ...parts) {
        return `${prefix}:${parts.join(':')}`;
    }

    // Specific cache key generators for different data types
    balanceKey(chain, address) {
        return this.generateKey('balance', chain, address.toLowerCase());
    }

    nftKey(chain, address) {
        return this.generateKey('nft', chain, address.toLowerCase());
    }

    transactionKey(chain, address, page = 1) {
        return this.generateKey('tx', chain, address.toLowerCase(), page);
    }

    portfolioKey(address) {
        return this.generateKey('portfolio', address.toLowerCase());
    }

    historicalKey(address, days = 30) {
        return this.generateKey('historical', address.toLowerCase(), days);
    }

    marketKey() {
        return this.generateKey('market', 'conditions');
    }

    insightsKey(address) {
        return this.generateKey('insights', address.toLowerCase());
    }

    // Cache wrapper for functions
    async wrap(key, fn, ttlSeconds = null) {
        if (!this.enabled) {
            return await fn();
        }

        // Try to get from cache first
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }

        // Execute function and cache result
        try {
            const result = await fn();
            if (result !== null && result !== undefined) {
                await this.set(key, result, ttlSeconds);
            }
            return result;
        } catch (error) {
            logger.error('Cache wrap function error', { key, error: error.message });
            throw error;
        }
    }

    // Get cache statistics
    getStats() {
        const memoryStats = this.memoryCache.getStats();
        const redisStats = this.redisCache ? this.redisCache.getStats() : null;
        
        return {
            enabled: this.enabled,
            memory: memoryStats,
            redis: redisStats,
            combined: {
                hits: memoryStats.hits + (redisStats?.hits || 0),
                misses: memoryStats.misses + (redisStats?.misses || 0),
                sets: memoryStats.sets + (redisStats?.sets || 0),
                deletes: memoryStats.deletes + (redisStats?.deletes || 0)
            }
        };
    }

    // Health check
    async healthCheck() {
        const health = {
            memory: true,
            redis: false
        };

        try {
            // Test memory cache
            const testKey = 'health:test';
            await this.memoryCache.set(testKey, 'test', 1);
            const value = await this.memoryCache.get(testKey);
            health.memory = value === 'test';
            await this.memoryCache.delete(testKey);
        } catch (error) {
            health.memory = false;
        }

        if (this.redisCache) {
            try {
                const testKey = 'health:test';
                await this.redisCache.set(testKey, 'test', 1);
                const value = await this.redisCache.get(testKey);
                health.redis = value === 'test';
                await this.redisCache.delete(testKey);
            } catch (error) {
                health.redis = false;
            }
        }

        return health;
    }

    async shutdown() {
        if (this.redisCache) {
            await this.redisCache.disconnect();
        }
        await this.memoryCache.clear();
        logger.info('Cache service shutdown complete');
    }
}

// Create singleton instance
const cacheService = new CacheService();

module.exports = {
    cacheService,
    CacheService,
    MemoryCache,
    RedisCache
};