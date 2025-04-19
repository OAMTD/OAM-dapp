
'use client';
import BuyOAMPaymentType from './BuyOAMPaymentType';

const OAM_PHASES = [
  { phase: 1, price: 3, cap: 100000 },
  { phase: 2, price: 12, cap: 300000 },
  { phase: 3, price: 20, cap: 900000 }
];

export default function BuyOAMCarousel({ signer }) {
  const currentPhase = OAM_PHASES[0]; // Change logic if dynamic phases later

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

      {/* Stacked Phase Display */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '20px',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        {OAM_PHASES.map(({ phase, price, cap }) => {
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
              <div>Cap: {cap.toLocaleString()}</div>
            </div>
          );
        })}
      </div>

      {/* Buy Handler Below */}
      <BuyOAMPaymentType
        signer={signer}
        selectedPhase={currentPhase.phase}
      />
    </div>
  );
}