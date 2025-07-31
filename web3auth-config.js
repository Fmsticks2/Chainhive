// Web3Auth Configuration Module
// Uses global Web3Auth objects loaded via CDN

// Access global Web3Auth objects with fallback
const getWeb3AuthObjects = () => {
  return {
    Web3Auth: window.Web3authModal?.Web3Auth,
    CHAIN_NAMESPACES: window.Web3authBase?.CHAIN_NAMESPACES,
    EthereumPrivateKeyProvider: window.Web3authEthereumProvider?.EthereumPrivateKeyProvider,
    OpenloginAdapter: window.Web3authOpenloginAdapter?.OpenloginAdapter
  };
};

// Web3Auth configuration - will be fetched from API
let clientId = null;

// Web3Auth instance will be created in initWeb3Auth
let web3auth = null;

// Initialize Web3Auth
export const initWeb3Auth = async () => {
  try {
    // Fetch Web3Auth configuration from API
    if (!clientId) {
      try {
        const response = await fetch('/api/config');
        if (!response.ok) {
          throw new Error('Failed to fetch Web3Auth configuration');
        }
        const config = await response.json();
        clientId = config.clientId;
      } catch (error) {
        console.error('Failed to fetch Web3Auth config:', error);
        throw new Error('Web3Auth configuration not available');
      }
    }

    // Get Web3Auth objects
    const { Web3Auth, CHAIN_NAMESPACES, EthereumPrivateKeyProvider, OpenloginAdapter } = getWeb3AuthObjects();
    
    // Check if Web3Auth objects are available
    if (!Web3Auth || !CHAIN_NAMESPACES || !EthereumPrivateKeyProvider || !OpenloginAdapter) {
      throw new Error('Web3Auth CDN scripts not loaded properly');
    }
    
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
    
    web3auth = new Web3Auth({
      clientId,
      web3AuthNetwork: 'sapphire_devnet', // Use devnet for testing
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
    if (!web3auth) {
      throw new Error('Web3Auth not initialized');
    }
    const provider = await web3auth.connect();
    return provider;
  } catch (error) {
    console.error('Wallet connection failed:', error);
    throw error;
  }
};

export const disconnectWallet = async () => {
  try {
    if (!web3auth) {
      throw new Error('Web3Auth not initialized');
    }
    await web3auth.logout();
    console.log('Wallet disconnected');
  } catch (error) {
    console.error('Wallet disconnection failed:', error);
    throw error;
  }
};

export const getUserInfo = async () => {
  try {
    if (!web3auth) {
      return null;
    }
    const userInfo = await web3auth.getUserInfo();
    return userInfo;
  } catch (error) {
    console.error('Failed to get user info:', error);
    return null;
  }
};

export const getProvider = () => {
  return web3auth ? web3auth.provider : null;
};

export const isConnected = () => {
  return web3auth ? web3auth.connected : false;
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