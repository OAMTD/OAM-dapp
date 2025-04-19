// components/BuyBundleCarousel.js
'use client';
import React from 'react';

const bundlePhases = [
  { phase: 1, price: 100, oamPerBundle: 50, supply: 250 },
  { phase: 2, price: 500, oamPerBundle: 50, supply: 250 },
  { phase: 3, price: 850, oamPerBundle: 50, supply: 250 },
];

const BuyBundleCarousel = () => {
  return (
    <div style={{ overflowY: 'auto', maxHeight: '300px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: '10px' }}>
      {bundlePhases.map(({ phase, price, oamPerBundle, supply }) => (
        <div key={phase} style={{ marginBottom: '15px', padding: '12px', backgroundColor: 'rgba(255, 255, 255, 0.07)', borderRadius: '8px' }}>
          <h4 style={{ color: '#00FFF0' }}>Phase {phase}</h4>
          <p style={{ margin: 0 }}>Price: ${price}</p>
          <p style={{ margin: 0 }}>Bundles Available: {supply}</p>
          <p style={{ margin: 0 }}>Each Bundle: {oamPerBundle} OAM</p>
        </div>
      ))}
    </div>
  );
};

export default BuyBundleCarousel;




