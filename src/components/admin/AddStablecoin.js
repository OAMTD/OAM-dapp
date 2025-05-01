'use client';

import { writeContract, getWalletClient } from '@wagmi/core';
import { useAccount } from 'wagmi';
import BlindRoscaABI from '../../abi/BlindRoscaABI';

const roscaAddress = process.env.NEXT_PUBLIC_ROSCA_PROXY_ADDRESS;
const ADMIN_ADDRESS = process.env.NEXT_PUBLIC_ADMIN_ADDRESS; // Stored securely in .env

export default function AddStablecoin() {
  const { address, isConnected } = useAccount();

  async function addStablecoin() {
    if (!isConnected || !window.ethereum) {
      alert('Please connect your wallet first.');
      return;
    }

    // Admin check (prevent unnecessary contract call)
    if (address.toLowerCase() !== ADMIN_ADDRESS?.toLowerCase()) {
      alert('Unauthorized: Only admin can add stablecoins.');
      return;
    }

    const stablecoinAddress = prompt('Paste the stablecoin address (e.g., USDC address)');
    if (!stablecoinAddress) {
      alert('No address entered.');
      return;
    }

    try {
      const walletClient = await getWalletClient();
      if (!walletClient) {
        alert('Wallet client not available.');
        return;
      }

      const txHash = await writeContract({
        address: roscaAddress,
        abi: BlindRoscaABI,
        functionName: 'addStablecoin',
        args: [stablecoinAddress],
        account: address,
      });

      alert('Transaction submitted: ' + txHash);
    } catch (error) {
      console.error(error);
      alert('Error adding stablecoin: ' + (error?.shortMessage || error?.message || 'Unknown error'));
    }
  }

  return (
    <div>
      <button onClick={addStablecoin}>
        Add Stablecoin (Admin Only)
      </button>
    </div>
  );
}
