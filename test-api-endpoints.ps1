# PowerShell script to test ChainHive API endpoints
# Usage: .\test-api-endpoints.ps1 [base-url]

param(
    [string]$BaseUrl = "http://localhost:3000"
)

Write-Host "🚀 ChainHive API Endpoints Test Suite" -ForegroundColor Cyan
Write-Host "Testing endpoints at: $BaseUrl" -ForegroundColor Yellow
Write-Host "" 

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js to run the tests." -ForegroundColor Red
    exit 1
}

# Check if the test file exists
if (-not (Test-Path "test-api-endpoints.js")) {
    Write-Host "❌ test-api-endpoints.js not found in current directory." -ForegroundColor Red
    exit 1
}

# Run the test suite
try {
    Write-Host "🔧 Starting API endpoint tests..." -ForegroundColor Blue
    Write-Host ""
    
    node test-api-endpoints.js $BaseUrl
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 All tests completed successfully!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "⚠️  Some tests failed. Check the output above for details." -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error running tests: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📝 Test completed. Check the results above." -ForegroundColor Cyan