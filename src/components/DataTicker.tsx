
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';

const DataTicker = () => {
  const tickerData = [
    { label: 'ETH', value: '$2,345.67', change: '+5.2%', positive: true },
    { label: 'BTC', value: '$43,210.00', change: '+2.1%', positive: true },
    { label: 'Gas', value: '32 gwei', change: '-8%', positive: true },
    { label: 'TVL', value: '$45.2B', change: '+1.4%', positive: true },
    { label: 'Volume', value: '$12.8B', change: '+15.7%', positive: true },
    { label: 'LINK', value: '$14.32', change: '-1.8%', positive: false },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 z-40">
      <div className="overflow-hidden py-3">
        <div className="animate-marquee flex space-x-8 whitespace-nowrap">
          {[...tickerData, ...tickerData].map((item, index) => (
            <div key={index} className="flex items-center space-x-2 px-4">
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
