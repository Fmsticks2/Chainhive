import axios from 'axios';

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_ADDRESS = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
const TEST_CHAIN = 'ethereum'; // Using Ethereum mainnet for better API support

// Colors for console output
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
  log(`⚠️  ${message}`, 'yellow');
}

// Test results tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

function recordTest(testName, success, error = null) {
  testResults.total++;
  if (success) {
    testResults.passed++;
    logSuccess(`${testName} - PASSED`);
  } else {
    testResults.failed++;
    logError(`${testName} - FAILED: ${error}`);
    testResults.errors.push({ test: testName, error });
  }
}

// Helper function to make HTTP requests
async function makeRequest(method, endpoint, data = null, expectedStatus = 200) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    };

    if (data) {
      config.data = data;
    }

    log(`Making ${method.toUpperCase()} request to: ${config.url}`);
    if (data) {
      log(`Request body: ${JSON.stringify(data, null, 2)}`);
    }

    const response = await axios(config);
    
    log(`Response status: ${response.status}`);
    log(`Response data: ${JSON.stringify(response.data, null, 2)}`);
    
    return {
      success: response.status === expectedStatus,
      status: response.status,
      data: response.data,
      error: null
    };
  } catch (error) {
    const status = error.response?.status || 'No response';
    const message = error.response?.data?.message || error.message;
    
    log(`Request failed with status: ${status}`);
    log(`Error message: ${message}`);
    
    return {
      success: false,
      status,
      data: null,
      error: message
    };
  }
}

// Test functions
async function testHealthEndpoint() {
  logTest('Health Check Endpoint');
  const result = await makeRequest('GET', '/health');
  recordTest('Health Check', result.success, result.error);
  return result;
}

async function testWeb3AuthConfig() {
  logTest('Web3Auth Configuration');
  const result = await makeRequest('GET', '/config');
  recordTest('Web3Auth Config', result.success, result.error);
  return result;
}

async function testPortfolioEndpoint() {
  logTest('Portfolio Data Retrieval');
  const result = await makeRequest('GET', `/portfolio/${TEST_ADDRESS}?chains=${TEST_CHAIN}`);
  recordTest('Portfolio Data', result.success, result.error);
  return result;
}

async function testTokenBalances() {
  logTest('Token Balances');
  const result = await makeRequest('GET', `/balance/${TEST_CHAIN}/${TEST_ADDRESS}`);
  recordTest('Token Balances', result.success, result.error);
  return result;
}

async function testTransactionHistory() {
  logTest('Transaction History');
  const result = await makeRequest('GET', `/transactions/${TEST_CHAIN}/${TEST_ADDRESS}?limit=10`);
  recordTest('Transaction History', result.success, result.error);
  return result;
}

async function testNFTs() {
  logTest('NFT Data');
  const result = await makeRequest('GET', `/nfts/${TEST_CHAIN}/${TEST_ADDRESS}`);
  recordTest('NFT Data', result.success, result.error);
  return result;
}

async function testAIInsights() {
  logTest('AI Insights');
  const portfolioData = { address: TEST_ADDRESS, totalValue: 1000 };
  const result = await makeRequest('POST', '/insights', portfolioData, 200);
  recordTest('AI Insights', result.success, result.error);
  return result;
}

// POST endpoint tests
async function testWebhookSetup() {
  logTest('Webhook Setup (POST)');
  const webhookData = {
    address: TEST_ADDRESS,
    events: ['transfer', 'approval'],
    callbackUrl: 'https://example.com/webhook'
  };
  
  const result = await makeRequest('POST', '/webhooks/setup', webhookData, 200);
  recordTest('Webhook Setup', result.success, result.error);
  return result;
}

async function testTokenPrices() {
  logTest('Token Prices');
  const result = await makeRequest('GET', '/prices?tokens=ETH,BTC,MATIC');
  recordTest('Token Prices', result.success, result.error);
  return result;
}

async function testGasFees() {
  logTest('Gas Fees');
  const result = await makeRequest('GET', '/gas?chains=ethereum,polygon');
  recordTest('Gas Fees', result.success, result.error);
  return result;
}

async function testWebhookReceive() {
  logTest('Webhook Receive (POST)');
  const webhookData = {
    event: 'transfer',
    address: TEST_ADDRESS,
    amount: '1000000000000000000',
    timestamp: new Date().toISOString()
  };
  
  const result = await makeRequest('POST', '/webhooks/receive', webhookData, 200);
  recordTest('Webhook Receive', result.success, result.error);
  return result;
}

// Server connectivity test
async function testServerConnectivity() {
  logTest('Server Connectivity');
  try {
    const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/`, { timeout: 5000 });
    recordTest('Server Connectivity', true);
    return true;
  } catch (error) {
    recordTest('Server Connectivity', false, error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log(`${colors.bold}🚀 Starting Frontend-Backend API Integration Tests${colors.reset}`, 'blue');
  log(`Testing API at: ${API_BASE_URL}\n`);

  // Test server connectivity first
  const serverOnline = await testServerConnectivity();
  if (!serverOnline) {
    logWarning('Server appears to be offline. Some tests may fail.');
  }

  // Run GET endpoint tests
  log(`\n${colors.bold}📥 Testing GET Endpoints${colors.reset}`, 'yellow');
  await testHealthEndpoint();
  await testWeb3AuthConfig();
  await testPortfolioEndpoint();
  await testTokenBalances();
  await testTransactionHistory();
  await testNFTs();
  await testTokenPrices();
  await testGasFees();

  // Run POST endpoint tests
  log(`\n${colors.bold}📤 Testing POST/PUT Endpoints${colors.reset}`, 'yellow');
  await testAIInsights();
  await testWebhookSetup();
  await testWebhookReceive();

  // Print summary
  log(`\n${colors.bold}📊 Test Summary${colors.reset}`, 'blue');
  log(`Total tests: ${testResults.total}`);
  logSuccess(`Passed: ${testResults.passed}`);
  logError(`Failed: ${testResults.failed}`);
  
  if (testResults.failed > 0) {
    log(`\n${colors.bold}❌ Failed Tests:${colors.reset}`, 'red');
    testResults.errors.forEach(({ test, error }) => {
      log(`  • ${test}: ${error}`, 'red');
    });
  }

  const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
  log(`\nSuccess Rate: ${successRate}%`);
  
  if (successRate >= 80) {
    logSuccess('🎉 API integration tests mostly successful!');
  } else if (successRate >= 50) {
    logWarning('⚠️  Some API endpoints need attention.');
  } else {
    logError('🚨 Multiple API endpoints are failing.');
  }

  return testResults;
}

// Error handling for unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

// Run tests directly
runAllTests()
  .then((results) => {
    process.exit(results.failed > 0 ? 1 : 0);
  })
  .catch((error) => {
    logError(`Test runner failed: ${error.message}`);
    process.exit(1);
  });

export {
  runAllTests,
  testResults,
  makeRequest
};