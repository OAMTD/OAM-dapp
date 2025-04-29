'use client';

import { useEffect } from 'react';

export default function WarpStarfield({ active }) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const styleSheet = document.styleSheets[0];

      styleSheet.insertRule(`
        @keyframes warpMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(-200%) }
        }
      `, styleSheet.cssRules.length);
    }
  }, []);

  return (
    <div style={{
      position: 'absolute',
      width: '200%',
      height: '200%',
      background: 'radial-gradient(circle, black 20%, #000 80%)',
      overflow: 'hidden',
      animation: active ? 'warpMove 10s linear infinite' : 'warpMove 30s linear infinite',
      opacity: active ? 1 : 0,
      transition: 'opacity 3s ease-out',
      zIndex: 0
    }}>
      {[...Array(200)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: `${Math.random() * 200}%`,
          left: `${Math.random() * 200}%`,
          width: '2px',
          height: '8px',
          background: '#00FFF0',
          opacity: Math.random() * 0.8 + 0.2,
          transform: `rotate(${Math.random() * 360}deg)`,
        }} />
      ))}
    </div>
  );
}