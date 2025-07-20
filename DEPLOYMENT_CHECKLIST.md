# ChainHive Deployment Checklist

## Pre-Deployment Preparation

### ✅ Repository Setup
- [ ] All code committed and pushed to GitHub
- [ ] Repository is public or accessible to Render/Vercel
- [ ] All sensitive data removed from code
- [ ] `.gitignore` properly configured

### ✅ Required Files Present
- [ ] `render.yaml` - Render blueprint configuration
- [ ] `vercel.json` - Vercel configuration with API proxy
- [ ] `.env.production` - Production environment template
- [ ] `Dockerfile` - Container configuration
- [ ] `build-render.sh` - Render build script
- [ ] `deploy-vercel.sh` - Vercel deployment script (Unix)
- [ ] `deploy-vercel.ps1` - Vercel deployment script (Windows)
- [ ] `package.json` - Updated with deployment scripts

### ✅ API Keys and Credentials
- [ ] NODIT API key obtained from [nodit.io](https://nodit.io)
- [ ] Web3Auth client ID from [web3auth.io](https://web3auth.io)
- [ ] GitHub repository URL ready
- [ ] Render account created
- [ ] Vercel account created

## Backend Deployment (Render)

### ✅ Service Configuration
- [ ] Render service created
- [ ] Repository connected to Render
- [ ] Service name: `chainhive-backend`
- [ ] Environment: Node.js
- [ ] Build command: `npm ci --only=production --legacy-peer-deps`
- [ ] Start command: `node api/server.js`

### ✅ Environment Variables Set
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`
- [ ] `NODIT_API_KEY=your_actual_key`
- [ ] `WEB3AUTH_CLIENT_ID=your_actual_id`
- [ ] `CORS_ORIGIN=https://your-frontend.vercel.app`
- [ ] `SERVER_HOST=0.0.0.0`
- [ ] `NODIT_BASE_URL=https://web3.nodit.io`
- [ ] `RATE_LIMIT_WINDOW_MS=900000`
- [ ] `RATE_LIMIT_MAX_REQUESTS=100`
- [ ] `CACHE_TTL=300`
- [ ] `LOG_LEVEL=info`
- [ ] `HELMET_ENABLED=true`
- [ ] `COMPRESSION_ENABLED=true`
- [ ] `HEALTH_CHECK_ENABLED=true`

### ✅ Backend Testing
- [ ] Service deployed successfully
- [ ] Health check endpoint responding: `/health`
- [ ] API config endpoint working: `/api/config`
- [ ] NODIT service initialized
- [ ] No errors in deployment logs
- [ ] Service URL noted: `https://chainhive-backend.onrender.com`

## Frontend Deployment (Vercel)

### ✅ Project Configuration
- [ ] Vercel project created
- [ ] Repository connected to Vercel
- [ ] Project name: `chainhive-frontend`
- [ ] Framework preset: Other
- [ ] Build command: (empty for static)
- [ ] Output directory: (empty)
- [ ] Root directory: `./`

### ✅ Environment Variables Set
- [ ] `NODE_ENV=production`
- [ ] `VITE_API_BASE_URL=https://chainhive-backend.onrender.com`
- [ ] `VITE_WEB3AUTH_CLIENT_ID=your_actual_id`

### ✅ Vercel Configuration
- [ ] `vercel.json` properly configured
- [ ] API proxy routes set to Render backend
- [ ] Static file serving configured
- [ ] Security headers added
- [ ] CORS headers configured

### ✅ Frontend Testing
- [ ] Frontend deployed successfully
- [ ] Main page loads without errors
- [ ] API proxy working (test `/api/health`)
- [ ] No console errors in browser
- [ ] Demo wallet connection works
- [ ] Frontend URL noted: `https://chainhive-frontend.vercel.app`

## Post-Deployment Configuration

### ✅ CORS Update
- [ ] Backend `CORS_ORIGIN` updated with actual Vercel URL
- [ ] Backend redeployed with new CORS settings
- [ ] Cross-origin requests working

### ✅ Domain Configuration (Optional)
- [ ] Custom domain configured for frontend
- [ ] Custom domain configured for backend
- [ ] DNS records updated
- [ ] SSL certificates active
- [ ] CORS updated for custom domains

### ✅ Security Configuration
- [ ] HTTPS enforced on both services
- [ ] Security headers active
- [ ] Rate limiting configured
- [ ] Input validation working
- [ ] No sensitive data exposed

## Integration Testing

### ✅ End-to-End Testing
- [ ] Frontend loads successfully
- [ ] Demo wallet connection works
- [ ] Portfolio analysis displays
- [ ] API calls complete successfully
- [ ] No JavaScript errors
- [ ] Mobile responsiveness verified
- [ ] Performance acceptable

### ✅ API Endpoint Testing
```bash
# Health check
curl https://chainhive-backend.onrender.com/health

# Config endpoint
curl https://chainhive-backend.onrender.com/api/config

# Frontend API proxy
curl https://chainhive-frontend.vercel.app/api/health

# Market conditions
curl https://chainhive-backend.onrender.com/api/market-conditions
```

### ✅ Browser Testing
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Edge
- [ ] Mobile browsers

## Monitoring Setup

### ✅ Render Monitoring
- [ ] Deployment logs reviewed
- [ ] Resource usage monitored
- [ ] Error alerts configured
- [ ] Uptime monitoring enabled

### ✅ Vercel Monitoring
- [ ] Function logs reviewed
- [ ] Analytics enabled (optional)
- [ ] Performance monitoring active
- [ ] Error tracking configured

### ✅ External Monitoring (Optional)
- [ ] Uptime monitoring service configured
- [ ] Error tracking (Sentry) integrated
- [ ] Performance monitoring active
- [ ] Log aggregation setup

## Documentation and Handover

### ✅ Documentation Updated
- [ ] Deployment URLs documented
- [ ] Environment variables documented
- [ ] API endpoints documented
- [ ] Troubleshooting guide updated
- [ ] Team access configured

### ✅ Backup and Recovery
- [ ] Environment variables backed up
- [ ] Deployment configurations saved
- [ ] Recovery procedures documented
- [ ] Rollback plan prepared

## Production Readiness

### ✅ Performance
- [ ] API response times < 2 seconds
- [ ] Frontend load time < 3 seconds
- [ ] No memory leaks detected
- [ ] Resource usage within limits

### ✅ Scalability
- [ ] Rate limiting configured
- [ ] Caching implemented
- [ ] Database connections optimized
- [ ] CDN configured (if applicable)

### ✅ Security
- [ ] Security headers implemented
- [ ] Input validation active
- [ ] HTTPS enforced
- [ ] Secrets properly managed
- [ ] CORS properly configured

## Final Verification

### ✅ Deployment URLs
- Backend: `https://chainhive-backend.onrender.com`
- Frontend: `https://chainhive-frontend.vercel.app`
- Health Check: `https://chainhive-backend.onrender.com/health`
- API Test: `https://chainhive-frontend.vercel.app/api/health`

### ✅ Key Features Working
- [ ] Demo wallet connection
- [ ] Portfolio data display
- [ ] Multi-chain support
- [ ] AI insights generation
- [ ] Real-time updates
- [ ] Error handling

### ✅ Team Notification
- [ ] Deployment completed notification sent
- [ ] URLs shared with team
- [ ] Access credentials distributed
- [ ] Documentation links provided
- [ ] Support contacts established

## Troubleshooting Quick Reference

### Common Issues

**CORS Errors**
- Check `CORS_ORIGIN` in Render environment
- Verify exact URL match (no trailing slash)
- Redeploy backend after CORS changes

**API Connection Failed**
- Verify `VITE_API_BASE_URL` in Vercel
- Check backend service status in Render
- Test direct API endpoints

**Build Failures**
- Check build logs in respective dashboards
- Verify all dependencies in `package.json`
- Check Node.js version compatibility

**Environment Variables Not Working**
- Verify variable names exactly match
- Check for typos in values
- Redeploy after environment changes

### Support Contacts
- Render Support: [render.com/support](https://render.com/support)
- Vercel Support: [vercel.com/support](https://vercel.com/support)
- NODIT Support: [docs.nodit.io](https://docs.nodit.io)
- Web3Auth Support: [web3auth.io/docs](https://web3auth.io/docs)

---

**Deployment Status**: ⏳ In Progress / ✅ Complete / ❌ Failed

**Deployed By**: _________________

**Deployment Date**: _________________

**Notes**: _________________________________________________