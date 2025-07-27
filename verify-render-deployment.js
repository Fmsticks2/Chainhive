#!/usr/bin/env node

/**
 * Render Deployment Verification Script
 * Helps debug and verify the deployment environment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DeploymentVerifier {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.info = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const formattedMessage = `[${timestamp}] ${message}`;
    
    switch (type) {
      case 'error':
        console.error(`❌ ${formattedMessage}`);
        this.errors.push(message);
        break;
      case 'warning':
        console.warn(`⚠️ ${formattedMessage}`);
        this.warnings.push(message);
        break;
      case 'success':
        console.log(`✅ ${formattedMessage}`);
        this.info.push(message);
        break;
      default:
        console.log(`📋 ${formattedMessage}`);
        this.info.push(message);
    }
  }

  /**
   * Check environment variables
   */
  checkEnvironment() {
    this.log('Checking environment variables...', 'info');
    
    const requiredEnvVars = ['NODE_ENV', 'PORT'];
    const optionalEnvVars = ['NODIT_API_KEY', 'RENDER'];
    
    // Check required variables
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        this.log(`${envVar}: ${process.env[envVar]}`, 'success');
      } else {
        this.log(`Missing required environment variable: ${envVar}`, 'error');
      }
    }
    
    // Check optional variables
    for (const envVar of optionalEnvVars) {
      if (process.env[envVar]) {
        const value = envVar === 'NODIT_API_KEY' ? '[REDACTED]' : process.env[envVar];
        this.log(`${envVar}: ${value}`, 'success');
      } else {
        this.log(`Optional environment variable not set: ${envVar}`, 'warning');
      }
    }
  }

  /**
   * Check file system paths
   */
  checkPaths() {
    this.log('Checking file system paths...', 'info');
    
    // Current working directory
    this.log(`Current working directory: ${process.cwd()}`, 'info');
    this.log(`Script directory: ${__dirname}`, 'info');
    
    // Check critical files
    const criticalFiles = [
      'package.json',
      'api/server.js',
      'src/mcp-service.js',
      'src/multi-chain-service.js'
    ];
    
    for (const file of criticalFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        this.log(`Found: ${file}`, 'success');
      } else {
        this.log(`Missing critical file: ${file}`, 'error');
      }
    }
  }

  /**
   * Check MCP server installation
   */
  checkMcpServer() {
    this.log('Checking MCP server installation...', 'info');
    
    const mcpPaths = [
      'node_modules/@noditlabs/nodit-mcp-server/package.json',
      'node_modules/@noditlabs/nodit-mcp-server/dist/index.js',
      '/opt/render/project/src/node_modules/@noditlabs/nodit-mcp-server/dist/index.js'
    ];
    
    let mcpFound = false;
    for (const mcpPath of mcpPaths) {
      const fullPath = path.isAbsolute(mcpPath) ? mcpPath : path.join(process.cwd(), mcpPath);
      if (fs.existsSync(fullPath)) {
        this.log(`MCP server found at: ${fullPath}`, 'success');
        mcpFound = true;
        
        // Try to read package.json for version info
        if (mcpPath.endsWith('package.json')) {
          try {
            const packageInfo = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
            this.log(`MCP server version: ${packageInfo.version}`, 'info');
          } catch (error) {
            this.log(`Could not read MCP package info: ${error.message}`, 'warning');
          }
        }
      }
    }
    
    if (!mcpFound) {
      this.log('MCP server not found in any expected location', 'error');
    }
    
    // Try require.resolve
    try {
      const resolvedPath = require.resolve('@noditlabs/nodit-mcp-server');
      this.log(`MCP server resolved to: ${resolvedPath}`, 'success');
    } catch (error) {
      this.log(`Could not resolve MCP server module: ${error.message}`, 'warning');
    }
  }

  /**
   * Check Node.js and npm versions
   */
  checkVersions() {
    this.log('Checking Node.js and npm versions...', 'info');
    
    this.log(`Node.js version: ${process.version}`, 'info');
    this.log(`Platform: ${process.platform}`, 'info');
    this.log(`Architecture: ${process.arch}`, 'info');
    
    // Check if we're in Render environment
    const isRender = process.env.RENDER === 'true' || process.env.NODE_ENV === 'production';
    this.log(`Render environment detected: ${isRender}`, isRender ? 'success' : 'info');
  }

  /**
   * Test MCP server startup
   */
  async testMcpStartup() {
    this.log('Testing MCP server startup...', 'info');
    
    try {
      const NoditMCPService = (await import('./src/mcp-service.js')).default;
      const mcpService = new NoditMCPService();
      
      this.log('MCP service instance created successfully', 'success');
      
      // Test path resolution
      const mcpPath = mcpService.resolveMcpPath();
      if (mcpPath) {
        this.log(`MCP server path resolved: ${mcpPath}`, 'success');
      } else {
        this.log('MCP server path could not be resolved', 'warning');
      }
      
      this.log('MCP service test completed', 'success');
    } catch (error) {
      this.log(`MCP service test failed: ${error.message}`, 'error');
    }
  }

  /**
   * Generate summary report
   */
  generateReport() {
    this.log('\n=== DEPLOYMENT VERIFICATION SUMMARY ===', 'info');
    this.log(`Errors: ${this.errors.length}`, this.errors.length > 0 ? 'error' : 'success');
    this.log(`Warnings: ${this.warnings.length}`, this.warnings.length > 0 ? 'warning' : 'success');
    this.log(`Info messages: ${this.info.length}`, 'info');
    
    if (this.errors.length > 0) {
      this.log('\n=== ERRORS TO FIX ===', 'error');
      this.errors.forEach((error, index) => {
        this.log(`${index + 1}. ${error}`, 'error');
      });
    }
    
    if (this.warnings.length > 0) {
      this.log('\n=== WARNINGS TO REVIEW ===', 'warning');
      this.warnings.forEach((warning, index) => {
        this.log(`${index + 1}. ${warning}`, 'warning');
      });
    }
    
    const status = this.errors.length === 0 ? 'READY' : 'NEEDS ATTENTION';
    this.log(`\nDeployment status: ${status}`, this.errors.length === 0 ? 'success' : 'error');
  }

  /**
   * Run all verification checks
   */
  async runAll() {
    this.log('🚀 Starting deployment verification...', 'info');
    
    this.checkVersions();
    this.checkEnvironment();
    this.checkPaths();
    this.checkMcpServer();
    await this.testMcpStartup();
    this.generateReport();
    
    this.log('✅ Deployment verification completed', 'success');
  }
}

// Run verification
const verifier = new DeploymentVerifier();
verifier.runAll().catch(error => {
  console.error('❌ Verification failed:', error);
  process.exit(1);
});

export default DeploymentVerifier;