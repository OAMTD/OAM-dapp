'use client';
import FlashbitsPaymentType from './BuyFlashbitsPaymentType';

const FLASHBITS_PHASES = [
  { phase: 1, price: 0.0001001, cap: 250000000000 },
  { phase: 2, price: 0.000125, cap: 750000000000 }
];

export default function FlashCarousel({ signer }) {
  const currentPhase = FLASHBITS_PHASES[0]; // Change logic if dynamic later

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

      {/* Phase Blocks */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        {FLASHBITS_PHASES.map(({ phase, price, cap }) => {
          const isActive = phase === currentPhase.phase;
          return (
            <div key={phase} style={{
              flex: '1 1 45%',
              padding: '15px',
              borderRadius: '10px',
              background: isActive ? 'rgba(0,255,240,0.1)' : 'rgba(255,255,255,0.05)',
              border: isActive ? '2px solid #00FFF0' : '1px solid rgba(255,255,255,0.1)',
              color: isActive ? '#00FFF0' : '#888',
              fontWeight: isActive ? 'bold' : 'normal',
              transition: 'all 0.3s ease'
            }}>
              <div>Phase {phase}</div>
              <div>Price: ${price.toFixed(7)}</div>
              <div>Cap: {cap.toLocaleString()} Flashbits</div>
            </div>
          );
        })}
      </div>

      {/* Payment Handler */}
      <FlashbitsPaymentType signer={signer} selectedPhase={currentPhase.phase} />
    </div>
  );
}