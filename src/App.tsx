
import React from 'react';
import { Web3Provider } from '@/contexts/Web3Context';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import './App.css';

function App() {
  return (
    <Web3Provider>
      <div className="App">
        <Index />
        <Toaster />
      </div>
    </Web3Provider>
  );
}

export default App;
