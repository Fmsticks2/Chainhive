
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { CryptoService, TokenData } from '@/services/cryptoService';

const DataTicker = () => {
  const [tickerData, setTickerData] = useState<any[]>([]);
  const [networkData, setNetworkData] = useState<any>(null);
  const cryptoService = CryptoService.getInstance();

  useEffect(() => {
    const updateData = async () => {
      try {
        // Get token data
        const tokens = await cryptoService.getTokenData(['ETH', 'BTC', 'LINK', 'UNI', 'MATIC']);
        const network = await cryptoService.getNetworkData();
        
        const formattedData = [
          ...tokens.map(token => ({
            label: token.symbol,
            value: `$${token.price.toFixed(2)}`,
            change: `${token.change24h > 0 ? '+' : ''}${token.change24h.toFixed(1)}%`,
            positive: token.change24h > 0
          })),
          {
            label: 'Gas',
            value: `${Math.round(network.gasPrice)} gwei`,
            change: network.gasPrice < 35 ? 'Low' : network.gasPrice > 60 ? 'High' : 'Normal',
            positive: network.gasPrice < 50
          },
          {
            label: 'Block',
            value: network.blockHeight.toLocaleString(),
            change: `${network.tps.toFixed(1)} TPS`,
            positive: network.tps > 13
          }
        ];

        setTickerData(formattedData);
        setNetworkData(network);
      } catch (error) {
        console.error('Error updating ticker data:', error);
      }
    };

    updateData();
    const interval = setInterval(updateData, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (tickerData.length === 0) {
    return (
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 z-40">
        <div className="py-3 flex justify-center">
          <span className="text-gray-400">Loading market data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 z-40">
      <div className="overflow-hidden py-3">
        <div className="animate-marquee flex space-x-8 whitespace-nowrap">
          {[...tickerData, ...tickerData].map((item, index) => (
            <div key={`${item.label}-${index}`} className="flex items-center space-x-2 px-4">
              <span className="text-gray-400 font-medium">{item.label}:</span>
              <span className="text-white font-semibold">{item.value}</span>
              <Badge
                variant={item.positive ? "default" : "destructive"}
                className={`text-xs ${
                  item.positive 
                    ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                }`}
              >
                {item.positive ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {item.change}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataTicker;
