
# ChainHive

**Professional Multi-Chain Portfolio Management Platform**

ChainHive is an enterprise-grade multi-chain portfolio tracker that leverages Nodit's Web3 Data APIs and Model Context Protocol (MCP) integration to provide comprehensive blockchain analytics and portfolio management across multiple networks.

## Features

### Multi-Chain Support
- **Ethereum** - Complete ERC-20 token and NFT tracking
- **Polygon** - High-performance Layer 2 analytics
- **Binance Smart Chain** - BSC ecosystem monitoring
- **Arbitrum** - Layer 2 scaling solution support
- **Optimism** - Optimistic rollup network integration
- **Avalanche** - High-throughput blockchain analysis

### Core Capabilities
- **Real-time Portfolio Tracking** - Live balance updates across all supported chains
- **Transaction History** - Comprehensive transaction analysis and categorization
- **NFT Management** - Complete NFT portfolio visualization and valuation
- **Multi-Chain Analytics** - Cross-chain portfolio performance metrics
- **API Integration** - RESTful API for programmatic access
- **Security-First Design** - Read-only access with enterprise-grade security

### Technical Features
- **High-Performance Architecture** - Optimized for speed and reliability
- **MCP Integration** - Model Context Protocol for enhanced AI-driven blockchain interactions
- **Rate Limiting** - Built-in API protection and throttling
- **Caching Layer** - Redis-based caching for optimal performance
- **Error Handling** - Comprehensive error management and logging
- **CORS Protection** - Secure cross-origin request handling
- **Health Monitoring** - Built-in health checks and monitoring endpoints

## Nodit MCP Integration

### What is MCP?

Model Context Protocol (MCP) is an open standard that enables secure connections between AI applications and data sources. ChainHive integrates with Nodit's MCP server to provide AI-powered blockchain data access and analysis.

### MCP Features in ChainHive

- **AI-Powered Analytics** - Leverage AI models for advanced blockchain data analysis
- **Secure Data Access** - MCP provides secure, standardized access to Nodit's Web3 APIs
- **Real-time Processing** - Stream blockchain data through MCP for real-time insights
- **Enhanced Query Capabilities** - Natural language queries for blockchain data
- **Automated Insights** - AI-driven portfolio analysis and recommendations

### MCP Server Configuration

The MCP server is automatically configured and managed by ChainHive:

```json
{
  "mcpServers": {
    "nodit": {
      "command": "npx",
      "args": ["@noditlabs/nodit-mcp-server@latest"],
      "env": {
        "NODIT_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### MCP API Endpoints

**Check MCP Status**
```http
GET /api/mcp/status
```

**Restart MCP Server**
```http
POST /api/mcp/restart
```

**List Available APIs**
```http
GET /api/mcp/apis
```

### Benefits of MCP Integration

1. **Standardized Access** - Consistent interface for blockchain data across different AI models
2. **Enhanced Security** - Secure authentication and data transmission
3. **Improved Performance** - Optimized data streaming and processing
4. **AI-Ready Data** - Pre-processed data optimized for AI/ML applications
5. **Future-Proof Architecture** - Built on open standards for long-term compatibility

## Prerequisites

- **Node.js** 16.0.0 or higher
- **npm** 8.0.0 or higher
- **Nodit API Key** - Obtain from [web3.nodit.io](https://web3.nodit.io)
- **Redis** (optional) - For caching and performance optimization

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chainhive
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Configure the following required environment variables:
   ```env
   # Required
   NODIT_API_KEY=your_nodit_api_key_here
   
   # Optional Configuration
   NODE_ENV=production
   PORT=3000
   NODIT_BASE_URL=https://web3.nodit.io
   
   # Security
   CORS_ALLOWED_ORIGINS=https://yourdomain.com
   VALID_API_KEYS=your_api_keys_here
   
   # Performance
   REDIS_URL=redis://localhost:6379
   CACHE_TTL=300
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Verify Installation**
   ```bash
   # Run deployment verification
   npm run verify:deployment
   ```

5. **Start the application**
   ```bash
   # Production
   npm start
   
   # Development
   npm run dev
   ```

## Deployment

### Render Deployment

ChainHive is optimized for deployment on Render with comprehensive fixes for common deployment issues.

#### Quick Deploy
1. Fork this repository
2. Connect to Render
3. Set environment variables in Render dashboard:
   ```
   NODIT_API_KEY=your_api_key_here
   NODE_ENV=production
   RENDER=true
   ```
4. Deploy using the included `render.yaml` configuration

#### Troubleshooting

For detailed deployment troubleshooting and fixes, see [RENDER_DEPLOYMENT_FIXES.md](./RENDER_DEPLOYMENT_FIXES.md).

**Common Issues:**
- MCP server initialization timeouts
- Module path resolution errors
- Environment-specific configuration problems

**Debug Commands:**
```bash
# Verify deployment readiness
npm run verify:deployment

# Debug Render environment
npm run debug:render

# Check MCP server status
npm run health:check
```

### Other Platforms

ChainHive can be deployed to any Node.js hosting platform:

- **Vercel**: Use `vercel.json` configuration
- **Heroku**: Standard Node.js buildpack
- **AWS**: EC2, ECS, or Lambda
- **Google Cloud**: App Engine or Cloud Run
- **DigitalOcean**: App Platform

### Environment Variables for Production

```env
# Core Configuration
NODIT_API_KEY=your_api_key_here
NODE_ENV=production
PORT=3000

# Render-specific (if deploying to Render)
RENDER=true
MCP_TIMEOUT=60000
MCP_STARTUP_DELAY=5000

# Security
CORS_ALLOWED_ORIGINS=https://yourdomain.com
VALID_API_KEYS=your_api_keys_here

# Performance
CACHE_TTL=300
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

## API Documentation

### Base URL
```
https://your-domain.com/api
```

### Authentication
All API endpoints require a valid Nodit API key. Include your API key in requests using one of these methods:

- **Header**: `X-API-Key: your_api_key`
- **Query Parameter**: `?apiKey=your_api_key`

### Endpoints

#### Portfolio Management

**Get Multi-Chain Portfolio**
```http
GET /api/portfolio/{address}
GET /api/portfolio/{address}?chains=ethereum,polygon,bsc
```

**Get Chain-Specific Balance**
```http
GET /api/balance/{chain}/{address}
```

**Get Transaction History**
```http
GET /api/transactions/{chain}/{address}
GET /api/transactions/{chain}/{address}?limit=50&offset=0
```

**Get NFT Portfolio**
```http
GET /api/nfts/{chain}/{address}
```

**Get Historical Data**
```http
GET /api/historical/{address}
GET /api/historical/{address}?days=30
```

#### MCP Endpoints

**MCP Server Status**
```http
GET /api/mcp/status
```

**Restart MCP Server**
```http
POST /api/mcp/restart
```

**List MCP APIs**
```http
GET /api/mcp/apis
```

#### System Endpoints

**Health Check**
```http
GET /api/health
```

**Market Conditions**
```http
GET /api/market-conditions
```

### Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error description",
  "message": "Detailed error message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Supported Chains

| Chain | Chain ID | Symbol | RPC Endpoint |
|-------|----------|--------|--------------|
| Ethereum | 1 | ETH | `https://web3.nodit.io/v1/eth/mainnet` |
| Polygon | 137 | MATIC | `https://web3.nodit.io/v1/polygon/mainnet` |
| BSC | 56 | BNB | `https://web3.nodit.io/v1/bsc/mainnet` |
| Arbitrum | 42161 | ETH | `https://web3.nodit.io/v1/arbitrum/mainnet` |
| Optimism | 10 | ETH | `https://web3.nodit.io/v1/optimism/mainnet` |
| Avalanche | 43114 | AVAX | `https://web3.nodit.io/v1/avalanche/mainnet` |

## Configuration

### Environment Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `NODIT_API_KEY` | string | **required** | Your Nodit API key (also used for MCP) |
| `NODIT_BASE_URL` | string | `https://web3.nodit.io` | Nodit API base URL |
| `NODE_ENV` | string | `development` | Application environment |
| `PORT` | number | `3000` | Server port |
| `MCP_ENABLED` | boolean | `true` | Enable/disable MCP integration |
| `MCP_AUTO_RESTART` | boolean | `true` | Auto-restart MCP server on failure |
| `RATE_LIMIT_MAX_REQUESTS` | number | `100` | Max requests per window |
| `RATE_LIMIT_WINDOW_MS` | number | `900000` | Rate limit window (15 min) |
| `CACHE_TTL` | number | `300` | Cache TTL in seconds |
| `REDIS_URL` | string | `''` | Redis connection URL |
| `CORS_ALLOWED_ORIGINS` | string | `*` | Allowed CORS origins |
| `LOG_LEVEL` | string | `info` | Logging level |

### Security Configuration

- **API Key Validation**: All endpoints validate API keys
- **Rate Limiting**: Configurable rate limiting per IP/user
- **CORS Protection**: Configurable allowed origins
- **Request Size Limits**: Configurable payload size limits
- **Security Headers**: Comprehensive security header implementation

## Performance Optimization

### Caching Strategy
- **Redis Integration**: Optional Redis caching for improved performance
- **Configurable TTL**: Adjustable cache expiration times
- **Smart Invalidation**: Automatic cache invalidation for real-time data

### Rate Limiting
- **IP-based Limiting**: Prevent API abuse
- **User-based Limiting**: Per-user rate limiting
- **Configurable Limits**: Adjustable rate limits per endpoint

## Monitoring and Logging

### Health Checks
- **System Health**: `/api/health` endpoint for monitoring
- **Service Dependencies**: Checks for external service availability
- **Performance Metrics**: Response time and error rate monitoring

### Logging
- **Structured Logging**: JSON-formatted logs for easy parsing
- **Configurable Levels**: Adjustable log levels (error, warn, info, debug)
- **Request Correlation**: Unique request IDs for tracing

## Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm test tests/config/
npm test tests/middleware/
npm test tests/services/

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   export NODE_ENV=production
   export NODIT_API_KEY=your_production_api_key
   export PORT=3000
   ```

2. **Build and Start**
   ```bash
   npm install --production
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For technical support and questions:
- **Documentation**: [Nodit Documentation](https://docs.nodit.io)
- **API Reference**: [Nodit API Reference](https://web3.nodit.io/docs)
- **Issues**: Create an issue in this repository

## Acknowledgments

- **Nodit**: For providing comprehensive Web3 data APIs
- **Contributors**: All contributors who have helped improve this project

---

**ChainHive** - Professional Multi-Chain Portfolio Management Platform

