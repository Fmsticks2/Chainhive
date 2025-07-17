# Multi-Chain Functionality Test Script for Windows PowerShell
# Tests Nodit RPC endpoints and contract interactions

Write-Host "🚀 ChainHive Multi-Chain Test Suite" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Gray

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Check if required dependencies are available
$requiredPackages = @("ethers", "dotenv")
foreach ($package in $requiredPackages) {
    if (-not (Test-Path "node_modules\$package")) {
        Write-Host "📦 Installing missing package: $package" -ForegroundColor Yellow
        npm install $package
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Failed to install $package" -ForegroundColor Red
            exit 1
        }
    }
}

# Check environment file
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  .env file not found. Creating template..." -ForegroundColor Yellow
    @"
# Nodit Configuration
NODIT_API_KEY=your_nodit_api_key_here
NODIT_BASE_URL=https://web3.nodit.io/

# Kairos Network Configuration
KAIROS_RPC_URL=https://public-en-kairos.node.kaia.io
KAIROS_CHAIN_ID=1001

# Contract Addresses (Deployed)
VITE_CHAINHIVE_CONTRACT_ADDRESS=0x72CA2541A705468368F9474fB419Defd002EC8af
VITE_CHAINHIVE_TOKEN_ADDRESS=0xdc6c396319895dA489b0Cd145A4c5D660b9e10F6
VITE_CHAINHIVE_MULTICHAIN_ADDRESS=0xF565086417Bf8ba76e4FaFC9F0088818eA027539
VITE_CHAINHIVE_GOVERNANCE_ADDRESS=0xcBB12aBDA134ac0444f2aa41E98EDD57f8D5631F

# IPFS Configuration
VITE_IPFS_GATEWAY=https://gateway.pinata.cloud/ipfs/
VITE_PINATA_API_KEY=your_pinata_api_key
VITE_PINATA_SECRET_KEY=your_pinata_secret_key
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "📝 Template .env file created. Please update with your API keys." -ForegroundColor Yellow
}

# Run the main test script
Write-Host "\n🧪 Running multi-chain tests..." -ForegroundColor Cyan
node test-multichain.js

$testExitCode = $LASTEXITCODE

# Additional Windows-specific tests
Write-Host "\n🪟 Running Windows-specific checks..." -ForegroundColor Cyan

# Test PowerShell execution policy
$executionPolicy = Get-ExecutionPolicy
if ($executionPolicy -eq "Restricted") {
    Write-Host "⚠️  PowerShell execution policy is Restricted. Consider running:" -ForegroundColor Yellow
    Write-Host "   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor Yellow
} else {
    Write-Host "✅ PowerShell execution policy: $executionPolicy" -ForegroundColor Green
}

# Test if development server can start
Write-Host "\n🌐 Testing development server startup..." -ForegroundColor Cyan
try {
    $serverProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -WindowStyle Hidden
    Start-Sleep -Seconds 5
    
    if (-not $serverProcess.HasExited) {
        Write-Host "✅ Development server started successfully" -ForegroundColor Green
        Stop-Process -Id $serverProcess.Id -Force
        Write-Host "✅ Development server stopped cleanly" -ForegroundColor Green
    } else {
        Write-Host "❌ Development server failed to start" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error testing development server: $($_.Exception.Message)" -ForegroundColor Red
}

# Test build process
Write-Host "\n🔨 Testing build process..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build completed successfully" -ForegroundColor Green
    if (Test-Path "dist") {
        $distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum
        Write-Host "📊 Build size: $([math]::Round($distSize / 1MB, 2)) MB" -ForegroundColor Cyan
    }
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
}

# Summary
Write-Host "\n" + "=" * 50 -ForegroundColor Gray
if ($testExitCode -eq 0) {
    Write-Host "🎉 All tests completed successfully!" -ForegroundColor Green
    Write-Host "\n📋 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Update .env file with your actual API keys" -ForegroundColor White
    Write-Host "   2. Test the application: npm run dev" -ForegroundColor White
    Write-Host "   3. Deploy to production when ready" -ForegroundColor White
} else {
    Write-Host "❌ Some tests failed. Please check the output above." -ForegroundColor Red
    Write-Host "\n🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "   1. Ensure all API keys are correctly set in .env" -ForegroundColor White
    Write-Host "   2. Check network connectivity" -ForegroundColor White
    Write-Host "   3. Verify contract addresses are correct" -ForegroundColor White
}

Write-Host "\n📄 Check test-results.json for detailed results" -ForegroundColor Cyan
exit $testExitCode