
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Settings, Bell, BarChart3, Menu, X, Activity, Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-white/20 backdrop-blur-xl">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center glow-primary group-hover:scale-105 transition-transform duration-300">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
                <Activity className="w-2 h-2 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl lg:text-2xl font-bold text-gradient">ChainHive</h1>
              <p className="text-xs text-primary/80 font-medium">AI-Powered Web3 Analytics</p>
            </div>
          </Link>

          {/* Navigation Menu */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10 ${
                location.pathname === '/' 
                  ? 'text-primary bg-primary/20 shadow-lg' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link 
              to="/portfolio" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover:bg-white/10 flex items-center gap-2 ${
                location.pathname === '/portfolio' 
                  ? 'text-primary bg-primary/20 shadow-lg' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Portfolio
            </Link>
            <div className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed opacity-60">
              Analytics
              <Badge className="ml-2 text-xs bg-primary/20 text-primary border-primary/30">Soon</Badge>
            </div>
          </nav>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-3">
            {/* Network Status */}
            <div className="hidden md:flex glass-subtle px-3 py-2 rounded-lg border border-white/10">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
                </div>
                <span className="text-sm text-gray-300 font-medium">Kairos</span>
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <Badge variant="secondary" className="text-xs bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                    Fast
                  </Badge>
                </div>
              </div>
            </div>

            {/* Wallet Connection */}
            <Button 
              variant="outline" 
              size="sm"
              className={`glass-subtle border transition-all duration-300 ${
                walletConnected 
                  ? 'border-green-400/40 hover:border-green-400/60 text-green-400 bg-green-400/10 hover:bg-green-400/20' 
                  : 'border-primary/40 hover:border-primary/60 text-primary bg-primary/10 hover:bg-primary/20'
              }`}
              onClick={connectWallet}
            >
              <Wallet className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">
                {walletConnected ? formatAddress(walletAddress) : 'Connect Wallet'}
              </span>
              <span className="sm:hidden">
                {walletConnected ? 'Connected' : 'Connect'}
              </span>
            </Button>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center space-x-1">
              <Link to="/notifications">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`relative glass-subtle hover:bg-white/10 transition-all duration-300 ${
                    location.pathname === '/notifications' 
                      ? 'text-primary bg-primary/20' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-xs text-white font-bold">3</span>
                  </div>
                </Button>
              </Link>
              <Link to="/settings">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`glass-subtle hover:bg-white/10 transition-all duration-300 ${
                    location.pathname === '/settings' 
                      ? 'text-primary bg-primary/20' 
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden glass-subtle hover:bg-white/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 mt-4 pt-4 pb-4">
            <nav className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  location.pathname === '/' 
                    ? 'text-primary bg-primary/20' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link 
                to="/portfolio" 
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  location.pathname === '/portfolio' 
                    ? 'text-primary bg-primary/20' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <BarChart3 className="w-4 h-4" />
                Portfolio
              </Link>
              <div className="px-4 py-3 rounded-lg text-sm font-medium text-gray-400 opacity-60">
                Analytics
                <Badge className="ml-2 text-xs bg-primary/20 text-primary border-primary/30">Soon</Badge>
              </div>
              <div className="border-t border-white/10 pt-2 mt-2">
                <Link to="/notifications" className="px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <Bell className="w-4 h-4" />
                  Notifications
                  <Badge className="ml-auto text-xs bg-red-500 text-white">3</Badge>
                </Link>
                <Link to="/settings" className="px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <Settings className="w-4 h-4" />
                  Settings
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
