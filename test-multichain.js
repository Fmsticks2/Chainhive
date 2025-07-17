#!/usr/bin/env node

/**
 * Multi-Chain Functionality Test Script
 * Tests Nodit RPC endpoints and contract interactions
 */

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test configuration
const TEST_CONFIG = {
  chains: {
    ethereum: {
      name: 'Ethereum Mainnet',
      rpcUrl: process.env.NODIT_API_KEY ? `https://eth-mainnet.nodit.io/${process.env.NODIT_API_KEY}` : 'https://ethereum.publicnode.com',
      chainId: 1,
      testAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' // Vitalik's address
    },
    polygon: {
      name: 'Polygon Mainnet', 
      rpcUrl: process.env.NODIT_API_KEY ? `https://polygon-mainnet.nodit.io/${process.env.NODIT_API_KEY}` : 'https://polygon.llamarpc.com',
      chainId: 137,
      testAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
    },
    bsc: {
      name: 'BSC Mainnet',
      rpcUrl: process.env.NODIT_API_KEY ? `https://bsc-mainnet.nodit.io/${process.env.NODIT_API_KEY}` : 'https://bsc.llamarpc.com',
      chainId: 56,
      testAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
    },
    kairos: {
      name: 'Kairos Network',
      rpcUrl: process.env.NODIT_API_KEY ? `https://kaia-kairos.nodit.io/${process.env.NODIT_API_KEY}` : 'https://public-en-kairos.node.kaia.io',
      chainId: 1001,
      testAddress: process.env.DEPLOYER_ADDRESS || '0x5CbD1ABe5029c5c717038f86C31B706f027640AB',
      contracts: {
        chainHive: process.env.VITE_CHAINHIVE_CONTRACT_ADDRESS || '0x72CA2541A705468368F9474fB419Defd002EC8af',
        token: process.env.VITE_CHAINHIVE_TOKEN_ADDRESS || '0xdc6c396319895dA489b0Cd145A4c5D660b9e10F6',
        multiChain: process.env.VITE_CHAINHIVE_MULTICHAIN_ADDRESS || '0xF565086417Bf8ba76e4FaFC9F0088818eA027539',
        governance: process.env.VITE_CHAINHIVE_GOVERNANCE_ADDRESS || '0xcBB12aBDA134ac0444f2aa41E98EDD57f8D5631F'
      }
    }
  }
};

// Test results storage
const testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: '📋',
    success: '✅',
    error: '❌',
    warning: '⚠️'
  }[type] || '📋';
  
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function logTest(testName, passed, details = '') {
  if (passed) {
    testResults.passed++;
    log(`${testName} - PASSED ${details}`, 'success');
  } else {
    testResults.failed++;
    testResults.errors.push(`${testName}: ${details}`);
    log(`${testName} - FAILED ${details}`, 'error');
  }
}

// Test functions
async function testRPCConnection(chainName, config) {
  try {
    const provider = new ethers.JsonRpcProvider(config.rpcUrl);
    
    // Test 1: Get network info
    const network = await provider.getNetwork();
    const networkMatches = Number(network.chainId) === config.chainId;
    logTest(
      `${chainName} - Network Connection`,
      networkMatches,
      `Chain ID: ${network.chainId} (expected: ${config.chainId})`
    );
    
    // Test 2: Get latest block
    const blockNumber = await provider.getBlockNumber();
    const blockValid = blockNumber > 0;
    logTest(
      `${chainName} - Latest Block`,
      blockValid,
      `Block: ${blockNumber}`
    );
    
    // Test 3: Get balance
    const balance = await provider.getBalance(config.testAddress);
    const balanceValid = balance >= 0;
    logTest(
      `${chainName} - Balance Query`,
      balanceValid,
      `Balance: ${ethers.formatEther(balance)} ${config.name.includes('Ethereum') ? 'ETH' : config.name.includes('Polygon') ? 'MATIC' : config.name.includes('BSC') ? 'BNB' : 'KAI'}`
    );
    
    return { provider, success: true };
  } catch (error) {
    logTest(
      `${chainName} - RPC Connection`,
      false,
      `Error: ${error.message}`
    );
    return { provider: null, success: false };
  }
}

async function testContractInteraction(chainName, config, provider) {
  if (!config.contracts || !provider) {
    log(`${chainName} - Skipping contract tests (no contracts or provider)`, 'warning');
    return;
  }
  
  try {
    // Simple contract ABI for basic calls
    const basicABI = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function totalSupply() view returns (uint256)"
    ];
    
    // Test ChainHive Token contract
    const tokenContract = new ethers.Contract(
      config.contracts.token,
      basicABI,
      provider
    );
    
    try {
      const name = await tokenContract.name();
      const symbol = await tokenContract.symbol();
      const totalSupply = await tokenContract.totalSupply();
      
      logTest(
        `${chainName} - Token Contract`,
        true,
        `${name} (${symbol}) - Supply: ${ethers.formatEther(totalSupply)}`
      );
    } catch (contractError) {
      logTest(
        `${chainName} - Token Contract`,
        false,
        `Contract call failed: ${contractError.message}`
      );
    }
    
  } catch (error) {
    logTest(
      `${chainName} - Contract Setup`,
      false,
      `Error: ${error.message}`
    );
  }
}

async function testNoditAPIKey() {
  const apiKey = process.env.NODIT_API_KEY;
  const baseUrl = process.env.NODIT_BASE_URL;
  
  logTest(
    'Nodit API Configuration',
    !!(apiKey && baseUrl),
    `API Key: ${apiKey ? 'Present' : 'Missing'}, Base URL: ${baseUrl || 'Missing'}`
  );
}

async function runAllTests() {
  log('🚀 Starting Multi-Chain Functionality Tests', 'info');
  log('=' * 60, 'info');
  
  // Test Nodit configuration
  await testNoditAPIKey();
  
  // Test each chain
  for (const [chainName, config] of Object.entries(TEST_CONFIG.chains)) {
    log(`\n🔗 Testing ${config.name}...`, 'info');
    
    const { provider, success } = await testRPCConnection(chainName, config);
    
    if (success && provider) {
      await testContractInteraction(chainName, config, provider);
    }
  }
  
  // Generate test report
  log('\n' + '=' * 60, 'info');
  log('📊 Test Results Summary', 'info');
  log('=' * 60, 'info');
  log(`✅ Passed: ${testResults.passed}`, 'success');
  log(`❌ Failed: ${testResults.failed}`, testResults.failed > 0 ? 'error' : 'info');
  
  if (testResults.errors.length > 0) {
    log('\n🔍 Error Details:', 'error');
    testResults.errors.forEach(error => log(`  • ${error}`, 'error'));
  }
  
  // Save results to file
  const reportPath = path.join(__dirname, 'test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    results: testResults,
    config: TEST_CONFIG
  }, null, 2));
  
  log(`\n📄 Detailed results saved to: ${reportPath}`, 'info');
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}` || import.meta.url.endsWith(process.argv[1])) {
  runAllTests().catch(error => {
    log(`Fatal error: ${error.message}`, 'error');
    process.exit(1);
  });
}

// Always run tests for now
runAllTests().catch(error => {
  log(`Fatal error: ${error.message}`, 'error');
  process.exit(1);
});

export {
  runAllTests,
  testRPCConnection,
  testContractInteraction,
  TEST_CONFIG
};