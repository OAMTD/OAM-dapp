'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { readContract } from '@wagmi/core';
import { formatUnits } from 'viem';
import { MyStyledConnectButton } from '../components/MyStyledConnectButton';
import BuyOAMCarousel from '../components/BuyOAM/BuyOAMCarousel';
import BuyBundleCarousel from '../components/BuyBundle/BuyBundleCarousel';
import FlashCarousel from '../components/BuyFlashbits/FlashCarousel';
import ReferralDashboard from '../components/ReferralDashboard';
import oamTokenAbi from '../abi/oamTokendaoAbi.js';
import RoscaWarpWindow from '../components/RoscaWarpWindow';
import RoscaGrowthLockPanel from '../components/RoscaGrowthLockPanel';

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [totalOAMSold, setTotalOAMSold] = useState(null);
  const [totalFlashbitsSold, setTotalFlashbitsSold] = useState(null);
  const [totalBundlesSold, setTotalBundlesSold] = useState(null);

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  useEffect(() => {
    const fetchStats = async () => {
      if (!publicClient) return;

      try {
        const [oamRaw, flashRaw, bundleRaw] = await Promise.all([
          readContract({
            address: CONTRACT_ADDRESS,
            abi: oamTokenAbi,
            functionName: 'oamTotalSold',
          }),
          readContract({
            address: CONTRACT_ADDRESS,
            abi: oamTokenAbi,
            functionName: 'totalFlashbitsSold',
          }),
          readContract({
            address: CONTRACT_ADDRESS,
            abi: oamTokenAbi,
            functionName: 'bundleSold',
          }),
        ]);

        setTotalOAMSold(Number(formatUnits(oamRaw, 18)));
        setTotalFlashbitsSold(Number(flashRaw));
        setTotalBundlesSold(Number(bundleRaw));
      } catch (err) {
        console.error('Dashboard fetch error:', err.message);
      }
    };

    fetchStats();
  }, [publicClient]);

  return (
    <div style={backdropStyle}>
      <div style={{ position: 'absolute', top: 20, right: 30 }}>
        <MyStyledConnectButton />
      </div>

      <h1 style={{ textAlign: 'center', fontSize: '3rem', color: '#00FFF0' }}>
        OAM Token DAO
      </h1>

      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <p><strong>Total OAM Sold:</strong> {totalOAMSold ?? 'Loading...'}</p>
        <p><strong>Total Flashbits Sold:</strong> {totalFlashbitsSold ?? 'Loading...'}</p>
        <p><strong>Total Bundles Sold:</strong> {totalBundlesSold ?? 'Loading...'}</p>
      </div>

      <div style={carouselContainerStyle}>
        <div style={cardStyle}><h3>Buy OAM Active</h3><BuyOAMCarousel /></div>
        <div style={cardStyle}><h3>Buy Bundle Active</h3><BuyBundleCarousel /></div>
        <div style={cardStyle}><h3>Buy Flashbits Active</h3><FlashCarousel /></div>
      </div>

      <ReferralDashboard />

      <div style={{
        marginTop: '40px',
        textAlign: 'center',
        fontSize: '1.2rem',
        color: '#00FFF0'
      }}>
        <em>OAM Benchmark Rosca now available</em>
        <RoscaWarpWindow />
        <RoscaGrowthLockPanel />
      </div>
    </div>
  );
};

const backdropStyle = {
  backgroundImage: `url('/backgrounds/moondrop.jpg')`,
  backgroundSize: 'cover',
  backgroundAttachment: 'fixed',
  color: '#fff',
  minHeight: '100vh',
  padding: '40px'
};

const carouselContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: '1.5rem',
  marginBottom: '2rem',
};

const cardStyle = {
  flex: '1 1 300px',
  maxWidth: '380px',
  backgroundColor: 'rgba(0,0,0,0.6)',
  padding: '20px',
  borderRadius: '10px',
  textAlign: 'center',
  minWidth: '280px',
};

export default Dashboard;