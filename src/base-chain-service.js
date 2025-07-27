/**
 * BaseChainService - Abstract base class for all blockchain services
 * Provides common functionality for HTTP requests and error handling
 */

import https from 'https';
import http from 'http';

class BaseChainService {
    constructor(chainName) {
        this.chainName = chainName;
        this.timeout = 5000; // 5 second timeout
        this.https = https;
        this.http = http;
    }

    /**
     * Make HTTP request with timeout and error handling
     * @param {string} url - Request URL
     * @param {Object} options - Request options
     * @returns {Promise<Object>} - Response data
     */
    async makeRequest(url, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error(`Request timeout after ${this.timeout}ms`);
            }
            throw error;
        }
    }

    /**
     * Validate address format (to be implemented by subclasses)
     * @param {string} address - Address to validate
     * @returns {boolean} - Whether address is valid
     */
    validateAddress(address) {
        throw new Error('validateAddress must be implemented by subclass');
    }

    /**
     * Get health status (to be implemented by subclasses)
     * @returns {Promise<Object>} - Health status
     */
    async getHealthStatus() {
        return {
            status: 'unknown',
            chain: this.chainName,
            timestamp: new Date().toISOString()
        };
    }
}

export default BaseChainService;