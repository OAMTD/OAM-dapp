'use client';

import { useState, useEffect } from 'react';
import { parseUnits, formatUnits } from 'viem';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';
import { erc20Abi } from '../../abi/erc20Abi.js';
import oamTokenAbi from '../../abi/oamTokendaoAbi.js';
import { MyStyledConnectButton } from '../MyStyledConnectButton';

const FLASHBITS_PHASES = [
  { phase: 1, price: 0.0001001, cap: 250_000_000_000 },
  { phase: 2, price: 0.000125, cap: 750_000_000_000 },
];

const TOKEN_DECIMALS = {
  matic: 18,
  usdc: 6,
  usdt: 6,
  weth: 18,
};

const PRICE_FEEDS = {
  matic: process.env.NEXT_PUBLIC_MATIC_USD_FEED,
  usdc: process.env.NEXT_PUBLIC_USDC_USD_FEED,
  usdt: process.env.NEXT_PUBLIC_USDT_USD_FEED,
  weth: process.env.NEXT_PUBLIC_WETH_USD_FEED,
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
  const [oamBalance, setOamBalance] = useState(0);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const oamTokenAddress = process.env.NEXT_PUBLIC_OAM_TOKEN_ADDRESS;

  useEffect(() => {
    fetchPrice();
    checkOAMBalance();
  }, [selectedPhase, quantity, paymentToken]);

  const fetchPrice = async () => {
    if (!quantity || isNaN(quantity)) return setConvertedPrice('0');
    try {
      const feedData = await publicClient.readContract({
        address: PRICE_FEEDS[paymentToken],
        abi: [
          {
            name: 'latestRoundData',
            outputs: [
              { internalType: 'uint80', name: 'roundId', type: 'uint80' },
              { internalType: 'int256', name: 'answer', type: 'int256' },
              { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
              { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
              { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' }
            ],
            inputs: [],
            stateMutability: 'view',
            type: 'function',
          },
        ],
        functionName: 'latestRoundData',
      });

      const pricePerUSD = Number(feedData[1]) / 1e8;
      const flashPrice = FLASHBITS_PHASES.find(p => p.phase === selectedPhase).price;
      const usdTotal = flashPrice * Number(quantity);
      setConvertedPrice((usdTotal / pricePerUSD).toFixed(6));
    } catch (err) {
      console.error('Price feed failed:', err.message);
      setConvertedPrice('0');
    }
  };

  const checkOAMBalance = async () => {
    if (!address) return;
    try {
      const balance = await publicClient.readContract({
        address: oamTokenAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [address],
      });

      setOamBalance(Number(formatUnits(balance, 18)));
    } catch (err) {
      console.error('Failed to fetch OAM balance:', err.message);
    }
  };

  const handleBuy = async () => {
    if (!walletClient || !address) {
      alert('Connect wallet first.');
      return;
    }

    if (Number(quantity) > 999999 && oamBalance < 25) {
      alert('You must hold 25 OAM or less than 999,999 Flashbits per transaction.');
      return;
    }

    try {
      setLoading(true);
      const phaseInfo = FLASHBITS_PHASES.find(p => p.phase === selectedPhase);
      const priceUSD = phaseInfo.price * Number(quantity);
      const value = parseUnits(priceUSD.toString(), TOKEN_DECIMALS[paymentToken]);
      const flashQty = BigInt(quantity);

      const tx = await walletClient.writeContract({
        address: contractAddress,
        abi: oamTokenAbi,
        functionName: 'sellFlashbitsAdvanced',
        args: [flashQty, paymentToken.toUpperCase()],
        value: paymentToken === 'matic' ? value : undefined,
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
        <label>Quantity (max 999,999 unless 25 OAM held):</label><br />
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