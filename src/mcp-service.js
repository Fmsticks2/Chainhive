import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Nodit MCP Service
 * Provides a bridge between ChainHive and the Nodit MCP server
 * Enables AI-ready blockchain data access across multiple networks
 */
class NoditMCPService extends EventEmitter {
  constructor() {
    super();
    this.mcpProcess = null;
    this.isConnected = false;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this.apiKey = process.env.NODIT_API_KEY;
    
    if (!this.apiKey) {
      console.warn('NODIT_API_KEY not found in environment variables');
    }
  }

  /**
   * Start the MCP server process
   */
  async start() {
    try {
      console.log('Starting Nodit MCP server...');
      
      // Try different approaches to start the MCP server
      const commands = [
        { cmd: 'npx', args: ['@noditlabs/nodit-mcp-server@latest'] },
        { cmd: 'node', args: ['node_modules/@noditlabs/nodit-mcp-server/dist/index.js'] },
        { cmd: process.platform === 'win32' ? 'npx.cmd' : 'npx', args: ['@noditlabs/nodit-mcp-server@latest'] }
      ];

      let lastError;
      for (const { cmd, args } of commands) {
        try {
          this.mcpProcess = spawn(cmd, args, {
            stdio: ['pipe', 'pipe', 'pipe'],
            env: {
              ...process.env,
              NODIT_API_KEY: this.apiKey
            },
            shell: process.platform === 'win32'
          });

          this.mcpProcess.stdout.on('data', (data) => {
            this.handleResponse(data.toString());
          });

          this.mcpProcess.stderr.on('data', (data) => {
            console.error('MCP Server Error:', data.toString());
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

          // Wait a moment for the process to start
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Check if process is still running
          if (this.mcpProcess && !this.mcpProcess.killed) {
            // Initialize the MCP server
            await this.initialize();
            
            this.isConnected = true;
            this.emit('connected');
            console.log('Nodit MCP server started successfully');
            return;
          }
        } catch (error) {
          lastError = error;
          console.warn(`Failed to start MCP with ${cmd}:`, error.message);
          continue;
        }
      }
      
      throw lastError || new Error('All MCP server start attempts failed');
      
    } catch (error) {
      console.error('Failed to start MCP server:', error);
      // Don't throw error, just log it and continue without MCP
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