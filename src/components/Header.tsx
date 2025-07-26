
import React from 'react';
import { useWeb3 } from '@/contexts/Web3Context';
import { Button } from '@/components/ui/button';
import { Wallet, Loader2, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Header = () => {
  const { account, isConnected, isConnecting, connect, disconnect, chainId } = useWeb3();

  const handleConnect = () => {
    connect();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getChainName = (chainId: number | null) => {
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  {account && formatAddress(account)}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex flex-col items-start">
                  <span className="text-sm font-medium">Connected</span>
                  <span className="text-xs text-muted-foreground">
                    {account && formatAddress(account)}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start">
                  <span className="text-sm font-medium">Network</span>
                  <span className="text-xs text-muted-foreground">{getChainName(chainId)}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDisconnect} className="text-red-600">
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex items-center gap-2"
            >
              {isConnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wallet className="w-4 h-4" />
              )}
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
