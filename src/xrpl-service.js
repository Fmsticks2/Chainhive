/**
 * XRPLService - XRPL blockchain service
 * Primary: s1.ripple.com:51234
 * Fallback: xrplcluster.com
 */

import BaseChainService from './base-chain-service.js';

class XRPLService extends BaseChainService {
    constructor() {
        super('xrpl');
        this.primaryRpcUrl = 'https://s1.ripple.com:51234';
        this.fallbackRpcUrl = 'https://xrplcluster.com';
        this.dropsPerXRP = 1000000; // 1 XRP = 1,000,000 drops
    }

    /**
     * Validate XRPL address format
     * @param {string} address - XRPL address
     * @returns {boolean} - Whether address is valid
     */
    validateAddress(address) {
        // XRPL classic address starts with 'r' and is 25-34 characters
        return /^r[1-9A-HJ-NP-Za-km-z]{24,33}$/.test(address);
    }

    /**
     * Make XRPL JSON-RPC request
     * @param {string} method - RPC method
     * @param {Object} params - RPC parameters
     * @param {boolean} useFallback - Whether to use fallback URL
     * @returns {Promise<Object>} - RPC response
     */
    async makeRpcRequest(method, params, useFallback = false) {
        const url = useFallback ? this.fallbackRpcUrl : this.primaryRpcUrl;
        
        const response = await this.makeRequest(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                method,
                params: [params]
            })
        });

        if (response.error) {
            throw new Error(response.error.message || 'XRPL RPC error');
        }

        return response.result;
    }

    /**
     * Get balance for XRPL address
     * @param {string} address - XRPL address
     * @returns {Promise<Object>} - Balance data
     */
    async getBalance(address) {
        if (!this.validateAddress(address)) {
            throw new Error('Invalid XRPL address format');
        }

        try {
            return await this.getBalanceFromPrimary(address);
        } catch (error) {
            console.warn('Primary XRPL RPC failed, trying fallback:', error.message);
            try {
                return await this.getBalanceFromFallback(address);
            } catch (fallbackError) {
                throw new Error(`Both XRPL RPCs failed: ${fallbackError.message}`);
            }
        }
    }

    /**
     * Get balance from primary RPC
     * @param {string} address - XRPL address
     * @returns {Promise<Object>} - Balance data
     */
    async getBalanceFromPrimary(address) {
        const accountInfo = await this.makeRpcRequest('account_info', {
            account: address,
            ledger_index: 'validated'
        });

        if (!accountInfo.account_data) {
            throw new Error('Account not found');
        }

        const balanceDrops = accountInfo.account_data.Balance;
        const balanceXRP = parseInt(balanceDrops) / this.dropsPerXRP;

        // Get token balances (trust lines)
        const tokenBalances = await this.getTokenBalances(address);

        return {
            data: [
                {
                    address: 'native',
                    symbol: 'XRP',
                    name: 'XRP',
                    decimals: 6,
                    balance: balanceDrops,
                    balanceFormatted: balanceXRP.toFixed(6),
                    priceUSD: 0.5, // Mock price - in production, fetch from price API
                    valueUSD: balanceXRP * 0.5,
                    logo: null,
                    verified: true
                },
                ...tokenBalances
            ],
            source: 'xrpl-primary'
        };
    }

    /**
     * Get balance from fallback RPC
     * @param {string} address - XRPL address
     * @returns {Promise<Object>} - Balance data
     */
    async getBalanceFromFallback(address) {
        const accountInfo = await this.makeRpcRequest('account_info', {
            account: address,
            ledger_index: 'validated'
        }, true);

        if (!accountInfo.account_data) {
            throw new Error('Account not found');
        }

        const balanceDrops = accountInfo.account_data.Balance;
        const balanceXRP = parseInt(balanceDrops) / this.dropsPerXRP;

        return {
            data: [{
                address: 'native',
                symbol: 'XRP',
                name: 'XRP',
                decimals: 6,
                balance: balanceDrops,
                balanceFormatted: balanceXRP.toFixed(6),
                priceUSD: 0.5,
                valueUSD: balanceXRP * 0.5,
                logo: null,
                verified: true
            }],
            source: 'xrpl-fallback'
        };
    }

    /**
     * Get token balances (trust lines)
     * @param {string} address - XRPL address
     * @returns {Promise<Array>} - Token balance array
     */
    async getTokenBalances(address) {
        try {
            const accountLines = await this.makeRpcRequest('account_lines', {
                account: address,
                ledger_index: 'validated'
            });

            if (!accountLines.lines) {
                return [];
            }

            return accountLines.lines
                .filter(line => parseFloat(line.balance) > 0)
                .map(line => ({
                    address: line.account,
                    symbol: line.currency,
                    name: `${line.currency} Token`,
                    decimals: 6,
                    balance: line.balance,
                    balanceFormatted: parseFloat(line.balance).toFixed(6),
                    priceUSD: 0,
                    valueUSD: 0,
                    logo: null,
                    verified: false
                }));
        } catch (error) {
            console.warn('Failed to get XRPL token balances:', error.message);
            return [];
        }
    }

    /**
     * Get transaction history
     * @param {string} address - XRPL address
     * @param {number} limit - Number of transactions
     * @returns {Promise<Object>} - Transaction data
     */
    async getTransactions(address, limit = 50) {
        if (!this.validateAddress(address)) {
            throw new Error('Invalid XRPL address format');
        }

        try {
            const accountTx = await this.makeRpcRequest('account_tx', {
                account: address,
                ledger_index_min: -1,
                ledger_index_max: -1,
                limit: limit
            });

            if (!accountTx.transactions) {
                return {
                    data: [],
                    source: 'xrpl-primary'
                };
            }

            const transactions = accountTx.transactions.map(txData => {
                const tx = txData.tx;
                const meta = txData.meta;
                
                return {
                    hash: tx.hash,
                    from: tx.Account,
                    to: tx.Destination || '',
                    value: tx.Amount || '0',
                    valueFormatted: tx.Amount ? (parseInt(tx.Amount) / this.dropsPerXRP).toFixed(6) : '0',
                    fee: tx.Fee,
                    timestamp: this.rippleTimeToISO(tx.date),
                    ledgerIndex: tx.ledger_index,
                    transactionType: tx.TransactionType,
                    status: meta.TransactionResult === 'tesSUCCESS' ? 'success' : 'failed'
                };
            });

            return {
                data: transactions,
                source: 'xrpl-primary'
            };
        } catch (error) {
            throw new Error(`Failed to get XRPL transactions: ${error.message}`);
        }
    }

    /**
     * Get NFT portfolio
     * @param {string} address - XRPL address
     * @returns {Promise<Object>} - NFT data
     */
    async getNFTs(address) {
        if (!this.validateAddress(address)) {
            throw new Error('Invalid XRPL address format');
        }

        try {
            const accountNFTs = await this.makeRpcRequest('account_nfts', {
                account: address,
                ledger_index: 'validated'
            });

            if (!accountNFTs.account_nfts) {
                return {
                    data: [],
                    source: 'xrpl-primary'
                };
            }

            const nfts = accountNFTs.account_nfts.map(nft => ({
                nftTokenID: nft.NFTokenID,
                issuer: nft.Issuer,
                taxon: nft.NFTokenTaxon,
                sequence: nft.nft_serial,
                uri: nft.URI ? this.hexToString(nft.URI) : '',
                name: `XRPL NFT #${nft.nft_serial}`,
                description: 'XRPL Native NFT',
                image: '',
                collection: 'XRPL Native',
                tokenType: 'XLS-20'
            }));

            return {
                data: nfts,
                source: 'xrpl-primary'
            };
        } catch (error) {
            console.warn('Failed to get XRPL NFTs:', error.message);
            return {
                data: [],
                source: 'xrpl-primary'
            };
        }
    }

    /**
     * Convert Ripple time to ISO string
     * @param {number} rippleTime - Ripple timestamp
     * @returns {string} - ISO timestamp
     */
    rippleTimeToISO(rippleTime) {
        // Ripple epoch starts January 1, 2000 (00:00 UTC)
        const rippleEpoch = 946684800;
        const unixTime = rippleTime + rippleEpoch;
        return new Date(unixTime * 1000).toISOString();
    }

    /**
     * Convert hex string to UTF-8
     * @param {string} hex - Hex string
     * @returns {string} - UTF-8 string
     */
    hexToString(hex) {
        try {
            return Buffer.from(hex, 'hex').toString('utf8');
        } catch (error) {
            return hex;
        }
    }

    /**
     * Get health status
     * @returns {Promise<Object>} - Health status
     */
    async getHealthStatus() {
        try {
            // Test primary RPC connection
            await this.makeRpcRequest('server_info', {});

            return {
                status: 'healthy',
                chain: this.chainName,
                providers: {
                    primary: 'healthy',
                    fallback: 'available'
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            try {
                // Test fallback RPC connection
                await this.makeRpcRequest('server_info', {}, true);
                
                return {
                    status: 'degraded',
                    chain: this.chainName,
                    providers: {
                        primary: 'failed',
                        fallback: 'healthy'
                    },
                    timestamp: new Date().toISOString()
                };
            } catch (fallbackError) {
                return {
                    status: 'unhealthy',
                    chain: this.chainName,
                    error: 'All XRPL providers failed',
                    timestamp: new Date().toISOString()
                };
            }
        }
    }
}

export default XRPLService;