import { ethers, Contract, BrowserProvider } from 'ethers';

// Contract ABIs (simplified for key functions)
const CHAINHIVE_ABI = [
  "function registerUser(string memory _profileHash) external",
  "function updateProfile(string memory _profileHash) external",
  "function getUserProfile(address _user) external view returns (tuple(string profileHash, uint256 registrationTime, uint8 subscriptionTier, uint256 subscriptionExpiry, uint256 totalAnalyses, uint256 rewardsEarned, bool isActive))",
  "function recordPortfolioAnalysis(string memory _dataHash, uint256 _totalValue, uint8 _riskScore, uint8 _diversificationScore) external",
  "function getPortfolioHistory(address _user) external view returns (tuple(string dataHash, uint256 totalValue, uint256 timestamp, uint8 riskScore, uint8 diversificationScore)[])",
  "function storeAIInsight(string memory _contentHash, uint8 _insightType, uint8 _confidenceScore, bool _isPublic) external",
  "function createAlert(uint8 _alertType, string memory _conditions) external returns (uint256 alertId)",
  "function toggleAlert(uint256 _alertId) external",
  "function getUserAlerts(address _user) external view returns (tuple(uint8 alertType, string conditions, bool isActive, uint256 createdAt, uint256 triggeredCount)[])",
  "function purchaseSubscription(uint8 _tier) external",
  "function claimRewards() external",
  "function userRewards(address) external view returns (uint256)",
  "event UserRegistered(address indexed user, string profileHash)",
  "event PortfolioAnalyzed(address indexed user, string portfolioHash, uint256 timestamp)",
  "event AIInsightGenerated(address indexed user, string insightHash, uint8 insightType)",
  "event AlertCreated(address indexed user, uint256 alertId, uint8 alertType)"
];

const CHAINHIVE_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function mint(address to, uint256 amount) external"
];

export interface ChainConfig {
  chainId: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  explorerUrl: string;
  contracts: {
    chainHive: string;
    token: string;
    multiChain: string;
    governance: string;
  };
}

export interface UserProfile {
  profileHash: string;
  registrationTime: number;
  subscriptionTier: number;
  subscriptionExpiry: number;
  totalAnalyses: number;
  rewardsEarned: number;
  isActive: boolean;
}

export interface PortfolioSnapshot {
  dataHash: string;
  totalValue: number;
  timestamp: number;
  riskScore: number;
  diversificationScore: number;
}

export interface Alert {
  alertType: number;
  conditions: string;
  isActive: boolean;
  createdAt: number;
  triggeredCount: number;
}

export class Web3Service {
  private static instance: Web3Service;
  private provider: BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private chainHiveContract: Contract | null = null;
  private tokenContract: Contract | null = null;
  private currentChain: ChainConfig | null = null;
  
  // Default contract addresses (update with actual deployed addresses)
  private readonly chainConfigs: { [chainId: number]: ChainConfig } = {
    1: { // Ethereum Mainnet
      chainId: 1,
      name: 'Ethereum',
      symbol: 'ETH',
      rpcUrl: process.env.NODIT_API_KEY ? `https://eth-mainnet.nodit.io/${process.env.NODIT_API_KEY}` : 'https://ethereum.publicnode.com',
      explorerUrl: 'https://etherscan.io',
      contracts: {
        chainHive: '0x...', // Update with deployed address
        token: '0x...', // Update with deployed address
        multiChain: '0x...', // Update with deployed address
        governance: '0x...' // Update with deployed address
      }
    },
    137: { // Polygon Mainnet
      chainId: 137,
      name: 'Polygon',
      symbol: 'MATIC',
      rpcUrl: process.env.NODIT_API_KEY ? `https://polygon-mainnet.nodit.io/${process.env.NODIT_API_KEY}` : 'https://polygon.llamarpc.com',
      explorerUrl: 'https://polygonscan.com',
      contracts: {
        chainHive: '0x...', // Update with deployed address
        token: '0x...', // Update with deployed address
        multiChain: '0x...', // Update with deployed address
        governance: '0x...' // Update with deployed address
      }
    },
    1001: { // Kairos Testnet
      chainId: 1001,
      name: 'Kairos',
      symbol: 'KAI',
      rpcUrl: process.env.NODIT_API_KEY ? `https://kaia-kairos.nodit.io/${process.env.NODIT_API_KEY}` : (process.env.KAIROS_RPC_URL || 'https://public-en-kairos.node.kaia.io'),
      explorerUrl: 'https://kairoscan.io',
      contracts: {
        chainHive: '0x72CA2541A705468368F9474fB419Defd002EC8af',
        token: '0xdc6c396319895dA489b0Cd145A4c5D660b9e10F6',
        multiChain: '0xF565086417Bf8ba76e4FaFC9F0088818eA027539',
        governance: '0xcBB12aBDA134ac0444f2aa41E98EDD57f8D5631F'
      }
    },
    // Add more chains as needed
  };

  static getInstance(): Web3Service {
    if (!Web3Service.instance) {
      Web3Service.instance = new Web3Service();
    }
    return Web3Service.instance;
  }

  async connectWallet(): Promise<string | null> {
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found. Please install MetaMask to continue.');
      }

      this.provider = new BrowserProvider(window.ethereum);
      await this.provider.send("eth_requestAccounts", []);
      this.signer = await this.provider.getSigner();
      
      const address = await this.signer.getAddress();
      const network = await this.provider.getNetwork();
      
      // Set current chain config
      this.currentChain = this.chainConfigs[Number(network.chainId)];
      if (!this.currentChain) {
        throw new Error(`Unsupported network: ${network.chainId}. Please switch to a supported network.`);
      }

      // Initialize contracts
      this.initializeContracts();
      
      return address;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      throw error;
    }
  }

  private initializeContracts(): void {
    if (!this.signer || !this.currentChain) return;

    this.chainHiveContract = new Contract(
      this.currentChain.contracts.chainHive,
      CHAINHIVE_ABI,
      this.signer
    );

    this.tokenContract = new Contract(
      this.currentChain.contracts.token,
      CHAINHIVE_TOKEN_ABI,
      this.signer
    );
  }

  async switchNetwork(chainId: number): Promise<void> {
    if (!window.ethereum) throw new Error('MetaMask not found');

    const chainConfig = this.chainConfigs[chainId];
    if (!chainConfig) throw new Error('Unsupported network');

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
      
      // Reinitialize after network switch
      await this.connectWallet();
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added to MetaMask, add it
        await this.addNetwork(chainConfig);
      } else {
        throw error;
      }
    }
  }

  private async addNetwork(chainConfig: ChainConfig): Promise<void> {
    if (!window.ethereum) throw new Error('MetaMask not found');

    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${chainConfig.chainId.toString(16)}`,
        chainName: chainConfig.name,
        nativeCurrency: {
          name: chainConfig.name,
          symbol: chainConfig.symbol,
          decimals: 18
        },
        rpcUrls: [chainConfig.rpcUrl],
        blockExplorerUrls: [chainConfig.explorerUrl]
      }]
    });
  }

  // User Management
  async registerUser(profileHash: string): Promise<string> {
    if (!this.chainHiveContract) throw new Error('Contract not initialized');
    
    const tx = await this.chainHiveContract.registerUser(profileHash);
    await tx.wait();
    return tx.hash;
  }

  async getUserProfile(address: string): Promise<UserProfile | null> {
    if (!this.chainHiveContract) throw new Error('Contract not initialized');
    
    try {
      const profile = await this.chainHiveContract.getUserProfile(address);
      return {
        profileHash: profile.profileHash,
        registrationTime: Number(profile.registrationTime),
        subscriptionTier: profile.subscriptionTier,
        subscriptionExpiry: Number(profile.subscriptionExpiry),
        totalAnalyses: Number(profile.totalAnalyses),
        rewardsEarned: Number(profile.rewardsEarned),
        isActive: profile.isActive
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async updateProfile(profileHash: string): Promise<string> {
    if (!this.chainHiveContract) throw new Error('Contract not initialized');
    
    const tx = await this.chainHiveContract.updateProfile(profileHash);
    await tx.wait();
    return tx.hash;
  }

  // Portfolio Analysis
  async recordPortfolioAnalysis(
    dataHash: string,
    totalValue: number,
    riskScore: number,
    diversificationScore: number
  ): Promise<string> {
    if (!this.chainHiveContract) throw new Error('Contract not initialized');
    
    const tx = await this.chainHiveContract.recordPortfolioAnalysis(
      dataHash,
      ethers.parseEther(totalValue.toString()),
      riskScore,
      diversificationScore
    );
    await tx.wait();
    return tx.hash;
  }

  async getPortfolioHistory(address: string): Promise<PortfolioSnapshot[]> {
    if (!this.chainHiveContract) throw new Error('Contract not initialized');
    
    const history = await this.chainHiveContract.getPortfolioHistory(address);
    return history.map((snapshot: any) => ({
      dataHash: snapshot.dataHash,
      totalValue: Number(ethers.formatEther(snapshot.totalValue)),
      timestamp: Number(snapshot.timestamp),
      riskScore: snapshot.riskScore,
      diversificationScore: snapshot.diversificationScore
    }));
  }

  // AI Insights
  async storeAIInsight(
    contentHash: string,
    insightType: number,
    confidenceScore: number,
    isPublic: boolean
  ): Promise<string> {
    if (!this.chainHiveContract) throw new Error('Contract not initialized');
    
    const tx = await this.chainHiveContract.storeAIInsight(
      contentHash,
      insightType,
      confidenceScore,
      isPublic
    );
    await tx.wait();
    return tx.hash;
  }

  // Alerts
  async createAlert(alertType: number, conditions: string): Promise<{ txHash: string, alertId: number }> {
    if (!this.chainHiveContract) throw new Error('Contract not initialized');
    
    const tx = await this.chainHiveContract.createAlert(alertType, conditions);
    const receipt = await tx.wait();
    
    // Extract alert ID from event logs
    const event = receipt.events?.find((e: any) => e.event === 'AlertCreated');
    const alertId = event?.args?.alertId?.toNumber() || 0;
    
    return { txHash: tx.hash, alertId };
  }

  async toggleAlert(alertId: number): Promise<string> {
    if (!this.chainHiveContract) throw new Error('Contract not initialized');
    
    const tx = await this.chainHiveContract.toggleAlert(alertId);
    await tx.wait();
    return tx.hash;
  }

  async getUserAlerts(address: string): Promise<Alert[]> {
    if (!this.chainHiveContract) throw new Error('Contract not initialized');
    
    const alerts = await this.chainHiveContract.getUserAlerts(address);
    return alerts.map((alert: any) => ({
      alertType: alert.alertType,
      conditions: alert.conditions,
      isActive: alert.isActive,
      createdAt: Number(alert.createdAt),
      triggeredCount: Number(alert.triggeredCount)
    }));
  }

  // Subscription Management
  async purchaseSubscription(tier: number): Promise<string> {
    if (!this.chainHiveContract || !this.tokenContract) {
      throw new Error('Contracts not initialized');
    }
    
    // First approve token spending
    const price = tier === 1 ? ethers.parseEther('50') : ethers.parseEther('200');
    const approveTx = await this.tokenContract.approve(this.currentChain!.contracts.chainHive, price);
    await approveTx.wait();
    
    // Then purchase subscription
    const tx = await this.chainHiveContract.purchaseSubscription(tier);
    await tx.wait();
    return tx.hash;
  }

  // Rewards
  async claimRewards(): Promise<string> {
    if (!this.chainHiveContract) throw new Error('Contract not initialized');
    
    const tx = await this.chainHiveContract.claimRewards();
    await tx.wait();
    return tx.hash;
  }

  async getRewardBalance(address: string): Promise<number> {
    if (!this.chainHiveContract) throw new Error('Contract not initialized');
    
    const balance = await this.chainHiveContract.userRewards(address);
    return Number(ethers.formatEther(balance));
  }

  // Token functions
  async getTokenBalance(address: string): Promise<number> {
    if (!this.tokenContract) throw new Error('Token contract not initialized');
    
    const balance = await this.tokenContract.balanceOf(address);
    return Number(ethers.formatEther(balance));
  }

  async transferTokens(to: string, amount: number): Promise<string> {
    if (!this.tokenContract) throw new Error('Token contract not initialized');
    
    const tx = await this.tokenContract.transfer(to, ethers.parseEther(amount.toString()));
    await tx.wait();
    return tx.hash;
  }

  // Utility functions
  getSupportedChains(): ChainConfig[] {
    return Object.values(this.chainConfigs);
  }

  getCurrentChain(): ChainConfig | null {
    return this.currentChain;
  }

  isConnected(): boolean {
    return this.signer !== null;
  }

  async getCurrentAddress(): Promise<string | null> {
    if (!this.signer) return null;
    return await this.signer.getAddress();
  }

  // Event listeners
  onUserRegistered(callback: (user: string, profileHash: string) => void): void {
    if (!this.chainHiveContract) return;
    
    this.chainHiveContract.on('UserRegistered', callback);
  }

  onPortfolioAnalyzed(callback: (user: string, portfolioHash: string, timestamp: number) => void): void {
    if (!this.chainHiveContract) return;
    
    this.chainHiveContract.on('PortfolioAnalyzed', callback);
  }

  onAIInsightGenerated(callback: (user: string, insightHash: string, insightType: number) => void): void {
    if (!this.chainHiveContract) return;
    
    this.chainHiveContract.on('AIInsightGenerated', callback);
  }

  onAlertCreated(callback: (user: string, alertId: number, alertType: number) => void): void {
    if (!this.chainHiveContract) return;
    
    this.chainHiveContract.on('AlertCreated', callback);
  }

  // Cleanup
  removeAllListeners(): void {
    if (this.chainHiveContract) {
      this.chainHiveContract.removeAllListeners();
    }
  }
}

// Global type declarations for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}