const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-url.com/api' 
  : 'http://localhost:3000/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PortfolioData {
  totalValue: number;
  tokens: Array<{
    symbol: string;
    balance: number;
    value: number;
    price: number;
  }>;
  nfts: Array<{
    name: string;
    collection: string;
    tokenId: string;
    image?: string;
  }>;
  transactions: Array<{
    hash: string;
    type: string;
    amount: number;
    timestamp: number;
    status: string;
  }>;
}

export interface HealthStatus {
  status: string;
  timestamp: number;
  services: {
    database: string;
    cache: string;
    blockchain: string;
  };
}

class ApiService {
  private static instance: ApiService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = API_BASE_URL;
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const config: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      console.log(`Making ${config.method || 'GET'} request to:`, url);
      
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // GET endpoints
  async getHealth(): Promise<ApiResponse<HealthStatus>> {
    return this.request<HealthStatus>('/health');
  }

  async getWeb3AuthConfig(): Promise<ApiResponse<any>> {
    return this.request<any>('/web3auth/config');
  }

  async getPortfolio(address: string, chains?: string[]): Promise<ApiResponse<PortfolioData>> {
    const params = new URLSearchParams({ address });
    if (chains && chains.length > 0) {
      params.append('chains', chains.join(','));
    }
    return this.request<PortfolioData>(`/multichain/portfolio?${params}`);
  }

  async getTokenBalances(address: string, chain: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ address, chain });
    return this.request<any>(`/multichain/tokens?${params}`);
  }

  async getTransactionHistory(address: string, chain: string, limit?: number): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ address, chain });
    if (limit) {
      params.append('limit', limit.toString());
    }
    return this.request<any>(`/multichain/transactions?${params}`);
  }

  async getNFTs(address: string, chain: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ address, chain });
    return this.request<any>(`/multichain/nfts?${params}`);
  }

  async getAIInsights(address: string, type?: string): Promise<ApiResponse<any>> {
    const params = new URLSearchParams({ address });
    if (type) {
      params.append('type', type);
    }
    return this.request<any>(`/ai/insights?${params}`);
  }

  // POST endpoints
  async createUser(userData: {
    address: string;
    profileHash?: string;
    email?: string;
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async createAlert(alertData: {
    address: string;
    type: string;
    conditions: any;
    isActive?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  }

  async updateUserProfile(address: string, profileData: {
    profileHash?: string;
    email?: string;
    preferences?: any;
  }): Promise<ApiResponse<any>> {
    return this.request<any>(`/users/${address}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async recordPortfolioAnalysis(analysisData: {
    address: string;
    dataHash: string;
    totalValue: number;
    riskScore: number;
    diversificationScore: number;
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/portfolio/analysis', {
      method: 'POST',
      body: JSON.stringify(analysisData),
    });
  }

  async storeAIInsight(insightData: {
    address: string;
    contentHash: string;
    insightType: string;
    confidenceScore: number;
    isPublic?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.request<any>('/ai/insights', {
      method: 'POST',
      body: JSON.stringify(insightData),
    });
  }

  // Test connectivity
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.getHealth();
      return response.success;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

export default ApiService;
export const apiService = ApiService.getInstance();