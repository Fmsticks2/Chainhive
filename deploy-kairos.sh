#!/bin/bash

# Kairos Network Deployment Script for ChainHive
# This script deploys ChainHive contracts to Kairos Network

echo "🚀 Starting ChainHive deployment to Kairos Network..."

# Set environment variables
export PRIVATE_KEY="73456a197074a8a7d3cb069745cc6c58fd750604aba0a9d89d54ebbb9865cb08"
export DEPLOYER_ADDRESS="0x5CbD1ABe5029c5c717038f86C31B706f027640AB"
export KAIROS_RPC_URL="https://public-en-kairos.node.kaia.io"

# Create deployments directory if it doesn't exist
mkdir -p deployments

echo "📋 Deployment Configuration:"
echo "  Network: Kairos Testnet"
echo "  Chain ID: 1001"
echo "  RPC URL: $KAIROS_RPC_URL"
echo "  Deployer: $DEPLOYER_ADDRESS"
echo ""

# Check if foundry is installed
if ! command -v forge &> /dev/null; then
    echo "❌ Foundry not found. Please install Foundry first:"
    echo "   curl -L https://foundry.paradigm.xyz | bash"
    echo "   foundryup"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
forge install OpenZeppelin/openzeppelin-contracts --no-commit
forge install foundry-rs/forge-std --no-commit

# Compile contracts
echo "🔨 Compiling contracts..."
forge build

if [ $? -ne 0 ]; then
    echo "❌ Contract compilation failed!"
    exit 1
fi

echo "✅ Contracts compiled successfully!"

# Deploy to Kairos Network
echo "🌐 Deploying to Kairos Network..."
forge script contracts/deploy/DeployScript.s.sol:DeployScript \
    --rpc-url $KAIROS_RPC_URL \
    --private-key $PRIVATE_KEY \
    --broadcast \
    --verify \
    --chain-id 1001 \
    -vvvv

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "📄 Contract addresses saved to deployments/latest.json"
    echo ""
    echo "🔗 Next steps:"
    echo "  1. Update your .env file with the deployed contract addresses"
    echo "  2. Configure the frontend to use Kairos Network"
    echo "  3. Test the integration with your wallet: $DEPLOYER_ADDRESS"
    echo ""
    echo "📊 You can view your contracts on Kairos Explorer:"
    echo "   https://kairoscan.io/address/$DEPLOYER_ADDRESS"
else
    echo "❌ Deployment failed! Check the logs above for details."
    exit 1
fi