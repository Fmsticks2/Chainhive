// Health check service for monitoring system status
const { logger } = require('../utils/logger');
const { config } = require('../config');
const { cacheService } = require('./cache');

class HealthCheckService {
    constructor() {
        this.checks = new Map();
        this.lastResults = new Map();
        this.isRunning = false;
        this.interval = null;
        
        this.registerDefaultChecks();
    }

    registerDefaultChecks() {
        // Register built-in health checks
        this.registerCheck('memory', this.checkMemoryUsage.bind(this));
        this.registerCheck('cache', this.checkCache.bind(this));
        this.registerCheck('nodit_api', this.checkNoditAPI.bind(this));
        this.registerCheck('disk_space', this.checkDiskSpace.bind(this));
        this.registerCheck('environment', this.checkEnvironment.bind(this));
    }

    registerCheck(name, checkFunction, options = {}) {
        this.checks.set(name, {
            fn: checkFunction,
            timeout: options.timeout || 5000,
            critical: options.critical || false,
            enabled: options.enabled !== false
        });
        
        logger.debug('Health check registered', { name, critical: options.critical });
    }

    async runCheck(name) {
        const check = this.checks.get(name);
        if (!check || !check.enabled) {
            return {
                name,
                status: 'disabled',
                timestamp: new Date().toISOString()
            };
        }

        const startTime = Date.now();
        let result;

        try {
            // Run check with timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Health check timeout')), check.timeout);
            });

            const checkResult = await Promise.race([
                check.fn(),
                timeoutPromise
            ]);

            result = {
                name,
                status: 'healthy',
                duration: Date.now() - startTime,
                timestamp: new Date().toISOString(),
                data: checkResult || {},
                critical: check.critical
            };
        } catch (error) {
            result = {
                name,
                status: 'unhealthy',
                duration: Date.now() - startTime,
                timestamp: new Date().toISOString(),
                error: error.message,
                critical: check.critical
            };

            if (check.critical) {
                logger.error('Critical health check failed', { name, error: error.message });
            } else {
                logger.warn('Health check failed', { name, error: error.message });
            }
        }

        this.lastResults.set(name, result);
        return result;
    }

    async runAllChecks() {
        const results = [];
        const promises = [];

        for (const [name] of this.checks) {
            promises.push(this.runCheck(name));
        }

        const checkResults = await Promise.allSettled(promises);
        
        for (const result of checkResults) {
            if (result.status === 'fulfilled') {
                results.push(result.value);
            } else {
                results.push({
                    name: 'unknown',
                    status: 'error',
                    error: result.reason?.message || 'Unknown error',
                    timestamp: new Date().toISOString()
                });
            }
        }

        return results;
    }

    async getHealthStatus() {
        const checks = await this.runAllChecks();
        const healthy = checks.filter(c => c.status === 'healthy').length;
        const unhealthy = checks.filter(c => c.status === 'unhealthy').length;
        const criticalFailed = checks.filter(c => c.status === 'unhealthy' && c.critical).length;
        
        const overallStatus = criticalFailed > 0 ? 'critical' : 
                             unhealthy > 0 ? 'degraded' : 'healthy';

        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            summary: {
                total: checks.length,
                healthy,
                unhealthy,
                critical_failed: criticalFailed
            },
            checks,
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0'
        };
    }

    // Individual health check implementations
    async checkMemoryUsage() {
        const usage = process.memoryUsage();
        const totalMB = Math.round(usage.heapTotal / 1024 / 1024);
        const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
        const externalMB = Math.round(usage.external / 1024 / 1024);
        const usagePercent = Math.round((usage.heapUsed / usage.heapTotal) * 100);

        // Consider unhealthy if memory usage > 90%
        if (usagePercent > 90) {
            throw new Error(`High memory usage: ${usagePercent}%`);
        }

        return {
            heap_total_mb: totalMB,
            heap_used_mb: usedMB,
            external_mb: externalMB,
            usage_percent: usagePercent
        };
    }

    async checkCache() {
        const health = await cacheService.healthCheck();
        const stats = cacheService.getStats();

        if (!health.memory) {
            throw new Error('Memory cache is not working');
        }

        return {
            memory_cache: health.memory,
            redis_cache: health.redis,
            stats: stats.combined
        };
    }

    async checkNoditAPI() {
        const axios = require('axios');
        const blockchainConfig = config.getBlockchainConfig();
        
        try {
            const response = await axios.get(`${blockchainConfig.noditBaseUrl}/health`, {
                timeout: 5000,
                headers: {
                    'X-API-Key': blockchainConfig.noditApiKey
                }
            });

            return {
                status_code: response.status,
                response_time: response.headers['x-response-time'] || 'unknown'
            };
        } catch (error) {
            if (error.response) {
                throw new Error(`Nodit API returned ${error.response.status}`);
            } else if (error.code === 'ECONNREFUSED') {
                throw new Error('Cannot connect to Nodit API');
            } else {
                throw new Error(`Nodit API error: ${error.message}`);
            }
        }
    }

    async checkDiskSpace() {
        try {
            const fs = require('fs').promises;
            const stats = await fs.stat(process.cwd());
            
            // This is a basic check - in production you might want to use a library
            // like 'check-disk-space' for more accurate disk space monitoring
            return {
                available: true,
                path: process.cwd(),
                accessible: true
            };
        } catch (error) {
            throw new Error(`Disk access error: ${error.message}`);
        }
    }

    async checkEnvironment() {
        const requiredEnvVars = ['NODIT_API_KEY'];
        const missing = [];
        const present = [];

        for (const envVar of requiredEnvVars) {
            if (process.env[envVar]) {
                present.push(envVar);
            } else {
                missing.push(envVar);
            }
        }

        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }

        return {
            node_version: process.version,
            platform: process.platform,
            arch: process.arch,
            env: config.get('NODE_ENV'),
            required_vars_present: present.length,
            missing_vars: missing.length
        };
    }

    // Continuous monitoring
    startMonitoring(intervalMs = null) {
        if (this.isRunning) {
            logger.warn('Health monitoring is already running');
            return;
        }

        const interval = intervalMs || config.getMonitoringConfig().healthCheckInterval;
        
        this.interval = setInterval(async () => {
            try {
                const status = await this.getHealthStatus();
                
                if (status.status === 'critical') {
                    logger.error('System health is critical', {
                        failed_checks: status.checks.filter(c => c.status === 'unhealthy' && c.critical)
                    });
                } else if (status.status === 'degraded') {
                    logger.warn('System health is degraded', {
                        failed_checks: status.checks.filter(c => c.status === 'unhealthy')
                    });
                }
            } catch (error) {
                logger.error('Health monitoring error', { error: error.message });
            }
        }, interval);

        this.isRunning = true;
        logger.info('Health monitoring started', { interval });
    }

    stopMonitoring() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
        logger.info('Health monitoring stopped');
    }

    // Get last known results without running checks
    getLastResults() {
        const results = [];
        for (const [name, result] of this.lastResults) {
            results.push(result);
        }
        return results;
    }

    // Express middleware for health endpoint
    middleware() {
        return async (req, res) => {
            try {
                const detailed = req.query.detailed === 'true';
                
                if (detailed) {
                    const status = await this.getHealthStatus();
                    res.status(status.status === 'healthy' ? 200 : 
                              status.status === 'degraded' ? 200 : 503)
                       .json(status);
                } else {
                    // Quick health check using last known results
                    const lastResults = this.getLastResults();
                    const criticalFailed = lastResults.filter(r => r.status === 'unhealthy' && r.critical).length;
                    
                    const status = {
                        status: criticalFailed > 0 ? 'critical' : 'healthy',
                        timestamp: new Date().toISOString(),
                        uptime: process.uptime()
                    };
                    
                    res.status(status.status === 'healthy' ? 200 : 503).json(status);
                }
            } catch (error) {
                logger.error('Health check endpoint error', { error: error.message });
                res.status(500).json({
                    status: 'error',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
            }
        };
    }

    // Readiness check (for Kubernetes)
    async readinessCheck() {
        const criticalChecks = ['environment', 'nodit_api'];
        const results = [];
        
        for (const checkName of criticalChecks) {
            const result = await this.runCheck(checkName);
            results.push(result);
        }
        
        const failed = results.filter(r => r.status === 'unhealthy');
        
        return {
            ready: failed.length === 0,
            checks: results,
            timestamp: new Date().toISOString()
        };
    }

    // Liveness check (for Kubernetes)
    async livenessCheck() {
        // Simple check to ensure the process is responsive
        return {
            alive: true,
            uptime: process.uptime(),
            memory_usage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
            timestamp: new Date().toISOString()
        };
    }
}

// Create singleton instance
const healthService = new HealthCheckService();

// Start monitoring in production
if (config.isProduction()) {
    healthService.startMonitoring();
}

module.exports = {
    healthService,
    HealthCheckService
};