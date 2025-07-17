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
import { MessageCircle, Wallet, TrendingUp, Bot, Send, Users, Mic, MicOff } from 'lucide-react';
import { VoiceService, VoiceCommand } from '@/services/voiceService';
import { TelegramService } from '@/services/telegramService';
import Web3Integration from '@/components/Web3Integration';
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
            <div className="text-center mb-20 relative">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[600px] bg-gradient-to-r from-primary/15 to-accent/15 rounded-full blur-3xl animate-pulse-glow"></div>
              </div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full glass-strong mb-8 text-sm font-medium border border-primary/20">
                  <div className="relative">
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse block"></span>
                    <span className="absolute inset-0 w-2 h-2 bg-primary rounded-full animate-ping opacity-75"></span>
                  </div>
                  <span className="text-primary font-semibold">Powered by Nodit Infrastructure</span>
                  <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">Live</Badge>
                </div>
                
                <h1 className="text-5xl md:text-6xl lg:text-8xl font-bold mb-8 animate-fade-in">
                  <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-shimmer">
                    ChainHive
                  </span>
                </h1>
                
                <h2 className="text-xl md:text-2xl lg:text-4xl font-semibold text-muted-foreground mb-6">
                  Next-Generation Web3 AI Assistant
                </h2>
                
                <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-4xl mx-auto leading-relaxed">
                  Unlock the power of blockchain with intelligent analysis, real-time insights, and seamless multi-chain portfolio management. 
                  Experience the future of Web3 analytics powered by advanced AI technology.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12">
                  <div className="flex items-center gap-3 px-6 py-4 rounded-xl glass-strong border border-green-400/20">
                    <div className="relative">
                      <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping opacity-50"></div>
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-semibold text-green-400 block">Multi-Chain</span>
                      <span className="text-xs text-gray-400">15+ Networks</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 rounded-xl glass-strong border border-blue-400/20">
                    <div className="relative">
                      <div className="w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-50"></div>
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-semibold text-blue-400 block">AI-Powered</span>
                      <span className="text-xs text-gray-400">Smart Analysis</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-6 py-4 rounded-xl glass-strong border border-purple-400/20">
                    <div className="relative">
                      <div className="w-4 h-4 bg-purple-400 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-4 h-4 bg-purple-400 rounded-full animate-ping opacity-50"></div>
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-semibold text-purple-400 block">Real-time</span>
                      <span className="text-xs text-gray-400">Live Alerts</span>
                    </div>
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
                  className={`transition-all duration-500 ${isListening ? 'animate-pulse shadow-red-500/25' : 'shadow-primary/25'} hover:scale-105 active:scale-95`}
                >
                  {isListening ? (
                    <MicOff className="w-6 h-6 mr-3" />
                  ) : (
                    <Mic className="w-6 h-6 mr-3" />
                  )}
                  {isListening ? 'Stop Listening' : 'Voice Control'}
                </Button>
                
                {isListening && (
                  <div className="flex items-center gap-4 px-8 py-4 rounded-2xl glass-strong animate-pulse-glow border border-red-400/30 backdrop-blur-xl">
                    <div className="flex space-x-1">
                      <div className="w-3 h-8 bg-red-400 rounded-full animate-pulse"></div>
                      <div className="w-3 h-6 bg-red-400/70 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-3 h-10 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-3 h-4 bg-red-400/70 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                      <div className="w-3 h-7 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-4 h-4 bg-red-400 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 w-4 h-4 bg-red-400 rounded-full animate-ping opacity-75"></div>
                      </div>
                      <span className="text-lg font-semibold text-red-400">Listening for commands...</span>
                    </div>
                  </div>
                )}
            </div>

            {/* Main Content Tabs */}
            <div className="glass-strong rounded-3xl p-8 md:p-12 mb-20 border border-white/10">
              <Tabs defaultValue="chat" className="w-full">
                <TabsList className="grid w-full grid-cols-5 bg-black/20 p-2 rounded-2xl border border-white/10 mb-12 h-auto">
                  <TabsTrigger 
                    value="chat" 
                    className="flex items-center gap-3 px-4 md:px-6 py-4 text-sm md:text-base font-medium transition-all duration-300 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:border-primary/30 rounded-xl"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="hidden sm:inline">AI Chat</span>
                    <span className="sm:hidden">AI</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="analyzer" 
                    className="flex items-center gap-3 px-4 md:px-6 py-4 text-sm md:text-base font-medium transition-all duration-300 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:border-primary/30 rounded-xl"
                  >
                    <Wallet className="w-5 h-5" />
                    <span className="hidden sm:inline">Wallet Analyzer</span>
                    <span className="sm:hidden">Analyzer</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="telegram" 
                    className="flex items-center gap-3 px-4 md:px-6 py-4 text-sm md:text-base font-medium transition-all duration-300 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:border-primary/30 rounded-xl"
                  >
                    <Send className="w-5 h-5" />
                    <span className="hidden sm:inline">Telegram</span>
                    <span className="sm:hidden">TG</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="farcaster" 
                    className="flex items-center gap-3 px-4 md:px-6 py-4 text-sm md:text-base font-medium transition-all duration-300 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:border-primary/30 rounded-xl"
                  >
                    <Users className="w-5 h-5" />
                    <span className="hidden sm:inline">Farcaster</span>
                    <span className="sm:hidden">FC</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="web3" 
                    className="flex items-center gap-3 px-4 md:px-6 py-4 text-sm md:text-base font-medium transition-all duration-300 data-[state=active]:bg-primary/20 data-[state=active]:text-primary data-[state=active]:shadow-lg data-[state=active]:border-primary/30 rounded-xl"
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span className="hidden sm:inline">Web3</span>
                    <span className="sm:hidden">W3</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="mt-8">
                  <div className="glass-subtle rounded-2xl p-6 border border-white/5">
                    <ChatInterface />
                  </div>
                </TabsContent>
                
                <TabsContent value="analyzer" className="mt-8">
                  <div className="glass-subtle rounded-2xl p-6 border border-white/5">
                    <WalletAnalyzer />
                  </div>
                </TabsContent>
                
                <TabsContent value="web3" className="mt-8">
                  <div className="glass-subtle rounded-2xl p-6 border border-white/5">
                    <Web3Integration />
                  </div>
                </TabsContent>

                <TabsContent value="telegram" className="mt-8">
                  <div className="glass-subtle rounded-2xl p-8 border border-white/5">
                    <div className="text-center mb-10">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/30 mb-6">
                        <Send className="w-8 h-8 text-blue-400" />
                      </div>
                      <h3 className="text-3xl font-bold mb-4 text-gradient">Telegram Integration</h3>
                      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Connect your Telegram bot to receive real-time alerts and interact with ChainHive seamlessly.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="glass-strong p-8 rounded-2xl border border-blue-500/20">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <Bot className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold">Bot Setup</h4>
                            <p className="text-sm text-blue-400">Quick & Easy</p>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-6">
                          Start a conversation with our intelligent Telegram bot to receive personalized alerts and portfolio updates.
                        </p>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                          <Send className="w-4 h-4 mr-2" />
                          Start Bot
                        </Button>
                      </div>
                      
                      <div className="glass-strong p-8 rounded-2xl border border-purple-500/20">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-purple-400" />
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold">Alert Settings</h4>
                            <p className="text-sm text-purple-400">Customizable</p>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-6">
                          Configure which alerts you want to receive via Telegram for optimal portfolio monitoring.
                        </p>
                        <Button variant="outline" className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
                          Configure Alerts
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="farcaster" className="mt-8">
                  <div className="glass-subtle rounded-2xl p-8 border border-white/5">
                    <div className="text-center mb-10">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/20 border border-purple-500/30 mb-6">
                        <Users className="w-8 h-8 text-purple-400" />
                      </div>
                      <h3 className="text-3xl font-bold mb-4 text-gradient">Farcaster Integration</h3>
                      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Share your portfolio insights and connect with the Web3 community on Farcaster.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="glass-strong p-8 rounded-2xl border border-green-500/20">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <Users className="w-6 h-6 text-green-400" />
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold">Connect Account</h4>
                            <p className="text-sm text-green-400">Social Web3</p>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-6">
                          Link your Farcaster account to share insights and discoveries with the decentralized social network.
                        </p>
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                          <Users className="w-4 h-4 mr-2" />
                          Connect Farcaster
                        </Button>
                      </div>
                      
                      <div className="glass-strong p-8 rounded-2xl border border-orange-500/20">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                            <Send className="w-6 h-6 text-orange-400" />
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold">Share Insights</h4>
                            <p className="text-sm text-orange-400">Auto-Share</p>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-6">
                          Automatically share your best portfolio insights and market discoveries with your followers.
                        </p>
                        <Button variant="outline" className="w-full border-orange-500/30 text-orange-400 hover:bg-orange-500/10">
                          Configure Sharing
                        </Button>
                      </div>
                    </div>
                  </div>
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