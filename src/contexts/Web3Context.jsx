import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppKitProvider, useAppKit } from '@reown/appkit';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { createConfig, configureChains, mainnet, polygon, optimism, arbitrum } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { InjectedConnector } from 'wagmi/connectors/injected';

// Configure chains & providers
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [mainnet, polygon, optimism, arbitrum],
  [publicProvider()]
);

// Set up wagmi config
const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Get from https://cloud.walletconnect.com
      },
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'ChainHive',
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

const Web3Context = createContext();

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

const Web3ProviderContent = ({ children }) => {
  const { connect, disconnect, isConnected, isConnecting, account, chainId, error } = useAppKit();

  const value = {
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

export const Web3Provider = ({ children }) => {
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