
import { NoditService } from './noditService';

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
    rpcUrl: process.env.NODIT_API_KEY ? 'https://web3.nodit.io/v1/eth/mainnet' : 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    icon: '⟠'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: process.env.NODIT_API_KEY ? 'https://web3.nodit.io/v1/polygon/mainnet' : 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    icon: '⬟'
  },
  {
    id: 'bsc',
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    rpcUrl: process.env.NODIT_API_KEY ? 'https://web3.nodit.io/v1/bsc/mainnet' : 'https://bsc-dataseed1.defibit.io',
    explorerUrl: 'https://bscscan.com',
    icon: '●'
  },
  {
    id: 'kairos',
    name: 'Kairos Network',
    symbol: 'KAI',
    rpcUrl: process.env.NODIT_KAIROS_RPC_URL || 'https://public-en-kairos.node.kaia.io',
    explorerUrl: 'https://kairoscan.io',
    icon: '🔗'
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

// JsonRpcProvider import removed as we're using NoditService for API calls

export class MultiChainService {
  private static instance: MultiChainService;
  private portfolioCache: Map<string, WalletPortfolio> = new Map();
  private transactionCache: Map<string, TransactionData[]> = new Map();
  private lastUpdate = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds
  private noditService: NoditService;

  constructor() {
    this.noditService = NoditService.getInstance();
    // Set API key from environment if available
    const apiKey = process.env.NODIT_API_KEY || import.meta.env?.VITE_NODIT_API_KEY;
    if (apiKey) {
      this.noditService.setApiKey(apiKey);
    }
  }

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
    let totalValue = 0;
    let totalChange24h = 0;
    const chainsData: WalletPortfolio['chains'] = {};

    // Fetch real data from Nodit API for each chain
    for (const chain of chains) {
      try {
        console.log(`Fetching portfolio data for ${chain}:`, address);
        
        // Get token balances from Nodit API
        const tokenBalances = await this.noditService.getTokenBalances(address, chain);
        
        // Convert Nodit token data to our format
        const tokens: MultiChainTokenData[] = tokenBalances.map(token => ({
          symbol: token.symbol,
          name: token.name,
          balance: parseFloat(token.balance) / Math.pow(10, token.decimals),
          price: token.price_usd || 0,
          value: token.value_usd || 0,
          change24h: token.change_24h || 0,
          chain: chain,
          contractAddress: token.token_address,
          decimals: token.decimals
        }));

        const chainValue = tokens.reduce((sum, token) => sum + token.value, 0);
        const chainChange = tokens.length > 0 
          ? tokens.reduce((sum, token) => sum + token.change24h, 0) / tokens.length 
          : 0;
        
        chainsData[chain] = {
          totalValue: chainValue,
          tokens
        };
        
        totalValue += chainValue;
        totalChange24h += chainChange;
        
        console.log(`✅ Successfully fetched ${tokens.length} tokens for ${chain}, total value: $${chainValue.toFixed(2)}`);
        
      } catch (error) {
        console.error(`❌ Failed to fetch portfolio data for ${chain}:`, error);
        
        // Fallback to empty data for failed chains
        chainsData[chain] = {
          totalValue: 0,
          tokens: []
        };
      }
    }

    return {
      totalValue,
      totalChange24h: chains.length > 0 ? totalChange24h / chains.length : 0,
      chains: chainsData
    };
  }

  private async fetchTransactionData(address: string, chain: string, limit: number): Promise<TransactionData[]> {
    try {
      console.log(`Fetching transaction history for ${chain}:`, address);
      
      // Get transaction history from Nodit API
      const transactions = await this.noditService.getTransactionHistory(address, chain, limit);
      
      // Convert Nodit transaction data to our format
      const formattedTransactions: TransactionData[] = transactions.map(tx => {
        const isReceive = tx.to_address.toLowerCase() === address.toLowerCase();
        const value = parseFloat(tx.value) / Math.pow(10, 18); // Assuming 18 decimals for ETH-like chains
        
        return {
          hash: tx.hash,
          from: tx.from_address,
          to: tx.to_address,
          value: value,
          timestamp: new Date(tx.timestamp).getTime(),
          chain: chain,
          type: isReceive ? 'receive' : 'send',
          status: tx.status
        };
      });
      
      console.log(`✅ Successfully fetched ${formattedTransactions.length} transactions for ${chain}`);
      return formattedTransactions;
      
    } catch (error) {
      console.error(`❌ Failed to fetch transaction data for ${chain}:`, error);
      
      // Return empty array on error
      return [];
    }
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
