'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

import BuyOAM from '../components/BuyOAM/BuyOAM';
import BuyBundle from '../components/BuyBundle';
import BuyFlashbits from '../components/BuyFlashbits';
import ReferralDashboard from '../components/ReferralDashboard';
import ConnectWalletButton from '../components/ConnectWalletButton';
import WhitelistRateAdjuster from '../components/WhitelistRateAdjuster';
import { QRCode } from 'react-qrcode-logo';
import { oamTokenAbi } from '../abi/oamTokendao_abi.js';
import BuyOAMCarousel from '../components/BuyOAM/BuyOAMCarousel';
import BuyBundleCarousel from '../components/BuyBundle/BuyBundleCarousel';
import FlashCarousel from '../components/BuyFlashbits/FlashCarousel';

const Dashboard = () => {
  const [signer, setSigner] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");
  const [currentPhase, setCurrentPhase] = useState(null);
  const [totalOAMSold, setTotalOAMSold] = useState(null);
  const [totalFlashbitsSold, setTotalFlashbitsSold] = useState(null);
  const [totalBundlesSold, setTotalBundlesSold] = useState(null);

  const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  // Fetch live contract data
  useEffect(() => {
    const fetchContractState = async () => {
      if (!window.ethereum) return;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const tempSigner = await provider.getSigner();
      setSigner(tempSigner);

      const contract = new ethers.Contract(CONTRACT_ADDRESS, oamTokenAbi, tempSigner);

      try {
        const phase = await contract.currentPhase();
        const oamSold = await contract.totalOAMSold();
        const flashbitsSold = await contract.totalFlashbitsSold();
        const bundlesSold = await contract.totalBundlesSold();

        setCurrentPhase(Number(phase));
        setTotalOAMSold(Number(ethers.formatUnits(oamSold, 18)));
        setTotalFlashbitsSold(Number(flashbitsSold));
        setTotalBundlesSold(Number(bundlesSold));
      } catch (err) {
        console.error("Contract state fetch failed:", err.message);
      }
    }

    fetchContractState();
  }, []);

  const backdropStyle = {
    backgroundImage: `url('/backgrounds/moondrop.jpg')`,
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
    color: '#fff',
    minHeight: '100vh',
    padding: '40px'
  };

  return (
    <div style={backdropStyle}>
      <div style={{ position: 'absolute', top: 20, right: 30 }}>
        <ConnectWalletButton setSigner={setSigner} 
        setWalletAddress={setWalletAddress}
        walletAddress={walletAddress}/>
      </div>

      <h1 style={{ textAlign: 'center', fontSize: '3rem', color: '#00FFF0' }}>OAM Token DAO</h1>

      {/* Phase Data */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <p>Current Sale Phase: <strong>{currentPhase ?? 'Loading...'}</strong></p>
        <p>Total OAM Sold: <strong>{totalOAMSold ?? 'Loading...'}</strong></p>
        <p>Total Flashbits Sold: <strong>{totalFlashbitsSold ?? 'Loading...'}</strong></p>
        <p>Total Bundles Sold: <strong>{totalBundlesSold ?? 'Loading...'}</strong></p>
      </div>

      {/* Buy Sections */}
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div style={{ width: '30%', backgroundColor: 'rgba(0,0,0,0.6)', padding: '20px', borderRadius: '10px' }}>
          <h3 style={{ textAlign: 'center' }}>Buy OAM</h3>
          <BuyOAMCarousel signer={signer} />
        </div>

        <div style={{ width: '30%', backgroundColor: 'rgba(0,0,0,0.6)', padding: '20px', borderRadius: '10px' }}>
          <h3 style={{ textAlign: 'center' }}>Buy Bundle</h3>
          <BuyBundleCarousel signer={signer} />
        </div>

        <div style={{ width: '30%', backgroundColor: 'rgba(0,0,0,0.6)', padding: '20px', borderRadius: '10px' }}>
          <h3 style={{ textAlign: 'center' }}>Buy Flashbits</h3>
          <FlashCarousel signer={signer} />
        </div>
      </div>

      <div style={{ marginTop: '50px', textAlign: 'center' }}>
        <h3>Referral QR</h3>
        <QRCode value={`https://yourdapp.com/?ref=${walletAddress || '0x...wallet'}`} size = {128} />
      </div>

      <WhitelistRateAdjuster />
      <ReferralDashboard signer={signer} />

      <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '1.2rem', color: '#00FFF0' }}>
        <em>OAM Benchmark Rosca coming soon</em>
      </div>
    </div>
  );
};

export default Dashboard;