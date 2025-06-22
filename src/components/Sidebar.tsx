
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Wallet, Eye, Star } from 'lucide-react';

const Sidebar = () => {
  const trendingTokens = [
    { symbol: 'ETH', price: '$2,345.67', change: '+5.2%', positive: true },
    { symbol: 'BTC', price: '$43,210.00', change: '+2.1%', positive: true },
    { symbol: 'LINK', price: '$14.32', change: '-1.8%', positive: false },
    { symbol: 'UNI', price: '$6.78', change: '+8.4%', positive: true },
  ];

  const quickActions = [
    { title: 'Wallet Analyzer', desc: 'Deep dive into any wallet', icon: Wallet },
    { title: 'Token Explorer', desc: 'Research tokens & contracts', icon: Eye },
    { title: 'Portfolio Tracker', desc: 'Track your holdings', icon: Star },
  ];

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
            >
              <action.icon className="w-5 h-5 mr-3 text-cyan-400" />
              <div className="text-left">
                <div className="font-medium text-white">{action.title}</div>
                <div className="text-sm text-gray-400">{action.desc}</div>
              </div>
            </Button>
          ))}
        </div>
      </Card>

      {/* Trending Tokens */}
      <Card className="glass p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Trending Tokens</h3>
        <div className="space-y-3">
          {trendingTokens.map((token) => (
            <div key={token.symbol} className="flex items-center justify-between p-3 glass rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full gradient-secondary flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{token.symbol.charAt(0)}</span>
                </div>
                <div>
                  <div className="font-medium text-white">{token.symbol}</div>
                  <div className="text-sm text-gray-400">{token.price}</div>
                </div>
              </div>
              <Badge
                variant={token.positive ? "default" : "destructive"}
                className={`${
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
          ))}
        </div>
      </Card>

      {/* Network Status */}
      <Card className="glass p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Network Status</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Block Height</span>
            <span className="text-cyan-400 font-mono">18,891,234</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Gas Price</span>
            <span className="text-cyan-400">32 gwei</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">TPS</span>
            <span className="text-green-400">14.2</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-gradient-to-r from-green-400 to-cyan-400 h-2 rounded-full w-[72%]"></div>
          </div>
          <span className="text-xs text-gray-400">Network Health: Good</span>
        </div>
      </Card>
    </div>
  );
};

export default Sidebar;
