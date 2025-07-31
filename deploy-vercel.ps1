# ChainHive Frontend Deployment Script for Vercel (PowerShell)
# This script automates the deployment of the frontend to Vercel

param(
    [switch]$Production,
    [switch]$Help
)

if ($Help) {
    Write-Host "ChainHive Vercel Deployment Script" -ForegroundColor Cyan
    Write-Host "Usage: .\deploy-vercel.ps1 [-Production] [-Help]" -ForegroundColor White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -Production    Deploy to production (default: preview)" -ForegroundColor White
    Write-Host "  -Help          Show this help message" -ForegroundColor White
    exit 0
}

Write-Host "🚀 Starting ChainHive Frontend Deployment to Vercel..." -ForegroundColor Cyan

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if Vercel CLI is installed
Write-Status "Checking Vercel CLI installation..."
try {
    $vercelVersion = vercel --version 2>$null
    Write-Success "Vercel CLI is installed: $vercelVersion"
} catch {
    Write-Error "Vercel CLI is not installed. Installing..."
    npm install -g vercel
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install Vercel CLI"
        exit 1
    }
}

# Check if user is logged in to Vercel
Write-Status "Checking Vercel authentication..."
try {
    $whoami = vercel whoami 2>$null
    Write-Success "Logged in as: $whoami"
} catch {
    Write-Warning "Not logged in to Vercel. Please log in..."
    vercel login
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to log in to Vercel"
        exit 1
    }
}

# Validate environment variables
Write-Status "Validating environment variables..."

if (-not $env:VITE_API_BASE_URL) {
    Write-Warning "VITE_API_BASE_URL not set. Using default from vercel.json"
}

if (-not $env:VITE_WEB3AUTH_CLIENT_ID) {
    Write-Warning "VITE_WEB3AUTH_CLIENT_ID not set. Using default from vercel.json"
}

# Check if required files exist
Write-Status "Checking required files..."

$requiredFiles = @("index.html", "app.js", "vercel.json")
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        Write-Error "Required file $file not found!"
        exit 1
    }
}

Write-Success "All required files found"

# Validate vercel.json configuration
Write-Status "Validating vercel.json configuration..."
try {
    $vercelConfig = Get-Content "vercel.json" | ConvertFrom-Json
    Write-Success "vercel.json is valid"
} catch {
    Write-Error "vercel.json is not valid JSON!"
    exit 1
}

# Determine deployment type
if ($Production) {
    $deploymentType = "production"
    $vercelArgs = "--prod"
    Write-Status "Deploying to PRODUCTION"
} else {
    $deploymentType = "preview"
    $vercelArgs = ""
    Write-Status "Deploying to PREVIEW"
}

# Get Git commit hash if available
try {
    $gitHash = git rev-parse --short HEAD 2>$null
} catch {
    $gitHash = "unknown"
}

# Create deployment info
Write-Status "Creating deployment info..."
$deploymentInfo = @{
    timestamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    type = $deploymentType
    frontend = "vercel"
    backend = "render"
    version = $gitHash
} | ConvertTo-Json

$deploymentInfo | Out-File -FilePath "deployment-info.json" -Encoding UTF8

# Deploy to Vercel
Write-Status "Deploying to Vercel..."
Write-Host "Running: vercel $vercelArgs" -ForegroundColor Gray

if ($vercelArgs) {
    $deployResult = vercel $vercelArgs.Split(' ')
} else {
    $deployResult = vercel
}

if ($LASTEXITCODE -eq 0) {
    Write-Success "Deployment successful!"
} else {
    Write-Error "Deployment failed!"
    exit 1
}

# Get deployment URL
Write-Status "Getting deployment URL..."
try {
    $whoami = vercel whoami
    $deploymentList = vercel ls --scope $whoami
    $deploymentUrl = ($deploymentList | Select-String "chainhive" | Select-Object -First 1).ToString().Split()[1]
    
    if ($deploymentUrl) {
        Write-Success "Deployment URL: https://$deploymentUrl"
        
        # Test the deployment
        Write-Status "Testing deployment..."
        
        # Test if the main page loads
        try {
            $response = Invoke-WebRequest -Uri "https://$deploymentUrl" -Method GET -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Success "Main page is accessible"
            } else {
                Write-Warning "Main page returned status code: $($response.StatusCode)"
            }
        } catch {
            Write-Warning "Main page might not be accessible: $($_.Exception.Message)"
        }
        
        # Test if API proxy works
        try {
            $response = Invoke-WebRequest -Uri "https://$deploymentUrl/api/health" -Method GET -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Success "API proxy is working"
            } else {
                Write-Warning "API proxy returned status code: $($response.StatusCode)"
            }
        } catch {
            Write-Warning "API proxy might not be working: $($_.Exception.Message)"
        }
        
    } else {
        Write-Warning "Could not retrieve deployment URL"
    }
} catch {
    Write-Warning "Could not retrieve deployment information"
}

# Set environment variables if this is the first production deployment
if ($Production) {
    Write-Status "Setting up environment variables..."
    
    try {
        $envList = vercel env ls
        
        # Check if environment variables are already set
        if ($envList -notmatch "VITE_API_BASE_URL") {
            Write-Status "Setting VITE_API_BASE_URL..."
            "https://chainhive-backend.onrender.com" | vercel env add VITE_API_BASE_URL production
        }
        
        if ($envList -notmatch "VITE_WEB3AUTH_CLIENT_ID") {
            Write-Status "Setting VITE_WEB3AUTH_CLIENT_ID..."
            if ($env:WEB3AUTH_CLIENT_ID) {
                $env:WEB3AUTH_CLIENT_ID | vercel env add VITE_WEB3AUTH_CLIENT_ID production
            } else {
                Write-Warning "WEB3AUTH_CLIENT_ID environment variable not found. Please set it manually in Vercel dashboard."
            }
        }
    } catch {
        Write-Warning "Could not set environment variables automatically. Please set them manually in Vercel dashboard."
    }
}

# Clean up
if (Test-Path "deployment-info.json") {
    Remove-Item "deployment-info.json"
}

Write-Success "Frontend deployment completed!"
Write-Status "Next steps:"
Write-Host "  1. Update your backend CORS settings to include the new domain" -ForegroundColor White
Write-Host "  2. Test all functionality on the deployed site" -ForegroundColor White
Write-Host "  3. Monitor the deployment for any issues" -ForegroundColor White

if ($deploymentUrl) {
    Write-Host "  4. Visit your site: https://$deploymentUrl" -ForegroundColor White
}

Write-Host ""
Write-Success "🎉 ChainHive frontend deployment complete!"

# Additional deployment information
Write-Host ""
Write-Host "Deployment Summary:" -ForegroundColor Cyan
Write-Host "  Type: $deploymentType" -ForegroundColor White
Write-Host "  Platform: Vercel" -ForegroundColor White
Write-Host "  Backend: Render (https://chainhive-backend.onrender.com)" -ForegroundColor White
Write-Host "  Git Hash: $gitHash" -ForegroundColor White
Write-Host "  Timestamp: $((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))" -ForegroundColor White