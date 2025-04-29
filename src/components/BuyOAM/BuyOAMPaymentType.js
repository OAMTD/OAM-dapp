'use client';

import { useState, useEffect } from 'react';
import { parseUnits } from 'viem';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { erc20Abi } from '../../abi/erc20Abi.js';
import oamTokenAbi from '../../abi/oamTokendaoAbi.js';
import { MyStyledConnectButton } from '../MyStyledConnectButton';

const OAM_PHASES = [
  { phase: 1, price: 3, cap: 100000 },
  { phase: 2, price: 12, cap: 300000 },
  { phase: 3, price: 20, cap: 900000 },
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
      const usdTotal = OAM_PHASES.find(p => p.phase === selectedPhase).price * Number(quantity);
      
      // Enforce overpayment buffer (1.5% to cover rounding/slippage)
      const paddedValue = (usdTotal / tokenUsdPrice) * 1.015;
      setConvertedPrice(paddedValue.toFixed(6));
    } catch (err) {
      console.error('Price fetch failed:', err.message);
      setConvertedPrice('0');
    }
  };

  const handleBuy = async () => {
    if (!walletClient || !address) {
      alert('Please connect your wallet first.');
      return;
    }

    try {
      setLoading(true);

      const usdTotal = OAM_PHASES.find(p => p.phase === selectedPhase).price * Number(quantity);
      const tokenFeed = await publicClient.readContract({
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

      const pricePerToken = Number(tokenFeed[1]) / 1e8;
      const paddedValue = (usdTotal / pricePerToken) * 1.015; // 1.5% buffer
      const value = parseUnits(paddedValue.toString(), TOKEN_DECIMALS[paymentToken]);

      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: oamTokenAbi,
        functionName: paymentToken === 'matic' ? 'buyOAMWithNative' : 'buyOAMWithToken',
        args: paymentToken === 'matic' ? [selectedPhase, quantity] : [paymentToken, value],
        value: paymentToken === 'matic' ? value : undefined,
      });

      setTxHash(hash);
    } catch (err) {
      console.error('Transaction error:', err.message);
      alert('Error: ' + err.message);
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
        <select value={selectedPhase} onChange={(e) => setSelectedPhase(Number(e.target.value))}>
          {OAM_PHASES.map(p => (
            <option key={p.phase} value={p.phase}>
              Phase {p.phase} — ${p.price} | Cap: {p.cap.toLocaleString()} OAM
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Quantity:</label><br />
        <input
          type="number"
          value={quantity}
          placeholder="Enter amount of OAM"
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