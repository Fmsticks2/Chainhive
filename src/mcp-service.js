import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Nodit MCP Service
 * Provides a bridge between ChainHive and the Nodit MCP server
 * Enables AI-ready blockchain data access across multiple networks
 * Enhanced for Render deployment environment
 */
class NoditMCPService extends EventEmitter {
  constructor() {
    super();
    this.mcpProcess = null;
    this.isConnected = false;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this.apiKey = process.env.NODIT_API_KEY;
    this.isRenderEnvironment = process.env.RENDER === 'true' || process.env.NODE_ENV === 'production';
    this.mcpTimeout = this.isRenderEnvironment ? 60000 : 30000; // Increased timeout for Render
    
    if (!this.apiKey) {
      console.warn('NODIT_API_KEY not found in environment variables');
    }
    
    // Add path debugging for Render environment
    if (this.isRenderEnvironment) {
      console.log('🔍 Environment debugging:');
      console.log('   Current working directory:', process.cwd());
      console.log('   __dirname:', __dirname);
      console.log('   NODE_ENV:', process.env.NODE_ENV);
      console.log('   RENDER:', process.env.RENDER);
    }
  }

  /**
   * Resolve MCP server module path for different environments
   */
  resolveMcpPath() {
    const possiblePaths = [
      // Render environment paths (try both build and dist)
      '/opt/render/project/src/node_modules/@noditlabs/nodit-mcp-server/build/index.js',
      '/opt/render/project/src/node_modules/@noditlabs/nodit-mcp-server/dist/index.js',
      // Local development paths - build directory (current structure)
      path.join(process.cwd(), 'node_modules/@noditlabs/nodit-mcp-server/build/index.js'),
      path.join(__dirname, '../node_modules/@noditlabs/nodit-mcp-server/build/index.js'),
      path.join(__dirname, '../../node_modules/@noditlabs/nodit-mcp-server/build/index.js'),
      // Local development paths - dist directory (fallback)
      path.join(process.cwd(), 'node_modules/@noditlabs/nodit-mcp-server/dist/index.js'),
      path.join(__dirname, '../node_modules/@noditlabs/nodit-mcp-server/dist/index.js'),
      path.join(__dirname, '../../node_modules/@noditlabs/nodit-mcp-server/dist/index.js'),
      // Alternative paths with explicit separators
      path.join(process.cwd(), 'node_modules', '@noditlabs', 'nodit-mcp-server', 'build', 'index.js'),
      path.join(__dirname, '..', 'node_modules', '@noditlabs', 'nodit-mcp-server', 'build', 'index.js'),
      path.join(process.cwd(), 'node_modules', '@noditlabs', 'nodit-mcp-server', 'dist', 'index.js'),
      path.join(__dirname, '..', 'node_modules', '@noditlabs', 'nodit-mcp-server', 'dist', 'index.js')
    ];

    // Try the most likely path first
    try {
      const modulePath = path.join(process.cwd(), 'node_modules', '@noditlabs', 'nodit-mcp-server', 'build', 'index.js');
      if (fs.existsSync(modulePath)) {
        console.log(`✅ Found MCP server at: ${modulePath}`);
        return modulePath;
      }
    } catch (error) {
      // Continue with other methods
    }

    for (const mcpPath of possiblePaths) {
      if (fs.existsSync(mcpPath)) {
        console.log(`✅ Found MCP server at: ${mcpPath}`);
        return mcpPath;
      }
    }

    console.warn('⚠️ MCP server module not found in any expected location');
    return null;
  }

  /**
   * Start the MCP server process
   */
  async start() {
    try {
      console.log('🚀 Starting Nodit MCP server...');
      
      if (!this.apiKey) {
        console.warn('⚠️ NODIT_API_KEY not available, skipping MCP initialization');
        this.isConnected = false;
        return;
      }

      // Resolve MCP server path
      const mcpPath = this.resolveMcpPath();
      
      // Try different approaches to start the MCP server
      const commands = [];
      
      // Add direct node execution if path is found
      if (mcpPath) {
        commands.push({ cmd: 'node', args: [mcpPath], description: 'Direct node execution' });
      }
      
      // Add npx commands
      commands.push(
        { cmd: 'npx', args: ['@noditlabs/nodit-mcp-server@latest'], description: 'NPX latest' },
        { cmd: 'npx', args: ['@noditlabs/nodit-mcp-server'], description: 'NPX installed' },
        { cmd: process.platform === 'win32' ? 'npx.cmd' : 'npx', args: ['@noditlabs/nodit-mcp-server@latest'], description: 'NPX with shell' }
      );

      let lastError;
      for (const { cmd, args, description } of commands) {
        try {
          console.log(`🔄 Attempting MCP start: ${description}`);
          
          this.mcpProcess = spawn(cmd, args, {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: {
              ...process.env,
              NODIT_API_KEY: this.apiKey,
              NODE_ENV: process.env.NODE_ENV || 'production'
            },
            shell: this.isRenderEnvironment || process.platform === 'win32',
            cwd: process.cwd()
          });

          this.mcpProcess.stdout.on('data', (data) => {
            const output = data.toString();
            console.log('MCP stdout:', output);
            this.handleResponse(output);
          });

          this.mcpProcess.stderr.on('data', (data) => {
            const error = data.toString();
            console.error('MCP stderr:', error);
          });

          this.mcpProcess.on('error', (error) => {
            console.error('MCP Process Error:', error);
            lastError = error;
          });

          this.mcpProcess.on('close', (code) => {
            console.log(`MCP server process exited with code ${code}`);
            this.isConnected = false;
            this.emit('disconnected');
          });

          // Wait longer for Render environment
          const startupDelay = this.isRenderEnvironment ? 5000 : 2000;
          await new Promise(resolve => setTimeout(resolve, startupDelay));
          
          // Check if process is still running
          if (this.mcpProcess && !this.mcpProcess.killed) {
            console.log('✅ MCP process started, attempting initialization...');
            
            try {
              // Initialize the MCP server with timeout
              await Promise.race([
                this.initialize(),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('MCP initialization timeout')), this.mcpTimeout)
                )
              ]);
              
              this.isConnected = true;
              this.emit('connected');
              console.log('✅ Nodit MCP server started and initialized successfully');
              return;
            } catch (initError) {
              console.error('❌ MCP initialization failed:', initError.message);
              this.isConnected = false;
              if (this.mcpProcess) {
                this.mcpProcess.kill();
                this.mcpProcess = null;
              }
              lastError = initError;
            }
          } else {
            lastError = new Error('MCP process failed to start or was killed');
          }
        } catch (error) {
          lastError = error;
          console.warn(`❌ Failed to start MCP with ${description}:`, error.message);
          continue;
        }
      }
      
      console.warn('⚠️ All MCP server start attempts failed, continuing without MCP');
      this.isConnected = false;
      
    } catch (error) {
      console.error('❌ Failed to start MCP server:', error.message);
      this.isConnected = false;
    }
  }

  /**
   * Stop the MCP server process
   */
  stop() {
    if (this.mcpProcess) {
      this.mcpProcess.kill();
      this.mcpProcess = null;
      this.isConnected = false;
    }
  }

  /**
   * Initialize the MCP server
   */
  async initialize() {
    const initRequest = {
      jsonrpc: '2.0',
      id: this.getNextRequestId(),
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        clientInfo: {
          name: 'ChainHive',
          version: '1.0.0'
        }
      }
    };

    return this.sendRequest(initRequest);
  }

  /**
   * List available API categories
   */
  async listApiCategories() {
    const request = {
      jsonrpc: '2.0',
      id: this.getNextRequestId(),
      method: 'tools/call',
      params: {
        name: 'list_nodit_api_categories',
        arguments: {}
      }
    };

    return this.sendRequest(request);
  }

  /**
   * List Node APIs
   */
  async listNodeApis() {
    const request = {
      jsonrpc: '2.0',
      id: this.getNextRequestId(),
      method: 'tools/call',
      params: {
        name: 'list_nodit_node_apis',
        arguments: {}
      }
    };

    return this.sendRequest(request);
  }

  /**
   * List Data APIs
   */
  async listDataApis() {
    const request = {
      jsonrpc: '2.0',
      id: this.getNextRequestId(),
      method: 'tools/call',
      params: {
        name: 'list_nodit_data_apis',
        arguments: {}
      }
    };

    return this.sendRequest(request);
  }

  /**
   * Get API specification for a specific operation
   */
  async getApiSpec(operationId) {
    const request = {
      jsonrpc: '2.0',
      id: this.getNextRequestId(),
      method: 'tools/call',
      params: {
        name: 'get_nodit_api_spec',
        arguments: {
          operationId
        }
      }
    };

    return this.sendRequest(request);
  }

  /**
   * Call a Nodit API through MCP
   */
  async callApi(operationId, parameters = {}) {
    const request = {
      jsonrpc: '2.0',
      id: this.getNextRequestId(),
      method: 'tools/call',
      params: {
        name: 'call_nodit_api',
        arguments: {
          operationId,
          parameters
        }
      }
    };

    return this.sendRequest(request);
  }

  /**
   * Get account balance for a specific chain
   */
  async getAccountBalance(chain, address) {
    try {
      const operationId = `get_${chain}_account_balance`;
      return await this.callApi(operationId, {
        address,
        chain
      });
    } catch (error) {
      console.error(`Failed to get balance for ${chain}:`, error);
      throw error;
    }
  }

  /**
   * Get transaction history for a specific chain
   */
  async getTransactionHistory(chain, address, options = {}) {
    try {
      const operationId = `get_${chain}_transaction_history`;
      return await this.callApi(operationId, {
        address,
        chain,
        ...options
      });
    } catch (error) {
      console.error(`Failed to get transaction history for ${chain}:`, error);
      throw error;
    }
  }

  /**
   * Get NFTs for a specific chain
   */
  async getNFTs(chain, address, options = {}) {
    try {
      const operationId = `get_${chain}_nfts`;
      return await this.callApi(operationId, {
        address,
        chain,
        ...options
      });
    } catch (error) {
      console.error(`Failed to get NFTs for ${chain}:`, error);
      throw error;
    }
  }

  /**
   * Send a JSON-RPC request to the MCP server
   */
  sendRequest(request) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected || !this.mcpProcess) {
        reject(new Error('MCP server is not connected'));
        return;
      }

      const timeout = setTimeout(() => {
        this.pendingRequests.delete(request.id);
        reject(new Error('Request timeout'));
      }, 30000); // 30 second timeout

      this.pendingRequests.set(request.id, {
        resolve,
        reject,
        timeout
      });

      const requestStr = JSON.stringify(request) + '\n';
      this.mcpProcess.stdin.write(requestStr);
    });
  }

  /**
   * Handle responses from the MCP server
   */
  handleResponse(data) {
    const lines = data.trim().split('\n');
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      try {
        const response = JSON.parse(line);
        
        if (response.id && this.pendingRequests.has(response.id)) {
          const { resolve, reject, timeout } = this.pendingRequests.get(response.id);
          clearTimeout(timeout);
          this.pendingRequests.delete(response.id);
          
          if (response.error) {
            reject(new Error(response.error.message || 'MCP request failed'));
          } else {
            resolve(response.result);
          }
        }
      } catch (error) {
        console.error('Failed to parse MCP response:', error, 'Data:', line);
      }
    }
  }

  /**
   * Get next request ID
   */
  getNextRequestId() {
    return ++this.requestId;
  }

  /**
   * Check if MCP server is connected
   */
  isReady() {
    return this.isConnected;
  }

  /**
   * Get supported chains
   */
  getSupportedChains() {
    return [
      'ethereum',
      'arbitrum',
      'avalanche',
      'base',
      'chiliz',
      'kaia',
      'optimism',
      'polygon',
      'aptos',
      'bitcoin',
      'dogecoin',
      'tron',
      'xrpl'
    ];
  }
}

export default NoditMCPService;