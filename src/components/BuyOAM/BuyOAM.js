// logic/BuyOAM.js
import React from 'react';
import BuyOAMPaymentType from './BuyOAMPaymentType';
import OAMPhaseStatus from '../OAMPhaseStatus';


export const OAM_PHASES = [
  { phase: 1, price: 3, cap: 100000 },
  { phase: 2, price: 12, cap: 300000 },
  { phase: 3, price: 20, cap: 900000 }
];

export function getPhaseData(phase) {
  return OAM_PHASES.find(p => p.phase === phase);
}

export function calculateCost(phase, quantity) {
  const data = getPhaseData(phase);
  return data ? data.price * quantity : 0;
}

export default function BuyOAM() {
  return (
   <div>
     <h2> Buy OAM Component</h2>
     <BuyOAMPaymentType/>
     </div>
  );
}

