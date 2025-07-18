// Comprehensive API Endpoints Test Suite
// Tests all ChainHive API endpoints for functionality and error handling

import axios from 'axios';
import { performance } from 'perf_hooks';

class APITester {
    constructor(baseUrl = 'http://localhost:3000') {
        this.baseUrl = baseUrl;
        this.results = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
        this.testAddress = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b';
        this.testChains = ['ethereum', 'polygon', 'bsc', 'aptos', 'xrpl'];
    }

    async runAllTests() {
        console.log('🚀 Starting ChainHive API Endpoints Test Suite\n');
        console.log('=' .repeat(60));
        
        const testSuites = [
            { name: 'Health Check', test: () => this.testHealthEndpoint() },
            { name: 'Configuration', test: () => this.testConfigEndpoint() },
            { name: 'Market Conditions', test: () => this.testMarketConditionsEndpoint() },
            { name: 'Historical Data', test: () => this.testHistoricalEndpoint() },
            { name: 'Token Balances', test: () => this.testBalanceEndpoints() },
            { name: 'NFT Portfolio', test: () => this.testNFTEndpoints() },
            { name: 'Transaction History', test: () => this.testTransactionEndpoints() },
            { name: 'Portfolio Analysis', test: () => this.testPortfolioEndpoint() },
            { name: 'AI Insights', test: () => this.testInsightsEndpoint() },
            { name: 'Error Handling', test: () => this.testErrorHandling() }
        ];

        for (const suite of testSuites) {
            console.log(`\n📋 Testing: ${suite.name}`);
            console.log('-'.repeat(40));
            try {
                await suite.test();
            } catch (error) {
                this.logResult(suite.name, false, `Suite failed: ${error.message}`);
            }
        }

        this.printSummary();
        return this.results;
    }

    async testHealthEndpoint() {
        const start = performance.now();
        try {
            const response = await axios.get(`${this.baseUrl}/api/health`);
            const duration = performance.now() - start;
            
            if (response.status === 200 && response.data.status === 'healthy') {
                this.logResult('Health Check', true, `Response time: ${duration.toFixed(2)}ms`);
            } else {
                this.logResult('Health Check', false, 'Invalid response format');
            }
        } catch (error) {
            this.logResult('Health Check', false, error.message);
        }
    }

    async testConfigEndpoint() {
        try {
            const response = await axios.get(`${this.baseUrl}/api/config`);
            
            if (response.status === 200 && response.data.clientId) {
                this.logResult('Config Endpoint', true, 'Web3Auth config retrieved');
            } else {
                this.logResult('Config Endpoint', false, 'Missing clientId in response');
            }
        } catch (error) {
            this.logResult('Config Endpoint', false, error.message);
        }
    }

    async testMarketConditionsEndpoint() {
        try {
            const response = await axios.get(`${this.baseUrl}/api/market-conditions`);
            
            if (response.status === 200 && response.data.success && response.data.data) {
                const data = response.data.data;
                const hasRequiredFields = data.sentiment && data.volatility && data.trend;
                
                if (hasRequiredFields) {
                    this.logResult('Market Conditions', true, `Sentiment: ${data.sentiment}, Volatility: ${data.volatility}`);
                } else {
                    this.logResult('Market Conditions', false, 'Missing required market data fields');
                }
            } else {
                this.logResult('Market Conditions', false, 'Invalid response structure');
            }
        } catch (error) {
            this.logResult('Market Conditions', false, error.message);
        }
    }

    async testHistoricalEndpoint() {
        try {
            const response = await axios.get(`${this.baseUrl}/api/historical/${this.testAddress}?days=7`);
            
            if (response.status === 200 && response.data.success) {
                const data = response.data.data;
                if (data.portfolio && Array.isArray(data.portfolio)) {
                    this.logResult('Historical Data', true, `Retrieved ${data.portfolio.length} data points`);
                } else {
                    this.logResult('Historical Data', false, 'Invalid portfolio data structure');
                }
            } else {
                this.logResult('Historical Data', false, 'Failed to retrieve historical data');
            }
        } catch (error) {
            this.logResult('Historical Data', false, error.message);
        }
    }

    async testBalanceEndpoints() {
        for (const chain of this.testChains) {
            try {
                const response = await axios.get(`${this.baseUrl}/api/balance/${chain}/${this.testAddress}`);
                
                if (response.status === 200 && response.data.success) {
                    this.logResult(`Balance - ${chain}`, true, 'Token balances retrieved');
                } else {
                    this.logResult(`Balance - ${chain}`, false, 'Failed to retrieve balances');
                }
            } catch (error) {
                this.logResult(`Balance - ${chain}`, false, error.message);
            }
        }
    }

    async testNFTEndpoints() {
        for (const chain of this.testChains.slice(0, 3)) { // Test first 3 chains
            try {
                const response = await axios.get(`${this.baseUrl}/api/nfts/${chain}/${this.testAddress}`);
                
                if (response.status === 200 && response.data.success) {
                    this.logResult(`NFTs - ${chain}`, true, 'NFT data retrieved');
                } else {
                    this.logResult(`NFTs - ${chain}`, false, 'Failed to retrieve NFTs');
                }
            } catch (error) {
                this.logResult(`NFTs - ${chain}`, false, error.message);
            }
        }
    }

    async testTransactionEndpoints() {
        for (const chain of this.testChains.slice(0, 3)) { // Test first 3 chains
            try {
                const response = await axios.get(`${this.baseUrl}/api/transactions/${chain}/${this.testAddress}?limit=10`);
                
                if (response.status === 200 && response.data.success) {
                    this.logResult(`Transactions - ${chain}`, true, 'Transaction history retrieved');
                } else {
                    this.logResult(`Transactions - ${chain}`, false, 'Failed to retrieve transactions');
                }
            } catch (error) {
                this.logResult(`Transactions - ${chain}`, false, error.message);
            }
        }
    }

    async testPortfolioEndpoint() {
        try {
            const response = await axios.get(`${this.baseUrl}/api/portfolio/${this.testAddress}`);
            
            if (response.status === 200 && response.data.success) {
                this.logResult('Portfolio Analysis', true, 'Portfolio data retrieved');
            } else {
                this.logResult('Portfolio Analysis', false, 'Failed to retrieve portfolio');
            }
        } catch (error) {
            this.logResult('Portfolio Analysis', false, error.message);
        }
    }

    async testInsightsEndpoint() {
        const mockPortfolioData = {
            ethereum: {
                tokens: [
                    { symbol: 'ETH', usdValue: 1000, balance: 0.5 },
                    { symbol: 'USDC', usdValue: 500, balance: 500 }
                ],
                totalValue: 1500
            }
        };

        try {
            const response = await axios.post(`${this.baseUrl}/api/insights`, {
                portfolioData: mockPortfolioData,
                address: this.testAddress,
                chains: ['ethereum']
            });
            
            if (response.status === 200 && response.data.success && response.data.data.insights) {
                this.logResult('AI Insights', true, 'Insights generated successfully');
            } else {
                this.logResult('AI Insights', false, 'Failed to generate insights');
            }
        } catch (error) {
            this.logResult('AI Insights', false, error.message);
        }
    }

    async testErrorHandling() {
        // Test invalid address
        try {
            const response = await axios.get(`${this.baseUrl}/api/balance/ethereum/invalid-address`);
            this.logResult('Error Handling - Invalid Address', response.status >= 400, 'Properly handled invalid address');
        } catch (error) {
            this.logResult('Error Handling - Invalid Address', true, 'Error properly thrown for invalid address');
        }

        // Test invalid chain
        try {
            const response = await axios.get(`${this.baseUrl}/api/balance/invalid-chain/${this.testAddress}`);
            this.logResult('Error Handling - Invalid Chain', response.status >= 400, 'Properly handled invalid chain');
        } catch (error) {
            this.logResult('Error Handling - Invalid Chain', true, 'Error properly thrown for invalid chain');
        }

        // Test missing parameters
        try {
            const response = await axios.post(`${this.baseUrl}/api/insights`, {});
            this.logResult('Error Handling - Missing Params', response.status >= 400, 'Properly handled missing parameters');
        } catch (error) {
            this.logResult('Error Handling - Missing Params', true, 'Error properly thrown for missing parameters');
        }
    }

    logResult(testName, passed, details = '') {
        this.results.total++;
        if (passed) {
            this.results.passed++;
            console.log(`✅ ${testName}: PASSED ${details ? `- ${details}` : ''}`);
        } else {
            this.results.failed++;
            console.log(`❌ ${testName}: FAILED ${details ? `- ${details}` : ''}`);
        }
        
        this.results.details.push({
            test: testName,
            status: passed ? 'PASSED' : 'FAILED',
            details
        });
    }

    printSummary() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${this.results.total}`);
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📈 Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
        
        if (this.results.failed > 0) {
            console.log('\n🔍 Failed Tests:');
            this.results.details
                .filter(result => result.status === 'FAILED')
                .forEach(result => {
                    console.log(`   • ${result.test}: ${result.details}`);
                });
        }
        
        console.log('\n🎯 Recommendations:');
        if (this.results.failed === 0) {
            console.log('   • All endpoints are working correctly!');
            console.log('   • Consider adding performance benchmarks');
            console.log('   • Monitor API response times in production');
        } else {
            console.log('   • Fix failing endpoints before deployment');
            console.log('   • Check environment variables configuration');
            console.log('   • Verify NODIT API key is properly set');
        }
    }
}

// Main execution
const baseUrl = process.argv[2] || 'http://localhost:3000';
const tester = new APITester(baseUrl);

console.log(`🔧 Testing API endpoints at: ${baseUrl}`);
console.log('Starting tests...');

tester.runAllTests()
    .then(results => {
        console.log('\n✨ Test execution completed!');
        process.exit(results.failed > 0 ? 1 : 0);
    })
    .catch(error => {
        console.error('❌ Test suite failed:', error);
        process.exit(1);
    });

export { APITester };