

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
import  oamTokenAbi  from '../abi/oamTokendao_abi.js';

const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const [currentPhase, setCurrentPhase] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [currentPhaseSupply, setCurrentPhaseSupply] = useState(null);
  const [totalOAMSold, setTotalOAMSold] = useState(null);
  const [totalFlashbitsSold, setTotalFlashbitsSold] = useState(null);
  const [totalBundlesSold, setTotalBundlesSold] = useState(null);

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  useEffect(() => {
    const fetchStats = async () => {
      if (!publicClient) return;

      try {
        const [phase, priceRaw, supply, oamRaw, flashRaw, bundleRaw] = await Promise.all([
          readContract({
            address: CONTRACT_ADDRESS,
            abi: oamTokenAbi,
            functionName: 'currentSalePhase',
          }),
          readContract({
            address: CONTRACT_ADDRESS,
            abi: oamTokenAbi,
            functionName: 'getCurrentSalePrice',
          }),
          readContract({
            address: CONTRACT_ADDRESS,
            abi: oamTokenAbi,
            functionName: 'getCurrentPhaseSupply',
          }),
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

        setCurrentPhase(Number(phase));
        setCurrentPrice(Number(formatUnits(priceRaw, 18)).toFixed(4));
        setCurrentPhaseSupply(Number(formatUnits(supply, 18)));
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
        <p><strong>Current Sale Phase:</strong> {currentPhase ?? 'Loading...'}</p>
        <p><strong>Phase Supply Remaining:</strong> {currentPhaseSupply ?? 'Loading...'}</p>
        <p><strong>Current OAM Price:</strong> ${currentPrice ?? 'Loading...'}</p>
        <p><strong>Total OAM Sold:</strong> {totalOAMSold ?? 'Loading...'}</p>
        <p><strong>Total Flashbits Sold:</strong> {totalFlashbitsSold ?? 'Loading...'}</p>
        <p><strong>Total Bundles Sold:</strong> {totalBundlesSold ?? 'Loading...'}</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div style={cardStyle}><h3>Buy OAM</h3><BuyOAMCarousel /></div>
        <div style={cardStyle}><h3>Buy Bundle</h3><BuyBundleCarousel /></div>
        <div style={cardStyle}><h3>Buy Flashbits</h3><FlashCarousel /></div>
      </div>

      <ReferralDashboard />

      <div style={{
        marginTop: '40px',
        textAlign: 'center',
        fontSize: '1.2rem',
        color: '#00FFF0'
      }}>
        <em>OAM Benchmark Rosca coming soon</em>
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

const cardStyle = {
  width: '30%',
  backgroundColor: 'rgba(0,0,0,0.6)',
  padding: '20px',
  borderRadius: '10px',
  textAlign: 'center'
};

export default Dashboard;



