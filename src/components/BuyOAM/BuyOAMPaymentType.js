
'use client';

import { useState, useEffect } from 'react';
import { parseUnits } from 'viem';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { MyStyledConnectButton } from '../MyStyledConnectButton';
import oamTokenAbi from '../../abi/oamTokendaoAbi.js';

const OAM_PHASES = [
  { phase: 1, price: 3, cap: 100_000 },
  { phase: 2, price: 12, cap: 300_000 },
  { phase: 3, price: 20, cap: 900_000 },
];

const PRICE_FEEDS = {
  matic: process.env.NEXT_PUBLIC_MATIC_USD_FEED,
  usdc: process.env.NEXT_PUBLIC_USDC_USD_FEED,
  usdt: process.env.NEXT_PUBLIC_USDT_USD_FEED,
  weth: process.env.NEXT_PUBLIC_WETH_USD_FEED,
};

const TOKEN_DECIMALS = {
  matic: 18,
  usdc: 6,
  usdt: 6,
  weth: 18,
};

const TOKEN_ADDRESSES = {
  matic: '0x0000000000000000000000000000000000000000',
  usdc: process.env.NEXT_PUBLIC_USDC_ADDRESS,
  usdt: process.env.NEXT_PUBLIC_USDT_ADDRESS,
  weth: process.env.NEXT_PUBLIC_WETH_ADDRESS,
};

const BuyOAMPaymentType = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [selectedPhase, setSelectedPhase] = useState(1);
  const [quantity, setQuantity] = useState('');
  const [paymentToken, setPaymentToken] = useState('matic');
  const [convertedPrice, setConvertedPrice] = useState('0');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  useEffect(() => {
    fetchPrice();
  }, [selectedPhase, quantity, paymentToken]);

  const fetchPrice = async () => {
    if (!quantity || isNaN(quantity)) return setConvertedPrice('0');
    try {
      const feedData = await publicClient.readContract({
        address: PRICE_FEEDS[paymentToken],
        abi: [{
          name: 'latestRoundData',
          outputs: [
            { name: 'roundId', type: 'uint80' },
            { name: 'answer', type: 'int256' },
            { name: 'startedAt', type: 'uint256' },
            { name: 'updatedAt', type: 'uint256' },
            { name: 'answeredInRound', type: 'uint80' }
          ],
          inputs: [],
          stateMutability: 'view',
          type: 'function',
        }],
        functionName: 'latestRoundData',
      });

      const tokenUsdPrice = Number(feedData[1]) / 1e8;
      const phasePrice = OAM_PHASES.find(p => p.phase === selectedPhase).price;
      const usdTotal = phasePrice * Number(quantity);
      const total = usdTotal / tokenUsdPrice;

      setConvertedPrice(total.toFixed(6));
    } catch (err) {
      console.error('Price fetch failed:', err.message);
      setConvertedPrice('0');
    }
  };

  const handleBuy = async () => {
    if (!walletClient || !address) {
      alert('Connect wallet first.');
      return;
    }

    try {
      setLoading(true);

      const amount = BigInt(quantity);
      const mode = 1; // OAM
      const tokenAddr = TOKEN_ADDRESSES[paymentToken];
      const value = paymentToken === 'matic'
        ? parseUnits(convertedPrice, TOKEN_DECIMALS[paymentToken])
        : undefined;

      const tx = await walletClient.writeContract({
        address: contractAddress,
        abi: oamTokenAbi,
        functionName: 'buy',
        args: [amount, mode, tokenAddr],
        value,
      });

      setTxHash(tx);
    } catch (err) {
      alert('Transaction error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Buy OAM Tokens (Pre-Sale)</h2>
      <MyStyledConnectButton />
      <div>
        <label>Phase:</label><br />
        <select value={selectedPhase} onChange={(e) => setSelectedPhase(Number(e.target.value))} style={{ width: '100%' }}>
          {OAM_PHASES.map(p => (
            <option key={p.phase} value={p.phase}>
              Phase {p.phase} — ${p.price} | Cap: {p.cap.toLocaleString()}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Quantity:</label><br />
        <input
          type="number"
          value={quantity}
          min={1}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </div>
      <div>
        <label>Payment Token:</label><br />
        <select value={paymentToken} onChange={(e) => setPaymentToken(e.target.value)}>
          <option value="matic">MATIC</option>
          <option value="usdc">USDC</option>
          <option value="usdt">USDT</option>
          <option value="weth">WETH</option>
        </select>
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
          : `Buy OAM — ${convertedPrice} ${paymentToken.toUpperCase()}`}
      </button>
      {txHash && (
        <p style={{ marginTop: '10px' }}>
          TX: <a href={`https://polygonscan.com/tx/${txHash}`} target="_blank" rel="noreferrer">View</a>
        </p>
      )}
    </div>
  );
};

export default BuyOAMPaymentType;
