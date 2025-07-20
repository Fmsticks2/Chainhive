// Structured logging utility with correlation IDs and multiple log levels
const crypto = require('crypto');

class Logger {
    constructor(options = {}) {
        this.serviceName = options.serviceName || 'chainhive-api';
        this.environment = process.env.NODE_ENV || 'development';
        this.logLevel = this.getLogLevel(options.level || process.env.LOG_LEVEL || 'info');
    }

    getLogLevel(level) {
        const levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3,
            trace: 4
        };
        return levels[level.toLowerCase()] || 2;
    }

    shouldLog(level) {
        const levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3,
            trace: 4
        };
        return levels[level] <= this.logLevel;
    }

    formatLog(level, message, meta = {}) {
        const timestamp = new Date().toISOString();
        const correlationId = meta.correlationId || this.generateCorrelationId();
        
        const logEntry = {
            timestamp,
            level: level.toUpperCase(),
            service: this.serviceName,
            environment: this.environment,
            correlationId,
            message,
            ...meta
        };

        // Remove correlationId from meta to avoid duplication
        delete logEntry.correlationId;
        logEntry.correlationId = correlationId;

        return this.environment === 'production' 
            ? JSON.stringify(logEntry)
            : this.formatForDevelopment(logEntry);
    }

    formatForDevelopment(logEntry) {
        const { timestamp, level, correlationId, message, ...meta } = logEntry;
        const time = new Date(timestamp).toLocaleTimeString();
        const metaStr = Object.keys(meta).length > 0 ? `\n${JSON.stringify(meta, null, 2)}` : '';
        
        return `[${time}] ${level} [${correlationId.slice(0, 8)}] ${message}${metaStr}`;
    }

    generateCorrelationId() {
        return crypto.randomUUID();
    }

    error(message, meta = {}) {
        if (this.shouldLog('error')) {
            console.error(this.formatLog('error', message, meta));
        }
    }

    warn(message, meta = {}) {
        if (this.shouldLog('warn')) {
            console.warn(this.formatLog('warn', message, meta));
        }
    }

    info(message, meta = {}) {
        if (this.shouldLog('info')) {
            console.info(this.formatLog('info', message, meta));
        }
    }

    debug(message, meta = {}) {
        if (this.shouldLog('debug')) {
            console.debug(this.formatLog('debug', message, meta));
        }
    }

    trace(message, meta = {}) {
        if (this.shouldLog('trace')) {
            console.trace(this.formatLog('trace', message, meta));
        }
    }

    // API request logging
    logRequest(req, res, next) {
        const correlationId = req.headers['x-correlation-id'] || this.generateCorrelationId();
        req.correlationId = correlationId;
        res.setHeader('x-correlation-id', correlationId);

        const startTime = Date.now();
        
        this.info('API Request', {
            correlationId,
            method: req.method,
            url: req.url,
            userAgent: req.get('User-Agent'),
            ip: req.ip || req.connection.remoteAddress,
            timestamp: new Date().toISOString()
        });

        // Log response when finished
        const originalSend = res.send;
        res.send = function(data) {
            const duration = Date.now() - startTime;
            
            logger.info('API Response', {
                correlationId,
                method: req.method,
                url: req.url,
                statusCode: res.statusCode,
                duration: `${duration}ms`,
                responseSize: Buffer.byteLength(data || '', 'utf8'),
                timestamp: new Date().toISOString()
            });

            originalSend.call(this, data);
        };

        next();
    }

    // Performance logging
    logPerformance(operation, duration, meta = {}) {
        this.info('Performance Metric', {
            operation,
            duration: `${duration}ms`,
            ...meta
        });
    }

    // Database operation logging
    logDatabaseOperation(operation, table, duration, meta = {}) {
        this.debug('Database Operation', {
            operation,
            table,
            duration: `${duration}ms`,
            ...meta
        });
    }

    // External API call logging
    logExternalAPI(service, endpoint, method, statusCode, duration, meta = {}) {
        this.info('External API Call', {
            service,
            endpoint,
            method,
            statusCode,
            duration: `${duration}ms`,
            ...meta
        });
    }

    // Blockchain operation logging
    logBlockchainOperation(chain, operation, txHash, duration, meta = {}) {
        this.info('Blockchain Operation', {
            chain,
            operation,
            txHash,
            duration: `${duration}ms`,
            ...meta
        });
    }
}

// Create singleton logger instance
const logger = new Logger();

// Performance measurement utility
function measurePerformance(operation, fn, meta = {}) {
    return async (...args) => {
        const startTime = Date.now();
        try {
            const result = await fn(...args);
            const duration = Date.now() - startTime;
            logger.logPerformance(operation, duration, { ...meta, success: true });
            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            logger.logPerformance(operation, duration, { ...meta, success: false, error: error.message });
            throw error;
        }
    };
}

// Request correlation middleware
function correlationMiddleware(req, res, next) {
    return logger.logRequest(req, res, next);
}

module.exports = {
    Logger,
    logger,
    measurePerformance,
    correlationMiddleware
};