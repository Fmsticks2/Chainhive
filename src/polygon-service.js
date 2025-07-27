/**
 * PolygonService - Polygon blockchain service
 * Extends EthereumService with Polygon-specific endpoints
 * Uses Polygonscan API and Alchemy Polygon
 */

import EthereumService from './ethereum-service.js';

class PolygonService extends EthereumService {
    constructor() {
        super();
        this.chainName = 'polygon';
        this.polygonscanApiKey = process.env.POLYGONSCAN_API_KEY;
        this.alchemyBaseUrl = `https://polygon-mainnet.g.alchemy.com/v2/${this.alchemyApiKey}`;
        this.polygonscanBaseUrl = 'https://api.polygonscan.com/api';
        this.nativeSymbol = 'MATIC';
        this.nativeName = 'Polygon';
        this.nativePrice = 0.8; // Mock price
    }

    /**
     * Get balance from Alchemy API (Polygon)
     * @param {string} address - Polygon address
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
        const balanceMatic = Number(balanceWei) / Math.pow(10, 18);

        // Get token balances
        const tokenBalances = await this.getTokenBalancesFromAlchemy(address);

        return {
            data: [
                {
                    address: '0x0000000000000000000000000000000000000000',
                    symbol: this.nativeSymbol,
                    name: this.nativeName,
                    decimals: 18,
                    balance: response.result,
                    balanceFormatted: balanceMatic.toFixed(6),
                    priceUSD: this.nativePrice,
                    valueUSD: balanceMatic * this.nativePrice,
                    logo: null,
                    verified: true
                },
                ...tokenBalances
            ],
            source: 'alchemy-polygon'
        };
    }

    /**
     * Get balance from Polygonscan API
     * @param {string} address - Polygon address
     * @returns {Promise<Object>} - Balance data
     */
    async getBalanceFromEtherscan(address) {
        const url = `${this.polygonscanBaseUrl}?module=account&action=balance&address=${address}&tag=latest&apikey=${this.polygonscanApiKey}`;
        const response = await this.makeRequest(url);

        if (response.status !== '1') {
            throw new Error(response.message || 'Polygonscan API error');
        }

        const balanceWei = BigInt(response.result);
        const balanceMatic = Number(balanceWei) / Math.pow(10, 18);

        return {
            data: [{
                address: '0x0000000000000000000000000000000000000000',
                symbol: this.nativeSymbol,
                name: this.nativeName,
                decimals: 18,
                balance: response.result,
                balanceFormatted: balanceMatic.toFixed(6),
                priceUSD: this.nativePrice,
                valueUSD: balanceMatic * this.nativePrice,
                logo: null,
                verified: true
            }],
            source: 'polygonscan'
        };
    }

    /**
     * Get transactions from Polygonscan
     * @param {string} address - Polygon address
     * @param {number} limit - Number of transactions
     * @returns {Promise<Object>} - Transaction data
     */
    async getTransactionsFromEtherscan(address, limit) {
        const url = `${this.polygonscanBaseUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${this.polygonscanApiKey}`;
        const response = await this.makeRequest(url);

        if (response.status !== '1') {
            throw new Error(response.message || 'Polygonscan API error');
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
            source: 'polygonscan'
        };
    }

    /**
     * Get health status
     * @returns {Promise<Object>} - Health status
     */
    async getHealthStatus() {
        try {
            // Test Alchemy Polygon connection
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
                    polygonscan: 'available'
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

export default PolygonService;