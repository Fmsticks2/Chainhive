#!/usr/bin/env node

/**
 * Verify ChainHive deployment on Kairos network with Nodit endpoints
 */

import { ethers } from 'ethers';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

const NODIT_API_KEY = process.env.NODIT_API_KEY;
const NODIT_KAIROS_RPC_URL = process.env.NODIT_KAIROS_RPC_URL;
const PUBLIC_KAIROS_RPC = 'https://public-en-kairos.node.kaia.io';

// Load deployment data
const deploymentData = JSON.parse(fs.readFileSync('./deployments/kairos-latest.json', 'utf8'));

async function verifyDeployment() {
  console.log('🔍 Verifying ChainHive deployment on Kairos network...');
  console.log('📋 Deployment data:', deploymentData);
  
  // Test Nodit endpoint
  if (NODIT_API_KEY && NODIT_KAIROS_RPC_URL) {
    console.log('\n🔑 Testing Nodit Kairos endpoint...');
    try {
      const noditProvider = new ethers.JsonRpcProvider(NODIT_KAIROS_RPC_URL);
      const network = await noditProvider.getNetwork();
      console.log(`✅ Nodit Network: Chain ID ${network.chainId}`);
      
      // Test contract existence
      const contractCode = await noditProvider.getCode(deploymentData.contracts.ChainHive);
      console.log(`✅ ChainHive contract verified on Nodit: ${contractCode.length > 2 ? 'YES' : 'NO'}`);
    } catch (error) {
      console.log(`❌ Nodit endpoint error: ${error.message}`);
    }
  } else {
    console.log('⚠️ Nodit credentials not found, skipping Nodit test');
  }
  
  // Test public RPC
  console.log('\n📋 Testing public Kairos RPC...');
  try {
    const publicProvider = new ethers.JsonRpcProvider(PUBLIC_KAIROS_RPC);
    const network = await publicProvider.getNetwork();
    console.log(`✅ Public Network: Chain ID ${network.chainId}`);
    
    // Verify all contracts
    console.log('\n🔍 Verifying contract deployments...');
    for (const [name, address] of Object.entries(deploymentData.contracts)) {
      try {
        const code = await publicProvider.getCode(address);
        const hasCode = code.length > 2;
        console.log(`${hasCode ? '✅' : '❌'} ${name}: ${address} - ${hasCode ? 'DEPLOYED' : 'NOT FOUND'}`);
      } catch (error) {
        console.log(`❌ ${name}: ${address} - ERROR: ${error.message}`);
      }
    }
    
    // Test Web3Auth configuration
    console.log('\n🔑 Web3Auth Configuration:');
    console.log(`Client ID: ${process.env.WEB3AUTH_CLIENT_ID || 'NOT SET'}`);
    console.log(`Network: ${process.env.WEB3AUTH_NETWORK || 'NOT SET'}`);
    
    console.log('\n✅ Verification complete!');
    console.log('\n📋 Summary:');
    console.log(`- Network: Kairos (Chain ID: ${network.chainId})`);
    console.log(`- Contracts deployed: ${Object.keys(deploymentData.contracts).length}`);
    console.log(`- Nodit endpoint: ${NODIT_KAIROS_RPC_URL ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
    console.log(`- Public RPC: WORKING`);
    
  } catch (error) {
    console.error('❌ Public RPC test failed:', error.message);
  }
}

verifyDeployment().catch(console.error);