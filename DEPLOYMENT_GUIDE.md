# ChainHive Deployment Guide

This guide provides detailed instructions for deploying ChainHive with the backend on Render and frontend on Vercel.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Deployment on Render](#backend-deployment-on-render)
3. [Frontend Deployment on Vercel](#frontend-deployment-on-vercel)
4. [Environment Variables](#environment-variables)
5. [Post-Deployment Configuration](#post-deployment-configuration)
6. [Monitoring and Troubleshooting](#monitoring-and-troubleshooting)
7. [Cost Estimation](#cost-estimation)

## Prerequisites

### Required Accounts
- [Render](https://render.com) account
- [Vercel](https://vercel.com) account
- [GitHub](https://github.com) account (for repository hosting)
- [NODIT](https://nodit.io/) API key
- [Web3Auth](https://web3auth.io) client ID

### Repository Setup
1. Push your ChainHive code to a GitHub repository
2. Ensure all files are committed and pushed
3. Make the repository public or ensure both Render and Vercel have access

## Backend Deployment on Render

### Step 1: Prepare Backend Configuration

Ensure your project has the following files:

#### `render.yaml` (Blueprint Configuration)
```yaml
services:
  - type: web
    name: chainhive-backend
    env: node
    plan: starter
    buildCommand: npm ci --only=production --legacy-peer-deps
    startCommand: node api/server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: NODIT_API_KEY
        sync: false
      - key: WEB3AUTH_CLIENT_ID
        sync: false
      - key: CORS_ORIGIN
        value: https://your-frontend-domain.vercel.app
```

#### `.env.production` (Production Environment)
```env
# Node.js Configuration
NODE_ENV=production
PORT=10000

# Server Configuration
SERVER_HOST=0.0.0.0
SERVER_TIMEOUT=30000

# NODIT API Configuration
NODIT_API_KEY=your_nodit_api_key_here
NODIT_BASE_URL=https://web3.nodit.io
NODIT_TIMEOUT=10000

# Web3Auth Configuration
WEB3AUTH_CLIENT_ID=your_web3auth_client_id_here
WEB3AUTH_NETWORK=sapphire_mainnet

# CORS Configuration
CORS_ORIGIN=https://your-frontend-domain.vercel.app
CORS_CREDENTIALS=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Caching
CACHE_TTL=300
CACHE_MAX_SIZE=100

# Logging
LOG_LEVEL=info
LOG_FORMAT=combined

# Security
HELMET_ENABLED=true
TRUST_PROXY=true

# Performance
COMPRESSION_ENABLED=true
COMPRESSION_LEVEL=6

# Health Check
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_PATH=/health
```

### Step 2: Deploy to Render

#### Option A: Using Render Blueprint (Recommended)

1. **Connect Repository**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your GitHub repository
   - Select the repository containing ChainHive

2. **Configure Blueprint**
   - Render will automatically detect the `render.yaml` file
   - Review the configuration
   - Click "Apply"

3. **Set Environment Variables**
   - In the Render dashboard, go to your service
   - Navigate to "Environment" tab
   - Add the following variables:
     ```
     NODIT_API_KEY=your_actual_nodit_api_key
     WEB3AUTH_CLIENT_ID=your_actual_web3auth_client_id
     CORS_ORIGIN=https://your-frontend-domain.vercel.app
     ```

#### Option B: Manual Deployment

1. **Create Web Service**
   - Go to Render Dashboard
   - Click "New" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   ```
   Name: chainhive-backend
   Environment: Node
   Region: Choose closest to your users
   Branch: main
   Root Directory: (leave empty)
   Build Command: npm install --production
   Start Command: npm run start:prod
   ```

3. **Set Environment Variables**
   - Add all variables from `.env.production`
   - Ensure sensitive keys are properly set

### Step 3: Backend Health Check

After deployment, verify your backend:

```bash
# Check health endpoint (primary)
curl https://your-backend-url.onrender.com/health

# Check alternative health endpoint
curl https://your-backend-url.onrender.com/api/health

# Test API endpoints
curl https://your-backend-url.onrender.com/api/config
```

**Note**: The server provides both `/health` and `/api/health` endpoints for health checks. Render will automatically use these endpoints to monitor service health.

## Frontend Deployment on Vercel

### Step 1: Prepare Frontend Configuration

#### `vercel.json` (Vercel Configuration)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "index.html",
      "use": "@vercel/static"
    },
    {
      "src": "app.js",
      "use": "@vercel/static"
    },
    {
      "src": "assets/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://your-backend-url.onrender.com/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ],
  "env": {
    "VITE_API_BASE_URL": "https://your-backend-url.onrender.com",
    "VITE_WEB3AUTH_CLIENT_ID": "your_web3auth_client_id"
  }
}
```

#### Update `app.js` for Production

Ensure your frontend points to the correct backend URL:

```javascript
// In app.js, update the API base URL
const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://your-backend-url.onrender.com';

// Update all API calls to use the production URL
const response = await fetch(`${API_BASE_URL}/api/config`);
```

### Step 2: Deploy to Vercel

#### Option A: Vercel CLI (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # From your project root
   vercel
   
   # Follow the prompts:
   # - Set up and deploy? Yes
   # - Which scope? Your account
   # - Link to existing project? No
   # - Project name: chainhive-frontend
   # - Directory: ./
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add VITE_API_BASE_URL
   # Enter: https://your-backend-url.onrender.com
   
   vercel env add VITE_WEB3AUTH_CLIENT_ID
   # Enter: your_web3auth_client_id
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

#### Option B: Vercel Dashboard

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Project**
   ```
   Project Name: chainhive-frontend
   Framework Preset: Other
   Root Directory: ./
   Build Command: (leave empty for static site)
   Output Directory: (leave empty)
   Install Command: npm install
   ```

3. **Set Environment Variables**
   - In project settings, go to "Environment Variables"
   - Add:
     ```
     VITE_API_BASE_URL=https://your-backend-url.onrender.com
     VITE_WEB3AUTH_CLIENT_ID=your_web3auth_client_id
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

### Step 3: Update Backend CORS

After frontend deployment, update your backend CORS configuration:

1. **Update Render Environment Variables**
   ```
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

2. **Redeploy Backend**
   - Render will automatically redeploy when environment variables change

## Environment Variables

### Backend (Render)

| Variable | Description | Example |
|----------|-------------|----------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `10000` |
| `NODIT_API_KEY` | NODIT API key | `your_nodit_key` |
| `WEB3AUTH_CLIENT_ID` | Web3Auth client ID | `your_web3auth_id` |
| `CORS_ORIGIN` | Frontend URL | `https://app.vercel.app` |

### Frontend (Vercel)

| Variable | Description | Example |
|----------|-------------|----------|
| `VITE_API_BASE_URL` | Backend URL | `https://api.onrender.com` |
| `VITE_WEB3AUTH_CLIENT_ID` | Web3Auth client ID | `your_web3auth_id` |

## Post-Deployment Configuration

### 1. Domain Configuration

#### Custom Domain for Frontend (Vercel)
1. Go to Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

#### Custom Domain for Backend (Render)
1. Go to Render service settings
2. Navigate to "Custom Domains"
3. Add your custom domain
4. Configure DNS records as instructed

### 2. SSL Certificates
- Both Render and Vercel provide automatic SSL certificates
- Ensure HTTPS is enforced for production

### 3. Performance Optimization

#### Frontend (Vercel)
- Enable Vercel Analytics
- Configure caching headers
- Optimize images and assets

#### Backend (Render)
- Monitor response times
- Implement proper caching
- Use compression middleware

## Monitoring and Troubleshooting

### Backend Monitoring (Render)

1. **Logs**
   ```bash
   # View logs in Render dashboard
   # Or use Render CLI
   render logs -s your-service-id
   ```

2. **Health Checks**
   ```bash
   curl https://your-backend-url.onrender.com/health
   ```

3. **Metrics**
   - Monitor CPU and memory usage in Render dashboard
   - Set up alerts for high resource usage

### Frontend Monitoring (Vercel)

1. **Analytics**
   - Enable Vercel Analytics in project settings
   - Monitor page views and performance

2. **Function Logs**
   ```bash
   # View logs in Vercel dashboard
   # Or use Vercel CLI
   vercel logs
   ```

### Common Issues and Solutions

#### CORS Errors
```javascript
// Ensure backend CORS is configured correctly
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
```

#### API Connection Issues
```javascript
// Check API base URL in frontend
const API_BASE_URL = process.env.VITE_API_BASE_URL;
console.log('API Base URL:', API_BASE_URL);
```

#### Environment Variable Issues
```bash
# Verify environment variables are set
echo $NODIT_API_KEY
echo $WEB3AUTH_CLIENT_ID
```

## Cost Estimation

### Render (Backend)
- **Starter Plan**: $7/month
  - 512 MB RAM
  - 0.1 CPU
  - 100 GB bandwidth
  - Suitable for development/small production

- **Standard Plan**: $25/month
  - 2 GB RAM
  - 1 CPU
  - 400 GB bandwidth
  - Recommended for production

### Vercel (Frontend)
- **Hobby Plan**: Free
  - 100 GB bandwidth
  - 100 deployments/day
  - Suitable for personal projects

- **Pro Plan**: $20/month
  - 1 TB bandwidth
  - Unlimited deployments
  - Analytics and monitoring
  - Recommended for production

### Total Monthly Cost
- **Development**: $7 (Render Starter + Vercel Hobby)
- **Production**: $45 (Render Standard + Vercel Pro)

## Security Best Practices

1. **Environment Variables**
   - Never commit sensitive keys to repository
   - Use different keys for development and production
   - Rotate keys regularly

2. **HTTPS**
   - Enforce HTTPS on both frontend and backend
   - Use secure headers (HSTS, CSP)

3. **API Security**
   - Implement rate limiting
   - Validate all inputs
   - Use proper authentication

4. **Monitoring**
   - Set up error tracking (Sentry)
   - Monitor for suspicious activity
   - Regular security audits

## Deployment Checklist

### Pre-Deployment
- [ ] Repository is up to date
- [ ] All environment variables are documented
- [ ] Tests are passing
- [ ] Security review completed

### Backend Deployment
- [ ] Render service created
- [ ] Environment variables set
- [ ] Health check endpoint working
- [ ] API endpoints responding

### Frontend Deployment
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] API connection working
- [ ] Custom domain configured (if applicable)

### Post-Deployment
- [ ] End-to-end testing completed
- [ ] Monitoring set up
- [ ] Documentation updated
- [ ] Team notified

## Support and Resources

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [NODIT API Documentation](https://docs.nodit.io)
- [Web3Auth Documentation](https://web3auth.io/docs)

For issues specific to ChainHive deployment, check the project's GitHub issues or create a new issue with deployment logs and error messages.