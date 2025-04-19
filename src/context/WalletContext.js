import { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert("MetaMask is not installed.");
      return;
    }

    try {
      const ethProvider = new ethers.BrowserProvider(window.ethereum);
      const ethSigner = await ethProvider.getSigner();
      const address = await ethSigner.getAddress();

      setWalletAddress(address);
      setSigner(ethSigner);
      setProvider(ethProvider);
    } catch (err) {
      console.error("Wallet connection failed:", err.message);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        connectWallet();
      });
    }
  }, []);

  return (
    <WalletContext.Provider value={{ walletAddress, signer, provider, connectWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);