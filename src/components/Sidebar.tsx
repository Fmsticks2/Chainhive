
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Wallet, Eye, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CryptoService, TokenData } from '@/services/cryptoService';

const Sidebar = () => {
  const { toast } = useToast();
  const [trendingTokens, setTrendingTokens] = useState<any[]>([]);
  const [networkData, setNetworkData] = useState<any>(null);
  const cryptoService = CryptoService.getInstance();

  useEffect(() => {
    const updateData = async () => {
      try {
        const tokens = await cryptoService.getTokenData(['ETH', 'BTC', 'LINK', 'UNI']);
        const network = await cryptoService.getNetworkData();
        
        const formattedTokens = tokens.map(token => ({
          symbol: token.symbol,
          price: `$${token.price.toFixed(2)}`,
          change: `${token.change24h > 0 ? '+' : ''}${token.change24h.toFixed(1)}%`,
          positive: token.change24h > 0
        }));

        setTrendingTokens(formattedTokens);
        setNetworkData(network);
      } catch (error) {
        console.error('Error updating sidebar data:', error);
      }
    };

    updateData();
    const interval = setInterval(updateData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const quickActions = [
    { 
      title: 'Wallet Analyzer', 
      desc: 'Analyze wallet holdings', 
      icon: Wallet,
      action: () => {
        toast({
          title: "Wallet Analyzer",
          description: "Enter a wallet address in the chat to analyze holdings and transaction history.",
        });
      }
    },
    { 
      title: 'Token Explorer', 
      desc: 'Research tokens & contracts', 
      icon: Eye,
      action: () => {
        toast({
          title: "Token Explorer",
          description: "Ask me about any token or smart contract for detailed analysis.",
        });
      }
    },
    { 
      title: 'Portfolio Tracker', 
      desc: 'Track holdings & performance', 
      icon: Star,
      action: () => {
        toast({
          title: "Portfolio Tracker",
          description: "Connect your wallet to track portfolio performance and get insights.",
        });
      }
    },
  ];

  const handleTokenClick = (token: any) => {
    toast({
      title: `${token.symbol} Info`,
      description: `Current price: ${token.price} (${token.change})`,
    });
  };

  return (
    <div className="w-80 space-y-6 p-6">
      {/* Quick Actions */}
      <Card className="glass p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="space-y-3">
          {quickActions.map((action) => (
            <Button
              key={action.title}
              variant="ghost"
              className="w-full justify-start glass hover:bg-white/10 p-4 h-auto"
              onClick={action.action}
            >
              <action.icon className="w-5 h-5 mr-3 text-cyan-400 flex-shrink-0" />
              <div className="text-left min-w-0 flex-1">
                <div className="font-medium text-white truncate">{action.title}</div>
                <div className="text-sm text-gray-400 truncate">{action.desc}</div>
              </div>
            </Button>
          ))}
        </div>
      </Card>

      {/* Trending Tokens */}
      <Card className="glass p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Live Prices</h3>
        <div className="space-y-3">
          {trendingTokens.length > 0 ? trendingTokens.map((token) => (
            <div 
              key={token.symbol} 
              className="flex items-center justify-between p-3 glass rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => handleTokenClick(token)}
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-full gradient-secondary flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">{token.symbol.charAt(0)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-white">{token.symbol}</div>
                  <div className="text-sm text-gray-400 truncate">{token.price}</div>
                </div>
              </div>
              <Badge
                variant={token.positive ? "default" : "destructive"}
                className={`flex-shrink-0 ${
                  token.positive 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}
              >
                {token.positive ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {token.change}
              </Badge>
            </div>
          )) : (
            <div className="text-center text-gray-400 py-4">
              Loading prices...
            </div>
          )}
        </div>
      </Card>

      {/* Network Status */}
      <Card className="glass p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Network Status</h3>
        {networkData ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Block Height</span>
              <span className="text-cyan-400 font-mono">{networkData.blockHeight.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Gas Price</span>
              <span className="text-cyan-400">{Math.round(networkData.gasPrice)} gwei</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">TPS</span>
              <span className="text-green-400">{networkData.tps.toFixed(1)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-cyan-400 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${networkData.networkHealth}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-400">
              Network Health: {networkData.networkHealth > 85 ? 'Excellent' : networkData.networkHealth > 70 ? 'Good' : 'Fair'} ({Math.round(networkData.networkHealth)}%)
            </span>
          </div>
        ) : (
          <div className="text-center text-gray-400 py-4">
            Loading network data...
          </div>
        )}
      </Card>
    </div>
  );
};

export default Sidebar;
