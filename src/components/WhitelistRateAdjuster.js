'use client';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { oamTokenAbi } from '../abi/oamTokendao_abi.js';
import { BrowserProvider} from 'ethers';

const WhitelistRateAdjuster = () => {
  const [wallet, setWallet] = useState('');
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [customRate, setCustomRate] = useState(3);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const init = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWallet(address);

      const c = new ethers.Contract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS, oamTokenAbi, signer);
      setContract(c);

      const isWL = await c.isWhitelisted(address);
      setIsWhitelisted(isWL);
    };

    init();
  }, []);

  const handleUpdateRate = async () => {
    if (!isWhitelisted) return alert("Not whitelisted.");
    try {
      const tx = await contract.setReferralRateBP(customRate * 100); // convert to basis points
      await tx.wait();
      alert("Referral rate updated!");
    } catch (err) {
      alert("Failed to update rate: " + err.message);
    }
  };

  if (!isWhitelisted) return null;

  return (
    <div style={{ color: '#fff' }}>
      <p><strong>Connected:</strong> {wallet}</p>
      <label>Set Custom Referral Rate (1% to 5%)</label><br />
      <input
        type="number"
        value={customRate}
        onChange={(e) => setCustomRate(Number(e.target.value))}
        min={1}
        max={5}
        style={{ padding: '8px', width: '80px', marginRight: '10px' }}
      />
      <button onClick={handleUpdateRate} style={{ padding: '8px 12px', background: '#00FFF0', color: '#000' }}>
        Update Rate
      </button>
    </div>
  );
};

export default WhitelistRateAdjuster;

