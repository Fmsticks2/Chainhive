
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Mic, Loader } from 'lucide-react';
import { CryptoService } from '@/services/cryptoService';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your Web3 AI assistant. I can help you analyze wallets, track tokens, explore NFTs, and understand blockchain data. What would you like to know?',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const cryptoService = CryptoService.getInstance();

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsTyping(true);

    // Generate AI response
    setTimeout(async () => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: await getAIResponse(currentInput),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // Vary response time
  };

  const getAIResponse = async (query: string): Promise<string> => {
    const lowercaseQuery = query.toLowerCase();
    
    // Wallet analysis
    if (lowercaseQuery.includes('analyze') && (lowercaseQuery.includes('wallet') || lowercaseQuery.includes('address'))) {
      const responses = [
        'I can help you analyze any Ethereum wallet! Please provide the wallet address (0x...) and I\'ll examine transaction history, token holdings, NFT collections, and DeFi positions.',
        'Wallet analysis is one of my specialties! Share the wallet address and I\'ll break down their portfolio, trading patterns, and recent activity.',
        'Ready to dive deep into wallet analytics! Provide the address and I\'ll show you holdings, transaction patterns, and risk assessment.'
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Token price queries
    if (lowercaseQuery.includes('price') || lowercaseQuery.includes('cost')) {
      const tokens = ['eth', 'btc', 'bitcoin', 'ethereum', 'link', 'uni', 'uniswap'];
      const mentionedToken = tokens.find(token => lowercaseQuery.includes(token));
      
      if (mentionedToken) {
        const symbol = mentionedToken === 'bitcoin' ? 'BTC' : 
                     mentionedToken === 'ethereum' ? 'ETH' :
                     mentionedToken === 'uniswap' ? 'UNI' : mentionedToken.toUpperCase();
        
        try {
          const analysis = cryptoService.getMarketAnalysis(symbol);
          const additionalInsights = [
            'Technical indicators suggest continued volatility.',
            'Market sentiment remains mixed with institutional interest growing.',
            'DeFi activity is influencing price movements.',
            'Layer 2 adoption is driving network usage.'
          ];
          
          return `${analysis}\n\n${additionalInsights[Math.floor(Math.random() * additionalInsights.length)]}`;
        } catch (error) {
          return `I'm having trouble fetching real-time data for ${symbol} right now. Please try again in a moment.`;
        }
      }
    }
    
    // Gas price queries
    if (lowercaseQuery.includes('gas') && !lowercaseQuery.includes('tracker')) {
      try {
        const networkData = await cryptoService.getNetworkData();
        const gasPrice = Math.round(networkData.gasPrice);
        const tips = [
          'Gas prices are typically lowest between 2-6 AM UTC.',
          'Consider using Layer 2 solutions like Arbitrum or Polygon for lower fees.',
          'Gas price prediction tools can help you time your transactions better.',
          'Setting a slightly lower gas price can save money if you\'re not in a hurry.'
        ];
        
        return `Current gas prices: Standard (~${gasPrice} gwei), Fast (~${gasPrice + 15} gwei), Instant (~${gasPrice + 30} gwei).\n\n💡 ${tips[Math.floor(Math.random() * tips.length)]}`;
      } catch (error) {
        return 'I\'m having trouble fetching current gas prices. The network might be experiencing high congestion.';
      }
    }
    
    // DeFi trends
    if (lowercaseQuery.includes('defi') || lowercaseQuery.includes('trends')) {
      const trends = [
        'Liquid staking derivatives are gaining massive traction with protocols like Lido leading the charge.',
        'Real-world asset (RWA) tokenization is emerging as a major narrative with traditional finance integration.',
        'Decentralized perps and derivatives trading is seeing explosive growth, challenging centralized exchanges.',
        'Cross-chain infrastructure and interoperability solutions are becoming critical for DeFi\'s next phase.',
        'Institutional DeFi adoption is accelerating with compliant protocols and regulatory clarity improving.'
      ];
      
      return `🔥 Latest DeFi Trends:\n\n${trends[Math.floor(Math.random() * trends.length)]}\n\nTotal Value Locked (TVL) has been fluctuating around $45-50B with Ethereum maintaining ~60% dominance despite Layer 2 growth.`;
    }
    
    // NFT queries
    if (lowercaseQuery.includes('nft') || lowercaseQuery.includes('opensea')) {
      const nftInsights = [
        'NFT market activity has stabilized with utility-focused projects gaining traction over pure speculation.',
        'Gaming NFTs and metaverse assets are showing renewed interest as gaming protocols mature.',
        'Creator royalties debate continues to shape marketplace dynamics and artist compensation.',
        'Ordinals and Bitcoin NFTs have created a new market segment worth monitoring.'
      ];
      
      return `📊 NFT Market Update:\n\n${nftInsights[Math.floor(Math.random() * nftInsights.length)]}\n\nI can help analyze specific NFT collections or wallet NFT holdings if you provide collection addresses!`;
    }
    
    // Default responses with variety
    const defaultResponses = [
      'I\'m here to help with Web3 analytics! I can analyze wallets, track token performance, explain DeFi protocols, monitor NFT collections, and provide market insights. What specific area interests you?',
      'Ready to dive into blockchain data! Whether you need wallet analysis, token research, gas optimization tips, or DeFi strategy advice, I\'ve got you covered. What would you like to explore?',
      'Your Web3 research assistant at your service! I specialize in on-chain analysis, market trends, protocol comparisons, and portfolio insights. What can I help you discover today?',
      'Let\'s explore the blockchain together! I can provide real-time market data, analyze transaction patterns, explain complex DeFi mechanics, or help you understand any Web3 concept. What\'s on your mind?'
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    // Automatically send the quick action
    setTimeout(() => handleSend(), 100);
  };

  const quickActions = [
    'Analyze my wallet',
    'Check ETH price trends',
    'Latest DeFi opportunities',
    'Current gas prices',
    'NFT market update',
    'Top gainers today'
  ];

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-4 rounded-2xl ${
                message.type === 'user'
                  ? 'gradient-primary text-white'
                  : 'glass text-gray-100'
              }`}
            >
              {message.type === 'ai' && (
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 rounded-full gradient-secondary mr-2"></div>
                  <span className="text-sm text-cyan-400 font-medium">Web3 AI</span>
                </div>
              )}
              <p className="leading-relaxed whitespace-pre-line">{message.content}</p>
              <p className="text-xs opacity-60 mt-2">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="glass p-4 rounded-2xl">
              <div className="flex items-center space-x-2">
                <Loader className="w-4 h-4 animate-spin text-cyan-400" />
                <span className="text-gray-300">AI is analyzing blockchain data...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {quickActions.map((action) => (
            <Badge
              key={action}
              variant="secondary"
              className="glass cursor-pointer hover:bg-white/20 transition-colors"
              onClick={() => handleQuickAction(action)}
            >
              {action}
            </Badge>
          ))}
        </div>

        {/* Input Area */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center space-x-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about wallets, tokens, NFTs, DeFi protocols, or market trends..."
              className="flex-1 bg-transparent border-none text-white placeholder-gray-400 focus:ring-0"
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-cyan-400">
              <Mic className="w-5 h-5" />
            </Button>
            <Button 
              onClick={handleSend}
              className="gradient-primary hover:opacity-90 transition-opacity"
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
