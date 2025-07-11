# Kairos Network Deployment Script for ChainHive (PowerShell)
# This script deploys ChainHive contracts to Kairos Network

Write-Host "Starting ChainHive deployment to Kairos Network..." -ForegroundColor Green

# Set environment variables
$env:PRIVATE_KEY = "73456a197074a8a7d3cb069745cc6c58fd750604aba0a9d89d54ebbb9865cb08"
$env:DEPLOYER_ADDRESS = "0x5CbD1ABe5029c5c717038f86C31B706f027640AB"
$env:KAIROS_RPC_URL = "https://public-en-kairos.node.kaia.io"

# Create deployments directory if it doesn't exist
if (!(Test-Path "deployments")) {
    New-Item -ItemType Directory -Path "deployments" | Out-Null
}

Write-Host "Deployment Configuration:" -ForegroundColor Cyan
Write-Host "  Network: Kairos Testnet"
Write-Host "  Chain ID: 1001"
Write-Host "  RPC URL: $env:KAIROS_RPC_URL"
Write-Host "  Deployer: $env:DEPLOYER_ADDRESS"
Write-Host ""

# Check if foundry is installed
try {
    ./foundry_bin/forge.exe --version | Out-Null
    Write-Host "Foundry found!" -ForegroundColor Green
} catch {
    Write-Host "Foundry not found. Please install Foundry first:" -ForegroundColor Red
    Write-Host "   Visit: https://book.getfoundry.sh/getting-started/installation" -ForegroundColor Yellow
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
./foundry_bin/forge.exe install OpenZeppelin/openzeppelin-contracts --no-commit
./foundry_bin/forge.exe install foundry-rs/forge-std --no-commit

# Compile contracts
Write-Host "Compiling contracts..." -ForegroundColor Yellow
./foundry_bin/forge.exe build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Contract compilation failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Contracts compiled successfully!" -ForegroundColor Green

# Deploy to Kairos Network
Write-Host "Deploying to Kairos Network..." -ForegroundColor Magenta
./foundry_bin/forge.exe script contracts/deploy/DeployScript.s.sol:DeployScript `
    --rpc-url $env:KAIROS_RPC_URL `
    --private-key $env:PRIVATE_KEY `
    --broadcast `
    --chain-id 1001 `
    -vvvv

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment successful!" -ForegroundColor Green
    Write-Host "Contract addresses saved to deployments/latest.json" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  1. Update your .env file with the deployed contract addresses"
    Write-Host "  2. Configure the frontend to use Kairos Network"
    Write-Host "  3. Test the integration with your wallet: $env:DEPLOYER_ADDRESS"
    Write-Host ""
    Write-Host "You can view your contracts on Kairos Explorer:" -ForegroundColor Cyan
    Write-Host "   https://kairoscan.io/address/$env:DEPLOYER_ADDRESS"
} else {
    Write-Host "Deployment failed! Check the logs above for details." -ForegroundColor Red
    exit 1
}