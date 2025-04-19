'use client';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import QRCode from 'qrcode.react'; // install via `npm i qrcode.react`

const BASE_URL = 'https://yourdapp.com/?ref=';

const ReferralDashboard = ({ signer, contract }) => {
  const [wallet, setWallet] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [customRate, setCustomRate] = useState(3); // %
  const [referrals, setReferrals] = useState(0);
  const [totalRewards, setTotalRewards] = useState('0');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signerInstance = signer || await provider.getSigner();
        const address = await signerInstance.getAddress();
        setWallet(address);
        setReferralLink(`${BASE_URL}${address}`);

        const wl = await contract.isWhitelisted(address);
        const refCount = await contract.userReferralCount(address);
        const spent = await contract.userSpentAmount(address);

        setIsWhitelisted(wl);
        setReferrals(Number(refCount));
        setTotalRewards(ethers.formatUnits(spent, 18));
      } catch (err) {
        console.error("ReferralDashboard error:", err.message);
      }
    };

    if (contract) fetchData();
  }, [signer, contract]);

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRateUpdate = async () => {
    if (!isWhitelisted || !contract) return;
    try {
      const tx = await contract.setReferralRateBP(customRate * 100); // basis points
      await tx.wait();
      alert("Referral rate updated.");
    } catch (err) {
      console.error("Failed to update referral rate:", err.message);
    }
  };

  return (
    <div>
      <h3>Referral Dashboard</h3>
      <p><strong>Wallet:</strong> {wallet}</p>
      <p><strong>Referral Link:</strong> {referralLink}</p>
      <button onClick={handleCopy}>{copied ? 'Copied!' : 'Copy Link'}</button>

      <div style={{ marginTop: '20px' }}>
        <p>QR Code:</p>
        {referralLink && <QRCode value={referralLink} size={128} />}
      </div>

      <p><strong>Referrals:</strong> {referrals}</p>
      <p><strong>Total Rewards:</strong> {totalRewards} OAM</p>

      {isWhitelisted && (
        <>
          <label>Custom Rate (%):</label>
          <input
            type="number"
            min="1"
            max="5"
            value={customRate}
            onChange={(e) => setCustomRate(e.target.value)}
          />
          <button onClick={handleRateUpdate}>Set Custom Rate</button>
        </>
      )}
    </div>
  );
};

export default ReferralDashboard;





