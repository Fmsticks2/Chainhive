# ChainHive Deployment Quick Start

This README provides a quick start guide for deploying ChainHive with backend on Render and frontend on Vercel.

## 🚀 Quick Deployment

### Prerequisites
- GitHub repository with ChainHive code
- [Render](https://render.com) account
- [Vercel](https://vercel.com) account
- NODIT API key
- Web3Auth client ID

### 1. Backend Deployment (Render)

#### Option A: One-Click Deploy
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/your-username/chainhive)

#### Option B: Manual Deploy
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   ```
   Name: chainhive-backend
   Environment: Node
   Build Command: npm install --production
   Start Command: npm run start:prod
   ```
5. Set environment variables:
   ```
   NODE_ENV=production
   PORT=10000
   NODIT_API_KEY=your_nodit_api_key
   WEB3AUTH_CLIENT_ID=your_web3auth_client_id
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

### 2. Frontend Deployment (Vercel)

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Deploy to production
vercel --prod
```

#### Option B: Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   ```
   Framework Preset: Other
   Build Command: (leave empty)
   Output Directory: (leave empty)
   ```
5. Set environment variables:
   ```
   VITE_API_BASE_URL=https://your-backend.onrender.com
   VITE_WEB3AUTH_CLIENT_ID=your_web3auth_client_id
   ```

#### Option C: Automated Script
```bash
# For Unix/Linux/macOS
./deploy-vercel.sh --production

# For Windows PowerShell
.\deploy-vercel.ps1 -Production
```

## 📁 Required Files

Ensure these files are in your repository:

- ✅ `render.yaml` - Render configuration
- ✅ `vercel.json` - Vercel configuration
- ✅ `.env.production` - Production environment variables
- ✅ `package.json` - Updated with deployment scripts
- ✅ `Dockerfile` - Container configuration
- ✅ `build-render.sh` - Render build script

## 🔧 Configuration Files

### `render.yaml`
```yaml
services:
  - type: web
    name: chainhive-backend
    env: node
    plan: starter
    buildCommand: npm install --production
    startCommand: npm run start:prod
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
```

### `vercel.json`
```json
{
  "version": 2,
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "https://chainhive-backend.onrender.com/api/$1"
    }
  ]
}
```

## 🌐 Environment Variables

### Backend (Render)
| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment | ✅ |
| `PORT` | Server port | ✅ |
| `NODIT_API_KEY` | NODIT API key | ✅ |
| `WEB3AUTH_CLIENT_ID` | Web3Auth client ID | ✅ |
| `CORS_ORIGIN` | Frontend URL | ✅ |

### Frontend (Vercel)
| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_BASE_URL` | Backend URL | ✅ |
| `VITE_WEB3AUTH_CLIENT_ID` | Web3Auth client ID | ✅ |

## 🔗 Post-Deployment

1. **Update CORS**: Set `CORS_ORIGIN` in Render to your Vercel URL
2. **Test endpoints**: Verify API connectivity
3. **Custom domains**: Configure custom domains if needed
4. **SSL certificates**: Ensure HTTPS is enabled

## 🧪 Testing Deployment

### Backend Health Check
```bash
curl https://your-backend.onrender.com/health
```

### Frontend API Test
```bash
curl https://your-frontend.vercel.app/api/config
```

### Full Integration Test
1. Visit your frontend URL
2. Connect demo wallet
3. Verify portfolio data loads
4. Check browser console for errors

## 📊 Monitoring

### Render
- View logs in Render dashboard
- Monitor CPU/memory usage
- Set up alerts for downtime

### Vercel
- Enable Vercel Analytics
- Monitor function execution
- Check deployment logs

## 💰 Cost Estimation

| Service | Plan | Cost/Month | Features |
|---------|------|------------|----------|
| Render | Starter | $7 | 512MB RAM, 0.1 CPU |
| Render | Standard | $25 | 2GB RAM, 1 CPU |
| Vercel | Hobby | Free | 100GB bandwidth |
| Vercel | Pro | $20 | 1TB bandwidth |

**Recommended for production**: Render Standard + Vercel Pro = $45/month

## 🔍 Troubleshooting

### Common Issues

#### CORS Errors
```javascript
// Check CORS_ORIGIN in Render environment variables
// Ensure it matches your Vercel domain exactly
```

#### API Connection Failed
```javascript
// Verify VITE_API_BASE_URL in Vercel
// Check if backend is running on Render
```

#### Build Failures
```bash
# Check build logs in respective dashboards
# Verify all dependencies are listed in package.json
```

### Debug Commands

```bash
# Check Render logs
render logs -s your-service-id

# Check Vercel logs
vercel logs

# Test API connectivity
curl -v https://your-backend.onrender.com/api/health
```

## 📚 Additional Resources

- [Complete Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [NODIT API Docs](https://docs.nodit.io)
- [Web3Auth Docs](https://web3auth.io/docs)

## 🆘 Support

If you encounter issues:

1. Check the [troubleshooting section](#troubleshooting)
2. Review deployment logs
3. Verify environment variables
4. Test API endpoints individually
5. Create an issue with logs and error messages

---

**Next Steps**: After successful deployment, consider setting up monitoring, custom domains, and CI/CD pipelines for automated deployments.