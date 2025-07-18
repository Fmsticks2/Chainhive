
# 🚀 ChainHive - Multi-Chain Portfolio Tracker

**AI-Powered Web3 Portfolio Management with NODIT MCP Integration**

ChainHive is a comprehensive multi-chain portfolio tracker that combines the power of NODIT's Web3 Data APIs with advanced AI insights through Model Context Protocol (MCP). Track your crypto assets across multiple blockchains, get intelligent recommendations, and stay informed with real-time alerts.

## ✨ Features

### 🌐 **Multi-Chain Support**
- **Ethereum** (ETH) - ERC-20 tokens, NFTs, DeFi positions
- **Polygon** (MATIC) - Fast, low-cost transactions
- **BSC** (BNB) - Binance Smart Chain ecosystem
- **Arbitrum** - Layer 2 scaling solution
- **Optimism** - Optimistic rollup network
- **Aptos** (APT) - Next-generation blockchain
- **Sui** (SUI) - High-performance blockchain
- **XRPL** (XRP) - Enterprise blockchain solutions
- **Solana** (SOL) - High-speed blockchain network

### 🤖 **AI-Powered Insights**
- **Portfolio Analysis** - Comprehensive asset breakdown and performance metrics
- **Smart Recommendations** - AI-driven investment suggestions
- **Risk Assessment** - Automated portfolio risk evaluation
- **Market Opportunities** - DeFi yield farming and staking suggestions
- **Trend Analysis** - Market sentiment and price prediction insights

### 📱 **Multiple Interfaces**
- **Web Application** - Modern, responsive dashboard
- **Telegram Bot** - Instant portfolio updates and commands
- **REST API** - Programmatic access to all features
- **Real-time Streams** - Live portfolio updates via WebSocket

### 🔔 **Smart Alerts & Monitoring**
- **Price Alerts** - Custom price thresholds for any token
- **Whale Watching** - Large transaction notifications
- **Portfolio Changes** - Real-time balance updates
- **Gas Fee Alerts** - Optimal transaction timing
- **DeFi Opportunities** - New yield farming alerts

### 🔐 **Security & Privacy**
- **Web3Auth Integration** - Secure, non-custodial authentication
- **Read-Only Access** - No private key storage required
- **Encrypted Data** - All sensitive information encrypted
- **Rate Limiting** - API abuse protection
- **CORS Protection** - Secure cross-origin requests

## 🚀 Quick Start

### Prerequisites

- **Node.js** 16.0.0 or higher
- **npm** 8.0.0 or higher
- **NODIT API Key** - Get yours at [nodit.io](https://nodit.io)
- **Telegram Bot Token** (optional) - Create via [@BotFather](https://t.me/BotFather)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/chainhive/portfolio-tracker.git
   cd chainhive
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

4. **Start the application**
   ```bash
   # Start web server
   npm start
   
   # Or start in development mode
   npm run server
   
   # Start Telegram bot (optional)
   npm run bot
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 📖 Usage Guide

### 🌐 Web Application

1. **Connect Your Wallet**
   - Click "Connect Wallet" on the landing page
   - Choose your preferred Web3Auth login method
   - Authorize the connection

2. **Add Wallet Addresses**
   - Navigate to the "Add Wallet" section
   - Enter wallet addresses for different chains
   - ChainHive will automatically detect supported networks

3. **View Portfolio**
   - Real-time portfolio overview across all chains
   - Token balances, USD values, and percentage allocations
   - Historical performance charts and analytics

4. **Get AI Insights**
   - Click "Analyze Portfolio" for AI-powered recommendations
   - View risk assessment and diversification suggestions
   - Discover DeFi opportunities and yield farming options

5. **Set Up Alerts**
   - Configure price alerts for specific tokens
   - Enable whale movement notifications
   - Set portfolio change thresholds

### 🤖 Telegram Bot

1. **Start the Bot**
   - Search for your bot on Telegram (after deployment)
   - Send `/start` to begin
   - Follow the setup instructions

2. **Basic Commands**
   ```
   /start - Initialize the bot
   /help - Show all available commands
   /addwallet <address> - Add a wallet to track
   /portfolio - View complete portfolio
   /balance <chain> - Check balance on specific chain
   /analyze - Get AI portfolio analysis
   /price <token> - Check token price
   /gas - View current gas fees
   /alerts - Manage price alerts
   /settings - Configure preferences
   ```

3. **Example Usage**
   ```
   /addwallet 0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b1
   /price ETH
   /balance ethereum
   /analyze
   ```

## 🔧 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### Portfolio Management
```http
GET /api/portfolio/:address
GET /api/balance/:chain/:address
GET /api/transactions/:chain/:address
GET /api/nfts/:chain/:address
```

#### AI Insights
```http
POST /api/insights
Content-Type: application/json

{
  "portfolioData": {...},
  "preferences": {...}
}
```

#### Market Data
```http
GET /api/prices?tokens=ETH,BTC,USDC
GET /api/gas?chains=ethereum,polygon,bsc
```

#### Webhooks
```http
POST /api/webhooks/setup
POST /api/webhooks/receive
```

#### Real-time Streams
```http
GET /api/stream/portfolio/:address
```

## 🏗️ Architecture

### Frontend
- **HTML/CSS/JavaScript** - Modern, responsive web interface
- **Web3Auth** - Secure wallet connection
- **Real-time Updates** - WebSocket integration
- **Progressive Web App** - Mobile-friendly design

### Backend
- **Express.js** - RESTful API server
- **NODIT Integration** - Web3 data and MCP services
- **Rate Limiting** - API protection and optimization
- **Webhook Processing** - Real-time event handling

### Telegram Bot
- **Node Telegram Bot API** - Full-featured bot implementation
- **Inline Keyboards** - Interactive command interface
- **Real-time Notifications** - Instant portfolio updates
- **Multi-user Support** - Concurrent user management

### NODIT MCP Integration
- **Multi-Chain Data** - Unified API across all supported networks
- **AI Analysis** - LLM-powered portfolio insights
- **Real-time Streams** - Live blockchain event monitoring
- **Webhook Events** - Automated alert system

## 🔐 Environment Configuration

### Required Variables
```env
# NODIT Configuration
NODIT_API_KEY=your_nodit_api_key_here

# Telegram Bot (Optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# Web3Auth
WEB3AUTH_CLIENT_ID=your_web3auth_client_id_here
```

### Optional Variables
```env
# Database
MONGODB_URI=mongodb://localhost:27017/chainhive
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=your_jwt_secret_here
ENCRYPTION_KEY=your_encryption_key_here

# Feature Flags
ENABLE_TELEGRAM_BOT=true
ENABLE_AI_INSIGHTS=true
ENABLE_REAL_TIME_STREAMS=true
```

## 🧪 Development

### Running Tests
```bash
npm test
```

### Development Mode
```bash
# Start with auto-reload
npm run server

# Start Telegram bot in development
npm run bot
```

### Building for Production
```bash
npm run build
```

### Code Quality
```bash
# Linting
npm run lint

# Formatting
npm run format
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build image
docker build -t chainhive .

# Run container
docker run -p 3000:3000 --env-file .env chainhive
```

### Cloud Deployment
- **Vercel** - Automatic deployments from Git
- **Heroku** - Easy scaling and management
- **AWS/GCP/Azure** - Enterprise-grade infrastructure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation** - [docs.chainhive.io](https://docs.chainhive.io)
- **Discord** - [discord.gg/chainhive](https://discord.gg/chainhive)
- **Twitter** - [@ChainHiveIO](https://twitter.com/ChainHiveIO)
- **Email** - support@chainhive.io

## 🙏 Acknowledgments

- **NODIT** - For providing comprehensive Web3 data APIs and MCP integration
- **Web3Auth** - For secure, user-friendly wallet authentication
- **Telegram** - For the robust bot platform
- **Open Source Community** - For the amazing tools and libraries

---

**Built with ❤️ by the ChainHive Team**

*Empowering the next generation of Web3 portfolio management*

