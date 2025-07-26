import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppKitProvider, useAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { createConfig, http } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { metaMask, walletConnect, coinbaseWallet, injected } from 'wagmi/connectors';

// Set up wagmi config
const config = createConfig({
  chains: [mainnet, polygon, optimism, arbitrum],
  connectors: [
    metaMask(),
    walletConnect({
      projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Get from https://cloud.walletconnect.com
    }),
    coinbaseWallet({
      appName: 'ChainHive',
    }),
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
  },
});

interface Web3ContextType {
  account: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => void;
  disconnect: () => void;
  error: string | null;
  chainId: number | null;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

const Web3ProviderContent: React.FC<Web3ProviderProps> = ({ children }) => {
  const { connect, disconnect, isConnected, isConnecting, account, chainId, error } = useAppKit();

  const value: Web3ContextType = {
    account: account?.address || null,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    error: error?.message || null,
    chainId: chainId || null,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
};

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  return (
    <AppKitProvider
      config={config}
      adapter={WagmiAdapter}
      theme={{
        mode: 'dark',
        accentColor: '#667eea',
        borderRadius: 'medium',
      }}
    >
      <Web3ProviderContent>{children}</Web3ProviderContent>
    </AppKitProvider>
  );
}; 