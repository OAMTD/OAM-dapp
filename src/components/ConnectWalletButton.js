"use client";

import { useState } from "react";
import { ethers } from "ethers";

export default function ConnectWalletButton({ setSigner, setWalletAddress, walletAddress }) {
    const [isConnecting, setIsConnecting] = useState(false);
    

  async function connectWallet() {
    try {
      if (!window.ethereum) {
        alert("MetaMask is not installed!");
        return;
      }
      
      setIsConnecting(true);

      const provider = new ethers.BrowserProvider(window.ethereum);

      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      setWalletAddress(address);
      setSigner(signer);
    } catch (error) {
      console.error("Wallet connection error:", error);
    } finally {
       setIsConnecting(false); 
    }
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      style={{
        padding: "10px 20px",
        fontSize: "18px",
        margin: "20px",
        backgroundColor: walletAddress ? "gray" : "#4F46E5",
        color: "white",
        borderRadius: "8px",
        cursor: walletAddress ? "not-allowed" : "pointer",
      }}
    >
      {walletAddress
        ? `Connected: ${walletAddress.substring(0, 6)}...${walletAddress.slice(-4)}`
        : isConnecting
        ? "Connecting..."
        :"Connect Wallet"}
    </button>
  );
}