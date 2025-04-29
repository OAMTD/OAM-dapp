import { useEffect, useState } from "react";
import AddStablecoin from "../components/admin/AddStablecoin";

export default function AdminPage() {
  const [walletConnected, setWalletConnected] = useState(false);

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        if (accounts.length > 0) {
          setWalletConnected(true);
        }
      } catch (err) {
        console.error("Wallet connection failed", err);
      }
    } else {
      console.error("No wallet found");
    }
  }

  useEffect(() => {
    connectWallet(); // Connect wallet when page loads
  }, []);

  return (
    <div>
      {walletConnected ? (
        <AddStablecoin />
      ) : (
        <p>Please connect your wallet to access <strong>Admin Panel</strong>.</p>
      )}
    </div>
  );
}