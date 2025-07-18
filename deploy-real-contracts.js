#!/usr/bin/env node

import { ethers } from 'ethers';
import dotenv from 'dotenv';
import fs from 'fs';

// Load environment variables
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || '73456a197074a8a7d3cb069745cc6c58fd750604aba0a9d89d54ebbb9865cb08';
const NODIT_API_KEY = process.env.NODIT_API_KEY;
const NODIT_KAIROS_RPC = NODIT_API_KEY ? `https://kaia-kairos.nodit.io/${NODIT_API_KEY}` : null;
const PUBLIC_KAIROS_RPC = 'https://public-en-kairos.node.kaia.io';

// Load compiled contract artifacts
function loadContractArtifact(contractName) {
  try {
    const artifactPath = `./out/${contractName}.sol/${contractName}.json`;
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    return {
      abi: artifact.abi,
      bytecode: artifact.bytecode.object
    };
  } catch (error) {
    console.error(`Failed to load ${contractName} artifact:`, error.message);
    return null;
  }
}

async function deployRealContracts() {
  console.log('🚀 Deploying ChainHive contracts to Kairos network...');
  
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
    
    const deployedContracts = {};
    
    // Get network fee data for all deployments
    const feeData = await provider.getFeeData();
    console.log(`\n📊 Network fee information:`);
    console.log(`   Base Fee: ${feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : 'N/A'} gwei`);
    console.log(`   Max Fee: ${feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : 'N/A'} gwei`);
    console.log(`   Priority Fee: ${feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : 'N/A'} gwei`);
    
    // Prepare gas options for all deployments
    function getGasOptions(gasLimit = 5000000) {
      let gasOptions = { gasLimit };
      
      if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
        // EIP-1559 transaction
        gasOptions.maxFeePerGas = feeData.maxFeePerGas * 2n;
        gasOptions.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas * 2n;
      } else if (feeData.gasPrice) {
        // Legacy transaction
        gasOptions.gasPrice = feeData.gasPrice * 2n;
      } else {
        // Fallback
        gasOptions.gasPrice = ethers.parseUnits('25', 'gwei');
      }
      
      return gasOptions;
    }
    
    // 1. Deploy ChainHiveToken
    console.log('\n🔨 Deploying ChainHiveToken...');
    const tokenArtifact = loadContractArtifact('ChainHiveToken');
    if (!tokenArtifact) throw new Error('ChainHiveToken artifact not found');
    
    const tokenFactory = new ethers.ContractFactory(tokenArtifact.abi, tokenArtifact.bytecode, wallet);
    const tokenContract = await tokenFactory.deploy(getGasOptions());
    await tokenContract.waitForDeployment();
    const tokenAddress = await tokenContract.getAddress();
    deployedContracts.ChainHiveToken = tokenAddress;
    console.log(`✅ ChainHiveToken deployed at: ${tokenAddress}`);
    
    // 2. Skip TimelockController (simplified governance)
    console.log('\n⏭️ Skipping TimelockController (simplified governance)...');
    
    // 3. Deploy ChainHive
    console.log('\n🔨 Deploying ChainHive...');
    const chainHiveArtifact = loadContractArtifact('ChainHive');
    if (!chainHiveArtifact) throw new Error('ChainHive artifact not found');
    
    const chainHiveFactory = new ethers.ContractFactory(chainHiveArtifact.abi, chainHiveArtifact.bytecode, wallet);
    const chainHiveContract = await chainHiveFactory.deploy(tokenAddress, getGasOptions());
    await chainHiveContract.waitForDeployment();
    const chainHiveAddress = await chainHiveContract.getAddress();
    deployedContracts.ChainHive = chainHiveAddress;
    console.log(`✅ ChainHive deployed at: ${chainHiveAddress}`);
    
    // 4. Deploy ChainHiveMultiChain
    console.log('\n🔨 Deploying ChainHiveMultiChain...');
    const multiChainArtifact = loadContractArtifact('ChainHiveMultiChain');
    if (!multiChainArtifact) throw new Error('ChainHiveMultiChain artifact not found');
    
    const multiChainFactory = new ethers.ContractFactory(multiChainArtifact.abi, multiChainArtifact.bytecode, wallet);
    const multiChainContract = await multiChainFactory.deploy(getGasOptions());
    await multiChainContract.waitForDeployment();
    const multiChainAddress = await multiChainContract.getAddress();
    deployedContracts.ChainHiveMultiChain = multiChainAddress;
    console.log(`✅ ChainHiveMultiChain deployed at: ${multiChainAddress}`);
    
    // 5. Deploy ChainHiveGovernance
    console.log('\n🔨 Deploying ChainHiveGovernance...');
    const governanceArtifact = loadContractArtifact('ChainHiveGovernance');
    if (!governanceArtifact) throw new Error('ChainHiveGovernance artifact not found');
    
    const governanceFactory = new ethers.ContractFactory(governanceArtifact.abi, governanceArtifact.bytecode, wallet);
    
    try {
      // Get current gas price from network
      const feeData = await provider.getFeeData();
      console.log(`📊 Current network fees:`);
      console.log(`   Base Fee: ${feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : 'N/A'} gwei`);
      console.log(`   Max Fee: ${feeData.maxFeePerGas ? ethers.formatUnits(feeData.maxFeePerGas, 'gwei') : 'N/A'} gwei`);
      console.log(`   Priority Fee: ${feeData.maxPriorityFeePerGas ? ethers.formatUnits(feeData.maxPriorityFeePerGas, 'gwei') : 'N/A'} gwei`);
      
      // Use EIP-1559 gas pricing if available, otherwise fallback to legacy
      let gasOptions = { gasLimit: 10000000 };
      
      if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
        // EIP-1559 transaction
        gasOptions.maxFeePerGas = feeData.maxFeePerGas * 2n; // 2x current max fee
        gasOptions.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas * 2n; // 2x current priority fee
        console.log(`🔧 Using EIP-1559 pricing: maxFee=${ethers.formatUnits(gasOptions.maxFeePerGas, 'gwei')} gwei, priorityFee=${ethers.formatUnits(gasOptions.maxPriorityFeePerGas, 'gwei')} gwei`);
      } else if (feeData.gasPrice) {
        // Legacy transaction
        gasOptions.gasPrice = feeData.gasPrice * 2n; // 2x current gas price
        console.log(`🔧 Using legacy pricing: gasPrice=${ethers.formatUnits(gasOptions.gasPrice, 'gwei')} gwei`);
      } else {
        // Fallback to manual pricing
        gasOptions.gasPrice = ethers.parseUnits('25', 'gwei');
        console.log(`🔧 Using fallback pricing: gasPrice=25 gwei`);
      }
      
      const governanceContract = await governanceFactory.deploy(tokenAddress, gasOptions);
      await governanceContract.waitForDeployment();
      const governanceAddress = await governanceContract.getAddress();
      deployedContracts.ChainHiveGovernance = governanceAddress;
      console.log(`✅ ChainHiveGovernance deployed at: ${governanceAddress}`);
    } catch (govError) {
      console.error('❌ ChainHiveGovernance deployment failed:', govError.message);
      console.log('🔍 Attempting deployment with higher gas settings...');
      
      try {
        // Try with much higher gas settings
        const feeData = await provider.getFeeData();
        let retryGasOptions = { gasLimit: 15000000 };
        
        if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
          retryGasOptions.maxFeePerGas = feeData.maxFeePerGas * 5n; // 5x current max fee
          retryGasOptions.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas * 5n; // 5x current priority fee
        } else {
          retryGasOptions.gasPrice = ethers.parseUnits('50', 'gwei'); // Higher legacy gas price
        }
        
        const governanceContract = await governanceFactory.deploy(tokenAddress, retryGasOptions);
        await governanceContract.waitForDeployment();
        const governanceAddress = await governanceContract.getAddress();
        deployedContracts.ChainHiveGovernance = governanceAddress;
        console.log(`✅ ChainHiveGovernance deployed at: ${governanceAddress}`);
      } catch (retryError) {
        console.error('❌ ChainHiveGovernance deployment failed on retry:', retryError.message);
        throw retryError;
      }
    }
    
    // Update deployment file
    const deploymentData = {
      network: 'kairos',
      chainId: 1001,
      rpcEndpoint: rpcUrl,
      usingNodit: usingNodit,
      deployedAt: new Date().toISOString(),
      contracts: deployedContracts
    };
    
    fs.writeFileSync('./deployments/kairos-latest.json', JSON.stringify(deploymentData, null, 2));
    console.log('\n📄 Updated deployment file: ./deployments/kairos-latest.json');
    
    console.log('\n✅ All contracts deployed successfully!');
    console.log(`📋 Summary:`);
    console.log(`- Network: Kairos (Chain ID: 1001)`);
    console.log(`- RPC: ${usingNodit ? 'Nodit' : 'Public'} endpoint`);
    console.log(`- ChainHiveToken: ${deployedContracts.ChainHiveToken}`);
    console.log(`- ChainHive: ${deployedContracts.ChainHive}`);
    console.log(`- ChainHiveMultiChain: ${deployedContracts.ChainHiveMultiChain}`);
    console.log(`- ChainHiveGovernance: ${deployedContracts.ChainHiveGovernance}`);
    
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

deployRealContracts().catch(console.error);