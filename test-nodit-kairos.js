#!/usr/bin/env node

/**
 * Test Nodit Kairos API endpoint
 */

import { ethers } from 'ethers';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const KAIROS_CONTRACT = '0xC34571EF2deF39aF6e1b7F072740061CBc1ec421';
const NODIT_API_KEY = process.env.NODIT_API_KEY;

async function testNoditKairos() {
  console.log('🔍 Testing Nodit Kairos API endpoint...');
  
  if (!NODIT_API_KEY) {
    console.log('❌ NODIT_API_KEY not found in environment variables');
    console.log('📋 Testing with public RPC endpoint instead...');
    
    // Test with public RPC
    const publicProvider = new ethers.JsonRpcProvider('https://public-en-kairos.node.kaia.io');
    
    try {
      console.log('📋 Testing public Kairos RPC...');
      const network = await publicProvider.getNetwork();
      console.log(`✅ Network: ${network.name}, Chain ID: ${network.chainId}`);
      
      const blockNumber = await publicProvider.getBlockNumber();
      console.log(`✅ Latest block: ${blockNumber}`);
      
      const code = await publicProvider.getCode(KAIROS_CONTRACT);
      console.log(`📋 Contract code at ${KAIROS_CONTRACT}: ${code.length} bytes`);
      console.log(`📋 Has code: ${code !== '0x'}`);
      
      if (code !== '0x') {
        console.log('✅ Contract exists on public RPC');
      } else {
        console.log('❌ Contract not found on public RPC');
      }
      
    } catch (error) {
      console.log(`❌ Public RPC error: ${error.message}`);
    }
    
    return;
  }
  
  // Test with Nodit API
  console.log('📋 Testing Nodit API endpoint...');
  
  try {
    // Create provider with Nodit API
    const noditUrl = `https://kaia-kairos.nodit.io/${NODIT_API_KEY}`;
    const fetchRequest = new ethers.FetchRequest(noditUrl);
    fetchRequest.setHeader('Content-Type', 'application/json');
    fetchRequest.setHeader('X-API-KEY', NODIT_API_KEY);
    
    const provider = new ethers.JsonRpcProvider(fetchRequest);
    
    console.log('📋 Testing Nodit Kairos connection...');
    const network = await provider.getNetwork();
    console.log(`✅ Network: ${network.name}, Chain ID: ${network.chainId}`);
    
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ Latest block: ${blockNumber}`);
    
    const code = await provider.getCode(KAIROS_CONTRACT);
    console.log(`📋 Contract code at ${KAIROS_CONTRACT}: ${code.length} bytes`);
    console.log(`📋 Has code: ${code !== '0x'}`);
    
    if (code !== '0x') {
      console.log('✅ Contract exists on Nodit API');
      
      // Try to call the contract
      const tokenContract = new ethers.Contract(
        KAIROS_CONTRACT,
        ['function symbol() view returns (string)', 'function name() view returns (string)'],
        provider
      );
      
      try {
        const symbol = await tokenContract.symbol();
        console.log(`✅ Contract symbol: ${symbol}`);
      } catch (symbolError) {
        console.log(`❌ Symbol call failed: ${symbolError.message}`);
      }
      
      try {
        const name = await tokenContract.name();
        console.log(`✅ Contract name: ${name}`);
      } catch (nameError) {
        console.log(`❌ Name call failed: ${nameError.message}`);
      }
      
    } else {
      console.log('❌ Contract not found on Nodit API');
    }
    
  } catch (error) {
    console.log(`❌ Nodit API error: ${error.message}`);
    
    // Fallback to public RPC
    console.log('📋 Falling back to public RPC...');
    const publicProvider = new ethers.JsonRpcProvider('https://public-en-kairos.node.kaia.io');
    
    try {
      const network = await publicProvider.getNetwork();
      console.log(`✅ Public RPC Network: ${network.name}, Chain ID: ${network.chainId}`);
      
      const code = await publicProvider.getCode(KAIROS_CONTRACT);
      console.log(`📋 Public RPC Contract code: ${code.length} bytes`);
      console.log(`📋 Public RPC Has code: ${code !== '0x'}`);
      
    } catch (publicError) {
      console.log(`❌ Public RPC also failed: ${publicError.message}`);
    }
  }
}

testNoditKairos().catch(console.error);