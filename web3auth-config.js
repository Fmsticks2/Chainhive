// Web3Auth Configuration Module
// This replaces the CDN-loaded Web3Auth library

import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { OpenloginAdapter } from '@web3auth/openlogin-adapter';

// Web3Auth configuration
const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID || 'BPi5PB_UiIZ-cPz1GtV5i1I2iOSOHuimiXBI0e-Oe_u6X3oVAbCiAZOTEBtTXw4tsluTITPqA8zMsfxIKMjiqNQ';

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: '0x1', // Ethereum Mainnet
  rpcTarget: 'https://rpc.ankr.com/eth',
  displayName: 'Ethereum Mainnet',
  blockExplorer: 'https://etherscan.io',
  ticker: 'ETH',
  tickerName: 'Ethereum',
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

const web3auth = new Web3Auth({
  clientId,
  web3AuthNetwork: 'sapphire_mainnet', // Use 'testnet' for testing
  privateKeyProvider,
  uiConfig: {
    appName: 'ChainHive',
    appUrl: 'https://chainhive.io',
    logoLight: 'https://chainhive.io/logo-light.png',
    logoDark: 'https://chainhive.io/logo-dark.png',
    defaultLanguage: 'en',
    mode: 'auto',
    theme: {
      primary: '#667eea',
    },
  },
});

const openloginAdapter = new OpenloginAdapter({
  adapterSettings: {
    uxMode: 'popup',
    whiteLabel: {
      appName: 'ChainHive',
      appUrl: 'https://chainhive.io',
      logoLight: 'https://chainhive.io/logo-light.png',
      logoDark: 'https://chainhive.io/logo-dark.png',
    },
  },
});

web3auth.configureAdapter(openloginAdapter);

// Initialize Web3Auth
export const initWeb3Auth = async () => {
  try {
    await web3auth.init();
    console.log('Web3Auth initialized successfully');
    return web3auth;
  } catch (error) {
    console.error('Web3Auth initialization failed:', error);
    throw error;
  }
};

// Export Web3Auth instance
export { web3auth };

// Helper functions
export const connectWallet = async () => {
  try {
    const provider = await web3auth.connect();
    return provider;
  } catch (error) {
    console.error('Wallet connection failed:', error);
    throw error;
  }
};

export const disconnectWallet = async () => {
  try {
    await web3auth.logout();
    console.log('Wallet disconnected');
  } catch (error) {
    console.error('Wallet disconnection failed:', error);
    throw error;
  }
};

export const getUserInfo = async () => {
  try {
    const userInfo = await web3auth.getUserInfo();
    return userInfo;
  } catch (error) {
    console.error('Failed to get user info:', error);
    return null;
  }
};

export const getProvider = () => {
  return web3auth.provider;
};

export const isConnected = () => {
  return web3auth.connected;
};

// Fallback for environments where Web3Auth modules are not available
export const createFallbackWeb3Auth = () => {
  console.warn('Web3Auth modules not available, using fallback');
  
  return {
    init: async () => {
      console.log('Fallback Web3Auth initialized');
      return true;
    },
    connect: async () => {
      throw new Error('Web3Auth not available. Please use a supported browser or enable required permissions.');
    },
    logout: async () => {
      console.log('Fallback logout');
    },
    getUserInfo: async () => {
      return null;
    },
    connected: false,
    provider: null,
  };
};