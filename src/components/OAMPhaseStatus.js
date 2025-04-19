'use client';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import oamTokenAbi from '../abi/oamTokendao_abi.js';

const OAMPhaseStatus = () => {
  const [currentPhase, setCurrentPhase] = useState(null);
  const [price, setPrice] = useState(null);

  useEffect(() => {
    const fetchPhaseInfo = async () => {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        oamTokenAbi,
        provider
      );

      try {
        const phase = await contract.getCurrentPhase(); // Must exist in ABI
        const priceRaw = await contract.getCurrentPrice(); // Must exist in ABI
        const formattedPrice = ethers.formatUnits(priceRaw, 18);

        setCurrentPhase(Number(phase));
        setPrice(formattedPrice);
      } catch (err) {
        console.error('Error fetching phase data:', err.message);
      }
    };

    fetchPhaseInfo();
  }, []);

  return (
    <div style={{ fontSize: '1.1rem', color: '#00FFF0' }}>
      {currentPhase
        ? `Current OAM Phase: ${currentPhase} | Price: $${price}`
        : 'Fetching OAM Phase...'}
    </div>
  );
};

export default OAMPhaseStatus;
