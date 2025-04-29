'use client';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import BuyOAMPaymentType from './BuyOAMPaymentType';
import oamTokenAbi from '../../abi/oamTokendao_abi';

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
      background: 'linear-gradient(145deg, #1a1a1a, #2b2b2b)',
      borderRadius: '14px',
      padding: '24px',
      border: '2px solid #00FFF0',
      boxShadow: '0 0 18px #00FFF0, inset 0 0 6px #00FFF0',
      textAlign: 'center',
      maxWidth: '740px',
      margin: '0 auto'
    }}>

      {/* Dynamic Phase Display */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '24px',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        {OAM_PHASES.map(({ phase, price, cap }) => {
          const isActive = phase === currentPhase || (currentPhase === null && phase === 1);
          return (
            <div key={phase} style={{
              flex: '1 1 30%',
              padding: '16px',
              borderRadius: '12px',
              background: isActive ? 'rgba(0, 255, 240, 0.15)' : 'rgba(50,50,50,0.35)',
              border: isActive ? '2px solid #00FFF0' : '1px solid rgba(255,255,255,0.1)',
              boxShadow: isActive
                ? '0 0 12px #00FFF0, inset 0 0 8px #00FFF0'
                : 'none',
              color: isActive ? '#00FFF0' : '#aaa',
              fontWeight: isActive ? 'bold' : 'normal',
              textShadow: isActive ? '0 0 6px #00FFF0' : 'none',
              transition: 'all 0.4s ease',
              animation: isActive ? 'cyberPulse 2s infinite alternate' : 'none'
            }}>
              <div>Phase {phase}</div>
              <div>Price: ${price}</div>
              <div>Cap: {cap.toLocaleString()}</div>
            </div>
          );
        })}
      </div>

      {/* Buy Handler */}
      <BuyOAMPaymentType
        signer={signer}
        selectedPhase={currentPhase || 1}
      />

      {/* Embedded keyframes */}
      <style>{`
        @keyframes cyberPulse {
          from {
            box-shadow: 0 0 8px #00FFF0, inset 0 0 4px #00FFF0;
          }
          to {
            box-shadow: 0 0 20px #00FFF0, inset 0 0 12px #00FFF0;
          }
        }
      `}</style>
    </div>
  );
}