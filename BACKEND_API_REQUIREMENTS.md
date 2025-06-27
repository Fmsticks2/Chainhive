
# ChainHive Backend API Requirements

This document outlines all the backend endpoints required for ChainHive (Web3 AI Assistant) to be fully functional.

## 🔐 Authentication Endpoints

### POST /auth/login
**Purpose**: User authentication
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response**:
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### POST /auth/register
**Purpose**: User registration
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### POST /auth/refresh
**Purpose**: Refresh JWT token
```json
{
  "refresh_token": "refresh_token_here"
}
```

## 🔗 Multi-Chain Wallet Analysis

### GET /api/wallet/analyze/{address}
**Purpose**: Analyze wallet across multiple chains
**Query Parameters**:
- `chains`: comma-separated list (ethereum,polygon,bsc,aptos,xrpl)
- `include_nfts`: boolean (default: false)
- `include_defi`: boolean (default: true)

**Response**:
```json
{
  "address": "0x...",
  "total_value": 12500.50,
  "total_change_24h": 5.2,
  "chains": {
    "ethereum": {
      "total_value": 8000.00,
      "tokens": [
        {
          "symbol": "ETH",
          "name": "Ethereum",
          "balance": 2.45,
          "price": 2345.67,
          "value": 5747.89,
          "change_24h": 5.2,
          "contract_address": null,
          "decimals": 18
        }
      ]
    }
  },
  "nfts": [],
  "defi_positions": []
}
```

### GET /api/wallet/transactions/{address}
**Purpose**: Get transaction history for a wallet
**Query Parameters**:
- `chain`: specific chain (ethereum, polygon, etc.)
- `limit`: number of transactions (default: 50)
- `offset`: pagination offset
- `type`: filter by transaction type (send, receive, swap, contract)

**Response**:
```json
{
  "transactions": [
    {
      "hash": "0x...",
      "from": "0x...",
      "to": "0x...",
      "value": 0.5,
      "timestamp": 1704067200,
      "chain": "ethereum",
      "type": "send",
      "status": "success",
      "gas_used": 21000,
      "gas_price": 20000000000
    }
  ],
  "total": 150,
  "has_more": true
}
```

## 🤖 AI Chat & Analysis

### POST /api/ai/chat
**Purpose**: AI-powered chat interface
```json
{
  "message": "What's the best DeFi strategy for my portfolio?",
  "context": {
    "wallet_address": "0x...",
    "portfolio_data": {},
    "conversation_id": "conv_123"
  }
}
```

**Response**:
```json
{
  "response": "Based on your portfolio analysis...",
  "insights": [
    "Your ETH allocation is 65% of total portfolio",
    "Consider diversification into stablecoins"
  ],
  "recommendations": [
    "Explore Uniswap v3 liquidity provision",
    "Consider yield farming on Aave"
  ],
  "conversation_id": "conv_123"
}
```

### POST /api/ai/portfolio-analysis
**Purpose**: AI-powered portfolio analysis using MCP
```json
{
  "wallet_address": "0x...",
  "chains": ["ethereum", "polygon"],
  "analysis_type": "comprehensive"
}
```

**Response**:
```json
{
  "summary": "Your portfolio shows strong diversification...",
  "risk_score": 6.5,
  "diversification_score": 7.2,
  "insights": [],
  "recommendations": [],
  "performance_metrics": {
    "total_return": 15.2,
    "sharpe_ratio": 1.8,
    "volatility": 12.5
  }
}
```

## 🎤 Voice Commands

### POST /api/voice/process
**Purpose**: Process voice commands
```json
{
  "audio_data": "base64_encoded_audio",
  "format": "webm",
  "duration": 5.2
}
```

**Response**:
```json
{
  "transcript": "analyze wallet 0x1234...",
  "intent": "analyze_wallet",
  "entities": {
    "wallet_address": "0x1234...",
    "action": "analyze"
  },
  "confidence": 0.95
}
```

## 📊 Market Data

### GET /api/market/tokens
**Purpose**: Get real-time token prices and market data
**Query Parameters**:
- `symbols`: comma-separated token symbols (ETH,BTC,LINK)
- `vs_currency`: base currency (default: USD)

**Response**:
```json
{
  "tokens": [
    {
      "symbol": "ETH",
      "price": 2345.67,
      "change_24h": 5.2,
      "market_cap": 282000000000,
      "volume_24h": 15000000000,
      "last_updated": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### GET /api/market/gas-tracker
**Purpose**: Real-time gas prices across networks
**Response**:
```json
{
  "ethereum": {
    "standard": 25,
    "fast": 35,
    "instant": 45,
    "unit": "gwei"
  },
  "polygon": {
    "standard": 30,
    "fast": 35,
    "instant": 40,
    "unit": "gwei"
  }
}
```

## 🚨 Alert System

### POST /api/alerts/create
**Purpose**: Create price/wallet alerts
```json
{
  "type": "price",
  "token_symbol": "ETH",
  "threshold": 2500,
  "condition": "above",
  "notification_channels": ["telegram", "webhook"]
}
```

### GET /api/alerts/user
**Purpose**: Get user's active alerts
**Response**:
```json
{
  "alerts": [
    {
      "id": "alert_123",
      "type": "price",
      "title": "ETH Price Alert",
      "threshold": 2500,
      "current_value": 2345.67,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### DELETE /api/alerts/{alert_id}
**Purpose**: Delete specific alert

## 📱 Social Integrations

### POST /api/integrations/telegram/setup
**Purpose**: Configure Telegram bot integration
```json
{
  "bot_token": "bot_token_here",
  "chat_id": 123456789
}
```

### POST /api/integrations/telegram/send
**Purpose**: Send message via Telegram bot
```json
{
  "chat_id": 123456789,
  "message": "🚨 ETH has reached $2,500!",
  "parse_mode": "HTML"
}
```

### POST /api/integrations/farcaster/connect
**Purpose**: Connect Farcaster account
```json
{
  "api_key": "farcaster_api_key",
  "username": "user_handle"
}
```

### POST /api/integrations/farcaster/cast
**Purpose**: Post to Farcaster
```json
{
  "text": "My portfolio is up 15% this month! 🚀",
  "embeds": []
}
```

## 📈 Portfolio Management

### GET /api/portfolio/summary
**Purpose**: Get comprehensive portfolio summary
**Response**:
```json
{
  "total_value": 12500.50,
  "total_change_24h": 5.2,
  "allocation": {
    "ethereum": 65.5,
    "polygon": 20.2,
    "bsc": 14.3
  },
  "top_tokens": [
    {
      "symbol": "ETH",
      "value": 8000.00,
      "percentage": 64.0
    }
  ],
  "performance": {
    "1d": 2.5,
    "7d": 8.2,
    "30d": 15.3,
    "ytd": 45.2
  }
}
```

### GET /api/portfolio/history
**Purpose**: Portfolio value history for charts
**Query Parameters**:
- `period`: 1d, 7d, 30d, 1y
- `interval`: 1h, 1d

**Response**:
```json
{
  "data": [
    {
      "timestamp": 1704067200,
      "value": 12000.00
    },
    {
      "timestamp": 1704070800,
      "value": 12150.50
    }
  ]
}
```

## 🔍 DeFi & NFT Data

### GET /api/defi/positions/{address}
**Purpose**: Get DeFi positions for a wallet
**Response**:
```json
{
  "positions": [
    {
      "protocol": "Uniswap V3",
      "type": "liquidity_pool",
      "token_pair": "ETH/USDC",
      "value": 1500.00,
      "apy": 12.5,
      "rewards": 25.50
    }
  ]
}
```

### GET /api/nfts/{address}
**Purpose**: Get NFT collection for a wallet
**Response**:
```json
{
  "nfts": [
    {
      "token_address": "0x...",
      "token_id": "1234",
      "name": "Cool NFT #1234",
      "collection": "Cool Collection",
      "image_url": "https://...",
      "floor_price": 0.5,
      "last_sale": 0.8,
      "estimated_value": 0.65
    }
  ]
}
```

## 🔧 System & Health

### GET /api/health
**Purpose**: API health check
**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": "up",
    "redis": "up",
    "blockchain_apis": "up"
  }
}
```

### GET /api/supported-chains
**Purpose**: List supported blockchain networks
**Response**:
```json
{
  "chains": [
    {
      "id": "ethereum",
      "name": "Ethereum",
      "symbol": "ETH",
      "rpc_url": "https://mainnet.infura.io/v3/",
      "explorer_url": "https://etherscan.io",
      "is_active": true
    }
  ]
}
```

## 📋 Implementation Requirements

### Authentication
- JWT-based authentication
- Password hashing (bcrypt)
- Rate limiting on auth endpoints

### Blockchain Integration
- Web3 providers for each supported chain
- Connection to Nodit MCP for multi-chain data
- Webhook support for real-time updates

### AI Integration
- OpenAI/Claude API integration
- Conversation context management
- Voice-to-text processing

### Database Schema
- Users table
- Portfolios table
- Alerts table
- Conversations table
- Integrations table

### External APIs
- CoinGecko/CoinMarketCap for price data
- Alchemy/Infura for blockchain data
- Telegram Bot API
- Farcaster API

### Infrastructure
- Redis for caching
- WebSocket support for real-time updates
- File storage for voice recordings
- Background job processing

## 🚀 Priority Implementation Order

1. **Authentication system** (login/register/refresh)
2. **Basic wallet analysis** (single chain)
3. **Market data endpoints** (prices, gas tracker)
4. **Multi-chain wallet analysis**
5. **AI chat integration**
6. **Alert system**
7. **Social integrations** (Telegram, Farcaster)
8. **Voice processing**
9. **DeFi/NFT data**
10. **Advanced portfolio analytics**

This API specification provides the foundation for a fully functional Web3 AI Assistant backend.
