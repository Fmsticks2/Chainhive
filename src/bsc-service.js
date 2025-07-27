/**
 * BSCService - Binance Smart Chain service
 * Extends EthereumService with BSC-specific endpoints
 * Uses BSCScan API and BSC RPC
 */

import EthereumService from './ethereum-service.js';

class BSCService extends EthereumService {
    constructor() {
        super();
        this.chainName = 'bsc';
        this.bscscanApiKey = process.env.BSCSCAN_API_KEY;
        this.bscRpcUrl = 'https://bsc-dataseed1.binance.org';
        this.bscscanBaseUrl = 'https://api.bscscan.com/api';
        this.nativeSymbol = 'BNB';
        this.nativeName = 'BNB';
        this.nativePrice = 300; // Mock price
    }

    /**
     * Get balance from BSC RPC
     * @param {string} address - BSC address
     * @returns {Promise<Object>} - Balance data
     */
    async getBalanceFromAlchemy(address) {
        const response = await this.makeRequest(this.bscRpcUrl, {
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
        const balanceBnb = Number(balanceWei) / Math.pow(10, 18);

        // Get BEP-20 token balances (simplified)
        const tokenBalances = await this.getBEP20TokenBalances(address);

        return {
            data: [
                {
                    address: '0x0000000000000000000000000000000000000000',
                    symbol: this.nativeSymbol,
                    name: this.nativeName,
                    decimals: 18,
                    balance: response.result,
                    balanceFormatted: balanceBnb.toFixed(6),
                    priceUSD: this.nativePrice,
                    valueUSD: balanceBnb * this.nativePrice,
                    logo: null,
                    verified: true
                },
                ...tokenBalances
            ],
            source: 'bsc-rpc'
        };
    }

    /**
     * Get BEP-20 token balances (simplified implementation)
     * @param {string} address - BSC address
     * @returns {Promise<Array>} - Token balance array
     */
    async getBEP20TokenBalances(address) {
        // This is a simplified implementation
        // In production, you would query specific token contracts
        try {
            // Common BSC tokens (USDT, USDC, BUSD, etc.)
            const commonTokens = [
                {
                    contract: '0x55d398326f99059fF775485246999027B3197955', // USDT
                    symbol: 'USDT',
                    name: 'Tether USD',
                    decimals: 18
                },
                {
                    contract: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC
                    symbol: 'USDC',
                    name: 'USD Coin',
                    decimals: 18
                }
            ];

            const tokenBalances = [];
            
            for (const token of commonTokens) {
                try {
                    const balance = await this.getTokenBalance(address, token.contract);
                    if (balance !== '0') {
                        tokenBalances.push({
                            address: token.contract,
                            symbol: token.symbol,
                            name: token.name,
                            decimals: token.decimals,
                            balance: balance,
                            balanceFormatted: (Number(BigInt(balance)) / Math.pow(10, token.decimals)).toFixed(6),
                            priceUSD: token.symbol === 'USDT' || token.symbol === 'USDC' ? 1 : 0,
                            valueUSD: token.symbol === 'USDT' || token.symbol === 'USDC' ? 
                                (Number(BigInt(balance)) / Math.pow(10, token.decimals)) : 0,
                            logo: null,
                            verified: true
                        });
                    }
                } catch (error) {
                    console.warn(`Failed to get ${token.symbol} balance:`, error.message);
                }
            }

            return tokenBalances;
        } catch (error) {
            console.warn('Failed to get BEP-20 token balances:', error.message);
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
        // ERC-20 balanceOf function call
        const data = `0x70a08231000000000000000000000000${address.slice(2)}`;
        
        const response = await this.makeRequest(this.bscRpcUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'eth_call',
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
     * Get balance from BSCScan API
     * @param {string} address - BSC address
     * @returns {Promise<Object>} - Balance data
     */
    async getBalanceFromEtherscan(address) {
        const url = `${this.bscscanBaseUrl}?module=account&action=balance&address=${address}&tag=latest&apikey=${this.bscscanApiKey}`;
        const response = await this.makeRequest(url);

        if (response.status !== '1') {
            throw new Error(response.message || 'BSCScan API error');
        }

        const balanceWei = BigInt(response.result);
        const balanceBnb = Number(balanceWei) / Math.pow(10, 18);

        return {
            data: [{
                address: '0x0000000000000000000000000000000000000000',
                symbol: this.nativeSymbol,
                name: this.nativeName,
                decimals: 18,
                balance: response.result,
                balanceFormatted: balanceBnb.toFixed(6),
                priceUSD: this.nativePrice,
                valueUSD: balanceBnb * this.nativePrice,
                logo: null,
                verified: true
            }],
            source: 'bscscan'
        };
    }

    /**
     * Get transactions from BSCScan
     * @param {string} address - BSC address
     * @param {number} limit - Number of transactions
     * @returns {Promise<Object>} - Transaction data
     */
    async getTransactionsFromEtherscan(address, limit) {
        const url = `${this.bscscanBaseUrl}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${this.bscscanApiKey}`;
        const response = await this.makeRequest(url);

        if (response.status !== '1') {
            throw new Error(response.message || 'BSCScan API error');
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
            source: 'bscscan'
        };
    }

    /**
     * Get NFT portfolio (BEP-721/BEP-1155)
     * @param {string} address - BSC address
     * @returns {Promise<Object>} - NFT data
     */
    async getNFTs(address) {
        if (!this.validateAddress(address)) {
            throw new Error('Invalid BSC address format');
        }

        try {
            // BSC NFT support is limited compared to Ethereum
            // This is a simplified implementation
            return {
                data: [],
                source: 'bsc-rpc'
            };
        } catch (error) {
            console.warn('Failed to get BSC NFTs:', error.message);
            return {
                data: [],
                source: 'bsc-rpc'
            };
        }
    }

    /**
     * Get health status
     * @returns {Promise<Object>} - Health status
     */
    async getHealthStatus() {
        try {
            // Test BSC RPC connection
            await this.makeRequest(this.bscRpcUrl, {
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
                    rpc: 'healthy',
                    bscscan: 'available'
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

export default BSCService;