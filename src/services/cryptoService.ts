
export interface TokenData {
  symbol: string;
  price: number;
  change24h: number;
  marketCap?: number;
  volume?: number;
}

export interface NetworkData {
  gasPrice: number;
  blockHeight: number;
  tps: number;
  networkHealth: number; // 0-100
}

// Mock service that simulates real API calls
// In production, you'd connect to actual APIs like CoinGecko, Etherscan, etc.
export class CryptoService {
  private static instance: CryptoService;
  private tokenCache: Map<string, TokenData> = new Map();
  private networkCache: NetworkData | null = null;
  private lastUpdate = 0;
  private readonly CACHE_DURATION = 30000; // 30 seconds

  static getInstance(): CryptoService {
    if (!CryptoService.instance) {
      CryptoService.instance = new CryptoService();
    }
    return CryptoService.instance;
  }

  async getTokenData(symbols: string[]): Promise<TokenData[]> {
    const now = Date.now();
    if (now - this.lastUpdate > this.CACHE_DURATION) {
      await this.updateCache();
      this.lastUpdate = now;
    }

    return symbols.map(symbol => 
      this.tokenCache.get(symbol.toUpperCase()) || this.getDefaultTokenData(symbol)
    );
  }

  async getNetworkData(): Promise<NetworkData> {
    const now = Date.now();
    if (!this.networkCache || now - this.lastUpdate > this.CACHE_DURATION) {
      await this.updateNetworkCache();
    }
    return this.networkCache!;
  }

  private async updateCache() {
    // Simulate API call with realistic fluctuating data
    const baseData = {
      ETH: { price: 2345.67, change24h: 5.2 },
      BTC: { price: 43210.00, change24h: 2.1 },
      LINK: { price: 14.32, change24h: -1.8 },
      UNI: { price: 6.78, change24h: 8.4 },
      USDC: { price: 1.00, change24h: 0.01 },
      MATIC: { price: 0.82, change24h: 3.4 }
    };

    // Add some realistic price fluctuation
    Object.entries(baseData).forEach(([symbol, data]) => {
      const fluctuation = (Math.random() - 0.5) * 0.1; // ±5% fluctuation
      const newPrice = data.price * (1 + fluctuation);
      const newChange = data.change24h + (Math.random() - 0.5) * 2;
      
      this.tokenCache.set(symbol, {
        symbol,
        price: newPrice,
        change24h: newChange,
        marketCap: newPrice * 120000000, // Mock market cap
        volume: newPrice * 1000000 * (Math.random() * 10 + 5) // Mock volume
      });
    });
  }

  private async updateNetworkCache() {
    // Simulate network data with realistic fluctuations
    const baseGasPrice = 42;
    const gasFluctuation = (Math.random() - 0.5) * 20; // ±10 gwei
    
    this.networkCache = {
      gasPrice: Math.max(15, baseGasPrice + gasFluctuation),
      blockHeight: 18891234 + Math.floor(Math.random() * 100),
      tps: 12 + Math.random() * 6, // 12-18 TPS
      networkHealth: 70 + Math.random() * 25 // 70-95% health
    };
  }

  private getDefaultTokenData(symbol: string): TokenData {
    return {
      symbol: symbol.toUpperCase(),
      price: 0,
      change24h: 0
    };
  }

  // Helper method to get market analysis
  getMarketAnalysis(symbol: string): string {
    const tokenData = this.tokenCache.get(symbol.toUpperCase());
    if (!tokenData) return `No data available for ${symbol}`;

    const trend = tokenData.change24h > 0 ? 'bullish' : 'bearish';
    const strength = Math.abs(tokenData.change24h) > 5 ? 'strong' : 'moderate';
    
    return `${symbol} is showing ${strength} ${trend} momentum with ${tokenData.change24h > 0 ? '+' : ''}${tokenData.change24h.toFixed(2)}% change. Current price: $${tokenData.price.toFixed(2)}`;
  }
}
