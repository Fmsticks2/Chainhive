
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Settings, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  // Check for wallet on component mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
        }
      } catch (error) {
        console.log('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
        }
      } catch (error) {
        console.log('Error connecting wallet:', error);
      }
    } else {
      alert('Please install MetaMask or another Ethereum wallet extension');
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center animate-pulse-glow">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Web3 AI Assistant</h1>
              <p className="text-xs text-cyan-400">Powered by Nodit MCP</p>
            </div>
          </Link>

          {/* Network Status */}
          <div className="flex items-center space-x-4">
            <div className="glass px-3 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">Ethereum</span>
                <Badge variant="secondary" className="text-xs">
                  Gas: 42 gwei
                </Badge>
              </div>
            </div>

            {/* Wallet Connection */}
            <Button 
              variant="outline" 
              className={`glass ${
                walletConnected 
                  ? 'border-green-400/30 hover:border-green-400/60 text-green-400' 
                  : 'border-cyan-400/30 hover:border-cyan-400/60 text-cyan-400'
              }`}
              onClick={connectWallet}
            >
              <Wallet className="w-4 h-4 mr-2" />
              {walletConnected ? formatAddress(walletAddress) : 'Connect Wallet'}
            </Button>

            {/* Settings */}
            <div className="flex items-center space-x-2">
              <Link to="/notifications">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`relative ${
                    location.pathname === '/notifications' 
                      ? 'text-cyan-400 bg-cyan-400/10' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white">3</span>
                  </div>
                </Button>
              </Link>
              <Link to="/settings">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`${
                    location.pathname === '/settings' 
                      ? 'text-cyan-400 bg-cyan-400/10' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
