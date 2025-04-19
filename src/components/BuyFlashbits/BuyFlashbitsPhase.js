
// logic/BuyFlashbits.js
export const FLASHBITS_PHASES = [
    { phase: 1, price: 0.0001001, cap: 250_000 * 1_000_000 },
    { phase: 2, price: 0.000125, cap: 750_000 * 1_000_000 }
  ];
  
  export function getFlashbitsPhaseData(phase) {
    return FLASHBITS_PHASES.find(p => p.phase === phase);
  }
  
  export function calculateFlashbitsCost(phase, quantity) {
    const phaseData = getFlashbitsPhaseData(phase);
    return phaseData ? phaseData.price * quantity : 0;
  }
  
  