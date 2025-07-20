import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Web3Service } from '../services/web3Service';

interface Web3AuthContextType {
  isConnected: boolean;
  userAddress: string | null;
  isLoading: boolean;
  error: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  web3Service: Web3Service;
}

const Web3AuthContext = createContext<Web3AuthContextType | undefined>(undefined);

export const useWeb3Auth = () => {
  const context = useContext(Web3AuthContext);
  if (context === undefined) {
    throw new Error('useWeb3Auth must be used within a Web3AuthProvider');
  }
  return context;
};

interface Web3AuthProviderProps {
  children: ReactNode;
}

export const Web3AuthProvider: React.FC<Web3AuthProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const web3Service = Web3Service.getInstance();

  const connectWallet = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const address = await web3Service.connectWallet();
      if (address) {
        setUserAddress(address);
        setIsConnected(true);
        localStorage.setItem('walletConnected', 'true');
        localStorage.setItem('userAddress', address);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      console.error('Wallet connection error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false);
    setUserAddress(null);
    setError(null);
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('userAddress');
  };

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const wasConnected = localStorage.getItem('walletConnected');
      const savedAddress = localStorage.getItem('userAddress');
      
      if (wasConnected && savedAddress && window.ethereum) {
        try {
          // Check if wallet is still connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0 && accounts[0].toLowerCase() === savedAddress.toLowerCase()) {
            setUserAddress(savedAddress);
            setIsConnected(true);
          } else {
            // Clear stale data
            disconnectWallet();
          }
        } catch (err) {
          console.error('Error checking wallet connection:', err);
          disconnectWallet();
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== userAddress) {
          setUserAddress(accounts[0]);
          localStorage.setItem('userAddress', accounts[0]);
        }
      };

      const handleChainChanged = () => {
        // Reload the page when chain changes to avoid state issues
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [userAddress]);

  const value: Web3AuthContextType = {
    isConnected,
    userAddress,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    web3Service,
  };

  return (
    <Web3AuthContext.Provider value={value}>
      {children}
    </Web3AuthContext.Provider>
  );
};

export default Web3AuthProvider;