#!/bin/bash

# ChainHive Frontend Deployment Script for Vercel
# This script automates the deployment of the frontend to Vercel

set -e

echo "🚀 Starting ChainHive Frontend Deployment to Vercel..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed. Installing..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
print_status "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    print_warning "Not logged in to Vercel. Please log in..."
    vercel login
fi

# Validate required environment variables
print_status "Validating environment variables..."

if [ -z "$VITE_API_BASE_URL" ]; then
    print_warning "VITE_API_BASE_URL not set. Using default from vercel.json"
fi

if [ -z "$VITE_WEB3AUTH_CLIENT_ID" ]; then
    print_warning "VITE_WEB3AUTH_CLIENT_ID not set. Using default from vercel.json"
fi

# Check if required files exist
print_status "Checking required files..."

required_files=("index.html" "app.js" "vercel.json")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        print_error "Required file $file not found!"
        exit 1
    fi
done

print_success "All required files found"

# Validate vercel.json configuration
print_status "Validating vercel.json configuration..."
if ! jq empty vercel.json 2>/dev/null; then
    print_error "vercel.json is not valid JSON!"
    exit 1
fi

print_success "vercel.json is valid"

# Check if this is a production deployment
if [ "$1" = "--production" ] || [ "$1" = "-p" ]; then
    DEPLOYMENT_TYPE="production"
    VERCEL_ARGS="--prod"
    print_status "Deploying to PRODUCTION"
else
    DEPLOYMENT_TYPE="preview"
    VERCEL_ARGS=""
    print_status "Deploying to PREVIEW"
fi

# Create deployment info
print_status "Creating deployment info..."
cat > deployment-info.json << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "type": "$DEPLOYMENT_TYPE",
  "frontend": "vercel",
  "backend": "render",
  "version": "$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
}
EOF

# Deploy to Vercel
print_status "Deploying to Vercel..."
echo "Running: vercel $VERCEL_ARGS"

if vercel $VERCEL_ARGS; then
    print_success "Deployment successful!"
else
    print_error "Deployment failed!"
    exit 1
fi

# Get deployment URL
print_status "Getting deployment URL..."
DEPLOYMENT_URL=$(vercel ls --scope $(vercel whoami) | grep chainhive | head -1 | awk '{print $2}')

if [ -n "$DEPLOYMENT_URL" ]; then
    print_success "Deployment URL: https://$DEPLOYMENT_URL"
    
    # Test the deployment
    print_status "Testing deployment..."
    
    # Test if the main page loads
    if curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOYMENT_URL" | grep -q "200"; then
        print_success "Main page is accessible"
    else
        print_warning "Main page might not be accessible"
    fi
    
    # Test if API proxy works
    if curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOYMENT_URL/api/health" | grep -q "200"; then
        print_success "API proxy is working"
    else
        print_warning "API proxy might not be working"
    fi
    
else
    print_warning "Could not retrieve deployment URL"
fi

# Set environment variables if this is the first deployment
if [ "$DEPLOYMENT_TYPE" = "production" ]; then
    print_status "Setting up environment variables..."
    
    # Check if environment variables are already set
    if ! vercel env ls | grep -q "VITE_API_BASE_URL"; then
        print_status "Setting VITE_API_BASE_URL..."
        echo "https://chainhive-backend.onrender.com" | vercel env add VITE_API_BASE_URL production
    fi
    
    if ! vercel env ls | grep -q "VITE_WEB3AUTH_CLIENT_ID"; then
        print_status "Setting VITE_WEB3AUTH_CLIENT_ID..."
        echo "BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4I70WhZDvIDnfcubVDT8fOiuQ" | vercel env add VITE_WEB3AUTH_CLIENT_ID production
    fi
fi

# Clean up
rm -f deployment-info.json

print_success "Frontend deployment completed!"
print_status "Next steps:"
echo "  1. Update your backend CORS settings to include the new domain"
echo "  2. Test all functionality on the deployed site"
echo "  3. Monitor the deployment for any issues"

if [ -n "$DEPLOYMENT_URL" ]; then
    echo "  4. Visit your site: https://$DEPLOYMENT_URL"
fi

echo ""
print_success "🎉 ChainHive frontend deployment complete!"