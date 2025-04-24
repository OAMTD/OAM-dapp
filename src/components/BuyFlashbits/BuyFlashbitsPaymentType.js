
'use client';

import { useState } from 'react';
import { parseUnits } from 'viem';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { erc20Abi } from '../../abi/erc20Abi.js';
import  oamTokenAbi  from '../../abi/oamTokendao_abi.js';
import { MyStyledConnectButton } from '../MyStyledConnectButton';

const FLASHBITS_PHASES = [
  { phase: 1, price: 0.0001001, cap: 250000 },
  { phase: 2, price: 0.000125, cap: 750000 },
];

const BuyFlashbitsPaymentType = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [selectedPhase, setSelectedPhase] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  const handleBuy = async () => {
    if (!walletClient || !address) {
      alert('Connect your wallet first.');
      return;
    }

    setLoading(true);
    try {
      const flashInfo = FLASHBITS_PHASES.find(p => p.phase === selectedPhase);
      const totalUsd = flashInfo.price * quantity;
      const rawAmount = BigInt(quantity);
      const ethValue = parseUnits(totalUsd.toString(), 18); // Assuming ETH payment

      const tx = await walletClient.writeContract({
        address: contractAddress,
        abi: oamTokenAbi,
        functionName: 'sellFlashbitsAdvanced',
        args: [rawAmount, "MATIC"],
        value: ethValue
      });

      setTxHash(tx);
    } catch (err) {
      console.error('Transaction failed:', err.message);
      alert('Transaction error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Buy Flashbits</h2>
      <MyStyledConnectButton />

      <div>
        <label>Phase:</label><br />
        <select value={selectedPhase} onChange={(e) => setSelectedPhase(Number(e.target.value))}>
          {FLASHBITS_PHASES.map(p => (
            <option key={p.phase} value={p.phase}>
              Phase {p.phase} — ${p.price} | Cap: {p.cap.toLocaleString()} Flashbits
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Quantity (Flashbits):</label><br />
        <input
          type="number"
          value={quantity}
          min={1}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>

      <button
        onClick={handleBuy}
        disabled={loading}
        style={{
          marginTop: 15,
          padding: '12px 24px',
          backgroundColor: '#00ffc3',
          color: '#000',
          fontWeight: 'bold',
          borderRadius: '30px',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 0 8px #00ffc3',
        }}
      >
        {loading
          ? 'Processing...'
          : `Buy Flashbits — Phase ${selectedPhase}`}
      </button>

      {txHash && (
        <p style={{ marginTop: '10px' }}>
          TX Hash: <a href={`https://polygonscan.com/tx/${txHash}`} target="_blank" rel="noreferrer">View</a>
        </p>
      )}
    </div>
  );
};

export default BuyFlashbitsPaymentType;

