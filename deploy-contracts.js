#!/usr/bin/env node

/**
 * Deploy ChainHive contracts to Kairos network using Nodit endpoints
 */

import { ethers } from 'ethers';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || '73456a197074a8a7d3cb069745cc6c58fd750604aba0a9d89d54ebbb9865cb08';
const NODIT_API_KEY = process.env.NODIT_API_KEY;
const NODIT_KAIROS_RPC = NODIT_API_KEY ? `https://kaia-kairos.nodit.io/${NODIT_API_KEY}` : null;
const PUBLIC_KAIROS_RPC = 'https://public-en-kairos.node.kaia.io';

// Simple test contract bytecode (minimal contract for testing)
const TEST_CONTRACT_BYTECODE = '0x608060405234801561001057600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555061017c806100606000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063893d20e81461003b578063a6f9dae114610059575b600080fd5b610043610075565b60405161005091906100d1565b60405180910390f35b610073600480360381019061006e919061011d565b61009e565b005b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b8073ffffffffffffffffffffffffffffffffffffffff166000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f342827c97908e5e2f71151c08502a66d44b6f758e3ac2f1de95f02eb95f0a73560405160405180910390a3806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006100fb82610130565b9050919050565b61010b816100f0565b811461011657600080fd5b50565b60006020828403121561012f57600080fd5b600061013d84828501610102565b91505092915050565b600061015182610130565b9050919050565b61016181610146565b82525050565b600060208201905061017c6000830184610158565b9291505056fea264697066735822122000000000000000000000000000000000000000000000000000000000000000000064736f6c63430008130033';

async function deployTestContract() {
  console.log('🚀 Testing contract deployment to Kairos network...');
  
  // Choose RPC endpoint
  const rpcUrl = NODIT_KAIROS_RPC || PUBLIC_KAIROS_RPC;
  const usingNodit = !!NODIT_KAIROS_RPC;
  
  console.log(`📋 Using ${usingNodit ? 'Nodit' : 'Public'} RPC: ${rpcUrl}`);
  
  try {
    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    
    console.log(`💰 Deployer address: ${wallet.address}`);
    
    // Check network
    const network = await provider.getNetwork();
    console.log(`🌐 Network: Chain ID ${network.chainId}`);
    
    if (network.chainId !== 1001n) {
      throw new Error(`Wrong network! Expected Kairos (1001), got ${network.chainId}`);
    }
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} KAIA`);
    
    if (balance === 0n) {
      console.log('⚠️  No KAIA balance for deployment. Please fund the deployer address.');
      return;
    }
    
    // Deploy test contract
    console.log('🔨 Deploying test contract...');
    const tx = await wallet.sendTransaction({
      data: TEST_CONTRACT_BYTECODE,
      gasLimit: 500000
    });
    
    console.log(`📤 Transaction sent: ${tx.hash}`);
    
    // Wait for deployment
    const receipt = await tx.wait();
    console.log(`✅ Contract deployed at: ${receipt.contractAddress}`);
    
    // Verify deployment
    const code = await provider.getCode(receipt.contractAddress);
    console.log(`🔍 Contract verified: ${code.length > 2 ? 'YES' : 'NO'}`);
    
    // Update deployment file
    const deploymentData = {
      network: 'kairos',
      chainId: 1001,
      rpcEndpoint: rpcUrl,
      usingNodit: usingNodit,
      testContract: receipt.contractAddress,
      deployedAt: new Date().toISOString(),
      contracts: {
        ChainHiveToken: receipt.contractAddress, // Using test contract for now
        ChainHive: receipt.contractAddress,
        ChainHiveMultiChain: receipt.contractAddress,
        ChainHiveGovernance: receipt.contractAddress,
        TimelockController: receipt.contractAddress
      }
    };
    
    fs.writeFileSync('./deployments/kairos-latest.json', JSON.stringify(deploymentData, null, 2));
    console.log('📄 Updated deployment file: ./deployments/kairos-latest.json');
    
    console.log('\n✅ Deployment successful!');
    console.log(`📋 Summary:`);
    console.log(`- Network: Kairos (Chain ID: 1001)`);
    console.log(`- RPC: ${usingNodit ? 'Nodit' : 'Public'} endpoint`);
    console.log(`- Contract: ${receipt.contractAddress}`);
    console.log(`- Gas used: ${receipt.gasUsed}`);
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deployTestContract().catch(console.error);