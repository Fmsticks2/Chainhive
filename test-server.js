// Simple Express server for testing API endpoints locally
// This mimics the Vercel serverless function structure

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Serve static files
app.use('/app.js', express.static(path.join(__dirname, 'app.js')));

// Dynamically load and mount API routes
async function loadAPIRoutes() {
    const apiDir = path.join(__dirname, 'api');
    
    // Load direct API files
    const directFiles = ['config.js', 'health.js', 'insights.js', 'market-conditions.js'];
    
    for (const file of directFiles) {
        const filePath = path.join(apiDir, file);
        if (fs.existsSync(filePath)) {
            try {
                const module = await import(`file://${filePath}`);
                const routePath = `/api/${file.replace('.js', '')}`;
                
                app.all(routePath, (req, res) => {
                    module.default(req, res);
                });
                
                console.log(`✅ Loaded: ${routePath}`);
            } catch (error) {
                console.error(`❌ Failed to load ${file}:`, error.message);
            }
        }
    }
    
    // Load dynamic routes
    const dynamicRoutes = [
        { pattern: '/api/balance/:chain/:address', file: 'balance/[chain]/[address].js' },
        { pattern: '/api/nfts/:chain/:address', file: 'nfts/[chain]/[address].js' },
        { pattern: '/api/transactions/:chain/:address', file: 'transactions/[chain]/[address].js' },
        { pattern: '/api/portfolio/:address', file: 'portfolio/[address].js' },
        { pattern: '/api/historical/:address', file: 'historical/[address].js' }
    ];
    
    for (const route of dynamicRoutes) {
        const filePath = path.join(apiDir, route.file);
        if (fs.existsSync(filePath)) {
            try {
                const module = await import(`file://${filePath}`);
                
                app.all(route.pattern, (req, res) => {
                    // Transform Express params to Vercel query format
                    req.query = { ...req.query, ...req.params };
                    module.default(req, res);
                });
                
                console.log(`✅ Loaded: ${route.pattern}`);
            } catch (error) {
                console.error(`❌ Failed to load ${route.file}:`, error.message);
            }
        }
    }
}

// Serve index.html for all other routes (SPA fallback)
app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.sendFile(path.join(__dirname, 'index.html'));
    }
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
    });
});

// Start server
async function startServer() {
    try {
        console.log('🔧 Loading API routes...');
        await loadAPIRoutes();
        
        app.listen(PORT, () => {
            console.log(`\n🚀 ChainHive Test Server running on http://localhost:${PORT}`);
            console.log(`📋 API endpoints available at http://localhost:${PORT}/api/*`);
            console.log(`🌐 Frontend available at http://localhost:${PORT}`);
            console.log('\n📝 Ready for testing!');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();