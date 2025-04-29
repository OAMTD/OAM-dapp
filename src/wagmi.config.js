import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon, mainnet } from 'wagmi/chains';
import { createConfig } from 'wagmi';

export const wagmiConfig = getDefaultConfig ({

    appName: 'OAM Token DAO',
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    chains: [polygon, mainnet],
  });


export const chains = [polygon, mainnet]
