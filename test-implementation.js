// Test script for ChainHive implementation verification
// Tests: getKairosChainData, streaming endpoints, and MCP connection

import axios from 'axios';
import { NoditService } from './nodit-service.js';
import { MultiChainService } from './src/multi-chain-service.js';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:3000';
const TEST_ADDRESS = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'; // Example address

// ANSI color codes for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
    log(`\n${colors.bold}🧪 Testing: ${testName}${colors.reset}`, 'blue');
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logWarning(message) {
    log(`⚠️ ${message}`, 'yellow');
}

// Test 1: getKairosChainData method
async function testGetKairosChainData() {
    logTest('getKairosChainData Method');
    
    try {
        // Test with NoditService directly
        if (!process.env.NODIT_API_KEY) {
            logWarning('NODIT_API_KEY not found, using mock data');
        }
        
        const noditService = new NoditService(process.env.NODIT_API_KEY);
        
        if (typeof noditService.getKairosChainData !== 'function') {
            logError('getKairosChainData method not found in NoditService');
            return false;
        }
        
        const result = await noditService.getKairosChainData(TEST_ADDRESS);
        
        if (result && result.success) {
            logSuccess('getKairosChainData method works correctly');
            log(`  - Portfolio: ${result.data.portfolio ? 'Available' : 'Not available'}`);
            log(`  - Token Balances: ${result.data.tokenBalances ? result.data.tokenBalances.length + ' tokens' : 'Not available'}`);
            log(`  - NFTs: ${result.data.nfts ? result.data.nfts.length + ' NFTs' : 'Not available'}`);
            log(`  - Transactions: ${result.data.transactions ? result.data.transactions.length + ' transactions' : 'Not available'}`);
            log(`  - Contract Data: ${result.data.contractData ? 'Available' : 'Not available'}`);
            return true;
        } else {
            logError('getKairosChainData returned invalid result');
            console.log('Result:', result);
            return false;
        }
        
    } catch (error) {
        logError(`getKairosChainData test failed: ${error.message}`);
        return false;
    }
}

// Test 2: Streaming endpoints
async function testStreamingEndpoints() {
    logTest('Portfolio Streaming Endpoints');
    
    try {
        // Test start streaming endpoint
        log('Testing POST /api/portfolio/stream/start...');
        const startResponse = await axios.post(`${BASE_URL}/api/portfolio/stream/start`, {
            address: TEST_ADDRESS
        });
        
        if (startResponse.data.success) {
            logSuccess('Stream start endpoint works correctly');
            log(`  - Stream ID: ${startResponse.data.data.streamId}`);
            log(`  - SSE Endpoint: ${startResponse.data.data.endpoint}`);
            
            const streamId = startResponse.data.data.streamId;
            
            // Wait a moment
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Test stop streaming endpoint
            log('Testing POST /api/portfolio/stream/stop...');
            const stopResponse = await axios.post(`${BASE_URL}/api/portfolio/stream/stop`, {
                streamId: streamId
            });
            
            if (stopResponse.data.success) {
                logSuccess('Stream stop endpoint works correctly');
                return true;
            } else {
                logError('Stream stop endpoint failed');
                return false;
            }
            
        } else {
            logError('Stream start endpoint failed');
            return false;
        }
        
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            logWarning('Server not running - start server with: npm start');
        } else {
            logError(`Streaming endpoints test failed: ${error.message}`);
        }
        return false;
    }
}

// Test 3: MCP server connection
async function testMCPConnection() {
    logTest('MCP Server Connection');
    
    try {
        // Test MCP status endpoint
        log('Testing GET /api/mcp/status...');
        const statusResponse = await axios.get(`${BASE_URL}/api/mcp/status`);
        
        if (statusResponse.data.success) {
            const mcpData = statusResponse.data.data.mcp;
            const apiKeyStatus = statusResponse.data.data.apiKey;
            
            log(`  - API Key: ${apiKeyStatus}`);
            log(`  - MCP Enabled: ${mcpData.enabled}`);
            log(`  - MCP Ready: ${mcpData.ready}`);
            
            if (apiKeyStatus === 'missing') {
                logWarning('NODIT_API_KEY is not configured');
            }
            
            if (mcpData.enabled && mcpData.ready) {
                logSuccess('MCP server is connected and ready');
                
                if (mcpData.supportedChains) {
                    log(`  - Supported Chains: ${mcpData.supportedChains.join(', ')}`);
                }
                
                return true;
            } else if (mcpData.enabled && !mcpData.ready) {
                logWarning('MCP server is enabled but not ready');
                log(`  - Error: ${mcpData.error || 'Unknown error'}`);
                return false;
            } else {
                logWarning('MCP server is not enabled');
                log(`  - Error: ${mcpData.error || 'Unknown error'}`);
                return false;
            }
            
        } else {
            logError('MCP status endpoint failed');
            return false;
        }
        
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            logWarning('Server not running - start server with: npm start');
        } else {
            logError(`MCP connection test failed: ${error.message}`);
        }
        return false;
    }
}

// Test 4: MultiChainService integration
async function testMultiChainService() {
    logTest('MultiChainService Integration');
    
    try {
        const multiChainService = new MultiChainService();
        
        // Test if MCP is initialized
        if (multiChainService.mcpService) {
            logSuccess('MCP service is integrated into MultiChainService');
            log(`  - MCP Enabled: ${multiChainService.mcpEnabled}`);
            
            if (multiChainService.mcpEnabled) {
                const supportedChains = multiChainService.getAllSupportedChains();
                log(`  - Total Supported Chains: ${supportedChains.length}`);
                log(`  - Chains: ${supportedChains.join(', ')}`);
            }
            
            return true;
        } else {
            logWarning('MCP service not found in MultiChainService');
            return false;
        }
        
    } catch (error) {
        logError(`MultiChainService test failed: ${error.message}`);
        return false;
    }
}

// Main test runner
async function runTests() {
    log(`${colors.bold}🚀 ChainHive Implementation Test Suite${colors.reset}`, 'blue');
    log('=' .repeat(50));
    
    const results = {
        getKairosChainData: false,
        streamingEndpoints: false,
        mcpConnection: false,
        multiChainService: false
    };
    
    // Run tests
    results.getKairosChainData = await testGetKairosChainData();
    results.streamingEndpoints = await testStreamingEndpoints();
    results.mcpConnection = await testMCPConnection();
    results.multiChainService = await testMultiChainService();
    
    // Summary
    log('\n' + '=' .repeat(50));
    log(`${colors.bold}📊 Test Results Summary${colors.reset}`, 'blue');
    
    const passed = Object.values(results).filter(Boolean).length;
    const total = Object.keys(results).length;
    
    Object.entries(results).forEach(([test, passed]) => {
        const status = passed ? '✅ PASS' : '❌ FAIL';
        log(`  ${test}: ${status}`);
    });
    
    log(`\n${colors.bold}Overall: ${passed}/${total} tests passed${colors.reset}`);
    
    if (passed === total) {
        logSuccess('🎉 All tests passed! Implementation is working correctly.');
    } else {
        logWarning(`⚠️ ${total - passed} test(s) failed. Check the issues above.`);
    }
    
    // Recommendations
    log(`\n${colors.bold}💡 Recommendations:${colors.reset}`, 'yellow');
    
    if (!results.getKairosChainData) {
        log('  - Check NoditService implementation and getKairosChainData method');
    }
    
    if (!results.streamingEndpoints) {
        log('  - Ensure server is running: npm start');
        log('  - Check streaming endpoint implementation');
    }
    
    if (!results.mcpConnection) {
        log('  - Set NODIT_API_KEY in .env file');
        log('  - Install MCP server: npm install @noditlabs/nodit-mcp-server@latest');
        log('  - Check MCP service initialization');
    }
    
    if (!results.multiChainService) {
        log('  - Check MultiChainService and MCP integration');
    }
    
    process.exit(passed === total ? 0 : 1);
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runTests().catch(error => {
        logError(`Test suite failed: ${error.message}`);
        process.exit(1);
    });
}

export { runTests };