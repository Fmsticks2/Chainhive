
export interface NoditTokenBalance {
  token_address: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: string;
  value_usd: number;
  price_usd: number;
  change_24h: number;
}

export interface NoditTransaction {
  hash: string;
  block_number: number;
  from_address: string;
  to_address: string;
  value: string;
  gas_used: string;
  gas_price: string;
  timestamp: string;
  status: 'success' | 'failed';
  method: string;
}

export interface NoditNFT {
  token_address: string;
  token_id: string;
  name: string;
  description: string;
  image_url: string;
  collection_name: string;
  floor_price: number;
  last_sale_price: number;
}

export interface NoditMCPResponse {
  summary: string;
  insights: string[];
  recommendations: string[];
  risk_score: number;
  diversification_score: number;
}

export class NoditService {
  private static instance: NoditService;
  private apiKey: string = '';
  private baseUrl = 'https://web3.nodit.io/v1';
  private kairosRpcUrl = 'https://kairos-testnet.kaichain.net';

  static getInstance(): NoditService {
    if (!NoditService.instance) {
      NoditService.instance = new NoditService();
    }
    return NoditService.instance;
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  setKairosRpcUrl(url: string): void {
    this.kairosRpcUrl = url;
  }

  async getTokenBalances(address: string, chain: string): Promise<NoditTokenBalance[]> {
    try {
      if (!this.apiKey) {
        console.warn('No NODIT API key provided, using mock data');
        return this.getMockTokenBalances(chain);
      }

      const endpoint = `${this.baseUrl}/${chain}/address/${address}/tokens`;
      console.log(`Making API call to: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.apiKey,
          'User-Agent': 'ChainHive/1.0.0'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Successfully fetched token balances for ${chain}:`, data);
      
      // Transform the response to match our interface
      return data.tokens?.map((token: any) => ({
        token_address: token.contract_address || token.address,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        balance: token.balance,
        value_usd: token.value_usd || (parseFloat(token.balance) * (token.price_usd || 0) / Math.pow(10, token.decimals)),
        price_usd: token.price_usd || 0,
        change_24h: token.change_24h || 0
      })) || [];
      
    } catch (error) {
      console.error(`Error fetching token balances for ${chain}:`, error);
      console.log('Falling back to mock data...');
      return this.getMockTokenBalances(chain);
    }
  }

  async getTransactionHistory(address: string, chain: string, limit: number = 50): Promise<NoditTransaction[]> {
    try {
      if (!this.apiKey) {
        console.warn('No NODIT API key provided, using mock data');
        return this.getMockTransactions(address, chain, limit);
      }

      const endpoint = `${this.baseUrl}/${chain}/address/${address}/transactions?limit=${limit}`;
      console.log(`Making API call to: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.apiKey,
          'User-Agent': 'ChainHive/1.0.0'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Successfully fetched transaction history for ${chain}:`, data);
      
      // Transform the response to match our interface
      return data.transactions?.map((tx: any) => ({
        hash: tx.hash,
        block_number: tx.block_number,
        from_address: tx.from,
        to_address: tx.to,
        value: tx.value,
        gas_used: tx.gas_used?.toString() || '0',
        gas_price: tx.gas_price?.toString() || '0',
        timestamp: tx.timestamp,
        status: tx.status === 1 || tx.status === 'success' ? 'success' as const : 'failed' as const,
        method: tx.method || 'transfer'
      })) || [];
      
    } catch (error) {
      console.error(`Error fetching transaction history for ${chain}:`, error);
      console.log('Falling back to mock data...');
      return this.getMockTransactions(address, chain, limit);
    }
  }

  async getNFTs(address: string, chain: string): Promise<NoditNFT[]> {
    try {
      if (!this.apiKey) {
        console.warn('No NODIT API key provided, using mock data');
        return this.getMockNFTs(chain);
      }

      const endpoint = `${this.baseUrl}/${chain}/address/${address}/nfts`;
      console.log(`Making API call to: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.apiKey,
          'User-Agent': 'ChainHive/1.0.0'
        }
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Successfully fetched NFTs for ${chain}:`, data);
      
      // Transform the response to match our interface
      return data.nfts?.map((nft: any) => ({
        token_address: nft.contract_address || nft.address,
        token_id: nft.token_id,
        name: nft.name,
        description: nft.description,
        image_url: nft.image_url || nft.image,
        collection_name: nft.collection_name || nft.collection,
        floor_price: nft.floor_price || 0,
        last_sale_price: nft.last_sale_price || 0
      })) || [];
      
    } catch (error) {
      console.error(`Error fetching NFTs for ${chain}:`, error);
      console.log('Falling back to mock data...');
      return this.getMockNFTs(chain);
    }
  }

  async getMCPAnalysis(portfolioData: any): Promise<NoditMCPResponse> {
    try {
      // Enhanced MCP analysis with Kairos Network integration
      if (portfolioData.chains && portfolioData.chains.kairos) {
        return this.getKairosMCPAnalysis(portfolioData);
      }
      // Fallback to general MCP analysis
      return this.getMockMCPAnalysis(portfolioData);
    } catch (error) {
      console.error('Error getting MCP analysis:', error);
      return {
        summary: 'Unable to analyze portfolio at this time.',
        insights: [],
        recommendations: [],
        risk_score: 5,
        diversification_score: 5
      };
    }
  }

  async getKairosNetworkData(address: string): Promise<any> {
    try {
      // Fetch Kairos-specific blockchain data
      const response = await fetch(`${this.kairosRpcUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1
        })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Kairos network data:', error);
      return null;
    }
  }

  private getKairosMCPAnalysis(portfolioData: any): NoditMCPResponse {
    const kairosData = portfolioData.chains.kairos;
    const totalValue = kairosData.totalValue || 0;
    const tokenCount = kairosData.tokens?.length || 0;
    
    return {
      summary: `Your Kairos Network portfolio shows ${tokenCount} tokens with a total value of $${totalValue.toFixed(2)}. Kairos Network offers unique opportunities for DeFi and cross-chain interactions.`,
      insights: [
        `Kairos Network exposure: $${totalValue.toFixed(2)} (${((totalValue / portfolioData.totalValue) * 100).toFixed(1)}% of total portfolio)`,
        `Token diversity on Kairos: ${tokenCount} different tokens`,
        'Kairos Network provides enhanced security and scalability features',
        'Consider exploring Kairos-native DeFi protocols for yield opportunities'
      ],
      recommendations: [
        'Diversify within the Kairos ecosystem by exploring native tokens',
        'Monitor Kairos Network governance proposals for potential impacts',
        'Consider staking KAI tokens for network rewards',
        'Explore cross-chain bridges to maximize portfolio efficiency'
      ],
      risk_score: Math.min(10, Math.max(1, Math.floor((tokenCount / 5) * 3) + 3)),
      diversification_score: Math.min(10, Math.max(1, tokenCount * 2))
    };
  }

  async setupWebhook(webhookUrl: string, chains: string[]): Promise<boolean> {
    try {
      // Mock webhook setup - replace with actual Nodit webhook API
      console.log('Setting up webhook:', webhookUrl, 'for chains:', chains);
      return true;
    } catch (error) {
      console.error('Error setting up webhook:', error);
      return false;
    }
  }

  // Mock data methods - replace with actual API calls
  private getMockTokenBalances(chain: string): NoditTokenBalance[] {
    const mockData = {
      ethereum: [
        {
          token_address: '0x0000000000000000000000000000000000000000',
          symbol: 'ETH',
          name: 'Ethereum',
          decimals: 18,
          balance: '2.45',
          value_usd: 5747.89,
          price_usd: 2345.67,
          change_24h: 5.2
        },
        {
          token_address: '0xA0b86a33E6441d3c0b8f03c90C44DF4e0ec6C15f',
          symbol: 'USDC',
          name: 'USD Coin',
          decimals: 6,
          balance: '1250.0',
          value_usd: 1250.0,
          price_usd: 1.00,
          change_24h: 0.01
        }
      ],
      polygon: [
        {
          token_address: '0x0000000000000000000000000000000000001010',
          symbol: 'MATIC',
          name: 'Polygon',
          decimals: 18,
          balance: '1500.0',
          value_usd: 1230.0,
          price_usd: 0.82,
          change_24h: 3.4
        }
      ]
    };

    return mockData[chain as keyof typeof mockData] || [];
  }

  private getMockTransactions(address: string, _chain: string, limit: number): NoditTransaction[] {
    return [
      {
        hash: '0x1234567890123456789012345678901234567890123456789012345678901234',
        block_number: 18891234,
        from_address: address,
        to_address: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
        value: '0.5',
        gas_used: '21000',
        gas_price: '20000000000',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'success' as const,
        method: 'transfer'
      }
    ].slice(0, limit);
  }

  private getMockNFTs(_chain: string): NoditNFT[] {
    return [
      {
        token_address: '0x60E4d786628Fea6478F785A6d7e704777c86a7c6',
        token_id: '1234',
        name: 'Cool NFT #1234',
        description: 'A very cool NFT',
        image_url: 'https://via.placeholder.com/300',
        collection_name: 'Cool Collection',
        floor_price: 0.5,
        last_sale_price: 0.8
      }
    ];
  }

  private getMockMCPAnalysis(_portfolioData: any): NoditMCPResponse {
    return {
      summary: 'Your portfolio shows strong diversification across major assets with a balanced risk profile. Current allocation favors established tokens like ETH and stablecoins, indicating a conservative strategy.',
      insights: [
        'ETH represents 82% of your portfolio value, showing high concentration',
        'USDC holdings provide good stability and liquidity',
        'Your cross-chain presence reduces single-network risk',
        'Recent transactions show consistent DeFi interaction'
      ],
      recommendations: [
        'Consider diversifying beyond ETH to reduce concentration risk',
        'Explore yield opportunities with your USDC holdings',
        'Monitor gas optimization strategies for Ethereum transactions',
        'Consider adding exposure to emerging L2 tokens'
      ],
      risk_score: 6.5, // Out of 10
      diversification_score: 7.2 // Out of 10
    };
  }
}
