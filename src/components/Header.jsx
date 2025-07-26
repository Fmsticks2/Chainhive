import React from 'react';
import { useWeb3 } from '@/contexts/Web3Context';

const Header = () => {
  const { account, isConnected, isConnecting, connect, disconnect, chainId } = useWeb3();

  const handleConnect = () => {
    connect();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getChainName = (chainId) => {
    switch (chainId) {
      case 1:
        return 'Ethereum';
      case 137:
        return 'Polygon';
      case 10:
        return 'Optimism';
      case 42161:
        return 'Arbitrum';
      default:
        return 'Unknown';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-gradient">ChainHive</h1>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#portfolio" className="text-muted-foreground hover:text-foreground transition-colors">
                Portfolio
              </a>
              <a href="#analytics" className="text-muted-foreground hover:text-foreground transition-colors">
                Analytics
              </a>
            </nav>
          </div>
          
          {isConnected ? (
            <div className="relative">
              <button
                onClick={handleDisconnect}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <span>🔗</span>
                {formatAddress(account)}
                <span>▼</span>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border p-2">
                <div className="text-sm text-gray-600 mb-2">
                  Network: {getChainName(chainId)}
                </div>
                <button
                  onClick={handleDisconnect}
                  className="w-full text-left px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Connecting...
                </>
              ) : (
                <>
                  <span>💼</span>
                  Connect Wallet
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 