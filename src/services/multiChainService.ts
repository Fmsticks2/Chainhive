
export interface ChainConfig {
  id: string;
  name: string;
  symbol: string;
  rpcUrl: string;
  explorerUrl: string;
  icon: string;
}

export interface MultiChainTokenData {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  value: number;
  change24h: number;
  chain: string;
  contractAddress?: string;
  decimals: number;
}

export interface WalletPortfolio {
  totalValue: number;
  totalChange24h: number;
  chains: {
    [chainId: string]: {
      totalValue: number;
      tokens: MultiChainTokenData[];
    };
  };
}

export interface TransactionData {
  hash: string;
  from: string;
  to: string;
  value: number;
  timestamp: number;
  chain: string;
  type: 'send' | 'receive' | 'swap' | 'contract';
  status: 'success' | 'failed' | 'pending';
}

export const SUPPORTED_CHAINS: ChainConfig[] = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://mainnet.infura.io/v3/',
    explorerUrl: 'https://etherscan.io',
    icon: '⟠'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    icon: '⬟'
  },
  {
    id: 'bsc',
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    icon: '●'
  },
  {
    id: 'aptos',
    name: 'Aptos',
    symbol: 'APT',
    rpcUrl: 'https://fullnode.mainnet.aptoslabs.com/v1',
    explorerUrl: 'https://explorer.aptoslabs.com',
    icon: 'A'
  },
  {
    id: 'xrpl',
    name: 'XRP Ledger',
    symbol: 'XRP',
    rpcUrl: 'wss://xrplcluster.com',
    explorerUrl: 'https://xrpscan.com',
    icon: 'X'
  }
];

export class MultiChainService {
  private static instance: MultiChainService;
  private portfolioCache: Map<string, WalletPortfolio> = new Map();
  private transactionCache: Map<string, TransactionData[]> = new Map();
  private lastUpdate = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  static getInstance(): MultiChainService {
    if (!MultiChainService.instance) {
      MultiChainService.instance = new MultiChainService();
    }
    return MultiChainService.instance;
  }

  async analyzeWallet(address: string, chains: string[] = ['ethereum']): Promise<WalletPortfolio> {
    const cacheKey = `${address}-${chains.join(',')}`;
    const now = Date.now();
    
    if (this.portfolioCache.has(cacheKey) && now - this.lastUpdate < this.CACHE_DURATION) {
      return this.portfolioCache.get(cacheKey)!;
    }

    // Simulate API calls to Nodit for real implementation
    const portfolio = await this.fetchPortfolioData(address, chains);
    this.portfolioCache.set(cacheKey, portfolio);
    this.lastUpdate = now;
    
    return portfolio;
  }

  async getTransactionHistory(address: string, chain: string, limit: number = 10): Promise<TransactionData[]> {
    const cacheKey = `${address}-${chain}-txs`;
    
    if (this.transactionCache.has(cacheKey)) {
      return this.transactionCache.get(cacheKey)!.slice(0, limit);
    }

    const transactions = await this.fetchTransactionData(address, chain, limit);
    this.transactionCache.set(cacheKey, transactions);
    
    return transactions;
  }

  private async fetchPortfolioData(address: string, chains: string[]): Promise<WalletPortfolio> {
    // Mock data - in real implementation, this would call Nodit APIs
    const mockTokens: { [chain: string]: MultiChainTokenData[] } = {
      ethereum: [
        {
          symbol: 'ETH',
          name: 'Ethereum',
          balance: 2.45,
          price: 2345.67,
          value: 5747.89,
          change24h: 5.2,
          chain: 'ethereum',
          decimals: 18
        },
        {
          symbol: 'USDC',
          name: 'USD Coin',
          balance: 1250.0,
          price: 1.00,
          value: 1250.0,
          change24h: 0.01,
          chain: 'ethereum',
          contractAddress: '0xA0b86a33E6441d3c0b8f03c90C44DF4e0ec6C15f',
          decimals: 6
        }
      ],
      polygon: [
        {
          symbol: 'MATIC',
          name: 'Polygon',
          balance: 1500.0,
          price: 0.82,
          value: 1230.0,
          change24h: 3.4,
          chain: 'polygon',
          decimals: 18
        }
      ]
    };

    let totalValue = 0;
    let totalChange24h = 0;
    const chainsData: WalletPortfolio['chains'] = {};

    for (const chain of chains) {
      const tokens = mockTokens[chain] || [];
      const chainValue = tokens.reduce((sum, token) => sum + token.value, 0);
      const chainChange = tokens.reduce((sum, token) => sum + (token.change24h * token.value / 100), 0) / chainValue * 100;
      
      chainsData[chain] = {
        totalValue: chainValue,
        tokens
      };
      
      totalValue += chainValue;
      totalChange24h += chainChange;
    }

    return {
      totalValue,
      totalChange24h: totalChange24h / chains.length,
      chains: chainsData
    };
  }

  private async fetchTransactionData(address: string, chain: string, limit: number): Promise<TransactionData[]> {
    // Mock transaction data
    const mockTransactions: TransactionData[] = [
      {
        hash: '0x1234...5678',
        from: address,
        to: '0xabcd...efgh',
        value: 0.5,
        timestamp: Date.now() - 3600000,
        chain,
        type: 'send',
        status: 'success'
      },
      {
        hash: '0x5678...9012',
        from: '0xefgh...ijkl',
        to: address,
        value: 1.2,
        timestamp: Date.now() - 7200000,
        chain,
        type: 'receive',
        status: 'success'
      }
    ];

    return mockTransactions.slice(0, limit);
  }

  isValidAddress(address: string, chain: string): boolean {
    switch (chain) {
      case 'ethereum':
      case 'polygon':
      case 'bsc':
        return /^0x[a-fA-F0-9]{40}$/.test(address);
      case 'aptos':
        return /^0x[a-fA-F0-9]{64}$/.test(address);
      case 'xrpl':
        return /^r[a-zA-Z0-9]{25,34}$/.test(address);
      default:
        return false;
    }
  }

  getChainConfig(chainId: string): ChainConfig | undefined {
    return SUPPORTED_CHAINS.find(chain => chain.id === chainId);
  }

  getSupportedChains(): ChainConfig[] {
    return SUPPORTED_CHAINS;
  }
}
