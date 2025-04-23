
'use client';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

export const MyStyledConnectButton = () => {
  const { openConnectModal } = useConnectModal();
  const { address, isConnected } = useAccount();

  return (
    <button
      onClick={openConnectModal}
      style={{
        marginBottom: 10,
        padding: '12px 24px',
        backgroundColor: '#00ffc3',
        color: '#000',
        fontWeight: 'bold',
        borderRadius: '30px',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 0 8px #00ffc3'
      }}
    >
      {isConnected
        ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`
        : 'Connect Wallet'}
    </button>
  );
};

