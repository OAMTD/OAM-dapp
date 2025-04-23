'use client';
import BuyBundlePaymentType from './BuyBundlePaymentType';

const BUNDLE_PHASES = [
  { phase: 1, price: 100, supply: 250 },
  { phase: 2, price: 500, supply: 250 },
  { phase: 3, price: 850, supply: 250 }
];

export default function BuyBundleCarousel({ signer }) {
  const currentPhase = BUNDLE_PHASES[0]; // Static for now, dynamic logic optional later

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

      {/* Phase Display */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        {BUNDLE_PHASES.map(({ phase, price, supply }) => {
          const isActive = phase === currentPhase.phase;
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
              <div>Supply: {supply}</div>
            </div>
          );
        })}
      </div>

      {/* Buy Handler Module */}
      <BuyBundlePaymentType signer={signer} selectedPhase={currentPhase.phase} />
    </div>
  );
}