'use client';
import { useState } from 'react';
import { ethers } from 'ethers';
import oamTokenAbi_abi from '../../abi/oamTokendao_abi.js';
import erc20Abi from '../../abi/erc20Abi.js';
import { BUNDLE_PHASES, calculateBundleCost } from './BuyBundlePhase.js';

const TOKEN_ADDRESSES = {
  usdc: process.env.NEXT_PUBLIC_USDC_ADDRESS,
  usdt: process.env.NEXT_PUBLIC_USDT_ADDRESS,
  weth: process.env.NEXT_PUBLIC_WETH_ADDRESS
};

const BuyBundlePaymentType = ({ signer }) => {
  const [selectedPhase, setSelectedPhase] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [paymentToken, setPaymentToken] = useState('matic');
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);

  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  const handleBuy = async () => {
    try {
      setLoading(true);
      const contract = new ethers.Contract(contractAddress, oamTokenAbi, signer);
      const cost = calculateBundleCost(selectedPhase, quantity);

      if (paymentToken === 'matic') {
        const tx = await contract.buyWhitelistBundle({ value: ethers.parseEther(cost.toString()) });
        await tx.wait();
        setTxHash(tx.hash);
      } else {
        const tokenAddress = TOKEN_ADDRESSES[paymentToken.toLowerCase()];
        const token = new ethers.Contract(tokenAddress, erc20Abi, signer);
        const decimals = await token.decimals();
        const formattedCost = ethers.parseUnits(cost.toString(), decimals);

        const user = await signer.getAddress();
        const allowance = await token.allowance(user, contract.target);
        if (allowance < formattedCost) {
          const approvalTx = await token.approve(contract.target, formattedCost);
          await approvalTx.wait();
        }

        const tx = await contract.buyWhitelistBundleWithToken(tokenAddress, formattedCost);
        await tx.wait();
        setTxHash(tx.hash);
      }
    } catch (err) {
      console.error("Bundle Purchase Failed:", err.message);
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Buy Whitelist Bundle</h2>

      <label>Phase:</label>
      <select value={selectedPhase} onChange={(e) => setSelectedPhase(Number(e.target.value))}>
        {BUNDLE_PHASES.map(({ phase, price, supply, oamPerBundle }) => (
          <option key={phase} value={phase}>
            Phase {phase}: ${price} | {supply} Bundles | {oamPerBundle} OAM each
          </option>
        ))}
      </select>

      <br /><label>Quantity:</label>
      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
      />

      <br /><label>Payment Method:</label>
      <select value={paymentToken} onChange={(e) => setPaymentToken(e.target.value)}>
        <option value="matic">MATIC</option>
        <option value="usdc">USDC</option>
        <option value="usdt">USDT</option>
        <option value="weth">WETH</option>
      </select>

      <br /><br />
      <button onClick={handleBuy} disabled={loading || !signer}>
        {loading ? 'Processing...' : 'Buy Bundle'}
      </button>

      {txHash && (
        <p>TX: <a href={`https://polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer">View TX</a></p>
      )}
    </div>
  );
};

export default BuyBundlePaymentType;

