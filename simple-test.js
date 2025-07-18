// Simple API Test - Tests the working endpoints
import axios from 'axios';

const baseUrl = process.argv[2] || 'http://localhost:3000';

console.log('🚀 Simple API Test Suite');
console.log('='.repeat(50));
console.log(`Testing: ${baseUrl}`);
console.log('');

async function testEndpoint(name, url, method = 'GET', data = null) {
    try {
        const config = {
            method,
            url: `${baseUrl}${url}`,
            timeout: 5000
        };
        
        if (data) {
            config.data = data;
        }
        
        const response = await axios(config);
        console.log(`✅ ${name}: ${response.status} - ${JSON.stringify(response.data).substring(0, 100)}...`);
        return true;
    } catch (error) {
        if (error.response) {
            console.log(`❌ ${name}: ${error.response.status} - ${error.response.statusText}`);
        } else {
            console.log(`❌ ${name}: ${error.message}`);
        }
        return false;
    }
}

async function runTests() {
    const tests = [
        ['Health Check', '/api/health'],
        ['Config', '/api/config'],
        ['Market Conditions', '/api/market-conditions'],
        ['Historical Data', '/api/historical/0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b?days=7'],
        ['AI Insights', '/api/insights', 'POST', {
            portfolioData: {
                ethereum: {
                    tokens: [{ symbol: 'ETH', usdValue: 1000, balance: 0.5 }],
                    totalValue: 1000
                }
            },
            address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b',
            chains: ['ethereum']
        }],
        ['Balance - Ethereum', '/api/balance/ethereum/0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b'],
        ['NFTs - Ethereum', '/api/nfts/ethereum/0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b'],
        ['Transactions - Ethereum', '/api/transactions/ethereum/0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b']
    ];
    
    let passed = 0;
    let total = tests.length;
    
    for (const [name, url, method, data] of tests) {
        const success = await testEndpoint(name, url, method, data);
        if (success) passed++;
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
    }
    
    console.log('');
    console.log('='.repeat(50));
    console.log(`📊 Results: ${passed}/${total} tests passed (${((passed/total)*100).toFixed(1)}%)`);
    
    if (passed === total) {
        console.log('🎉 All tests passed!');
    } else {
        console.log('⚠️  Some tests failed - check API configuration');
    }
}

runTests().catch(console.error);