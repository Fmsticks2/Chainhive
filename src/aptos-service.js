/**
 * AptosService - Aptos blockchain service
 * Uses Aptos native REST API: https://fullnode.mainnet.aptoslabs.com/v1
 */

import BaseChainService from './base-chain-service.js';

class AptosService extends BaseChainService {
    constructor() {
        super('aptos');
        this.baseUrl = 'https://fullnode.mainnet.aptoslabs.com/v1';
        this.aptDecimals = 8; // APT has 8 decimals
    }

    /**
     * Validate Aptos address format
     * @param {string} address - Aptos address
     * @returns {boolean} - Whether address is valid
     */
    validateAddress(address) {
        // Aptos addresses are 64 character hex strings with 0x prefix
        return /^0x[a-fA-F0-9]{64}$/.test(address) || /^0x[a-fA-F0-9]{1,63}$/.test(address);
    }

    /**
     * Get balance for Aptos address
     * @param {string} address - Aptos address
     * @returns {Promise<Object>} - Balance data
     */
    async getBalance(address) {
        if (!this.validateAddress(address)) {
            throw new Error('Invalid Aptos address format');
        }

        try {
            // Get APT balance from CoinStore
            const aptBalance = await this.getAPTBalance(address);
            
            // Get other coin balances
            const otherCoins = await this.getOtherCoinBalances(address);

            return {
                data: [aptBalance, ...otherCoins],
                source: 'aptos-mainnet'
            };
        } catch (error) {
            throw new Error(`Failed to get Aptos balance: ${error.message}`);
        }
    }

    /**
     * Get APT balance from CoinStore resource
     * @param {string} address - Aptos address
     * @returns {Promise<Object>} - APT balance data
     */
    async getAPTBalance(address) {
        try {
            const url = `${this.baseUrl}/accounts/${address}/resource/0x1::coin::CoinStore%3C0x1::aptos_coin::AptosCoin%3E`;
            const response = await this.makeRequest(url);

            const balance = response.data?.coin?.value || '0';
            const balanceFormatted = (parseInt(balance) / Math.pow(10, this.aptDecimals)).toFixed(6);

            return {
                address: '0x1::aptos_coin::AptosCoin',
                symbol: 'APT',
                name: 'Aptos Coin',
                decimals: this.aptDecimals,
                balance: balance,
                balanceFormatted: balanceFormatted,
                priceUSD: 8, // Mock price - in production, fetch from price API
                valueUSD: parseFloat(balanceFormatted) * 8,
                logo: null,
                verified: true
            };
        } catch (error) {
            // If CoinStore doesn't exist, account has 0 APT
            if (error.message.includes('404')) {
                return {
                    address: '0x1::aptos_coin::AptosCoin',
                    symbol: 'APT',
                    name: 'Aptos Coin',
                    decimals: this.aptDecimals,
                    balance: '0',
                    balanceFormatted: '0.000000',
                    priceUSD: 8,
                    valueUSD: 0,
                    logo: null,
                    verified: true
                };
            }
            throw error;
        }
    }

    /**
     * Get other coin balances
     * @param {string} address - Aptos address
     * @returns {Promise<Array>} - Other coin balances
     */
    async getOtherCoinBalances(address) {
        try {
            const url = `${this.baseUrl}/accounts/${address}/resources`;
            const response = await this.makeRequest(url);

            const coinStores = response.filter(resource => 
                resource.type.includes('0x1::coin::CoinStore') && 
                !resource.type.includes('AptosCoin')
            );

            return coinStores.map(store => {
                const balance = store.data?.coin?.value || '0';
                const coinType = this.extractCoinType(store.type);
                const symbol = this.getCoinSymbol(coinType);
                
                return {
                    address: coinType,
                    symbol: symbol,
                    name: `${symbol} Token`,
                    decimals: 8, // Default to 8, should be fetched from coin metadata
                    balance: balance,
                    balanceFormatted: (parseInt(balance) / Math.pow(10, 8)).toFixed(6),
                    priceUSD: 0,
                    valueUSD: 0,
                    logo: null,
                    verified: false
                };
            });
        } catch (error) {
            console.warn('Failed to get other Aptos coin balances:', error.message);
            return [];
        }
    }

    /**
     * Extract coin type from CoinStore type
     * @param {string} storeType - CoinStore type string
     * @returns {string} - Coin type
     */
    extractCoinType(storeType) {
        const match = storeType.match(/0x1::coin::CoinStore<(.+)>/);
        return match ? match[1] : storeType;
    }

    /**
     * Get coin symbol from coin type
     * @param {string} coinType - Coin type
     * @returns {string} - Coin symbol
     */
    getCoinSymbol(coinType) {
        // Extract symbol from coin type (simplified)
        const parts = coinType.split('::');
        return parts[parts.length - 1].toUpperCase();
    }

    /**
     * Get transaction history
     * @param {string} address - Aptos address
     * @param {number} limit - Number of transactions
     * @returns {Promise<Object>} - Transaction data
     */
    async getTransactions(address, limit = 50) {
        if (!this.validateAddress(address)) {
            throw new Error('Invalid Aptos address format');
        }

        try {
            const url = `${this.baseUrl}/accounts/${address}/transactions?limit=${limit}`;
            const response = await this.makeRequest(url);

            const transactions = response.map(tx => ({
                hash: tx.hash,
                version: tx.version,
                from: tx.sender,
                to: this.extractRecipient(tx),
                value: this.extractValue(tx),
                valueFormatted: this.formatValue(this.extractValue(tx)),
                gasUsed: tx.gas_used,
                gasUnitPrice: tx.gas_unit_price,
                timestamp: new Date(parseInt(tx.timestamp) / 1000).toISOString(),
                type: tx.type,
                status: tx.success ? 'success' : 'failed'
            }));

            return {
                data: transactions,
                source: 'aptos-mainnet'
            };
        } catch (error) {
            throw new Error(`Failed to get Aptos transactions: ${error.message}`);
        }
    }

    /**
     * Extract recipient from transaction
     * @param {Object} tx - Transaction object
     * @returns {string} - Recipient address
     */
    extractRecipient(tx) {
        if (tx.payload?.arguments?.length > 0) {
            return tx.payload.arguments[0] || '';
        }
        return '';
    }

    /**
     * Extract value from transaction
     * @param {Object} tx - Transaction object
     * @returns {string} - Transaction value
     */
    extractValue(tx) {
        if (tx.payload?.arguments?.length > 1) {
            return tx.payload.arguments[1] || '0';
        }
        return '0';
    }

    /**
     * Format value for display
     * @param {string} value - Raw value
     * @returns {string} - Formatted value
     */
    formatValue(value) {
        try {
            return (parseInt(value) / Math.pow(10, this.aptDecimals)).toFixed(6);
        } catch (error) {
            return '0.000000';
        }
    }

    /**
     * Get NFT portfolio
     * @param {string} address - Aptos address
     * @returns {Promise<Object>} - NFT data
     */
    async getNFTs(address) {
        if (!this.validateAddress(address)) {
            throw new Error('Invalid Aptos address format');
        }

        try {
            // Get NFT tokens owned by address
            const url = `${this.baseUrl}/accounts/${address}/resources`;
            const response = await this.makeRequest(url);

            // Look for TokenStore resources
            const tokenStores = response.filter(resource => 
                resource.type.includes('0x3::token::TokenStore')
            );

            const nfts = [];
            
            for (const store of tokenStores) {
                if (store.data?.tokens) {
                    const tokens = Object.entries(store.data.tokens).map(([tokenId, tokenData]) => ({
                        tokenId: tokenId,
                        creator: tokenData.id?.token_data_id?.creator || '',
                        collection: tokenData.id?.token_data_id?.collection || 'Unknown Collection',
                        name: tokenData.id?.token_data_id?.name || 'Unknown NFT',
                        description: tokenData.token_properties?.description || '',
                        image: tokenData.token_properties?.image || '',
                        amount: tokenData.amount || '1',
                        tokenType: 'Aptos Token'
                    }));
                    
                    nfts.push(...tokens);
                }
            }

            return {
                data: nfts,
                source: 'aptos-mainnet'
            };
        } catch (error) {
            console.warn('Failed to get Aptos NFTs:', error.message);
            return {
                data: [],
                source: 'aptos-mainnet'
            };
        }
    }

    /**
     * Get health status
     * @returns {Promise<Object>} - Health status
     */
    async getHealthStatus() {
        try {
            // Test connection by getting ledger info
            const url = `${this.baseUrl}/`;
            await this.makeRequest(url);

            return {
                status: 'healthy',
                chain: this.chainName,
                providers: {
                    mainnet: 'healthy'
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

export default AptosService;