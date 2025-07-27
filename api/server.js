// ChainHive Express Server
// Serves the HTML frontend and provides API endpoints for NODIT integration

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { NoditService } from '../nodit-service.js';
import { MultiChainService } from '../src/multi-chain-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODIT_API_KEY = process.env.NODIT_API_KEY;

// Initialize services
let primaryService;
let fallbackService;

try {
    // Try to use MultiChainService as primary
    primaryService = new MultiChainService();
    console.log('✅ MultiChainService initialized as primary service');
    
    // Initialize MCP service
    (async () => {
        try {
            await primaryService.initializeMCP();
            console.log('✅ MCP service initialized successfully');
        } catch (error) {
            console.warn('⚠️ Failed to initialize MCP service:', error.message);
        }
    })();
    
    // Keep NoditService as fallback if API key is available
    if (NODIT_API_KEY) {
        fallbackService = new NoditService(NODIT_API_KEY);
        console.log('✅ NoditService initialized as fallback service');
    }
} catch (error) {
    console.warn('⚠️ MultiChainService initialization failed, using NoditService only:', error.message);
    
    if (!NODIT_API_KEY) {
        throw new Error('NODIT_API_KEY environment variable is required when MultiChainService is not available');
    }
    
    primaryService = new NoditService(NODIT_API_KEY);
}

// Service wrapper to handle fallback logic
const serviceWrapper = {
    async getTokenBalances(chain, address) {
        try {
            if (primaryService instanceof MultiChainService) {
                return await primaryService.getBalance(chain, address);
            }
            return await primaryService.getTokenBalances(chain, address);
        } catch (error) {
            if (fallbackService) {
                console.warn(`Primary service failed for getTokenBalances, using fallback:`, error.message);
                return await fallbackService.getTokenBalances(chain, address,);
            }
            throw error;
        }
    },
    
    async getTransactionHistory(chain, address, limit, offset) {
        try {
            if (primaryService instanceof MultiChainService) {
                return await primaryService.getTransactions(chain, address, limit);
            }
            return await primaryService.getTransactionHistory(chain, address, limit, offset);
        } catch (error) {
            if (fallbackService) {
                console.warn(`Primary service failed for getTransactionHistory, using fallback:`, error.message);
                return await fallbackService.getTransactionHistory(chain, address, limit, offset);
            }
            throw error;
        }
    },
    
    async getNFTData(chain, address) {
        try {
            if (primaryService instanceof MultiChainService) {
                return await primaryService.getNFTs(chain, address);
            }
            return await primaryService.getNFTData(chain, address);
        } catch (error) {
            if (fallbackService) {
                console.warn(`Primary service failed for getNFTData, using fallback:`, error.message);
                return await fallbackService.getNFTData(chain, address);
            }
            throw error;
        }
    },
    
    // Delegate other methods to primary service (with fallback)
    async getMultiChainPortfolio(...args) {
        try {
            return await primaryService.getMultiChainPortfolio(...args);
        } catch (error) {
            if (fallbackService) {
                return await fallbackService.getMultiChainPortfolio(...args);
            }
            throw error;
        }
    },
    
    async generatePortfolioInsights(...args) {
        try {
            return await primaryService.generatePortfolioInsights(...args);
        } catch (error) {
            if (fallbackService) {
                return await fallbackService.generatePortfolioInsights(...args);
            }
            throw error;
        }
    },
    
    async getTokenPrices(...args) {
        try {
            return await primaryService.getTokenPrices(...args);
        } catch (error) {
            if (fallbackService) {
                return await fallbackService.getTokenPrices(...args);
            }
            throw error;
        }
    },
    
    async getGasFees(...args) {
        try {
            return await primaryService.getGasFees(...args);
        } catch (error) {
            if (fallbackService) {
                return await fallbackService.getGasFees(...args);
            }
            throw error;
        }
    },
    
    async setupWebhook(...args) {
        try {
            return await primaryService.setupWebhook(...args);
        } catch (error) {
            if (fallbackService) {
                return await fallbackService.setupWebhook(...args);
            }
            throw error;
        }
    },
    
    async processWebhookData(...args) {
        try {
            return await primaryService.processWebhookData(...args);
        } catch (error) {
            if (fallbackService) {
                return await fallbackService.processWebhookData(...args);
            }
            throw error;
        }
    },
    
    async startPortfolioStream(...args) {
        try {
            return await primaryService.startPortfolioStream(...args);
        } catch (error) {
            if (fallbackService) {
                return await fallbackService.startPortfolioStream(...args);
            }
            throw error;
        }
    },
    
    async stopPortfolioStream(...args) {
        try {
            return await primaryService.stopPortfolioStream(...args);
        } catch (error) {
            if (fallbackService) {
                return await fallbackService.stopPortfolioStream(...args);
            }
            throw error;
        }
    },
    
    async getHistoricalData(...args) {
        try {
            return await primaryService.getHistoricalData(...args);
        } catch (error) {
            if (fallbackService) {
                return await fallbackService.getHistoricalData(...args);
            }
            throw error;
        }
    },
    
    async getMarketConditions(...args) {
        try {
            return await primaryService.getMarketConditions(...args);
        } catch (error) {
            if (fallbackService) {
                return await fallbackService.getMarketConditions(...args);
            }
            throw error;
        }
    },
    
    async getKairosChainData(...args) {
        try {
            return await primaryService.getKairosChainData(...args);
        } catch (error) {
            if (fallbackService) {
                return await fallbackService.getKairosChainData(...args);
            }
            throw error;
        }
    },
    
    async initialize() {
        const results = [];
        try {
            if (primaryService.initialize) {
                await primaryService.initialize();
                results.push('Primary service initialized');
            }
        } catch (error) {
            console.warn('Primary service initialization failed:', error.message);
        }
        
        try {
            if (fallbackService && fallbackService.initialize) {
                await fallbackService.initialize();
                results.push('Fallback service initialized');
            }
        } catch (error) {
            console.warn('Fallback service initialization failed:', error.message);
        }
        
        return results;
    }
};

// Use the service wrapper as noditService for backward compatibility
const noditService = serviceWrapper;

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            connectSrc: ["'self'", "https://api.web3auth.io", "https://web3.nodit.io", "https://kaia-kairos.nodit.io"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '..'), {
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// API Routes

// Health check for Render (direct /health endpoint)
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: {
            nodit: 'connected',
            database: 'connected'
        }
    });
});

// Health check (API endpoint)
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        services: {
            nodit: 'connected',
            database: 'connected'
        }
    });
});

// MCP service status endpoint
app.get('/api/mcp/status', async (req, res) => {
    try {
        let mcpStatus = {
            enabled: false,
            ready: false,
            error: 'MCP service not available'
        };
        
        // Check if primary service has MCP capabilities
        if (primaryService && typeof primaryService.getMCPStatus === 'function') {
            mcpStatus = await primaryService.getMCPStatus();
        }
        
        res.json({
            success: true,
            data: {
                mcp: mcpStatus,
                apiKey: process.env.NODIT_API_KEY ? 'configured' : 'missing',
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('MCP status check error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check MCP status',
            message: error.message
        });
    }
});

// MCP service restart endpoint
app.post('/api/mcp/restart', async (req, res) => {
    try {
        if (!primaryService || typeof primaryService.restartMCP !== 'function') {
            return res.status(404).json({
                success: false,
                error: 'MCP service not available'
            });
        }
        
        const success = await primaryService.restartMCP();
        
        res.json({
            success,
            message: success ? 'MCP service restarted successfully' : 'Failed to restart MCP service',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('MCP restart error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to restart MCP service',
            message: error.message
        });
    }
});

// Get Web3Auth configuration
app.get('/api/config', (req, res) => {
    res.json({
        web3auth: {
            clientId: process.env.WEB3AUTH_CLIENT_ID || "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ",
            network: process.env.WEB3AUTH_NETWORK || "sapphire_mainnet"
        }
    });
});

// Get multi-chain portfolio
app.get('/api/portfolio/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const { chains } = req.query;
        
        if (!address) {
            return res.status(400).json({ error: 'Address is required' });
        }
        
        const portfolio = await noditService.getMultiChainPortfolio(
            address, 
            chains ? chains.split(',') : undefined
        );
        
        res.json({
            success: true,
            data: portfolio,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Portfolio API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch portfolio data',
            message: error.message
        });
    }
});

// Get token balances for specific chain
app.get('/api/balance/:chain/:address', async (req, res) => {
    try {
        const { chain, address } = req.params;
        
        const balance = await noditService.getTokenBalances(address, chain);
        
        res.json({
            success: true,
            data: balance,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Balance API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch balance data',
            message: error.message
        });
    }
});

// Get transaction history
app.get('/api/transactions/:chain/:address', async (req, res) => {
    try {
        const { chain, address } = req.params;
        const { limit = 10, offset = 0 } = req.query;
        
        const transactions = await noditService.getTransactionHistory(
            address, 
            chain, 
            parseInt(limit), 
            parseInt(offset)
        );
        
        res.json({
            success: true,
            data: transactions,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Transactions API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch transaction data',
            message: error.message
        });
    }
});

// Get NFT data
app.get('/api/nfts/:chain/:address', async (req, res) => {
    try {
        const { chain, address } = req.params;
        
        const nfts = await noditService.getNFTData(address, chain);
        
        res.json({
            success: true,
            data: nfts,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('NFTs API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch NFT data',
            message: error.message
        });
    }
});

// Generate AI insights
app.post('/api/insights', async (req, res) => {
    try {
        const { portfolioData, preferences, address, totalValue } = req.body;
        
        // Handle different input formats
        let inputData = portfolioData;
        if (!inputData && address) {
            // Create mock portfolio data from address and totalValue
            inputData = {
                address,
                totalValue: totalValue || 0,
                chains: ['ethereum'],
                tokens: [],
                nfts: []
            };
        }
        
        if (!inputData) {
            return res.status(400).json({ error: 'Portfolio data or address is required' });
        }
        
        const insights = await noditService.generatePortfolioInsights(
            inputData, 
            preferences
        );
        
        res.json({
            success: true,
            data: insights,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Insights API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate insights',
            message: error.message
        });
    }
});

// Get token prices
app.get('/api/prices', async (req, res) => {
    try {
        const { tokens } = req.query;
        
        if (!tokens) {
            return res.status(400).json({ error: 'Tokens parameter is required' });
        }
        
        const tokenList = tokens.split(',');
        const prices = await noditService.getTokenPrices(tokenList);
        
        res.json({
            success: true,
            data: prices,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Prices API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch price data',
            message: error.message
        });
    }
});

// Get gas fees
app.get('/api/gas', async (req, res) => {
    try {
        const { chains } = req.query;
        
        const chainList = chains ? chains.split(',') : ['ethereum', 'polygon', 'bsc'];
        const gasFees = await noditService.getGasFees(chainList);
        
        res.json({
            success: true,
            data: gasFees,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Gas API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch gas data',
            message: error.message
        });
    }
});

// Setup webhooks
app.post('/api/webhooks/setup', async (req, res) => {
    try {
        const { address, events, callbackUrl } = req.body;
        
        if (!address || !events || !callbackUrl) {
            return res.status(400).json({ 
                error: 'Address, events, and callbackUrl are required' 
            });
        }
        
        const webhook = await noditService.setupWebhook(address, events, callbackUrl);
        
        res.json({
            success: true,
            data: webhook,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Webhook setup error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to setup webhook',
            message: error.message
        });
    }
});

// Webhook receiver
app.post('/api/webhooks/receive', async (req, res) => {
    try {
        const webhookData = req.body;
        
        // Process webhook data
        await noditService.processWebhookData(webhookData);
        
        res.json({ success: true, received: true });
        
    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to process webhook',
            message: error.message
        });
    }
});

// Stream endpoints
app.get('/api/stream/portfolio/:address', async (req, res) => {
    try {
        const { address } = req.params;
        
        // Set up SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*'
        });
        
        // Start streaming portfolio updates
        const streamId = await noditService.startPortfolioStream(address, (data) => {
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        });
        
        // Handle client disconnect
        req.on('close', () => {
            noditService.stopPortfolioStream(streamId);
        });
        
    } catch (error) {
        console.error('Stream error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to start stream',
            message: error.message
        });
    }
});

// Portfolio streaming start endpoint
app.post('/api/portfolio/stream/start', async (req, res) => {
    try {
        const { address } = req.body;
        
        if (!address) {
            return res.status(400).json({
                success: false,
                error: 'Address is required'
            });
        }
        
        // Start portfolio streaming
        const streamId = await serviceWrapper.startPortfolioStream(address, (data) => {
            // For POST endpoint, we don't stream directly
            // This is handled by the GET SSE endpoint
            console.log('Portfolio stream data:', data);
        });
        
        res.json({
            success: true,
            message: 'Portfolio streaming started',
            data: {
                streamId,
                address,
                endpoint: `/api/stream/portfolio/${address}`,
                startTime: new Date().toISOString()
            }
        });
        
    } catch (error) {
        console.error('Portfolio stream start error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to start portfolio streaming',
            message: error.message
        });
    }
});

// Portfolio streaming stop endpoint
app.post('/api/portfolio/stream/stop', async (req, res) => {
    try {
        const { address, streamId } = req.body;
        
        if (!address && !streamId) {
            return res.status(400).json({
                success: false,
                error: 'Address or streamId is required'
            });
        }
        
        let result;
        if (streamId) {
            // Stop specific stream by ID
            result = await serviceWrapper.stopPortfolioStream(streamId);
        } else {
            // Stop all streams for address (fallback)
            const activeStreams = noditService.getActiveStreams();
            const addressStreams = activeStreams.filter(stream => stream.address === address);
            
            if (addressStreams.length === 0) {
                return res.json({
                    success: true,
                    message: 'No active streams found for address',
                    address
                });
            }
            
            // Stop all streams for this address
            const results = await Promise.all(
                addressStreams.map(stream => serviceWrapper.stopPortfolioStream(stream.streamId))
            );
            
            result = {
                success: true,
                message: `Stopped ${results.length} stream(s)`,
                streams: results
            };
        }
        
        res.json({
            success: true,
            data: result,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Portfolio stream stop error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to stop portfolio streaming',
            message: error.message
        });
    }
});

// Get historical portfolio data
app.get('/api/historical/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const { days = '30' } = req.query;
        
        if (!address) {
            return res.status(400).json({ error: 'Address is required' });
        }
        
        const historicalData = await noditService.getHistoricalData(address, parseInt(days));
        
        res.json({
            success: true,
            data: historicalData,
            address,
            days: parseInt(days),
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Historical API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch historical data',
            message: error.message,
            address: req.params.address,
            days: parseInt(req.query.days || '30'),
            timestamp: new Date().toISOString()
        });
    }
});

// Get market conditions
app.get('/api/market-conditions', async (req, res) => {
    try {
        const marketData = await noditService.getMarketConditions();
        
        res.json({
            success: true,
            data: marketData,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Market conditions API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch market conditions',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Get Kairos network data
app.get('/api/kairos/:address', async (req, res) => {
    try {
        const { address } = req.params;
        const { dataType = 'portfolio' } = req.query;
        
        if (!address) {
            return res.status(400).json({ error: 'Address is required' });
        }
        
        const kairosData = await noditService.getKairosChainData(address, dataType);
        
        res.json({
            success: true,
            data: kairosData,
            network: 'kairos',
            chainId: 1001,
            contracts: {
                ChainHiveToken: '0xC34571EF2deF39aF6e1b7F072740061CBc1ec421',
                ChainHive: '0x76069a57EFaf234E18195756fe580E7064884A46',
                ChainHiveMultiChain: '0xf93Cf0AB9b60967368714f7d8BB6A48c0034ACD2',
                ChainHiveGovernance: '0x0601ED877D78dc4BE53cDd25A0dAfF3F6d261640',
                TimelockController: '0x7c19b04AD3375e3710e5bBF4C528909C407af46B'
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Kairos API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch Kairos data',
            message: error.message
        });
    }
});

// MCP Service endpoints
app.get('/api/mcp/status', async (req, res) => {
    try {
        if (primaryService instanceof MultiChainService) {
            const mcpStatus = await primaryService.getMCPStatus();
            res.json({
                success: true,
                data: mcpStatus,
                timestamp: new Date().toISOString()
            });
        } else {
            res.json({
                success: false,
                error: 'MCP service not available',
                message: 'MultiChainService is required for MCP functionality'
            });
        }
    } catch (error) {
        console.error('MCP status API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get MCP status',
            message: error.message
        });
    }
});

// Restart MCP service
app.post('/api/mcp/restart', async (req, res) => {
    try {
        if (primaryService instanceof MultiChainService) {
            const success = await primaryService.restartMCP();
            res.json({
                success,
                message: success ? 'MCP service restarted successfully' : 'Failed to restart MCP service',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(400).json({
                success: false,
                error: 'MCP service not available',
                message: 'MultiChainService is required for MCP functionality'
            });
        }
    } catch (error) {
        console.error('MCP restart API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to restart MCP service',
            message: error.message
        });
    }
});

// Get all supported chains (including MCP chains)
app.get('/api/chains/supported', async (req, res) => {
    try {
        if (primaryService instanceof MultiChainService) {
            const chains = primaryService.getAllSupportedChains();
            res.json({
                success: true,
                data: {
                    chains,
                    count: chains.length,
                    mcpEnabled: primaryService.mcpEnabled
                },
                timestamp: new Date().toISOString()
            });
        } else {
            res.json({
                success: true,
                data: {
                    chains: ['ethereum', 'polygon', 'bsc', 'xrpl', 'aptos', 'kaia'],
                    count: 6,
                    mcpEnabled: false
                },
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('Supported chains API error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get supported chains',
            message: error.message
        });
    }
});

// Enhanced health check with MCP status
app.get('/api/health/detailed', async (req, res) => {
    try {
        let healthStatus = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            services: {
                primary: primaryService.constructor.name,
                fallback: fallbackService ? fallbackService.constructor.name : 'none'
            }
        };

        if (primaryService instanceof MultiChainService) {
            const chainHealth = await primaryService.getHealthStatus();
            healthStatus.chains = chainHealth;
        }

        res.json({
            success: true,
            data: healthStatus
        });
    } catch (error) {
        console.error('Detailed health check error:', error);
        res.status(500).json({
            success: false,
            error: 'Health check failed',
            message: error.message
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    if (req.path.startsWith('/api/')) {
        res.status(404).json({
            success: false,
            error: 'API endpoint not found'
        });
    } else {
        // Serve index.html for all non-API routes (SPA support)
        res.sendFile(path.join(__dirname, '..', 'index.html'));
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 ChainHive server running on port ${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
    console.log(`🌐 Frontend available at http://localhost:${PORT}`);
    
    if (NODIT_API_KEY) {
        console.log(`🔑 NODIT API Key: ${NODIT_API_KEY.substring(0, 8)}...`);
    }
    
    // Initialize services
    noditService.initialize().then((results) => {
        if (results && results.length > 0) {
            console.log('✅ Services initialized:', results.join(', '));
        } else {
            console.log('✅ Services initialized successfully');
        }
        
        // Log supported chains
        if (primaryService instanceof MultiChainService) {
            console.log('🔗 Supported chains: Ethereum, XRPL, Aptos, Polygon, BSC, Kaia');
        }
    }).catch(error => {
        console.error('❌ Failed to initialize services:', error);
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Received SIGTERM, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Received SIGINT, shutting down gracefully');
    process.exit(0);
});

export default app;