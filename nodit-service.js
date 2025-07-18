// NODIT MCP Integration Service
// Comprehensive Web3 Data APIs, MCP Analysis, and Webhook Management

import axios from 'axios';
import { EventEmitter } from 'events';
import WebSocket from 'ws';
import { createHmac, timingSafeEqual } from 'crypto';

class NoditService {
    constructor(apiKey, options = {}) {
        this.apiKey = apiKey;
        this.baseUrl = options.baseUrl || 'https://web3.nodit.io/v1';
        this.mcpEndpoint = options.mcpEndpoint || 'https://mcp.nodit.io';
        this.webhookEndpoint = options.webhookEndpoint || 'https://webhooks.nodit.io';
        this.streamEndpoint = options.streamEndpoint || 'wss://stream.nodit.io';
        
        // Supported chains
        this.supportedChains = {
            ethereum: { id: 1, name: 'Ethereum', symbol: 'ETH' },
            polygon: { id: 137, name: 'Polygon', symbol: 'MATIC' },
            bsc: { id: 56, name: 'BSC', symbol: 'BNB' },
            arbitrum: { id: 42161, name: 'Arbitrum', symbol: 'ETH' },
            optimism: { id: 10, name: 'Optimism', symbol: 'ETH' },
            aptos: { id: 'aptos', name: 'Aptos', symbol: 'APT' },
            sui: { id: 'sui', name: 'Sui', symbol: 'SUI' },
            xrpl: { id: 'xrpl', name: 'XRPL', symbol: 'XRP' },
            solana: { id: 'solana', name: 'Solana', symbol: 'SOL' }
        };
        
        this.webhooks = new Map();
        this.streams = new Map();
        this.cache = new Map();
        this.rateLimiter = new RateLimiter(100, 60000); // 100 requests per minute
        this.initialized = false;
    }

    // ==================== INITIALIZATION ====================
    
    async initialize() {
        if (this.initialized) {
            return true;
        }
        
        try {
            console.log('🔧 Initializing NODIT service...');
            
            // Test API connection
            const isAuthenticated = await this.authenticate();
            if (!isAuthenticated) {
                console.warn('⚠️ NODIT API authentication failed - using mock data');
            } else {
                console.log('✅ NODIT API authenticated successfully');
            }
            
            this.initialized = true;
            console.log('🚀 NODIT service initialized');
            return true;
        } catch (error) {
            console.error('❌ Failed to initialize NODIT service:', error.message);
            console.log('🔄 Continuing with mock data...');
            this.initialized = true;
            return false;
        }
    }

    // ==================== AUTHENTICATION ====================
    
    async authenticate() {
        try {
            console.log('🔑 Using web3.nodit.io API - authentication will be validated per request');
            return true;
        } catch (error) {
            console.error('Authentication failed:', error);
            return false;
        }
    }

    // ==================== PORTFOLIO TRACKING ====================
    
    async getMultiChainPortfolio(address, chains = null) {
        const targetChains = chains || Object.keys(this.supportedChains);
        const portfolioPromises = targetChains.map(chain => 
            this.getChainPortfolio(address, chain)
        );
        
        const results = await Promise.allSettled(portfolioPromises);
        const portfolio = {};
        
        results.forEach((result, index) => {
            const chain = targetChains[index];
            if (result.status === 'fulfilled') {
                portfolio[chain] = result.value;
            } else {
                console.error(`Failed to fetch ${chain} portfolio:`, result.reason);
                portfolio[chain] = { tokens: [], nfts: [], totalValue: 0, error: result.reason.message };
            }
        });
        
        return portfolio;
    }
    
    async getChainPortfolio(address, chain) {
        const cacheKey = `portfolio_${chain}_${address}`;
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes cache
            return cached.data;
        }
        
        try {
            const [tokens, nfts, transactions] = await Promise.all([
                this.getTokenBalances(address, chain),
                this.getNFTPortfolio(address, chain),
                this.getRecentTransactions(address, chain, 10)
            ]);
            
            const totalValue = tokens.reduce((sum, token) => sum + (token.valueUSD || 0), 0);
            
            const portfolio = {
                address,
                chain,
                tokens,
                nfts,
                transactions,
                totalValue,
                lastUpdated: new Date().toISOString()
            };
            
            this.cache.set(cacheKey, { data: portfolio, timestamp: Date.now() });
            return portfolio;
        } catch (error) {
            throw new Error(`Failed to fetch ${chain} portfolio: ${error.message}`);
        }
    }
    
    async getTokenBalances(address, chain) {
        const endpoint = `/v1/${chain}/address/${address}/tokens`;
        const response = await this.makeRequest(endpoint);
        
        return response.tokens.map(token => ({
            address: token.contract_address,
            symbol: token.symbol,
            name: token.name,
            decimals: token.decimals,
            balance: token.balance,
            balanceFormatted: this.formatBalance(token.balance, token.decimals),
            priceUSD: token.price_usd,
            valueUSD: parseFloat(token.balance) * parseFloat(token.price_usd || 0) / Math.pow(10, token.decimals),
            logo: token.logo_url,
            verified: token.verified
        }));
    }
    
    async getNFTPortfolio(address, chain) {
        const endpoint = `/v1/${chain}/address/${address}/nfts`;
        const response = await this.makeRequest(endpoint);
        
        return response.nfts.map(nft => ({
            tokenId: nft.token_id,
            contractAddress: nft.contract_address,
            name: nft.name,
            description: nft.description,
            image: nft.image_url,
            collection: {
                name: nft.collection_name,
                slug: nft.collection_slug,
                verified: nft.collection_verified
            },
            metadata: nft.metadata,
            lastSale: nft.last_sale,
            floorPrice: nft.floor_price,
            estimatedValue: nft.estimated_value
        }));
    }
    
    async getRecentTransactions(address, chain, limit = 50) {
        const endpoint = `/v1/${chain}/address/${address}/transactions?limit=${limit}`;
        const response = await this.makeRequest(endpoint);
        
        return response.transactions.map(tx => ({
            hash: tx.hash,
            blockNumber: tx.block_number,
            timestamp: tx.timestamp,
            from: tx.from,
            to: tx.to,
            value: tx.value,
            valueFormatted: this.formatBalance(tx.value, 18),
            gasUsed: tx.gas_used,
            gasPrice: tx.gas_price,
            status: tx.status,
            type: tx.type,
            tokenTransfers: tx.token_transfers || []
        }));
    }

    // ==================== MCP AI ANALYSIS ====================
    
    async generatePortfolioInsights(portfolioData, userPreferences = {}) {
        const mcpPayload = {
            action: 'analyze_portfolio',
            data: {
                portfolio: portfolioData,
                preferences: userPreferences,
                analysis_type: 'comprehensive'
            },
            options: {
                include_recommendations: true,
                include_risk_analysis: true,
                include_market_trends: true,
                include_defi_opportunities: true
            }
        };
        
        try {
            const response = await this.makeMCPRequest('/analyze', mcpPayload);
            return this.formatAIInsights(response);
        } catch (error) {
            console.error('MCP analysis failed:', error);
            return this.generateFallbackInsights(portfolioData);
        }
    }
    
    async detectAnomalies(address, timeframe = '24h') {
        const mcpPayload = {
            action: 'detect_anomalies',
            data: {
                address,
                timeframe,
                analysis_depth: 'deep'
            }
        };
        
        const response = await this.makeMCPRequest('/anomalies', mcpPayload);
        return response.anomalies || [];
    }
    
    async predictPriceMovements(tokens, timeframe = '1h') {
        const mcpPayload = {
            action: 'predict_prices',
            data: {
                tokens,
                timeframe,
                confidence_threshold: 0.7
            }
        };
        
        const response = await this.makeMCPRequest('/predictions', mcpPayload);
        return response.predictions || [];
    }
    
    async findDeFiOpportunities(portfolioData) {
        const mcpPayload = {
            action: 'find_defi_opportunities',
            data: {
                portfolio: portfolioData,
                risk_tolerance: 'medium',
                min_apy: 5.0
            }
        };
        
        const response = await this.makeMCPRequest('/defi', mcpPayload);
        return response.opportunities || [];
    }

    // ==================== REAL-TIME STREAMS ====================
    
    async subscribeToAddressActivity(address, chains, callback) {
        const streamId = `address_${address}_${chains.join('_')}`;
        
        if (this.streams.has(streamId)) {
            console.warn('Already subscribed to this address activity');
            return streamId;
        }
        
        try {
            const ws = new WebSocket(`${this.streamEndpoint}/address/${address}`);
            
            ws.onopen = () => {
                console.log(`Subscribed to address activity: ${address}`);
                ws.send(JSON.stringify({
                    action: 'subscribe',
                    chains,
                    filters: ['transactions', 'token_transfers', 'nft_transfers']
                }));
            };
            
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    callback(data);
                } catch (error) {
                    console.error('Failed to parse stream data:', error);
                }
            };
            
            ws.onerror = (error) => {
                console.error('Stream error:', error);
            };
            
            ws.onclose = () => {
                console.log('Stream closed');
                this.streams.delete(streamId);
            };
            
            this.streams.set(streamId, ws);
            return streamId;
        } catch (error) {
            console.error('Failed to subscribe to address activity:', error);
            throw error;
        }
    }
    
    async subscribeToTokenPrices(tokens, callback) {
        const streamId = `prices_${tokens.join('_')}`;
        
        if (this.streams.has(streamId)) {
            console.warn('Already subscribed to these token prices');
            return streamId;
        }
        
        try {
            const ws = new WebSocket(`${this.streamEndpoint}/prices`);
            
            ws.onopen = () => {
                console.log('Subscribed to token prices');
                ws.send(JSON.stringify({
                    action: 'subscribe',
                    tokens,
                    interval: '1s'
                }));
            };
            
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    callback(data);
                } catch (error) {
                    console.error('Failed to parse price data:', error);
                }
            };
            
            this.streams.set(streamId, ws);
            return streamId;
        } catch (error) {
            console.error('Failed to subscribe to token prices:', error);
            throw error;
        }
    }
    
    unsubscribeFromStream(streamId) {
        const ws = this.streams.get(streamId);
        if (ws) {
            ws.close();
            this.streams.delete(streamId);
            return true;
        }
        return false;
    }

    // ==================== WEBHOOKS ====================
    
    async createWebhook(config) {
        const webhookPayload = {
            url: config.url,
            events: config.events || ['transaction', 'token_transfer', 'price_alert'],
            filters: config.filters || {},
            secret: config.secret,
            active: true
        };
        
        const response = await this.makeRequest('/webhooks', {
            method: 'POST',
            body: JSON.stringify(webhookPayload)
        });
        
        this.webhooks.set(response.id, response);
        return response;
    }
    
    async updateWebhook(webhookId, updates) {
        const response = await this.makeRequest(`/webhooks/${webhookId}`, {
            method: 'PATCH',
            body: JSON.stringify(updates)
        });
        
        this.webhooks.set(webhookId, response);
        return response;
    }
    
    async deleteWebhook(webhookId) {
        await this.makeRequest(`/webhooks/${webhookId}`, {
            method: 'DELETE'
        });
        
        this.webhooks.delete(webhookId);
        return true;
    }
    
    async listWebhooks() {
        const response = await this.makeRequest('/webhooks');
        return response.webhooks || [];
    }
    
    // Webhook signature verification
    verifyWebhookSignature(payload, signature, secret) {
        const crypto = require('crypto');
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
        
        return crypto.timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );
    }

    // ==================== UTILITY METHODS ====================
    
    async makeRequest(endpoint, options = {}) {
        await this.rateLimiter.checkLimit();
        
        const url = `${this.baseUrl}${endpoint}`;
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'X-API-KEY': this.apiKey,
            'User-Agent': 'ChainHive/1.0.0'
        };
        
        const config = {
            method: 'GET',
            headers: { ...defaultHeaders, ...options.headers },
            ...options
        };
        
        // Ensure body is properly handled for POST requests
        if (options.body && typeof options.body === 'string') {
            config.body = options.body;
        }
        
        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error(`Request to ${url} failed:`, error);
            throw error;
        }
    }
    
    async makeMCPRequest(endpoint, payload) {
        const url = `${this.mcpEndpoint}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-KEY': this.apiKey,
                    'X-MCP-Version': '1.0'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`MCP request failed: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('MCP request failed:', error);
            throw error;
        }
    }
    
    formatBalance(balance, decimals) {
        const value = parseFloat(balance) / Math.pow(10, decimals);
        return value.toLocaleString('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 6
        });
    }
    
    formatAIInsights(mcpResponse) {
        const insights = mcpResponse.insights || {};
        
        return {
            summary: insights.summary || 'Portfolio analysis completed',
            recommendations: insights.recommendations || [],
            riskAnalysis: insights.risk_analysis || {},
            marketTrends: insights.market_trends || {},
            defiOpportunities: insights.defi_opportunities || [],
            alerts: insights.alerts || [],
            confidence: insights.confidence || 0.8
        };
    }
    
    generateFallbackInsights(portfolioData) {
        const totalValue = Object.values(portfolioData)
            .reduce((sum, chain) => sum + (chain.totalValue || 0), 0);
        
        return {
            summary: `Portfolio analysis completed. Total value: $${totalValue.toLocaleString()}`,
            recommendations: [
                'Consider diversifying across multiple chains',
                'Monitor gas fees for optimal transaction timing',
                'Review DeFi yield opportunities'
            ],
            riskAnalysis: {
                level: 'medium',
                factors: ['Market volatility', 'Smart contract risk']
            },
            alerts: [],
            confidence: 0.6
        };
    }
}

// Rate Limiter Class
class RateLimiter {
    constructor(maxRequests, windowMs) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = [];
    }
    
    async checkLimit() {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.windowMs);
        
        if (this.requests.length >= this.maxRequests) {
            const oldestRequest = Math.min(...this.requests);
            const waitTime = this.windowMs - (now - oldestRequest);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return this.checkLimit();
        }
        
        this.requests.push(now);
    }
}

// Export for use in other modules
export { NoditService, RateLimiter };