
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send, Mic, Loader } from 'lucide-react';

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

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: getAIResponse(input),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const getAIResponse = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    
    if (lowercaseQuery.includes('analyze') && lowercaseQuery.includes('wallet')) {
      return 'I can help you analyze any wallet! Please provide the wallet address you\'d like me to examine. I\'ll show you transaction history, token holdings, NFT collections, and DeFi positions.';
    } else if (lowercaseQuery.includes('eth') && lowercaseQuery.includes('price')) {
      return 'Current ETH price is $2,345.67 (+5.2% in 24h). The price has been trending upward with strong support at $2,300. Would you like me to analyze price predictions or historical data?';
    } else if (lowercaseQuery.includes('defi') || lowercaseQuery.includes('trends')) {
      return 'Latest DeFi trends show increased activity in liquid staking protocols and real-world asset tokenization. TVL has grown 15% this month, with Ethereum maintaining 60% dominance. Notable protocols include Lido, Aave, and Uniswap V4 preparations.';
    } else if (lowercaseQuery.includes('gas')) {
      return 'Current gas prices: Standard (32 gwei), Fast (45 gwei), Instant (60 gwei). Gas has been relatively stable today. Best time to transact is typically between 2-6 AM UTC for lower fees.';
    } else {
      return 'I\'m analyzing the blockchain data for you. Based on your query, I can provide insights about wallets, tokens, DeFi protocols, NFTs, and market trends. What specific aspect would you like me to focus on?';
    }
  };

  const handleQuickAction = (action: string) => {
    setInput(action);
    // Automatically send the quick action
    setTimeout(() => handleSend(), 100);
  };

  const quickActions = [
    'Analyze my wallet',
    'Check ETH price',
    'Latest DeFi trends',
    'Gas tracker'
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
              <p className="leading-relaxed">{message.content}</p>
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
                <span className="text-gray-300">AI is thinking...</span>
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
              placeholder="Ask about wallets, tokens, NFTs, or DeFi protocols..."
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
