#!/usr/bin/env node

/**
 * Docker Health Check Script
 * 
 * This script performs a basic health check for the ChainHive application
 * by making an HTTP request to the health endpoint.
 */

const http = require('http');
const { URL } = require('url');

// Configuration
const config = {
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 3000,
  path: '/api/health',
  timeout: 5000, // 5 seconds
};

/**
 * Perform health check
 */
function healthCheck() {
  return new Promise((resolve, reject) => {
    const url = new URL(`http://${config.host}:${config.port}${config.path}`);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'GET',
      timeout: config.timeout,
      headers: {
        'User-Agent': 'Docker-HealthCheck/1.0',
        'Accept': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200 && response.status === 'healthy') {
            resolve({
              status: 'healthy',
              statusCode: res.statusCode,
              response,
            });
          } else {
            reject(new Error(`Health check failed: ${res.statusCode} - ${response.status || 'unknown'}`));
          }
        } catch (error) {
          reject(new Error(`Invalid JSON response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Health check request failed: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Health check timed out after ${config.timeout}ms`));
    });

    req.setTimeout(config.timeout);
    req.end();
  });
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log(`Performing health check on ${config.host}:${config.port}${config.path}`);
    
    const result = await healthCheck();
    
    console.log('✅ Health check passed:', {
      status: result.status,
      statusCode: result.statusCode,
      timestamp: new Date().toISOString(),
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Health check failed:', {
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception during health check:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled rejection during health check:', reason);
  process.exit(1);
});

// Run health check
if (require.main === module) {
  main();
}

module.exports = { healthCheck, config };