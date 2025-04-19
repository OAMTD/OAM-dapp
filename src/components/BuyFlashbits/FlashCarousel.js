
// components/BuyFlashbitsCarousel.js
'use client';
import React from 'react';

const flashbitsPhases = [
  { phase: 1, price: 0.0001001, cap: 250000 },
  { phase: 2, price: 0.000125, cap: 750000 },
];

const FlashCarousel = () => {
  return (
    <div style={{ overflowY: 'auto', maxHeight: '300px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '10px' }}>
      {flashbitsPhases.map(({ phase, price, cap }) => (
        <div key={phase} style={{ marginBottom: '15px', padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.07)', borderRadius: '8px' }}>
          <h4 style={{ color: '#00FFF0' }}>Phase {phase}</h4>
          <p style={{ margin: 0 }}>Price: ${price.toFixed(7)} per Flashbits</p>
          <p style={{ margin: 0 }}>OAM Cap: {cap.toLocaleString()} OAM</p>
        </div>
      ))}
    </div>
  );
};

export default FlashCarousel