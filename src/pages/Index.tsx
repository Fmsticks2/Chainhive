
import React, { useState } from 'react';
import Header from '@/components/Header';
import ChatInterface from '@/components/ChatInterface';
import Sidebar from '@/components/Sidebar';
import DataTicker from '@/components/DataTicker';
import WalletAnalyzer from '@/components/WalletAnalyzer';

const Index = () => {
  const [show

  
    
  
  WalletAnalyzer, setShowWalletAnalyzer] = useState(false);

  const handleWalletAnalyzerToggle = () => {
    setShowWalletAnalyzer(!showWalletAnalyzer);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex pt-20 pb-16">
        {/* Main Content Area */}
        <div className="flex-1 flex">
          <div className="flex-1 flex flex-col">
            {showWalletAnalyzer ? (
              <div className="p-6">
                <WalletAnalyzer />
              </div>
            ) : (
              <ChatInterface />
            )}
          </div>
          
          {/* Sidebar */}
          <div className="hidden lg:block">
            <Sidebar 
              onWalletAnalyzerToggle={handleWalletAnalyzerToggle}
              showWalletAnalyzer={showWalletAnalyzer}
            />
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

export default Index;
