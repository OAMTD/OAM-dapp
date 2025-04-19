'use client';
import { useState, useEffect } from 'react';
import { ethers, Contract, parseUnits } from 'ethers';
import { useWallet } from '../../context/WalletContext';
import oamTokenAbi from '../../abi/oamTokendao_abi.js';
import { erc20Abi } from '../../abi/erc20Abi.js';

const OAM_PHASES = [
  { phase: 1, price: 3, cap: 100000 },
  { phase: 2, price: 12, cap: 300000 },
  { phase: 3, price: 20, cap: 900000 }
];

const TOKEN_ADDRESSES = {
  usdc: process.env.NEXT_PUBLIC_USDC_ADDRESS,
  usdt: process.env.NEXT_PUBLIC_USDT_ADDRESS,
  weth: process.env.NEXT_PUBLIC_WETH_ADDRESS
};

const COINGECKO_IDS = {
  matic: 'matic-network',
  usdc: 'usd-coin',
  usdt: 'tether',
  weth: 'weth'
};

const BuyOAMPaymentType = () => {
  const { signer, walletAddress, connectWallet } = useWallet();
  const [selectedPhase, setSelectedPhase] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [paymentToken, setPaymentToken] = useState('matic');
  const [convertedPrice, setConvertedPrice] = useState('0');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  useEffect(() => {
    fetchConvertedPrice();
  }, [selectedPhase, quantity, paymentToken]);

  const fetchConvertedPrice = async () => {
    try {
      const phase = OAM_PHASES.find(p => p.phase === selectedPhase);
      const totalUSD = quantity * phase.price;

      const id = COINGECKO_IDS[paymentToken];
      if (!id) return setConvertedPrice(totalUSD.toFixed(2));

      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);
      const data = await response.json();
      const tokenPrice = data[id]?.usd;

      if (!tokenPrice) return setConvertedPrice('0');
      const converted = totalUSD / tokenPrice;

      setConvertedPrice(converted.toFixed(6));
    } catch (err) {
      console.error("Conversion error:", err.message);
      setConvertedPrice('0');
    }
  };

  const handleBuy = async () => {
    try {
      if (!signer) {
        alert("Please connect your wallet first.");
        return;
      }

      setLoading(true);
      const contract = new Contract(contractAddress, oamTokenAbi, signer);
      const phase = OAM_PHASES.find(p => p.phase === selectedPhase);
      const usdCost = phase.price * quantity;

      if (paymentToken === 'matic') {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=usd');
        const data = await response.json();
        const maticPrice = data['matic-network'].usd;
        const maticAmount = usdCost / maticPrice;

        const tx = await contract.buyOAM({ value: ethers.parseEther(maticAmount.toString()) });
        await tx.wait();
        setTxHash(tx.hash);
      } else {
        const tokenAddress = TOKEN_ADDRESSES[paymentToken];
        if (!tokenAddress) throw new Error("Invalid token selected.");

        const token = new Contract(tokenAddress, erc20Abi, signer);
        const decimals = await token.decimals();

        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${COINGECKO_IDS[paymentToken]}&vs_currencies=usd`);
        const data = await response.json();
        const tokenPrice = data[COINGECKO_IDS[paymentToken]]?.usd;

        const tokenAmount = usdCost / tokenPrice;
        const formattedAmount = parseUnits(tokenAmount.toString(), decimals);

        const allowance = await token.allowance(await signer.getAddress(), contractAddress);
        if (allowance < formattedAmount) {
          const approval = await token.approve(contractAddress, formattedAmount);
          await approval.wait();
        }

        const tx = await contract.buyOAMWithToken(tokenAddress, formattedAmount);
        await tx.wait();
        setTxHash(tx.hash);
      }

    } catch (err) {
      console.error("Buy failed:", err.message);
      alert("Transaction failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Buy OAM Tokens (Pre-Sale)</h2>

      <button
        onClick={!walletAddress ? connectWallet : null}
        disabled={!!walletAddress}
        style={{
          marginBottom: 10,
          padding: '10px 16px',
          backgroundColor: walletAddress ? 'gray' : '#ffd700',
          fontWeight: 'bold',
          border: 'none',
          borderRadius: '8px',
          cursor: walletAddress ? 'not-allowed' : 'pointer'
        }}
      >
        {walletAddress
          ? `Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
          : 'Connect Wallet'}
      </button>

      <div>
        <label>Phase:</label><br />
        <select value={selectedPhase} onChange={(e) => setSelectedPhase(Number(e.target.value))}>
          {OAM_PHASES.map(p => (
            <option key={p.phase} value={p.phase}>
              Phase {p.phase} — ${p.price} | Cap: {p.cap} OAM
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Quantity (OAM):</label><br />
        <input
          type="number"
          value={quantity}
          min={1}
          onChange={(e) => setQuantity(Number(e.target.value))}
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
          boxShadow: '0 0 8px #00ffc3'
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