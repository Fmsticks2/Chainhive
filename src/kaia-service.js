/**
 * KaiaService - Kaia blockchain service
 * Uses Kaia RPC endpoints
 * Mainnet: https://public-en-baobab.klaytn.net (for production)
 * Testnet: https://public-en-kairos.node.kaia.io (for development)
 */

import BaseChainService from './base-chain-service.js';

class KaiaService extends BaseChainService {
    constructor() {
        super('kaia');
        this.mainnetRpcUrl = 'https://public-en-baobab.klaytn.net';
        this.testnetRpcUrl = process.env.KAIA_RPC_URL || 'https://public-en-kairos.node.kaia.io';
        this.klaytnScopeApiKey = process.env.KLAYTNSCOPE_API_KEY;
        this.klaytnScopeBaseUrl = 'https://api.klaytnscope.com/v2';
        this.isTestnet = process.env.NODE_ENV !== 'production';
        this.rpcUrl = this.isTestnet ? this.testnetRpcUrl : this.mainnetRpcUrl;
        this.nativeSymbol = 'KAIA';
        this.nativeName = 'Kaia';
        this.nativePrice = 0.15; // Mock price
    }

    /**
     * Validate Kaia address format (same as Ethereum)
     * @param {string} address - Kaia address
     * @returns {boolean} - Whether address is valid
     */
    validateAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    /**
     * Get balance for Kaia address
     * @param {string} address - Kaia address
     * @returns {Promise<Object>} - Balance data
     */
    async getBalance(address) {
        if (!this.validateAddress(address)) {
            throw new Error('Invalid Kaia address format');
        }

        try {
            return await this.getBalanceFromRPC(address);
        } catch (error) {
            throw new Error(`Failed to get Kaia balance: ${error.message}`);
        }
    }

    /**
     * Get balance from Kaia RPC
     * @param {string} address - Kaia address
     * @returns {Promise<Object>} - Balance data
     */
    async getBalanceFromRPC(address) {
        const response = await this.makeRequest(this.rpcUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'klay_getBalance',
                params: [address, 'latest'],
                id: 1
            })
        });

        if (response.error) {
            throw new Error(response.error.message);
        }

        const balanceWei = BigInt(response.result);
        const balanceKaia = Number(balanceWei) / Math.pow(10, 18);

        // Get KIP-7 token balances
        const tokenBalances = await this.getKIP7TokenBalances(address);

        return {
            data: [
                {
                    address: '0x0000000000000000000000000000000000000000',
                    symbol: this.nativeSymbol,
                    name: this.nativeName,
                    decimals: 18,
                    balance: response.result,
                    balanceFormatted: balanceKaia.toFixed(6),
                    priceUSD: this.nativePrice,
                    valueUSD: balanceKaia * this.nativePrice,
                    logo: null,
                    verified: true
                },
                ...tokenBalances
            ],
            source: this.isTestnet ? 'kaia-testnet' : 'kaia-mainnet'
        };
    }

    /**
     * Get KIP-7 token balances (simplified implementation)
     * @param {string} address - Kaia address
     * @returns {Promise<Array>} - Token balance array
     */
    async getKIP7TokenBalances(address) {
        try {
            // Common Kaia tokens (this would be expanded in production)
            const commonTokens = [
                {
                    contract: '0x5c74070fdea071359b86082bd9f9b3deaafbe32b', // oUSDT (example)
                    symbol: 'oUSDT',
                    name: 'Orbit Bridge Tether USD',
                    decimals: 6
                }
            ];

            const tokenBalances = [];
            
            for (const token of commonTokens) {
                try {
                    const balance = await this.getTokenBalance(address, token.contract);
                    if (balance !== '0x0' && balance !== '0') {
                        tokenBalances.push({
                            address: token.contract,
                            symbol: token.symbol,
                            name: token.name,
                            decimals: token.decimals,
                            balance: balance,
                            balanceFormatted: (Number(BigInt(balance)) / Math.pow(10, token.decimals)).toFixed(6),
                            priceUSD: 0,
                            valueUSD: 0,
                            logo: null,
                            verified: false
                        });
                    }
                } catch (error) {
                    console.warn(`Failed to get ${token.symbol} balance:`, error.message);
                }
            }

            return tokenBalances;
        } catch (error) {
            console.warn('Failed to get KIP-7 token balances:', error.message);
            return [];
        }
    }

    /**
     * Get token balance for specific contract
     * @param {string} address - Wallet address
     * @param {string} contractAddress - Token contract address
     * @returns {Promise<string>} - Token balance
     */
    async getTokenBalance(address, contractAddress) {
        // KIP-7 balanceOf function call (same as ERC-20)
        const data = `0x70a08231000000000000000000000000${address.slice(2)}`;
        
        const response = await this.makeRequest(this.rpcUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'klay_call',
                params: [{
                    to: contractAddress,
                    data: data
                }, 'latest'],
                id: 1
            })
        });

        if (response.error) {
            throw new Error(response.error.message);
        }

        return response.result || '0x0';
    }

    /**
     * Get transaction history
     * @param {string} address - Kaia address
     * @param {number} limit - Number of transactions
     * @returns {Promise<Object>} - Transaction data
     */
    async getTransactions(address, limit = 50) {
        if (!this.validateAddress(address)) {
            throw new Error('Invalid Kaia address format');
        }

        try {
            if (this.klaytnScopeApiKey) {
                return await this.getTransactionsFromKlaytnScope(address, limit);
            } else {
                // Fallback to basic RPC method (limited functionality)
                return await this.getTransactionsFromRPC(address, limit);
            }
        } catch (error) {
            throw new Error(`Failed to get Kaia transactions: ${error.message}`);
        }
    }

    /**
     * Get transactions from KlaytnScope API
     * @param {string} address - Kaia address
     * @param {number} limit - Number of transactions
     * @returns {Promise<Object>} - Transaction data
     */
    async getTransactionsFromKlaytnScope(address, limit) {
        const url = `${this.klaytnScopeBaseUrl}/accounts/${address}/txs?size=${limit}`;
        const response = await this.makeRequest(url, {
            headers: {
                'Authorization': `Bearer ${this.klaytnScopeApiKey}`
            }
        });

        const transactions = response.results?.map(tx => ({
            hash: tx.txHash,
            from: tx.from,
            to: tx.to,
            value: tx.amount || '0',
            valueFormatted: tx.amount ? (parseFloat(tx.amount) / Math.pow(10, 18)).toFixed(6) : '0',
            gasPrice: tx.gasPrice,
            gasUsed: tx.gasUsed,
            timestamp: new Date(tx.datetime).toISOString(),
            blockNumber: tx.blockId,
            status: tx.txError === 0 ? 'success' : 'failed'
        })) || [];

        return {
            data: transactions,
            source: 'klaytnscope'
        };
    }

    /**
     * Get transactions from RPC (basic implementation)
     * @param {string} address - Kaia address
     * @param {number} limit - Number of transactions
     * @returns {Promise<Object>} - Transaction data
     */
    async getTransactionsFromRPC(address, limit) {
        // This is a simplified implementation
        // Kaia RPC doesn't have a direct method to get account transactions
        // In production, you would need to scan blocks or use indexing services
        
        return {
            data: [],
            source: this.isTestnet ? 'kaia-testnet-rpc' : 'kaia-mainnet-rpc'
        };
    }

    /**
     * Get NFT portfolio (KIP-17/KIP-37)
     * @param {string} address - Kaia address
     * @returns {Promise<Object>} - NFT data
     */
    async getNFTs(address) {
        if (!this.validateAddress(address)) {
            throw new Error('Invalid Kaia address format');
        }

        try {
            // Kaia NFT support is limited
            // This would require specific NFT contract queries
            return {
                data: [],
                source: this.isTestnet ? 'kaia-testnet' : 'kaia-mainnet'
            };
        } catch (error) {
            console.warn('Failed to get Kaia NFTs:', error.message);
            return {
                data: [],
                source: this.isTestnet ? 'kaia-testnet' : 'kaia-mainnet'
            };
        }
    }

    /**
     * Get health status
     * @returns {Promise<Object>} - Health status
     */
    async getHealthStatus() {
        try {
            // Test Kaia RPC connection
            await this.makeRequest(this.rpcUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'klay_blockNumber',
                    params: [],
                    id: 1
                })
            });

            return {
                status: 'healthy',
                chain: this.chainName,
                network: this.isTestnet ? 'testnet' : 'mainnet',
                providers: {
                    rpc: 'healthy',
                    klaytnscope: this.klaytnScopeApiKey ? 'available' : 'not-configured'
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                chain: this.chainName,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

export default KaiaService;