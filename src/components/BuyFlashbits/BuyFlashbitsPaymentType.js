'use client';

import { useState, useEffect } from 'react';
import { parseUnits } from 'viem';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { MyStyledConnectButton } from '../MyStyledConnectButton';
import oamTokenAbi from '../../abi/oamTokendaoAbi.js';

const FLASHBITS_PHASES = [
  { phase: 1, price: 0.0001001, cap: 250_000_000_000 },
  { phase: 2, price: 0.000125, cap: 750_000_000_000 },
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

const BuyFlashbitsPaymentType = () => {
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
    if (!quantity || isNaN(quantity) || Number(quantity) <= 0) return setConvertedPrice('0');
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
      const usdTotal = FLASHBITS_PHASES.find(p => p.phase === selectedPhase).price * Number(quantity);
      const padded = (usdTotal / tokenUsdPrice) * 1.01;
      setConvertedPrice(padded.toFixed(6));
    } catch (err) {
      console.error('Fetch price failed:', err.message);
      setConvertedPrice('0');
    }
  };

  const handleBuy = async () => {
    if (!walletClient || !address) return alert('Please connect your wallet.');

    try {
      setLoading(true);
      const mode = 0; // Flashbits
      const amount = BigInt(Math.max(1, Number(quantity)));
      const tokenAddr = TOKEN_ADDRESSES[paymentToken];
      const ethValue = paymentToken === 'matic'
        ? parseUnits(convertedPrice.toString(), TOKEN_DECIMALS[paymentToken])
        : undefined;

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: oamTokenAbi,
        functionName: 'buy',
        args: [amount, mode, tokenAddr],
        value: ethValue,
      });

      setTxHash(hash);
    } catch (err) {
      alert('Transaction failed: ' + err.message);
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
        <select value={selectedPhase} onChange={(e) => setSelectedPhase(Number(e.target.value))} style={{ width: '100%' }}>
          {FLASHBITS_PHASES.map(p => (
            <option key={p.phase} value={p.phase}>
              Phase {p.phase} — ${p.price} | Cap: {p.cap.toLocaleString()}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Quantity (min 1):</label><br />
        <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
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
          : `Buy Flashbits — ${convertedPrice} ${paymentToken.toUpperCase()}`}
      </button>
      {txHash && (
        <p style={{ marginTop: '10px' }}>
          TX: <a href={`https://polygonscan.com/tx/${txHash}`} target="_blank" rel="noreferrer">View</a>
        </p>
      )}
    </div>
  );
};

export default BuyFlashbitsPaymentType;


