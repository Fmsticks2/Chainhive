
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Settings, Bell } from 'lucide-react';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center animate-pulse-glow">
                <div className="w-6 h-6 bg-white rounded-sm opacity-90"></div>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Web3 AI Assistant</h1>
              <p className="text-xs text-cyan-400">Powered by Nodit MCP</p>
            </div>
          </div>

          {/* Network Status */}
          <div className="flex items-center space-x-4">
            <div className="glass px-3 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">Ethereum</span>
                <Badge variant="secondary" className="text-xs">
                  Gas: 32 gwei
                </Badge>
              </div>
            </div>

            {/* Wallet Connection */}
            <Button variant="outline" className="glass border-cyan-400/30 hover:border-cyan-400/60 text-cyan-400">
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>

            {/* Settings */}
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
