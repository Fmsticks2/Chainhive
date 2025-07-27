
import React, { useState } from 'react';
import Header from '@/components/Header';
import DataTicker from '@/components/DataTicker';
import MultiChainPortfolio from '@/components/MultiChainPortfolio';
import ChainSelector from '@/components/ChainSelector';
import AlertManager from '@/components/AlertManager';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, TrendingUp, BarChart, Bell } from 'lucide-react';

const Portfolio = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedChains, setSelectedChains] = useState(['ethereum']);
  const [activeAddress, setActiveAddress] = useState('');

  const handleAnalyze = () => {
    if (walletAddress.trim()) {
      setActiveAddress(walletAddress.trim());
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Portfolio Dashboard</h1>
              <p className="text-gray-400">Multi-chain portfolio analysis and monitoring</p>
            </div>

            {/* Wallet Input */}
            <Card className="glass p-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter wallet address (0x... or r...)"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={!walletAddress.trim() || selectedChains.length === 0}
                  className="gradient-primary px-8"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Analyze
                </Button>
              </div>
            </Card>

            {/* Chain Selector */}
            <div className="mb-8">
              <ChainSelector
                selectedChains={selectedChains}
                onChainToggle={handleChainToggle}
              />
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="portfolio" className="w-full">
              <TabsList className="grid w-full grid-cols-3 glass mb-8">
                <TabsTrigger value="portfolio" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Portfolio Analysis
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart className="w-4 h-4" />
                  Advanced Analytics
                </TabsTrigger>
                <TabsTrigger value="alerts" className="flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  Alert Management
                </TabsTrigger>
              </TabsList>

              <TabsContent value="portfolio">
                <MultiChainPortfolio 
                  walletAddress={activeAddress}
                  selectedChains={selectedChains}
                />
              </TabsContent>

              <TabsContent value="analytics">
                <div className="space-y-6">
                  <Card className="glass p-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Advanced Analytics</h3>
                    <p className="text-gray-400 mb-4">
                      Deep dive into your portfolio performance with AI-powered insights
                    </p>
                    {activeAddress ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="glass p-4 rounded-lg">
                            <h4 className="font-medium text-white mb-2">Risk Assessment</h4>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-700 rounded-full h-2">
                                <div className="bg-gradient-to-r from-green-400 to-yellow-400 h-2 rounded-full" style={{ width: '65%' }}></div>
                              </div>
                              <span className="text-sm text-gray-400">6.5/10</span>
                            </div>
                          </div>
                          <div className="glass p-4 rounded-lg">
                            <h4 className="font-medium text-white mb-2">Diversification</h4>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-700 rounded-full h-2">
                                <div className="bg-gradient-to-r from-green-400 to-cyan-400 h-2 rounded-full" style={{ width: '72%' }}></div>
                              </div>
                              <span className="text-sm text-gray-400">7.2/10</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="glass p-4 rounded-lg">
                        <h4 className="font-medium text-white mb-3">AI Insights</h4>
                          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-3 rounded-lg border border-cyan-500/20">
                            {activeAddress ? (
                              <ul className="space-y-2 text-sm text-gray-200">
                                <li className="flex items-start gap-2">
                                  <span className="text-cyan-400 mt-1">•</span>
                                  <span>Portfolio analysis shows {selectedChains.length} active blockchain{selectedChains.length > 1 ? 's' : ''}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-cyan-400 mt-1">•</span>
                                  <span>Multi-chain presence detected across {selectedChains.join(', ')} networks</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-cyan-400 mt-1">•</span>
                                  <span>Cross-chain diversification reduces single-network dependency risk</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-cyan-400 mt-1">•</span>
                                  <span>Real-time monitoring active for portfolio value changes</span>
                                </li>
                              </ul>
                            ) : (
                              <ul className="space-y-2 text-sm text-gray-400">
                                <li className="flex items-start gap-2">
                                  <span className="text-gray-500 mt-1">•</span>
                                  <span>Connect wallet to receive personalized AI insights</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-gray-500 mt-1">•</span>
                                  <span>Analysis will include risk assessment and diversification metrics</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-gray-500 mt-1">•</span>
                                  <span>Get recommendations based on your portfolio composition</span>
                                </li>
                              </ul>
                            )}
                          </div>
                        </div>

                        <div className="glass p-4 rounded-lg">
                          <h4 className="font-medium text-white mb-3">Recommendations</h4>
                          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-3 rounded-lg border border-purple-500/20">
                            {activeAddress ? (
                              <ul className="space-y-2 text-sm text-gray-200">
                                <li className="flex items-start gap-2">
                                  <span className="text-purple-400 mt-1">•</span>
                                  <span>{selectedChains.length < 3 ? 'Consider diversifying across more blockchain networks' : 'Maintain current multi-chain strategy'}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-purple-400 mt-1">•</span>
                                  <span>Explore yield opportunities with your stablecoin holdings</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-purple-400 mt-1">•</span>
                                  <span>Monitor gas optimization strategies for {selectedChains.includes('ethereum') ? 'Ethereum' : 'active network'} transactions</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-purple-400 mt-1">•</span>
                                  <span>Set up alerts for significant portfolio value changes</span>
                                </li>
                              </ul>
                            ) : (
                              <ul className="space-y-2 text-sm text-gray-400">
                                <li className="flex items-start gap-2">
                                  <span className="text-gray-500 mt-1">•</span>
                                  <span>Connect wallet to receive personalized investment recommendations</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-gray-500 mt-1">•</span>
                                  <span>AI will suggest optimization strategies based on your holdings</span>
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-gray-500 mt-1">•</span>
                                  <span>Get alerts for market opportunities and risk management</span>
                                </li>
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400">Enter a wallet address to see advanced analytics</p>
                    )}
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="alerts">
                <AlertManager />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      
      <DataTicker />
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
};

export default Portfolio;
