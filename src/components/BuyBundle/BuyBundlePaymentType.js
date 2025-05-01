
'use client';

import { useState, useEffect } from 'react';
import { parseUnits } from 'viem';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { MyStyledConnectButton } from '../MyStyledConnectButton';
import oamTokenAbi from '../../abi/oamTokendaoAbi.js';

const BUNDLE_PHASES = [
  { phase: 1, basePrice: 100, cap: 250 },
  { phase: 2, basePrice: 500, cap: 250 },
  { phase: 3, basePrice: 850, cap: 250 },
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

const BuyBundlePaymentType = () => {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();

  const [selectedPhase, setSelectedPhase] = useState(1);
  const [paymentToken, setPaymentToken] = useState('matic');
  const [convertedPrice, setConvertedPrice] = useState('0');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  useEffect(() => {
    fetchPrice();
  }, [selectedPhase, paymentToken]);

  const fetchPrice = async () => {
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

      const usdPrice = Number(feedData[1]) / 1e8;
      const base = BUNDLE_PHASES.find(p => p.phase === selectedPhase).basePrice;
      const total = (base * 1.01) / usdPrice;
      setConvertedPrice(total.toFixed(6));
    } catch (err) {
      console.error('Price fetch error:', err.message);
      setConvertedPrice('0');
    }
  };

  const handleBuy = async () => {
    if (!walletClient || !address) {
      alert('Connect your wallet first.');
      return;
    }

    try {
      setLoading(true);

      const bundleAmount = BigInt(1); // Always 1 per wallet
      const mode = 2; // Bundle
      const tokenAddr = TOKEN_ADDRESSES[paymentToken];
      const ethValue = paymentToken === 'matic'
        ? parseUnits(convertedPrice, TOKEN_DECIMALS[paymentToken])
        : undefined;

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: oamTokenAbi,
        functionName: 'buy',
        args: [bundleAmount, mode, tokenAddr],
        value: ethValue,
      });

      setTxHash(hash);
    } catch (err) {
      alert('Transaction error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Buy Bundle</h2>
      <MyStyledConnectButton />
      <div>
        <label>Phase:</label><br />
        <select value={selectedPhase} onChange={(e) => setSelectedPhase(Number(e.target.value))} style={{ width: '100%' }}>
          {BUNDLE_PHASES.map(p => (
            <option key={p.phase} value={p.phase}>
              Phase {p.phase} — ${p.basePrice} | Supply: {p.cap}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Quantity:</label><br />
        <input type="number" value={1} disabled />
        <small style={{ color: 'gray' }}>Limit: 1 per wallet</small>
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
          : `Buy Bundle — ${convertedPrice} ${paymentToken.toUpperCase()}`}
      </button>
      {txHash && (
        <p style={{ marginTop: '10px' }}>
          TX: <a href={`https://polygonscan.com/tx/${txHash}`} target="_blank" rel="noreferrer">View</a>
        </p>
      )}
    </div>
  );
};

export default BuyBundlePaymentType;
