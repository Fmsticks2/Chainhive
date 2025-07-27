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
        this.initializeServices();
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

            const service = this.services[chain.toLowerCase()];
            const result = await service.getBalance(address);
            
            return {
                chain: chain.toLowerCase(),
                address,
                data: result.data,
                source: result.source,
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

            const service = this.services[chain.toLowerCase()];
            const result = await service.getTransactions(address, limit);
            
            return {
                chain: chain.toLowerCase(),
                address,
                data: result.data,
                source: result.source,
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

            const service = this.services[chain.toLowerCase()];
            const result = await service.getNFTs(address);
            
            return {
                chain: chain.toLowerCase(),
                address,
                data: result.data,
                source: result.source,
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
        const status = {};
        
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
}



export { MultiChainService };