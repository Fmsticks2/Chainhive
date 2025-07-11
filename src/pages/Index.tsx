
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import DataTicker from '@/components/DataTicker';
import ChatInterface from '@/components/ChatInterface';
import WalletAnalyzer from '@/components/WalletAnalyzer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Wallet, TrendingUp, Bot, Send, Users } from 'lucide-react';
import { VoiceService, VoiceCommand } from '@/services/voiceService';
import { TelegramService } from '@/services/telegramService';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [isListening, setIsListening] = useState(false);
  const [telegramBotToken, setTelegramBotToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [farcasterApiKey, setFarcasterApiKey] = useState('');
  const { toast } = useToast();
  
  const voiceService = VoiceService.getInstance();
  const telegramService = TelegramService.getInstance();

  useEffect(() => {
    const unsubscribe = voiceService.subscribe(handleVoiceCommand);
    return unsubscribe;
  }, []);

  const handleVoiceCommand = (command: VoiceCommand) => {
    console.log('Voice command received:', command);
    
    if (command.intent === 'analyze' && command.entities.wallet) {
      toast({
        title: "Voice Command Detected",
        description: `Analyzing wallet: ${command.entities.wallet}`,
      });
    }
  };

  const toggleVoiceListening = async () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      const started = await voiceService.startListening();
      if (started) {
        setIsListening(true);
        toast({
          title: "Voice Input Active",
          description: "Listening for commands...",
        });
      } else {
        toast({
          title: "Voice Input Failed",
          description: "Could not start voice recognition",
          variant: "destructive"
        });
      }
    }
  };

  const setupTelegramBot = async () => {
    if (!telegramBotToken || !telegramChatId) {
      toast({
        title: "Missing Information",
        description: "Please enter both bot token and chat ID",
        variant: "destructive"
      });
      return;
    }

    telegramService.setBotToken(telegramBotToken);
    const success = await telegramService.sendMessage(Number(telegramChatId), "🤖 Web3 AI Assistant connected successfully!");
    
    if (success) {
      toast({
        title: "Telegram Connected",
        description: "Bot is now active and ready to send alerts",
      });
    } else {
      toast({
        title: "Connection Failed",
        description: "Could not connect to Telegram. Check your credentials.",
        variant: "destructive"
      });
    }
  };

  const testFarcasterIntegration = () => {
    if (!farcasterApiKey) {
      toast({
        title: "Missing API Key",
        description: "Please enter your Farcaster API key",
        variant: "destructive"
      });
      return;
    }

    // Mock Farcaster integration
    toast({
      title: "Farcaster Connected",
      description: "Ready to post portfolio updates to Farcaster",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-20 pb-16">
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16 relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-96 h-96 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl animate-pulse-glow"></div>
              </div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-subtle mb-6 text-sm font-medium">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                  Powered by Nodit Infrastructure
                </div>
                
                <h1 className="text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
                  <span className="text-gradient">ChainHive</span>
                </h1>
                
                <h2 className="text-2xl lg:text-3xl font-semibold text-muted-foreground mb-8">
                  Web3 AI Assistant
                </h2>
                
                <p className="text-xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
                  Your intelligent companion for blockchain analysis, portfolio management, and Web3 insights. 
                  Built on cutting-edge AI technology with multi-chain support and advanced analytics.
                </p>
                
                <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass-subtle">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Multi-Chain Support</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass-subtle">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">AI-Powered Analysis</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg glass-subtle">
                    <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Real-time Alerts</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Voice Control */}
            <div className="flex items-center justify-center gap-6 mb-12">
                <Button
                  onClick={toggleVoiceListening}
                  size="xl"
                  variant={isListening ? 'destructive' : 'gradient'}
                  disabled={!voiceService.isSupported()}
                >
                  <Bot className="w-6 h-6 mr-3" />
                  {isListening ? 'Stop Listening' : 'Voice Control'}
                </Button>
                
                {isListening && (
                  <div className="flex items-center gap-3 px-6 py-3 rounded-full glass-strong animate-pulse-glow">
                    <div className="flex space-x-1">
                      <div className="w-2 h-6 bg-destructive rounded-full animate-pulse"></div>
                      <div className="w-2 h-4 bg-destructive/70 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-8 bg-destructive rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-3 bg-destructive/70 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                    <span className="text-lg font-medium text-destructive">Listening...</span>
                  </div>
                )}
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="grid w-full grid-cols-4 glass-strong mb-12 p-2 h-auto">
                <TabsTrigger 
                  value="chat" 
                  className="flex items-center gap-3 px-6 py-4 text-base font-medium transition-all duration-300 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  AI Chat
                </TabsTrigger>
                <TabsTrigger 
                  value="analyzer" 
                  className="flex items-center gap-3 px-6 py-4 text-base font-medium transition-all duration-300 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg"
                >
                  <Wallet className="w-5 h-5" />
                  Wallet Analyzer
                </TabsTrigger>
                <TabsTrigger 
                  value="telegram" 
                  className="flex items-center gap-3 px-6 py-4 text-base font-medium transition-all duration-300 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg"
                >
                  <Send className="w-5 h-5" />
                  Telegram
                </TabsTrigger>
                <TabsTrigger 
                  value="farcaster" 
                  className="flex items-center gap-3 px-6 py-4 text-base font-medium transition-all duration-300 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg"
                >
                  <Users className="w-5 h-5" />
                  Farcaster
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat">
                <ChatInterface />
              </TabsContent>

              <TabsContent value="analyzer">
                <WalletAnalyzer />
              </TabsContent>

              <TabsContent value="telegram">
                <Card className="glass p-6">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <Send className="w-6 h-6 mr-3 text-blue-400" />
                    Telegram Bot Integration
                  </h2>
                  <p className="text-gray-400 mb-6">
                    Set up your Telegram bot to receive portfolio alerts and notifications directly in your chat.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bot Token
                      </label>
                      <Input
                        type="password"
                        value={telegramBotToken}
                        onChange={(e) => setTelegramBotToken(e.target.value)}
                        placeholder="Enter your Telegram bot token"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Chat ID
                      </label>
                      <Input
                        value={telegramChatId}
                        onChange={(e) => setTelegramChatId(e.target.value)}
                        placeholder="Enter your chat ID"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    
                    <Button onClick={setupTelegramBot} variant="gradient" className="w-full">
                      Connect Telegram Bot
                    </Button>
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <h4 className="font-medium text-blue-400 mb-2">Setup Instructions:</h4>
                    <ol className="text-sm text-gray-300 space-y-1">
                      <li>1. Message @BotFather on Telegram to create a new bot</li>
                      <li>2. Copy the bot token provided by BotFather</li>
                      <li>3. Start a chat with your bot and send any message</li>
                      <li>4. Visit https://api.telegram.org/bot[TOKEN]/getUpdates to get your chat ID</li>
                      <li>5. Enter both values above and click Connect</li>
                    </ol>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="farcaster">
                <Card className="glass p-6">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
                    <Users className="w-6 h-6 mr-3 text-purple-400" />
                    Farcaster Integration
                  </h2>
                  <p className="text-gray-400 mb-6">
                    Connect your Farcaster account to share portfolio insights and updates with your network.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Farcaster API Key
                      </label>
                      <Input
                        type="password"
                        value={farcasterApiKey}
                        onChange={(e) => setFarcasterApiKey(e.target.value)}
                        placeholder="Enter your Farcaster API key"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                    </div>
                    
                    <Button onClick={testFarcasterIntegration} variant="gradient" className="w-full">
                      Connect Farcaster
                    </Button>
                  </div>
                  
                  <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <h4 className="font-medium text-purple-400 mb-2">Coming Soon:</h4>
                    <ul className="text-sm text-gray-300 space-y-1">
                      <li>• Auto-post portfolio performance updates</li>
                      <li>• Share interesting wallet discoveries</li>
                      <li>• Alert followers about market opportunities</li>
                      <li>• Create frames for interactive portfolio views</li>
                    </ul>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <DataTicker />
      
      {/* Enhanced Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-1/6 right-1/3 w-48 h-48 bg-primary/8 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-accent/8 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
        
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02] animate-grid-move"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 210, 255, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 210, 255, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        ></div>
        
        {/* Geometric shapes */}
        <div className="absolute top-1/3 right-1/6 w-4 h-4 border border-primary/30 rotate-45 animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-1/3 left-1/6 w-6 h-6 border border-accent/30 rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-2/3 right-1/3 w-3 h-8 bg-primary/20 rounded-full animate-float" style={{ animationDelay: '2.5s' }}></div>
      </div>
    </div>
  );
};

export default Index;
