// ChainHive Express Server
// Serves the HTML frontend and provides API endpoints for NODIT integration

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { NoditService } from './nodit-service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODIT_API_KEY = process.env.NODIT_API_KEY || 'demo-key';

// Initialize NODIT service
const noditService = new NoditService(NODIT_API_KEY);

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com"],
            connectSrc: ["'self'", "https://api.web3auth.io", "https://web3.nodit.io"],
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
app.use(express.static('.', {
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// API Routes

// Health check
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
        const { portfolioData, preferences } = req.body;
        
        if (!portfolioData) {
            return res.status(400).json({ error: 'Portfolio data is required' });
        }
        
        const insights = await noditService.generatePortfolioInsights(
            portfolioData, 
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
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 ChainHive server running on port ${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
    console.log(`🌐 Frontend available at http://localhost:${PORT}`);
    console.log(`🔑 NODIT API Key: ${NODIT_API_KEY.substring(0, 8)}...`);
    
    // Initialize NODIT service
    noditService.initialize().then(() => {
        console.log('✅ NODIT service initialized successfully');
    }).catch(error => {
        console.error('❌ Failed to initialize NODIT service:', error);
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