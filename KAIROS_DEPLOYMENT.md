# ChainHive - Kairos Network Deployment Guide

This guide provides comprehensive instructions for deploying ChainHive on Kairos Network with Nodit MCP integration.

## 🌐 Kairos Network Overview

Kairos Network is a high-performance blockchain that provides:
- Enhanced security and scalability
- Cross-chain interoperability
- Native DeFi protocols
- Low transaction fees
- Fast finality

## 📋 Prerequisites

### Required Tools
1. **Foundry** - Smart contract development framework
   ```bash
   curl -L https://foundry.paradigm.xyz | bash
   foundryup
   ```

2. **Node.js & npm** - For frontend development
   ```bash
   node --version  # Should be v18+
   npm --version
   ```

3. **Git** - Version control

### Wallet Setup
- **Deployer Address**: `0x5CbD1ABe5029c5c717038f86C31B706f027640AB`
- **Private Key**: `73456a197074a8a7d3cb069745cc6c58fd750604aba0a9d89d54ebbb9865cb08`
- **Network**: Kairos Testnet (Chain ID: 1001)
- **RPC URL**: `https://kairos-testnet.kaichain.net`

### Required Tokens
Ensure your wallet has sufficient KAI tokens for deployment:
- Estimated gas cost: ~0.1 KAI
- Get testnet tokens from: https://faucet.kaichain.net

## 🚀 Deployment Process

### Step 1: Environment Setup

1. **Copy environment file**:
   ```bash
   cp .env.example .env
   ```

2. **Update .env with your configuration**:
   ```env
   PRIVATE_KEY=73456a197074a8a7d3cb069745cc6c58fd750604aba0a9d89d54ebbb9865cb08
   DEPLOYER_ADDRESS=0x5CbD1ABe5029c5c717038f86C31B706f027640AB
   KAIROS_RPC_URL=https://kairos-testnet.kaichain.net
   NODIT_API_KEY=your_nodit_api_key_here
   ```

### Step 2: Smart Contract Deployment

#### Option A: Using PowerShell (Windows)
```powershell
.\deploy-kairos.ps1
```

#### Option B: Using Bash (Linux/Mac)
```bash
chmod +x deploy-kairos.sh
./deploy-kairos.sh
```

#### Option C: Manual Deployment
```bash
# Install dependencies
forge install

# Compile contracts
forge build

# Deploy to Kairos
forge script contracts/deploy/DeployScript.s.sol:DeployScript \
    --rpc-url https://kairos-testnet.kaichain.net \
    --private-key 73456a197074a8a7d3cb069745cc6c58fd750604aba0a9d89d54ebbb9865cb08 \
    --broadcast \
    --chain-id 1001 \
    -vvvv
```

### Step 3: Frontend Configuration

1. **Update contract addresses** in your `.env` file after deployment:
   ```env
   VITE_CHAINHIVE_CONTRACT_ADDRESS=0x...
   VITE_CHAINHIVE_TOKEN_ADDRESS=0x...
   VITE_CHAINHIVE_MULTICHAIN_ADDRESS=0x...
   VITE_CHAINHIVE_GOVERNANCE_ADDRESS=0x...
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

## 🔧 Nodit MCP Integration

### Features Implemented

1. **Multi-Chain Portfolio Analysis**
   - Cross-chain asset tracking
   - Kairos-specific token analysis
   - Risk assessment algorithms
   - Diversification scoring

2. **AI-Powered Insights**
   - Smart contract interaction analysis
   - DeFi protocol recommendations
   - Market trend predictions
   - Portfolio optimization suggestions

3. **Real-time Monitoring**
   - Transaction tracking
   - Price alerts
   - Portfolio performance metrics
   - Security notifications

### API Integration

The NoditService now includes:
- Kairos Network RPC integration
- Enhanced MCP analysis for Kairos assets
- Cross-chain data aggregation
- Native token support

## 📊 Smart Contract Features

### Core Contracts

1. **ChainHive.sol** - Main platform contract
   - User registration and profiles
   - Portfolio analysis recording
   - AI insight storage
   - Alert system
   - Reward distribution

2. **ChainHiveToken.sol** - Platform utility token
   - ERC-20 compliant
   - Minting for rewards
   - Governance voting power

3. **ChainHiveMultiChain.sol** - Cross-chain bridge
   - Asset bridging
   - Cross-chain messaging
   - Multi-chain governance

4. **ChainHiveGovernance.sol** - DAO governance
   - Proposal creation
   - Voting mechanisms
   - Timelock execution

### Key Functions

```solidity
// User Management
function registerUser(string memory _profileHash) external
function updateProfile(string memory _profileHash) external

// Portfolio Analysis
function recordPortfolioAnalysis(
    string memory _dataHash,
    uint256 _totalValue,
    uint8 _riskScore,
    uint8 _diversificationScore
) external

// AI Insights
function storeAIInsight(
    string memory _contentHash,
    uint8 _insightType,
    uint8 _confidenceScore,
    bool _isPublic
) external

// Alert System
function createAlert(
    uint8 _alertType,
    string memory _conditions
) external returns (uint256 alertId)
```

## 🔐 Security Considerations

### Implemented Security Features
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency pause functionality
- **Access Control**: Role-based permissions
- **Timelock**: Governance delay mechanism
- **Input Validation**: Parameter sanitization

### Best Practices
- Private keys are never logged or stored
- All external calls are properly handled
- Gas limits are optimized
- Contract upgrades use proxy patterns

## 🧪 Testing

### Local Testing
```bash
# Run contract tests
forge test

# Run with coverage
forge coverage

# Gas optimization analysis
forge test --gas-report
```

### Integration Testing
1. Deploy to Kairos testnet
2. Test wallet connection
3. Verify contract interactions
4. Test Nodit API integration
5. Validate cross-chain functionality

## 📈 Monitoring & Analytics

### Contract Events
Monitor these key events:
- `UserRegistered`
- `PortfolioAnalyzed`
- `AIInsightGenerated`
- `AlertCreated`
- `AlertTriggered`

### Metrics Dashboard
Track:
- Total users registered
- Portfolio analyses performed
- AI insights generated
- Rewards distributed
- Cross-chain transactions

## 🔗 Useful Links

- **Kairos Network**: https://kaichain.net
- **Kairos Explorer**: https://kairoscan.io
- **Kairos Faucet**: https://faucet.kaichain.net
- **Nodit Documentation**: https://docs.nodit.io
- **Foundry Book**: https://book.getfoundry.sh

## 🆘 Troubleshooting

### Common Issues

1. **Deployment Fails**
   - Check KAI balance in deployer wallet
   - Verify RPC URL connectivity
   - Ensure private key is correct

2. **Frontend Connection Issues**
   - Add Kairos network to MetaMask
   - Check contract addresses in .env
   - Verify chain ID (1001)

3. **Nodit API Errors**
   - Validate API key
   - Check rate limits
   - Verify endpoint URLs

### Support
For additional support:
- Check contract verification on Kairoscan
- Review deployment logs
- Test with smaller transactions first
- Join Kairos Network community channels

## 🎯 Next Steps

After successful deployment:
1. Register your first user profile
2. Connect additional wallets for testing
3. Perform portfolio analysis
4. Set up monitoring alerts
5. Explore DeFi integrations
6. Implement additional Kairos-specific features

---

**Note**: This deployment uses testnet tokens. For mainnet deployment, ensure you have sufficient KAI tokens and update the RPC URLs accordingly.