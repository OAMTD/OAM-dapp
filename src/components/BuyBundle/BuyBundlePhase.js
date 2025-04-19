// components/BuyBundlePhase.js
'use client';
import { useState } from 'react';
import { ethers } from 'ethers';

export const BUNDLE_PHASES = [
  { phase: 1, price: 100, supply: 250, oamPerBundle: 50 },
  { phase: 2, price: 500, supply: 250, oamPerBundle: 50 },
  { phase: 3, price: 850, supply: 250, oamPerBundle: 50 }
];

export default function BundlePhaseSelector({ selectedPhase, setSelectedPhase }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label>Select Bundle Phase:</label>
      <select
        value={selectedPhase}
        onChange={(e) => setSelectedPhase(parseInt(e.target.value))}
        style={{ marginLeft: '10px', padding: '6px' }}
      >
        {BUNDLE_PHASES.map(({ phase, price, supply }) => (
          <option key={phase} value={phase}>
            Phase {phase}: ${price} | {supply} Bundles | 50 OAM
          </option>
        ))}
      </select>
    </div>
  );
}
