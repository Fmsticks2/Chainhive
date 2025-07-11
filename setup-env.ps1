# ChainHive Environment Setup Script
# This script helps configure environment variables after contract deployment

Write-Host "🔧 ChainHive Environment Setup" -ForegroundColor Green
Write-Host "This script will help you configure your environment after contract deployment." -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (!(Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Created .env file from .env.example" -ForegroundColor Green
    } else {
        Write-Host "❌ .env.example file not found!" -ForegroundColor Red
        exit 1
    }
}

# Check if deployment file exists
if (Test-Path "deployments/latest.json") {
    Write-Host "📄 Found deployment configuration" -ForegroundColor Green
    
    # Read deployment data
    $deploymentData = Get-Content "deployments/latest.json" | ConvertFrom-Json
    
    Write-Host "📋 Deployment Information:" -ForegroundColor Cyan
    Write-Host "  Network: $($deploymentData.network)"
    Write-Host "  Chain ID: $($deploymentData.chainId)"
    Write-Host ""
    Write-Host "📝 Contract Addresses:" -ForegroundColor Yellow
    
    foreach ($contract in $deploymentData.contracts.PSObject.Properties) {
        Write-Host "  $($contract.Name): $($contract.Value)"
    }
    
    Write-Host ""
    Write-Host "🔄 Updating .env file with contract addresses..." -ForegroundColor Yellow
    
    # Update .env file
    $envContent = Get-Content ".env"
    
    # Update contract addresses
    $envContent = $envContent -replace "VITE_CHAINHIVE_CONTRACT_ADDRESS=.*", "VITE_CHAINHIVE_CONTRACT_ADDRESS=$($deploymentData.contracts.ChainHive)"
    $envContent = $envContent -replace "VITE_CHAINHIVE_TOKEN_ADDRESS=.*", "VITE_CHAINHIVE_TOKEN_ADDRESS=$($deploymentData.contracts.ChainHiveToken)"
    $envContent = $envContent -replace "VITE_CHAINHIVE_MULTICHAIN_ADDRESS=.*", "VITE_CHAINHIVE_MULTICHAIN_ADDRESS=$($deploymentData.contracts.ChainHiveMultiChain)"
    $envContent = $envContent -replace "VITE_CHAINHIVE_GOVERNANCE_ADDRESS=.*", "VITE_CHAINHIVE_GOVERNANCE_ADDRESS=$($deploymentData.contracts.ChainHiveGovernance)"
    $envContent = $envContent -replace "VITE_TIMELOCK_CONTROLLER_ADDRESS=.*", "VITE_TIMELOCK_CONTROLLER_ADDRESS=$($deploymentData.contracts.TimelockController)"
    
    # Save updated .env file
    $envContent | Set-Content ".env"
    
    Write-Host "✅ Environment file updated successfully!" -ForegroundColor Green
    
} else {
    Write-Host "⚠️  No deployment configuration found." -ForegroundColor Yellow
    Write-Host "   Please deploy contracts first using: .\deploy-kairos.ps1" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔑 Don't forget to configure these additional settings in your .env file:" -ForegroundColor Cyan
Write-Host "  - NODIT_API_KEY: Your Nodit API key for blockchain data"
Write-Host "  - PINATA_API_KEY: For IPFS storage (optional)"
Write-Host "  - PINATA_SECRET_KEY: For IPFS storage (optional)"
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Green
Write-Host "  1. Configure your API keys in the .env file"
Write-Host "  2. Start the development server: npm run dev"
Write-Host "  3. Connect your wallet to Kairos Network"
Write-Host "  4. Test the smart contract integration"
Write-Host ""
Write-Host "📖 For detailed instructions, see: KAIROS_DEPLOYMENT.md" -ForegroundColor Cyan