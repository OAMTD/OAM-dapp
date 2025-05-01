
'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { readContract } from '@wagmi/core';
import { formatUnits } from 'viem';
import { QRCode } from 'react-qrcode-logo';
import oamTokenAbi from '../abi/oamTokendaoAbi.js';

const ReferralDashboard = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [referralCount, setReferralCount] = useState(null);
  const [referralEarnings, setReferralEarnings] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [customRate, setCustomRate] = useState(3);

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
  const rewardPercent = 0.03;

  const referralLink = address
    ? `https://www.oamtokendao.com/=${address}`
    : '';

  useEffect(() => {
    const fetchReferralData = async () => {
      if (!address || !publicClient) return;

      try {
        const [count, earnings, whitelistStatus] = await Promise.all([
          readContract({
            address: CONTRACT_ADDRESS,
            abi: oamTokenAbi,
            functionName: 'getReferralCount',
            args: [address],
          }),
          readContract({
            address: CONTRACT_ADDRESS,
            abi: oamTokenAbi,
            functionName: 'getReferralEarnings',
            args: [address],
          }),
          readContract({
            address: CONTRACT_ADDRESS,
            abi: oamTokenAbi,
            functionName: 'isWhitelisted',
            args: [address],
          }),
        ]);

        setReferralCount(Number(count));
        setReferralEarnings(Number(formatUnits(earnings, 6)));
        setIsWhitelisted(whitelistStatus);
      } catch (err) {
        console.error('Error fetching referral data:', err.message);
      }
    };

    fetchReferralData();
  }, [address, publicClient]);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateRate = async () => {
    if (!walletClient || !isWhitelisted) {
      alert("You are not whitelisted or wallet not connected.");
      return;
    }

    if (customRate < 1 || customRate > 5) {
      alert("Rate must be between 1% and 5%");
      return;
    }

    try {
      const tx = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: oamTokenAbi,
        functionName: 'setReferralRateBP',
        args: [customRate * 100],
      });
      alert("Rate updated. TX Hash: " + tx);
    } catch (err) {
      alert("Failed to update rate: " + err.message);
    }
  };

  const estimatedVolume = referralEarnings
    ? (referralEarnings / rewardPercent).toFixed(2)
    : null;

  return (
    <div style={{
      marginTop: 50,
      textAlign: 'center',
      color: '#00ffc3',
      fontFamily: 'monospace',
    }}>
      <h2 style={{ marginBottom: 16, fontWeight: 'bold' }}>
        Referral Dashboard
      </h2>

      {isConnected && address ? (
        <>
          <div style={{
            display: 'inline-block',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            padding: 20,
            borderRadius: 12,
            boxShadow: '0 0 12px #00ffc3'
          }}>
            <QRCode
              value={address}
              size={130}
              bgColor="#000000"
              fgColor="#00ffc3"
              eyeRadius={2}
            />
            <p style={{ marginTop: 10, fontSize: '0.9rem' }}>
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>

          <div style={{ marginTop: 30 }}>
            <p>Your Referral Link:</p>
            <div style={{
              display: 'inline-block',
              padding: '10px 15px',
              backgroundColor: '#000',
              borderRadius: '8px',
              border: '1px solid #00ffc3',
              color: '#00ffc3',
              fontSize: '0.85rem',
              userSelect: 'all'
            }}>
              {referralLink}
            </div><br />
            <button
              onClick={handleCopy}
              style={{
                marginTop: 10,
                padding: '8px 18px',
                backgroundColor: copied ? '#333' : '#00ffc3',
                color: copied ? '#00ffc3' : '#000',
                fontWeight: 'bold',
                borderRadius: 20,
                border: 'none',
                cursor: 'pointer',
                boxShadow: copied ? '0 0 6px #00ffc3 inset' : '0 0 8px #00ffc3'
              }}
            >
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

          <div style={{ marginTop: 30, fontSize: '1rem' }}>
            {referralCount === null
              ? <div className="placeholder-blur" />
              : <p>Total Referrals: <strong>{referralCount}</strong></p>}
            {referralEarnings === null
              ? <div className="placeholder-blur" />
              : <p>Total Earned: <strong>{referralEarnings} USDC</strong></p>}
            {estimatedVolume === null
              ? <div className="placeholder-blur" />
              : <p>Estimated Volume: <strong>{estimatedVolume} USD</strong></p>}
          </div>

          {isWhitelisted && (
            <div style={{ marginTop: 40 }}>
              <h3>Adjust Your Referral Rate</h3>
              <label>Rate (1% - 5%)</label><br />
              <input
                type="number"
                value={customRate}
                onChange={(e) => setCustomRate(Number(e.target.value))}
                min={1}
                max={5}
                style={{
                  padding: '8px',
                  width: '80px',
                  margin: '10px',
                  textAlign: 'center',
                  borderRadius: '5px',
                  border: '1px solid #00ffc3',
                  backgroundColor: '#000',
                  color: '#00ffc3'
                }}
              />
              <button
                onClick={handleUpdateRate}
                style={{
                  padding: '8px 12px',
                  background: '#00FFF0',
                  color: '#000',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Update Rate
              </button>
            </div>
          )}
        </>
      ) : (
        <p style={{ marginTop: 20 }}>
          Connect your wallet to access referral tools.
        </p>
      )}
    </div>
  );
};

export default ReferralDashboard;