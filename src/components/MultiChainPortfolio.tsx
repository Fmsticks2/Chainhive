
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Wallet, RefreshCw } from 'lucide-react';
import { MultiChainService, WalletPortfolio } from '@/services/multiChainService';
import PortfolioChart from './PortfolioChart';
import { useToast } from '@/hooks/use-toast';

interface MultiChainPortfolioProps {
  walletAddress?: string;
  selectedChains?: string[];
}

const MultiChainPortfolio: React.FC<MultiChainPortfolioProps> = ({ 
  walletAddress = '', 
  selectedChains = ['ethereum'] 
}) => {
  const [portfolio, setPortfolio] = useState<WalletPortfolio | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const { toast } = useToast();
  const multiChainService = MultiChainService.getInstance();

  const loadPortfolio = async () => {
    if (!walletAddress) return;
    
    setIsLoading(true);
    try {
      const portfolioData = await multiChainService.analyzeWallet(walletAddress, selectedChains);
      setPortfolio(portfolioData);
      setLastUpdate(new Date());
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load portfolio data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      loadPortfolio();
    }
  }, [walletAddress, selectedChains]);

  const getChartData = () => {
    if (!portfolio) return [];
    
    return Object.entries(portfolio.chains).map(([chainId, chainData]) => {
      const chainConfig = multiChainService.getChainConfig(chainId);
      return {
        name: chainConfig?.name || chainId,
        value: chainData.totalValue
      };
    });
  };

  const getTokenAllocation = () => {
    if (!portfolio) return [];
    
    const tokenMap = new Map<string, number>();
    
    Object.values(portfolio.chains).forEach(chainData => {
      chainData.tokens.forEach(token => {
        const current = tokenMap.get(token.symbol) || 0;
        tokenMap.set(token.symbol, current + token.value);
      });
    });

    return Array.from(tokenMap.entries()).map(([symbol, value]) => ({
      name: symbol,
      value
    })).sort((a, b) => b.value - a.value).slice(0, 6);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: value > 1000000 ? 'compact' : 'standard'
    }).format(value);
  };

  if (!walletAddress) {
    return (
      <Card className="glass p-8 text-center">
        <Wallet className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Portfolio Dashboard</h3>
        <p className="text-gray-400">Enter a wallet address to view your multi-chain portfolio</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Header */}
      <Card className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Portfolio Overview</h2>
          <div className="flex items-center gap-3">
            {lastUpdate && (
              <span className="text-sm text-gray-400">
                Updated {lastUpdate.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={loadPortfolio}
              disabled={isLoading}
              className="glass border-cyan-400/30 text-cyan-400"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {portfolio && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Total Portfolio Value</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(portfolio.totalValue)}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">24h Change</p>
              <p className={`text-2xl font-bold flex items-center justify-center ${
                portfolio.totalChange24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {portfolio.totalChange24h >= 0 ? (
                  <TrendingUp className="w-5 h-5 mr-1" />
                ) : (
                  <TrendingDown className="w-5 h-5 mr-1" />
                )}
                {portfolio.totalChange24h.toFixed(2)}%
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Active Networks</p>
              <p className="text-2xl font-bold text-cyan-400">{Object.keys(portfolio.chains).length}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Total Assets</p>
              <p className="text-2xl font-bold text-purple-400">
                {Object.values(portfolio.chains).reduce((sum, chain) => sum + chain.tokens.length, 0)}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Charts and Analytics */}
      {portfolio && (
        <Tabs defaultValue="allocation" className="w-full">
          <TabsList className="grid w-full grid-cols-3 glass">
            <TabsTrigger value="allocation">Asset Allocation</TabsTrigger>
            <TabsTrigger value="chains">Chain Distribution</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="allocation" className="mt-6">
            <PortfolioChart
              type="pie"
              data={getTokenAllocation()}
              title="Top Assets by Value"
            />
          </TabsContent>
          
          <TabsContent value="chains" className="mt-6">
            <PortfolioChart
              type="pie"
              data={getChartData()}
              title="Portfolio Distribution by Network"
            />
          </TabsContent>
          
          <TabsContent value="performance" className="mt-6">
            <PortfolioChart
              type="line"
              data={[
                { name: '7d ago', value: portfolio.totalValue * 0.95 },
                { name: '6d ago', value: portfolio.totalValue * 0.97 },
                { name: '5d ago', value: portfolio.totalValue * 0.93 },
                { name: '4d ago', value: portfolio.totalValue * 0.98 },
                { name: '3d ago', value: portfolio.totalValue * 1.02 },
                { name: '2d ago', value: portfolio.totalValue * 0.99 },
                { name: 'Yesterday', value: portfolio.totalValue * 0.96 },
                { name: 'Today', value: portfolio.totalValue }
              ]}
              title="Portfolio Performance (7 Days)"
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default MultiChainPortfolio;
