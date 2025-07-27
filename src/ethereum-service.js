/**
 * EthereumService - Ethereum blockchain service
 * Primary: Alchemy API for balance and NFTs
 * Fallback: Etherscan API for transactions and balance
 */

import BaseChainService from './base-chain-service.js';

class EthereumService extends BaseChainService {
    constructor() {
        super('ethereum');
        this.alchemyApiKey = process.env.ALCHEMY_API_KEY;
        this.etherscanApiKey = process.env.ETHERSCAN_API_KEY;
        this.alchemyBaseUrl = `https://eth-mainnet.g.alchemy.com/v2/${this.alchemyApiKey}`;
        this.etherscanBaseUrl = 'https://api.etherscan.io/api';
    }

    /**
     * Validate Ethereum address format
     * @param {string} address - Ethereum address
     * @returns {boolean} - Whether address is valid
     */
    validateAddress(address) {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    /**
     * Get balance for Ethereum address
     * @param {string} address - Ethereum address
     * @returns {Promise<Object>} - Balance data
     */
    async getBalance(address) {
        if (!this.validateAddress(address)) {
            throw new Error('Invalid Ethereum address format');
        }

        try {
            // Try Alchemy first
            return await this.getBalanceFromAlchemy(address);
        } catch (error) {
            console.warn('Alchemy failed, trying Etherscan:', error.message);
            try {
                return await this.getBalanceFromEtherscan(address);
            } catch (fallbackError) {
                throw new Error(`Both Alchemy and Etherscan failed: ${fallbackError.message}`);
            }
        }
    }

    /**
     * Get balance from Alchemy API
     * @param {string} address - Ethereum address
     * @returns {Promise<Object>} - Balance data
     */
    async getBalanceFromAlchemy(address) {
        const response = await this.makeRequest(this.alchemyBaseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_getBalance',
                params: [address, 'latest'],
                id: 1
            })
        });

        if (response.error) {
            throw new Error(response.error.message);
        }

        const balanceWei = BigInt(response.result);
        const balanceEth = Number(balanceWei) / Math.pow(10, 18);

        // Get token balances
        const tokenBalances = await this.getTokenBalancesFromAlchemy(address);

        return {
            data: [
                {
                    address: '0x0000000000000000000000000000000000000000',
                    symbol: 'ETH',
                    name: 'Ethereum',
                    decimals: 18,
                    balance: response.result,
                    balanceFormatted: balanceEth.toFixed(6),
                    priceUSD: 2000, // Mock price - in production, fetch from price API
                    valueUSD: balanceEth * 2000,
                    logo: null,
                    verified: true
                },
                ...tokenBalances
            ],
            source: 'alchemy'
        };
    }

    /**
     * Get token balances from Alchemy
     * @param {string} address - Ethereum address
     * @returns {Promise<Array>} - Token balance array
     */
    async getTokenBalancesFromAlchemy(address) {
        try {
            const response = await this.makeRequest(this.alchemyBaseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'alchemy_getTokenBalances',
                    params: [address],
                    id: 1
                })
            });

            if (response.error || !response.result) {
                return [];
            }

            return response.result.tokenBalances
                .filter(token => token.tokenBalance !== '0x0')
                .map(token => ({
                    address: token.contractAddress,
                    symbol: 'UNKNOWN',
                    name: 'Unknown Token',
                    decimals: 18,
                    balance: token.tokenBalance,
                    balanceFormatted: (Number(BigInt(token.tokenBalance)) / Math.pow(10, 18)).toFixed(6),
                    priceUSD: 0,
                    valueUSD: 0,
                    logo: null,
                    verified: false
                }));
        } catch (error) {
            console.warn('Failed to get token balances from Alchemy:', error.message);
            return [];
        }
    }

    /**
     * Get balance from Etherscan API
     * @param {string} address - Ethereum address
     * @returns {Promise<Object>} - Balance data
     */
    async getBalanceFromEtherscan(address) {
        const url = `${this.etherscanBaseUrl}?module=account&action=balance&address=${address}&tag=latest&apikey=${this.etherscanApiKey}`;
        const response = await this.makeRequest(url);

        if (response.status !== '1') {
            throw new Error(response.message || 'Etherscan API error');
        }

        const balanceWei = BigInt(response.result);
        const balanceEth = Number(balanceWei) / Math.pow(10, 18);

        return {
            data: [{
                address: '0x0000000000000000000000000000000000000000',
                symbol: 'ETH',
                name: 'Ethereum',
                decimals: 18,
                balance: response.result,
                balanceFormatted: balanceEth.toFixed(6),
                priceUSD: 2000,
                valueUSD: balanceEth * 2000,
                logo: null,
                verified: true
            }],
            source: 'etherscan'
        };
    }

    /**
     * Get transaction history
     * @param {string} address - Ethereum address
     * @param {number} limit - Number of transactions
     * @returns {Promise<Object>} - Transaction data
     */
    async getTransactions(address, limit = 50) {
        if (!this.validateAddress(address)) {
            throw new Error('Invalid Ethereum address format');
        }

        try {
            return await this.getTransactionsFromEtherscan(address, limit);
        } catch (error) {
            throw new Error(`Failed to get transactions: ${error.message}`);
        }
    }

    /**
     * Get transactions from Etherscan
     * @param {string} address - Ethereum address
     * @param {number} limit - Number of transactions
     * @returns {Promise<Object>} - Transaction data
     */
    async getTransactionsFromEtherscan(address, limit) {
        const url = `${this.etherscanBaseUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${this.etherscanApiKey}`;
        const response = await this.makeRequest(url);

        if (response.status !== '1') {
            throw new Error(response.message || 'Etherscan API error');
        }

        const transactions = response.result.map(tx => ({
            hash: tx.hash,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            valueFormatted: (Number(BigInt(tx.value)) / Math.pow(10, 18)).toFixed(6),
            gasPrice: tx.gasPrice,
            gasUsed: tx.gasUsed,
            timestamp: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
            blockNumber: tx.blockNumber,
            status: tx.txreceipt_status === '1' ? 'success' : 'failed'
        }));

        return {
            data: transactions,
            source: 'etherscan'
        };
    }

    /**
     * Get NFT portfolio
     * @param {string} address - Ethereum address
     * @returns {Promise<Object>} - NFT data
     */
    async getNFTs(address) {
        if (!this.validateAddress(address)) {
            throw new Error('Invalid Ethereum address format');
        }

        try {
            return await this.getNFTsFromAlchemy(address);
        } catch (error) {
            console.warn('Failed to get NFTs from Alchemy:', error.message);
            return {
                data: [],
                source: 'alchemy'
            };
        }
    }

    /**
     * Get NFTs from Alchemy
     * @param {string} address - Ethereum address
     * @returns {Promise<Object>} - NFT data
     */
    async getNFTsFromAlchemy(address) {
        const response = await this.makeRequest(this.alchemyBaseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'alchemy_getNFTs',
                params: [{
                    owner: address,
                    withMetadata: true
                }],
                id: 1
            })
        });

        if (response.error) {
            throw new Error(response.error.message);
        }

        const nfts = response.result?.ownedNfts?.map(nft => ({
            contractAddress: nft.contract.address,
            tokenId: nft.id.tokenId,
            name: nft.title || 'Unknown NFT',
            description: nft.description || '',
            image: nft.metadata?.image || nft.media?.[0]?.gateway || '',
            collection: nft.contractMetadata?.name || 'Unknown Collection',
            tokenType: nft.id.tokenMetadata?.tokenType || 'ERC721'
        })) || [];

        return {
            data: nfts,
            source: 'alchemy'
        };
    }

    /**
     * Get health status
     * @returns {Promise<Object>} - Health status
     */
    async getHealthStatus() {
        try {
            // Test Alchemy connection
            await this.makeRequest(this.alchemyBaseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'eth_blockNumber',
                    params: [],
                    id: 1
                })
            });

            return {
                status: 'healthy',
                chain: this.chainName,
                providers: {
                    alchemy: 'healthy',
                    etherscan: 'available'
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                status: 'degraded',
                chain: this.chainName,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

export default EthereumService;