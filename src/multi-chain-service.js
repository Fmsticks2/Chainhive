/**
 * MultiChainService - A robust multi-chain blockchain service
 * Replaces the failing NoditService with reliable alternative APIs
 * Supports: Ethereum, XRPL, Aptos, Polygon, BSC, Kaia
 */

import BaseChainService from './base-chain-service.js';
import EthereumService from './ethereum-service.js';
import XRPLService from './xrpl-service.js';
import AptosService from './aptos-service.js';
import PolygonService from './polygon-service.js';
import BSCService from './bsc-service.js';
import KaiaService from './kaia-service.js';
import NoditMCPService from './mcp-service.js';

class MultiChainService {
    constructor() {
        this.supportedChains = {
            ethereum: 'EthereumService',
            polygon: 'PolygonService', 
            bsc: 'BSCService',
            xrpl: 'XRPLService',
            aptos: 'AptosService',
            kaia: 'KaiaService'
        };
        
        this.services = {};
        this.mcpService = null;
        this.mcpEnabled = false;
        this.initializeServices();
        this.initializeMCP();
    }

    /**
     * Initialize all chain-specific services
     */
    initializeServices() {
        this.services.ethereum = new EthereumService();
        this.services.polygon = new PolygonService();
        this.services.bsc = new BSCService();
        this.services.xrpl = new XRPLService();
        this.services.aptos = new AptosService();
        this.services.kaia = new KaiaService();
    }

    /**
     * Initialize MCP service for enhanced blockchain data access
     */
    async initializeMCP() {
        try {
            this.mcpService = new NoditMCPService();
            await this.mcpService.start();
            this.mcpEnabled = true;
            console.log('MCP service initialized successfully');
        } catch (error) {
            console.warn('MCP service initialization failed:', error.message);
            this.mcpEnabled = false;
        }
    }

    /**
     * Check if a chain is supported
     * @param {string} chain - Chain name
     * @returns {boolean} - Whether chain is supported
     */
    isChainSupported(chain) {
        return Object.keys(this.supportedChains).includes(chain.toLowerCase());
    }

    /**
     * Get balance for an address on a specific chain
     * @param {string} chain - Chain name
     * @param {string} address - Wallet address
     * @returns {Promise<Object>} - Balance data with consistent format
     */
    async getBalance(chain, address) {
        try {
            if (!this.isChainSupported(chain)) {
                throw new Error(`Chain ${chain} is not supported`);
            }

            let result;
            let source = 'chain-service';

            // Try MCP service first if available
            if (this.mcpEnabled && this.mcpService.isReady()) {
                try {
                    const mcpResult = await this.mcpService.getAccountBalance(chain.toLowerCase(), address);
                    if (mcpResult && mcpResult.content) {
                        result = { data: mcpResult.content };
                        source = 'mcp-service';
                    }
                } catch (mcpError) {
                    console.warn(`MCP balance request failed for ${chain}:`, mcpError.message);
                }
            }

            // Fallback to chain-specific service
            if (!result) {
                const service = this.services[chain.toLowerCase()];
                result = await service.getBalance(address);
                source = result.source || 'chain-service';
            }
            
            return {
                chain: chain.toLowerCase(),
                address,
                data: result.data,
                source,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`MultiChainService.getBalance error for ${chain}:`, error.message);
            return {
                chain: chain.toLowerCase(),
                address,
                data: null,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get transaction history for an address on a specific chain
     * @param {string} chain - Chain name
     * @param {string} address - Wallet address
     * @param {number} limit - Number of transactions to fetch
     * @returns {Promise<Object>} - Transaction data with consistent format
     */
    async getTransactions(chain, address, limit = 50) {
        try {
            if (!this.isChainSupported(chain)) {
                throw new Error(`Chain ${chain} is not supported`);
            }

            let result;
            let source = 'chain-service';

            // Try MCP service first if available
            if (this.mcpEnabled && this.mcpService.isReady()) {
                try {
                    const mcpResult = await this.mcpService.getTransactionHistory(chain.toLowerCase(), address, { limit });
                    if (mcpResult && mcpResult.content) {
                        result = { data: mcpResult.content };
                        source = 'mcp-service';
                    }
                } catch (mcpError) {
                    console.warn(`MCP transaction request failed for ${chain}:`, mcpError.message);
                }
            }

            // Fallback to chain-specific service
            if (!result) {
                const service = this.services[chain.toLowerCase()];
                result = await service.getTransactions(address, limit);
                source = result.source || 'chain-service';
            }
            
            return {
                chain: chain.toLowerCase(),
                address,
                data: result.data,
                source,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`MultiChainService.getTransactions error for ${chain}:`, error.message);
            return {
                chain: chain.toLowerCase(),
                address,
                data: [],
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get NFT portfolio for an address on a specific chain
     * @param {string} chain - Chain name
     * @param {string} address - Wallet address
     * @returns {Promise<Object>} - NFT data with consistent format
     */
    async getNFTs(chain, address) {
        try {
            if (!this.isChainSupported(chain)) {
                throw new Error(`Chain ${chain} is not supported`);
            }

            let result;
            let source = 'chain-service';

            // Try MCP service first if available
            if (this.mcpEnabled && this.mcpService.isReady()) {
                try {
                    const mcpResult = await this.mcpService.getNFTs(chain.toLowerCase(), address);
                    if (mcpResult && mcpResult.content) {
                        result = { data: mcpResult.content };
                        source = 'mcp-service';
                    }
                } catch (mcpError) {
                    console.warn(`MCP NFT request failed for ${chain}:`, mcpError.message);
                }
            }

            // Fallback to chain-specific service
            if (!result) {
                const service = this.services[chain.toLowerCase()];
                result = await service.getNFTs(address);
                source = result.source || 'chain-service';
            }
            
            return {
                chain: chain.toLowerCase(),
                address,
                data: result.data,
                source,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error(`MultiChainService.getNFTs error for ${chain}:`, error.message);
            return {
                chain: chain.toLowerCase(),
                address,
                data: [],
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Get health status of all supported chains
     * @returns {Promise<Object>} - Health status for each chain
     */
    async getHealthStatus() {
        const status = {
            mcp: {
                enabled: this.mcpEnabled,
                ready: this.mcpService ? this.mcpService.isReady() : false
            }
        };
        
        for (const chain of Object.keys(this.supportedChains)) {
            try {
                const service = this.services[chain];
                status[chain] = await service.getHealthStatus();
            } catch (error) {
                status[chain] = {
                    status: 'error',
                    error: error.message
                };
            }
        }
        
        return status;
    }

    /**
     * Get MCP service status and capabilities
     * @returns {Promise<Object>} - MCP service information
     */
    async getMCPStatus() {
        if (!this.mcpEnabled || !this.mcpService) {
            return {
                enabled: false,
                ready: false,
                error: 'MCP service not initialized'
            };
        }

        try {
            const categories = await this.mcpService.listApiCategories();
            return {
                enabled: true,
                ready: this.mcpService.isReady(),
                supportedChains: this.mcpService.getSupportedChains(),
                apiCategories: categories
            };
        } catch (error) {
            return {
                enabled: true,
                ready: false,
                error: error.message
            };
        }
    }

    /**
     * Restart MCP service
     * @returns {Promise<boolean>} - Success status
     */
    async restartMCP() {
        try {
            if (this.mcpService) {
                this.mcpService.stop();
            }
            await this.initializeMCP();
            return this.mcpEnabled;
        } catch (error) {
            console.error('Failed to restart MCP service:', error);
            return false;
        }
    }

    /**
     * Get all supported chains (including MCP chains)
     * @returns {Array<string>} - List of supported chain names
     */
    getAllSupportedChains() {
        const chainServiceChains = Object.keys(this.supportedChains);
        const mcpChains = this.mcpService ? this.mcpService.getSupportedChains() : [];
        
        // Combine and deduplicate
        return [...new Set([...chainServiceChains, ...mcpChains])];
    }
}



export { MultiChainService };