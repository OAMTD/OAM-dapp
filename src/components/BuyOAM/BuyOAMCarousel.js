'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import BuyOAMPaymentType from './BuyOAMPaymentType';
import { oamTokenAbi } from '../../abi/oamTokendao_abi';

const OAM_PHASES = [
  { phase: 1, price: 3, cap: 100000 },
  { phase: 2, price: 12, cap: 300000 },
  { phase: 3, price: 20, cap: 900000 }
];

export default function BuyOAMCarousel({ signer }) {
  const [currentPhase, setCurrentPhase] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);

  useEffect(() => {
    const fetchLivePhase = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
          oamTokenAbi,
          provider
        );

        const livePhase = await contract.getCurrentPhase();
        const rawPrice = await contract.getCurrentPrice();

        setCurrentPhase(Number(livePhase));
        setCurrentPrice(Number(ethers.formatUnits(rawPrice, 18)));
      } catch (err) {
        console.error('Failed to fetch OAM phase data:', err.message);
      }
    };

    fetchLivePhase();
  }, []);

  return (
    <div style={{
      background: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(8px)',
      borderRadius: '12px',
      padding: '20px',
      border: '1px solid rgba(255,255,255,0.1)',
      textAlign: 'center',
      maxWidth: '700px',
      margin: '0 auto'
    }}>

      {/* Dynamic Phase Display */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        {OAM_PHASES.map(({ phase, price, cap }) => {
          const isActive = phase === currentPhase;
          return (
            <div key={phase} style={{
              flex: '1 1 30%',
              padding: '15px',
              borderRadius: '10px',
              background: isActive ? 'rgba(0,255,240,0.1)' : 'rgba(255,255,255,0.05)',
              border: isActive ? '2px solid #00FFF0' : '1px solid rgba(255,255,255,0.1)',
              color: isActive ? '#00FFF0' : '#888',
              fontWeight: isActive ? 'bold' : 'normal',
              transition: 'all 0.3s ease'
            }}>
              <div>Phase {phase}</div>
              <div>Price: ${price}</div>
              <div>Cap: {cap.toLocaleString()}</div>
            </div>
          );
        })}
      </div>

      {/* Buy Handler Below */}
      <BuyOAMPaymentType
        signer={signer}
        selectedPhase={currentPhase || 1} // Fallback to phase 1 if null
      />
    </div>
  );
}