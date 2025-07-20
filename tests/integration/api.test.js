// Integration tests for API endpoints with middleware
const request = require('supertest');
const express = require('express');
const { errorHandler, asyncHandler } = require('../../middleware/errorHandler');
const { validateRequest } = require('../../middleware/validation');
const { securityHeaders, corsMiddleware } = require('../../middleware/security');
const { correlationMiddleware } = require('../../utils/logger');
const { cacheService } = require('../../services/cache');
const { NoditService } = require('../../services/nodit-service');

// Mock external dependencies
jest.mock('../../services/nodit-service');
jest.mock('redis');

describe('API Integration Tests', () => {
    let app;
    let mockNoditService;

    beforeEach(() => {
        // Create Express app with middleware
        app = express();
        
        // Apply middleware in correct order
        app.use(express.json());
        app.use(correlationMiddleware);
        app.use(securityHeaders);
        app.use(corsMiddleware);
        
        // Mock NoditService
        mockNoditService = {
            getBalance: jest.fn(),
            getNFTs: jest.fn(),
            getTransactions: jest.fn(),
            getPortfolio: jest.fn(),
            getHistoricalData: jest.fn(),
            getAIInsights: jest.fn(),
            healthCheck: jest.fn()
        };
        NoditService.mockImplementation(() => mockNoditService);
        
        // Setup routes
        setupTestRoutes();
        
        // Error handling middleware (must be last)
        app.use(errorHandler);
    });

    function setupTestRoutes() {
        // Health check endpoint
        app.get('/api/health', asyncHandler(async (req, res) => {
            const isHealthy = await mockNoditService.healthCheck();
            res.json({ 
                status: isHealthy ? 'healthy' : 'unhealthy',
                timestamp: new Date().toISOString()
            });
        }));

        // Balance endpoint with validation
        app.get('/api/balance/:chain/:address', 
            validateRequest('balance'),
            asyncHandler(async (req, res) => {
                const { chain, address } = req.params;
                
                // Check cache first
                const cacheKey = `balance:${chain}:${address.toLowerCase()}`;
                const cached = await cacheService.get(cacheKey);
                
                if (cached) {
                    return res.json({ ...cached, cached: true });
                }
                
                // Fetch from service
                const balance = await mockNoditService.getBalance(chain, address);
                
                // Cache result
                await cacheService.set(cacheKey, balance, 300);
                
                res.json({ ...balance, cached: false });
            })
        );

        // NFTs endpoint with validation
        app.get('/api/nfts/:chain/:address',
            validateRequest('nfts'),
            asyncHandler(async (req, res) => {
                const { chain, address } = req.params;
                const { limit = 20, offset = 0 } = req.query;
                
                const nfts = await mockNoditService.getNFTs(chain, address, {
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                });
                
                res.json(nfts);
            })
        );

        // Transactions endpoint with validation
        app.get('/api/transactions/:chain/:address',
            validateRequest('transactions'),
            asyncHandler(async (req, res) => {
                const { chain, address } = req.params;
                const { limit = 10, offset = 0 } = req.query;
                
                const transactions = await mockNoditService.getTransactions(chain, address, {
                    limit: parseInt(limit),
                    offset: parseInt(offset)
                });
                
                res.json(transactions);
            })
        );

        // Portfolio endpoint
        app.get('/api/portfolio/:address',
            validateRequest('portfolio'),
            asyncHandler(async (req, res) => {
                const { address } = req.params;
                
                const portfolio = await mockNoditService.getPortfolio(address);
                res.json(portfolio);
            })
        );

        // Historical data endpoint
        app.get('/api/historical/:address',
            validateRequest('historical'),
            asyncHandler(async (req, res) => {
                const { address } = req.params;
                const { days = 30 } = req.query;
                
                const historical = await mockNoditService.getHistoricalData(address, parseInt(days));
                res.json(historical);
            })
        );

        // AI Insights endpoint
        app.get('/api/insights',
            validateRequest('insights'),
            asyncHandler(async (req, res) => {
                const { address, timeframe = '30d' } = req.query;
                
                const insights = await mockNoditService.getAIInsights(address, timeframe);
                res.json(insights);
            })
        );

        // Error testing endpoint
        app.get('/api/error', asyncHandler(async (req, res) => {
            throw new Error('Test error');
        }));

        // Validation error testing endpoint
        app.get('/api/validate-error/:chain/:address',
            validateRequest('balance'),
            asyncHandler(async (req, res) => {
                res.json({ success: true });
            })
        );
    }

    describe('Health Check Endpoint', () => {
        it('should return healthy status', async () => {
            mockNoditService.healthCheck.mockResolvedValue(true);
            
            const response = await request(app)
                .get('/api/health')
                .expect(200);
            
            expect(response.body).toHaveProperty('status', 'healthy');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.headers).toHaveProperty('x-correlation-id');
        });

        it('should return unhealthy status when service is down', async () => {
            mockNoditService.healthCheck.mockResolvedValue(false);
            
            const response = await request(app)
                .get('/api/health')
                .expect(200);
            
            expect(response.body).toHaveProperty('status', 'unhealthy');
        });
    });

    describe('Balance Endpoint', () => {
        const validAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
        const mockBalance = {
            address: validAddress,
            balance: '1.5',
            balanceUSD: 2500.75,
            tokens: []
        };

        it('should return balance for valid request', async () => {
            mockNoditService.getBalance.mockResolvedValue(mockBalance);
            
            const response = await request(app)
                .get(`/api/balance/ethereum/${validAddress}`)
                .expect(200);
            
            expect(response.body).toMatchObject(mockBalance);
            expect(response.body).toHaveProperty('cached', false);
            expect(mockNoditService.getBalance).toHaveBeenCalledWith('ethereum', validAddress);
        });

        it('should return cached balance on second request', async () => {
            mockNoditService.getBalance.mockResolvedValue(mockBalance);
            
            // First request
            await request(app)
                .get(`/api/balance/ethereum/${validAddress}`)
                .expect(200);
            
            // Second request should use cache
            const response = await request(app)
                .get(`/api/balance/ethereum/${validAddress}`)
                .expect(200);
            
            expect(response.body).toHaveProperty('cached', true);
            expect(mockNoditService.getBalance).toHaveBeenCalledTimes(1);
        });

        it('should validate chain parameter', async () => {
            const response = await request(app)
                .get(`/api/balance/invalid-chain/${validAddress}`)
                .expect(400);
            
            expect(response.body).toHaveProperty('error');
            expect(response.body.message).toContain('chain');
        });

        it('should validate address parameter', async () => {
            const response = await request(app)
                .get('/api/balance/ethereum/invalid-address')
                .expect(400);
            
            expect(response.body).toHaveProperty('error');
            expect(response.body.message).toContain('address');
        });
    });

    describe('NFTs Endpoint', () => {
        const validAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
        const mockNFTs = {
            nfts: [
                {
                    tokenId: '1',
                    name: 'Test NFT',
                    collection: 'Test Collection',
                    image: 'https://example.com/image.png'
                }
            ],
            total: 1,
            hasMore: false
        };

        it('should return NFTs for valid request', async () => {
            mockNoditService.getNFTs.mockResolvedValue(mockNFTs);
            
            const response = await request(app)
                .get(`/api/nfts/ethereum/${validAddress}`)
                .expect(200);
            
            expect(response.body).toMatchObject(mockNFTs);
            expect(mockNoditService.getNFTs).toHaveBeenCalledWith('ethereum', validAddress, {
                limit: 20,
                offset: 0
            });
        });

        it('should handle pagination parameters', async () => {
            mockNoditService.getNFTs.mockResolvedValue(mockNFTs);
            
            await request(app)
                .get(`/api/nfts/ethereum/${validAddress}?limit=10&offset=20`)
                .expect(200);
            
            expect(mockNoditService.getNFTs).toHaveBeenCalledWith('ethereum', validAddress, {
                limit: 10,
                offset: 20
            });
        });
    });

    describe('Transactions Endpoint', () => {
        const validAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
        const mockTransactions = {
            transactions: [
                {
                    hash: '0xabc123',
                    from: validAddress,
                    to: '0xdef456',
                    value: '1.0',
                    timestamp: '2024-01-01T00:00:00Z'
                }
            ],
            total: 1,
            hasMore: false
        };

        it('should return transactions for valid request', async () => {
            mockNoditService.getTransactions.mockResolvedValue(mockTransactions);
            
            const response = await request(app)
                .get(`/api/transactions/ethereum/${validAddress}`)
                .expect(200);
            
            expect(response.body).toMatchObject(mockTransactions);
        });
    });

    describe('Portfolio Endpoint', () => {
        const validAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
        const mockPortfolio = {
            totalValue: 10000,
            chains: {
                ethereum: { value: 6000, percentage: 60 },
                polygon: { value: 4000, percentage: 40 }
            },
            tokens: []
        };

        it('should return portfolio for valid request', async () => {
            mockNoditService.getPortfolio.mockResolvedValue(mockPortfolio);
            
            const response = await request(app)
                .get(`/api/portfolio/${validAddress}`)
                .expect(200);
            
            expect(response.body).toMatchObject(mockPortfolio);
        });
    });

    describe('Historical Data Endpoint', () => {
        const validAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
        const mockHistorical = {
            data: [
                { date: '2024-01-01', value: 5000 },
                { date: '2024-01-02', value: 5200 }
            ],
            summary: {
                startValue: 5000,
                endValue: 5200,
                change: 200,
                changePercent: 4
            }
        };

        it('should return historical data for valid request', async () => {
            mockNoditService.getHistoricalData.mockResolvedValue(mockHistorical);
            
            const response = await request(app)
                .get(`/api/historical/${validAddress}`)
                .expect(200);
            
            expect(response.body).toMatchObject(mockHistorical);
            expect(mockNoditService.getHistoricalData).toHaveBeenCalledWith(validAddress, 30);
        });

        it('should handle custom days parameter', async () => {
            mockNoditService.getHistoricalData.mockResolvedValue(mockHistorical);
            
            await request(app)
                .get(`/api/historical/${validAddress}?days=7`)
                .expect(200);
            
            expect(mockNoditService.getHistoricalData).toHaveBeenCalledWith(validAddress, 7);
        });
    });

    describe('AI Insights Endpoint', () => {
        const validAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
        const mockInsights = {
            insights: [
                {
                    type: 'trend',
                    message: 'Portfolio value trending upward',
                    confidence: 0.85
                }
            ],
            summary: 'Overall positive outlook'
        };

        it('should return AI insights for valid request', async () => {
            mockNoditService.getAIInsights.mockResolvedValue(mockInsights);
            
            const response = await request(app)
                .get(`/api/insights?address=${validAddress}`)
                .expect(200);
            
            expect(response.body).toMatchObject(mockInsights);
            expect(mockNoditService.getAIInsights).toHaveBeenCalledWith(validAddress, '30d');
        });

        it('should require address parameter', async () => {
            const response = await request(app)
                .get('/api/insights')
                .expect(400);
            
            expect(response.body).toHaveProperty('error');
            expect(response.body.message).toContain('address');
        });
    });

    describe('Error Handling', () => {
        it('should handle service errors gracefully', async () => {
            mockNoditService.getBalance.mockRejectedValue(new Error('Service unavailable'));
            
            const response = await request(app)
                .get('/api/balance/ethereum/0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6')
                .expect(500);
            
            expect(response.body).toHaveProperty('error');
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('correlationId');
        });

        it('should handle validation errors', async () => {
            const response = await request(app)
                .get('/api/validate-error/invalid/invalid-address')
                .expect(400);
            
            expect(response.body).toHaveProperty('error', 'Validation Error');
            expect(response.body).toHaveProperty('details');
        });

        it('should handle unexpected errors', async () => {
            const response = await request(app)
                .get('/api/error')
                .expect(500);
            
            expect(response.body).toHaveProperty('error');
            expect(response.body).toHaveProperty('correlationId');
        });
    });

    describe('Security Headers', () => {
        it('should include security headers in all responses', async () => {
            mockNoditService.healthCheck.mockResolvedValue(true);
            
            const response = await request(app)
                .get('/api/health')
                .expect(200);
            
            expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
            expect(response.headers).toHaveProperty('x-frame-options', 'DENY');
            expect(response.headers).toHaveProperty('x-xss-protection', '1; mode=block');
            expect(response.headers).toHaveProperty('referrer-policy', 'strict-origin-when-cross-origin');
        });
    });

    describe('CORS Headers', () => {
        it('should handle CORS for allowed origins', async () => {
            mockNoditService.healthCheck.mockResolvedValue(true);
            
            const response = await request(app)
                .get('/api/health')
                .set('Origin', 'http://localhost:3000')
                .expect(200);
            
            expect(response.headers).toHaveProperty('access-control-allow-origin', 'http://localhost:3000');
            expect(response.headers).toHaveProperty('access-control-allow-credentials', 'true');
        });

        it('should handle preflight OPTIONS requests', async () => {
            const response = await request(app)
                .options('/api/health')
                .set('Origin', 'http://localhost:3000')
                .expect(200);
            
            expect(response.headers).toHaveProperty('access-control-allow-methods');
            expect(response.headers).toHaveProperty('access-control-allow-headers');
        });
    });

    describe('Correlation IDs', () => {
        it('should include correlation ID in all responses', async () => {
            mockNoditService.healthCheck.mockResolvedValue(true);
            
            const response = await request(app)
                .get('/api/health')
                .expect(200);
            
            expect(response.headers).toHaveProperty('x-correlation-id');
            expect(typeof response.headers['x-correlation-id']).toBe('string');
            expect(response.headers['x-correlation-id'].length).toBeGreaterThan(0);
        });

        it('should use provided correlation ID', async () => {
            const correlationId = 'test-correlation-123';
            mockNoditService.healthCheck.mockResolvedValue(true);
            
            const response = await request(app)
                .get('/api/health')
                .set('X-Correlation-ID', correlationId)
                .expect(200);
            
            expect(response.headers).toHaveProperty('x-correlation-id', correlationId);
        });
    });

    describe('Performance', () => {
        it('should handle concurrent requests efficiently', async () => {
            mockNoditService.getBalance.mockResolvedValue({
                address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
                balance: '1.0',
                balanceUSD: 2000
            });
            
            const requests = Array(10).fill().map(() => 
                request(app)
                    .get('/api/balance/ethereum/0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6')
                    .expect(200)
            );
            
            const startTime = Date.now();
            const responses = await Promise.all(requests);
            const duration = Date.now() - startTime;
            
            expect(responses).toHaveLength(10);
            expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
            
            // First request should hit the service, others should use cache
            expect(mockNoditService.getBalance).toHaveBeenCalledTimes(1);
            
            // Check that some responses are cached
            const cachedResponses = responses.filter(r => r.body.cached === true);
            expect(cachedResponses.length).toBeGreaterThan(0);
        });
    });
});