
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, TrendingDown, ArrowUp, ArrowDown } from 'lucide-react';
import { MultiChainService, WalletPortfolio, TransactionData } from '@/services/multiChainService';
import ChainSelector from './ChainSelector';

const WalletAnalyzer = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedChains, setSelectedChains] = useState(['ethereum']);
  const [portfolio, setPortfolio] = useState<WalletPortfolio | null>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const multiChainService = MultiChainService.getInstance();

  const handleAnalyze = async () => {
    if (!walletAddress.trim()) {
      setError('Please enter a wallet address');
      return;
    }

    // Validate address for at least one selected chain
    const isValidForAnyChain = selectedChains.some(chain => 
      multiChainService.isValidAddress(walletAddress, chain)
    );

    if (!isValidForAnyChain) {
      setError('Invalid wallet address for selected networks');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const portfolioData = await multiChainService.analyzeWallet(walletAddress, selectedChains);
      setPortfolio(portfolioData);

      // Get transactions from the first selected chain
      const txData = await multiChainService.getTransactionHistory(walletAddress, selectedChains[0]);
      setTransactions(txData);
    } catch (err) {
      setError('Failed to analyze wallet. Please try again.');
      console.error('Wallet analysis error:', err);
    } finally {
      setIsLoading(false);
    }
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
            <Input
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Enter wallet address (0x... or r...)"
              className="bg-gray-800 border-gray-600 text-white"
            />
            {error && (
              <p className="text-red-400 text-sm mt-1">{error}</p>
            )}
          </div>
          
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || selectedChains.length === 0}
            className="gradient-primary w-full"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Wallet'}
          </Button>
        </div>
      </Card>

      {/* Chain Selector */}
      <ChainSelector
        selectedChains={selectedChains}
        onChainToggle={handleChainToggle}
      />

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
                    tx.type === 'receive' ? 'bg-green-500/20' : 'bg-red-500/20'
                  }`}>
                    {tx.type === 'receive' ? (
                      <ArrowDown className="w-4 h-4 text-green-400" />
                    ) : (
                      <ArrowUp className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium capitalize">{tx.type}</p>
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
