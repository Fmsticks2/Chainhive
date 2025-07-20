#!/bin/bash
# Build script for Render deployment

set -e  # Exit on any error

echo "🚀 Starting ChainHive build for Render..."

# Check Node.js version
echo "📋 Node.js version: $(node --version)"
echo "📋 NPM version: $(npm --version)"

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Create public directory if it doesn't exist
mkdir -p public

# Copy static files
echo "📁 Copying static files..."
cp index.html public/
cp app.js public/

# Copy any additional assets
if [ -d "assets" ]; then
    cp -r assets public/
fi

if [ -d "images" ]; then
    cp -r images public/
fi

# Create a simple index.html if build fails
if [ ! -f "public/index.html" ]; then
    echo "⚠️  Creating fallback index.html"
    cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ChainHive - Loading...</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
        }
        .spinner {
            border: 4px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top: 4px solid white;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <h1>ChainHive</h1>
    <div class="spinner"></div>
    <p>Initializing multi-chain portfolio intelligence...</p>
    <script>
        // Redirect to main app after a short delay
        setTimeout(() => {
            window.location.href = '/app.html';
        }, 3000);
    </script>
</body>
</html>
EOF
fi

# Verify build output
echo "✅ Build verification:"
ls -la public/

echo "🎉 Build completed successfully!"
echo "📊 Build size:"
du -sh public/

echo "🔧 Setting up production configuration..."

# Create a production server configuration
cat > server-config.json << 'EOF'
{
  "port": 3000,
  "host": "0.0.0.0",
  "environment": "production",
  "staticPath": "./public",
  "apiPath": "/api",
  "healthCheck": "/api/health",
  "cors": {
    "enabled": true,
    "credentials": true
  },
  "compression": {
    "enabled": true,
    "level": 6
  },
  "rateLimit": {
    "windowMs": 900000,
    "max": 100
  }
}
EOF

echo "✨ Ready for deployment!"