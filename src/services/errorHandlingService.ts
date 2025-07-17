/**
 * Enhanced Error Handling and Retry Logic Service
 * Implements resilient RPC provider with retry mechanisms
 */

export interface RetryConfig {
  maxRetries: number;
  backoffMs: number;
  timeoutMs: number;
  exponentialBackoff: boolean;
}

export interface RPCError {
  code: number;
  message: string;
  data?: any;
  isRetryable: boolean;
}

export class ResilientRPCProvider {
  private retryConfig: RetryConfig = {
    maxRetries: 3,
    backoffMs: 1000,
    timeoutMs: 30000,
    exponentialBackoff: true
  };

  private logger = console; // Can be replaced with structured logger

  constructor(config?: Partial<RetryConfig>) {
    if (config) {
      this.retryConfig = { ...this.retryConfig, ...config };
    }
  }

  /**
   * Execute operation with retry logic and timeout handling
   */
  async callWithRetry<T>(
    operation: () => Promise<T>,
    context: string = 'RPC Call'
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        this.logger.debug(`${context} - Attempt ${attempt}/${this.retryConfig.maxRetries}`);
        
        const result = await Promise.race([
          operation(),
          this.createTimeoutPromise()
        ]);
        
        if (attempt > 1) {
          this.logger.info(`${context} - Succeeded on attempt ${attempt}`);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        const rpcError = this.parseRPCError(error);
        
        this.logger.warn(`${context} - Attempt ${attempt} failed:`, {
          error: rpcError.message,
          code: rpcError.code,
          isRetryable: rpcError.isRetryable
        });

        // Don't retry if error is not retryable or this is the last attempt
        if (!rpcError.isRetryable || attempt === this.retryConfig.maxRetries) {
          break;
        }

        // Wait before retry with exponential backoff
        const delay = this.calculateDelay(attempt);
        this.logger.debug(`${context} - Waiting ${delay}ms before retry`);
        await this.delay(delay);
      }
    }

    this.logger.error(`${context} - All retry attempts failed`, { error: lastError.message });
    throw lastError;
  }

  /**
   * Create multiple providers with fallback logic
   */
  async callWithFallback<T>(
    providers: Array<() => Promise<T>>,
    context: string = 'Multi-Provider Call'
  ): Promise<T> {
    let lastError: Error;

    for (let i = 0; i < providers.length; i++) {
      try {
        this.logger.debug(`${context} - Trying provider ${i + 1}/${providers.length}`);
        return await this.callWithRetry(providers[i], `${context} (Provider ${i + 1})`);
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`${context} - Provider ${i + 1} failed:`, { error: lastError.message });
      }
    }

    this.logger.error(`${context} - All providers failed`, { error: lastError!.message });
    throw lastError!;
  }

  /**
   * Parse RPC error to determine if it's retryable
   */
  private parseRPCError(error: any): RPCError {
    const message = error.message || error.toString();
    const code = error.code || -1;
    
    // Determine if error is retryable based on common patterns
    const isRetryable = this.isRetryableError(error);

    return {
      code,
      message,
      data: error.data,
      isRetryable
    };
  }

  /**
   * Determine if an error should trigger a retry
   */
  private isRetryableError(error: any): boolean {
    const message = error.message?.toLowerCase() || '';
    const code = error.code;

    // Network-related errors (retryable)
    const networkErrors = [
      'network error',
      'timeout',
      'enotfound',
      'econnreset',
      'econnrefused',
      'socket hang up',
      'request timeout',
      'connection timeout',
      'too many requests',
      'rate limit',
      'service unavailable',
      'bad gateway',
      'gateway timeout'
    ];

    // HTTP status codes that are retryable
    const retryableHttpCodes = [408, 429, 500, 502, 503, 504];

    // RPC error codes that are retryable
    const retryableRpcCodes = [-32603, -32002, -32005]; // Internal error, resource unavailable, limit exceeded

    // Check message patterns
    if (networkErrors.some(pattern => message.includes(pattern))) {
      return true;
    }

    // Check HTTP status codes
    if (retryableHttpCodes.includes(code)) {
      return true;
    }

    // Check RPC error codes
    if (retryableRpcCodes.includes(code)) {
      return true;
    }

    // Non-retryable errors
    const nonRetryablePatterns = [
      'invalid api key',
      'unauthorized',
      'forbidden',
      'not found',
      'method not found',
      'invalid params',
      'parse error',
      'invalid request'
    ];

    if (nonRetryablePatterns.some(pattern => message.includes(pattern))) {
      return false;
    }

    // Default to retryable for unknown errors
    return true;
  }

  /**
   * Calculate delay with exponential backoff
   */
  private calculateDelay(attempt: number): number {
    if (!this.retryConfig.exponentialBackoff) {
      return this.retryConfig.backoffMs;
    }

    // Exponential backoff with jitter
    const exponentialDelay = this.retryConfig.backoffMs * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
    return Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
  }

  /**
   * Create a timeout promise
   */
  private createTimeoutPromise<T>(): Promise<T> {
    return new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error(`Operation timed out after ${this.retryConfig.timeoutMs}ms`)),
        this.retryConfig.timeoutMs
      );
    });
  }

  /**
   * Delay utility
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Circuit breaker pattern for failing endpoints
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private failureThreshold = 5,
    private recoveryTimeMs = 60000 // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeMs) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  getState(): string {
    return this.state;
  }
}

/**
 * Enhanced logger for structured logging
 */
export class StructuredLogger {
  private logLevel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' = 'INFO';

  constructor(level?: string) {
    if (level) {
      this.logLevel = level.toUpperCase() as any;
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('DEBUG')) {
      this.log('DEBUG', message, context);
    }
  }

  info(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('INFO')) {
      this.log('INFO', message, context);
    }
  }

  warn(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('WARN')) {
      this.log('WARN', message, context);
    }
  }

  error(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('ERROR')) {
      this.log('ERROR', message, context);
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  private log(level: string, message: string, context?: Record<string, any>): void {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context
    };
    console.log(JSON.stringify(entry));
  }
}