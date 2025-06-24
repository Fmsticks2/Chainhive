
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wallet, TrendingUp, TrendingDown, ArrowUp, ArrowDown, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { MultiChainService, WalletPortfolio, TransactionData } from '@/services/multiChainService';
import { NoditService, NoditTokenBalance, NoditTransaction } from '@/services/noditService';
import ChainSelector from './ChainSelector';
import { useToast } from '@/hooks/use-toast';

const WalletAnalyzer = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedChains, setSelectedChains] = useState(['ethereum']);
  const [portfolio, setPortfolio] = useState<WalletPortfolio | null>(null);
  const [transactions, setTransactions] = useState<NoditTransaction[]>([]);
  const [tokenBalances, setTokenBalances] = useState<NoditTokenBalance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isValidAddress, setIsValidAddress] = useState<boolean | null>(null);
  const { toast } = useToast();

  const multiChainService = MultiChainService.getInstance();
  const noditService = NoditService.getInstance();

  // Validate address in real-time
  useEffect(() => {
    if (!walletAddress.trim()) {
      setIsValidAddress(null);
      return;
    }

    const isValid = selectedChains.some(chain => 
      multiChainService.isValidAddress(walletAddress, chain)
    );
    setIsValidAddress(isValid);
  }, [walletAddress, selectedChains]);

  const handleAnalyze = async () => {
    if (!walletAddress.trim()) {
      setError('Please enter a wallet address');
      return;
    }

    if (!isValidAddress) {
      setError('Invalid wallet address format for selected networks');
      return;
    }

    setIsLoading(true);
    setError('');
    setPortfolio(null);
    setTransactions([]);
    setTokenBalances([]);

    try {
      console.log('Analyzing wallet:', walletAddress, 'on chains:', selectedChains);
      
      // Simulate checking if wallet exists and has activity
      const walletExists = await checkWalletExists(walletAddress, selectedChains[0]);
      
      if (!walletExists) {
        throw new Error('Wallet not found or has no transaction history');
      }

      // Get token balances using Nodit service
      const balances = await noditService.getTokenBalances(walletAddress, selectedChains[0]);
      setTokenBalances(balances);

      // Get transaction history
      const txHistory = await noditService.getTransactionHistory(walletAddress, selectedChains[0], 10);
      setTransactions(txHistory);

      // Get portfolio analysis
      const portfolioData = await multiChainService.analyzeWallet(walletAddress, selectedChains);
      setPortfolio(portfolioData);

      toast({
        title: "Analysis Complete",
        description: `Found ${balances.length} tokens and ${txHistory.length} recent transactions`,
      });

    } catch (err: any) {
      const errorMessage = err.message || 'Failed to analyze wallet. Please try again.';
      setError(errorMessage);
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      });
      console.error('Wallet analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkWalletExists = async (address: string, chain: string): Promise<boolean> => {
    // Mock wallet existence check - in real implementation, this would call Nodit API
    // Simulate some wallets not existing
    const nonExistentAddresses = [
      '0x0000000000000000000000000000000000000000',
      '0x1111111111111111111111111111111111111111'
    ];
    
    return !nonExistentAddresses.includes(address.toLowerCase());
  };

  const handleChainToggle = (chainId: string) => {
    setSelectedChains(prev => {
      if (prev.includes(chainId)) {
        return prev.filter(id => id !== chainId);
      } else {
        return [...prev, chainId];
      }
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-6">
      {/* Wallet Input Section */}
      <Card className="glass p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Wallet className="w-5 h-5 mr-2 text-cyan-400" />
          Wallet Analyzer
        </h2>
        
        <div className="space-y-4">
          <div>
            <div className="relative">
              <Input
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter wallet address (0x... or r...)"
                className="bg-gray-800 border-gray-600 text-white pr-10"
              />
              {walletAddress && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {isValidAddress === true && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                  {isValidAddress === false && (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>
              )}
            </div>
            
            {error && (
              <Alert className="mt-2 border-red-500/20 bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}
            
            {isValidAddress === false && walletAddress && (
              <Alert className="mt-2 border-yellow-500/20 bg-yellow-500/10">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-400">
                  Address format is invalid for selected networks
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || selectedChains.length === 0 || !isValidAddress}
            className="gradient-primary w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Wallet...
              </>
            ) : (
              'Analyze Wallet'
            )}
          </Button>
        </div>
      </Card>

      {/* Chain Selector */}
      <ChainSelector
        selectedChains={selectedChains}
        onChainToggle={handleChainToggle}
      />

      {/* Token Balances */}
      {tokenBalances.length > 0 && (
        <Card className="glass p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Token Balances</h3>
          <div className="space-y-3">
            {tokenBalances.map((token, index) => (
              <div key={index} className="flex items-center justify-between glass p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {token.symbol.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{token.symbol}</p>
                    <p className="text-gray-400 text-sm">{token.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{formatCurrency(token.value_usd)}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-400 text-sm">{token.balance} {token.symbol}</span>
                    <span className={`text-xs flex items-center ${
                      token.change_24h >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {token.change_24h >= 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {token.change_24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Portfolio Overview */}
      {portfolio && (
        <Card className="glass p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Portfolio Overview</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Total Value</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(portfolio.totalValue)}</p>
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
              <p className="text-gray-400 text-sm">Networks</p>
              <p className="text-2xl font-bold text-cyan-400">{Object.keys(portfolio.chains).length}</p>
            </div>
          </div>

          {/* Chain Breakdown */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-white">Holdings by Network</h4>
            {Object.entries(portfolio.chains).map(([chainId, chainData]) => {
              const chainConfig = multiChainService.getChainConfig(chainId);
              return (
                <div key={chainId} className="glass p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{chainConfig?.icon}</span>
                      <span className="font-medium text-white">{chainConfig?.name}</span>
                    </div>
                    <span className="font-semibold text-cyan-400">
                      {formatCurrency(chainData.totalValue)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {chainData.tokens.map((token, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-300">{token.symbol}</span>
                          <Badge variant="secondary" className="text-xs">
                            {token.balance.toFixed(4)}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <span className="text-white">{formatCurrency(token.value)}</span>
                          <span className={`ml-2 text-xs ${
                            token.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <Card className="glass p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
          <div className="space-y-3">
            {transactions.map((tx, index) => (
              <div key={index} className="flex items-center justify-between glass p-3 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    tx.from_address.toLowerCase() === walletAddress.toLowerCase() 
                      ? 'bg-red-500/20' : 'bg-green-500/20'
                  }`}>
                    {tx.from_address.toLowerCase() === walletAddress.toLowerCase() ? (
                      <ArrowUp className="w-4 h-4 text-red-400" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-green-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium capitalize">
                      {tx.from_address.toLowerCase() === walletAddress.toLowerCase() ? 'Sent' : 'Received'}
                    </p>
                    <p className="text-gray-400 text-sm">{formatAddress(tx.hash)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">{tx.value} ETH</p>
                  <p className="text-gray-400 text-sm">
                    {new Date(tx.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default WalletAnalyzer;
