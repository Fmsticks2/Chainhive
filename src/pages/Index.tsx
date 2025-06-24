
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
    const success = await telegramService.sendMessage(telegramChatId, "🤖 Web3 AI Assistant connected successfully!");
    
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
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-white mb-4 animate-fade-in">
                Web3 AI Assistant
              </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                Your intelligent companion for blockchain analysis, portfolio management, and Web3 insights powered by Nodit MCP
              </p>
              
              {/* Voice Control */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <Button
                  onClick={toggleVoiceListening}
                  className={`${isListening ? 'bg-red-500 hover:bg-red-600' : 'gradient-primary'} px-6 py-3`}
                  disabled={!voiceService.isSupported()}
                >
                  <Bot className="w-5 h-5 mr-2" />
                  {isListening ? 'Stop Listening' : 'Voice Control'}
                </Button>
                {isListening && (
                  <Badge variant="secondary" className="animate-pulse bg-red-500/20 text-red-400">
                    🎤 Listening...
                  </Badge>
                )}
              </div>
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="grid w-full grid-cols-4 glass mb-8">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  AI Chat
                </TabsTrigger>
                <TabsTrigger value="analyzer" className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  Wallet Analyzer
                </TabsTrigger>
                <TabsTrigger value="telegram" className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Telegram
                </TabsTrigger>
                <TabsTrigger value="farcaster" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
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
                    
                    <Button onClick={setupTelegramBot} className="gradient-primary w-full">
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
                    
                    <Button onClick={testFarcasterIntegration} className="gradient-primary w-full">
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
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  );
};

export default Index;
