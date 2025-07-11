
# ChainHive - Web3 AI Assistant

**ChainHive** is an intelligent Web3 companion that provides AI-powered blockchain analysis, portfolio management, and DeFi insights. Built with cutting-edge AI technology and powered by Nodit MCP, ChainHive helps users navigate the complex world of decentralized finance with ease.

🌐 **Now with Kairos Network Integration!** - Deploy smart contracts on Kairos Network for enhanced cross-chain functionality and native blockchain features.

## 🚀 Features

### 🤖 AI-Powered Chat Interface
- Natural language blockchain queries
- Real-time market analysis and insights
- Voice command support for hands-free interaction
- Intelligent portfolio recommendations

### 🔍 Advanced Wallet Analyzer
- Comprehensive wallet content analysis
- Transaction history and patterns
- Token holdings and valuations
- Multi-chain portfolio tracking
- Real-time balance updates

### 📊 Portfolio Management
- Multi-chain portfolio overview
- Performance tracking and analytics
- Risk assessment and diversification insights
- Historical performance charts
- Automated alerts and notifications

### 🔗 Social Integration
- **Telegram Bot**: Receive portfolio alerts and market updates directly in Telegram
- **Farcaster Integration**: Share insights and connect with the Web3 community
- Real-time notifications for important portfolio events

### 🎯 Smart Features
- **Voice Control**: Speak commands naturally for wallet analysis
- **Real-time Data**: Live blockchain data from multiple networks
- **Multi-chain Support**: Ethereum, Polygon, BSC, and more
- **Gas Tracker**: Real-time gas price monitoring
- **Security Alerts**: Suspicious activity detection

## 🛠 Technologies Used

This project leverages modern web technologies and blockchain infrastructure:

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui component library
- **Build Tool**: Vite for fast development and building
- **Data Fetching**: TanStack Query for efficient data management
- **Blockchain**: Nodit MCP for multi-chain data access
- **Smart Contracts**: Solidity 0.8.19 with Foundry framework
- **Networks**: Ethereum, Polygon, BSC, Kairos Network
- **Routing**: React Router for navigation
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React for consistent iconography

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm (install with [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- MetaMask or compatible Web3 wallet

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd chainhive
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

### Configuration

1. **Wallet Connection**: Connect your MetaMask or compatible Web3 wallet
2. **API Keys**: Configure your API keys in the Settings page:
   - Nodit API key for blockchain data
   - Telegram bot token for notifications
   - Farcaster API key for social features

## 🔗 Smart Contract Deployment (Kairos Network)

ChainHive includes a complete smart contract backend that can be deployed on Kairos Network for enhanced functionality.

### Quick Deployment

**Prerequisites:**
- Foundry installed (`curl -L https://foundry.paradigm.xyz | bash && foundryup`)
- KAI tokens in your wallet for gas fees
- Wallet configured for Kairos Network

**Deploy to Kairos Network:**
```powershell
# Windows (PowerShell)
.\deploy-kairos.ps1
```

```bash
# Linux/Mac
chmod +x deploy-kairos.sh
./deploy-kairos.sh
```

### Smart Contract Features
- **User Profiles**: On-chain user registration and profile management
- **Portfolio Tracking**: Blockchain-based portfolio analysis storage
- **AI Insights**: Decentralized AI insight storage with IPFS
- **Alert System**: Smart contract-based notification system
- **Reward System**: Token-based rewards for platform usage
- **Governance**: DAO governance with voting and proposals
- **Multi-chain Bridge**: Cross-chain asset and data bridging

### Deployed Contracts
After deployment, you'll have:
- `ChainHive.sol` - Main platform contract
- `ChainHiveToken.sol` - Platform utility token (CHT)
- `ChainHiveMultiChain.sol` - Cross-chain bridge
- `ChainHiveGovernance.sol` - DAO governance
- `TimelockController.sol` - Governance timelock

📖 **Detailed deployment guide**: See [KAIROS_DEPLOYMENT.md](./KAIROS_DEPLOYMENT.md)

## 📱 Usage

### Wallet Analysis
1. Navigate to the "Wallet Analyzer" tab
2. Enter any Ethereum wallet address
3. View comprehensive portfolio breakdown, transaction history, and insights

### AI Chat
1. Use the "AI Chat" interface to ask questions about:
   - Market conditions and trends
   - Portfolio optimization
   - DeFi opportunities
   - Token analysis
2. Try voice commands by clicking the "Voice Control" button

### Telegram Integration
1. Create a Telegram bot via @BotFather
2. Configure the bot token and chat ID in the Telegram tab
3. Receive real-time portfolio alerts and market updates

### Farcaster Integration
1. Connect your Farcaster account
2. Share portfolio insights with the Web3 community
3. Discover trending tokens and strategies

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Main application pages
├── services/           # API and external service integrations
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
└── types/              # TypeScript type definitions
```





## 🤝 Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

## 📄 License

This project is licensed under the MIT License.

