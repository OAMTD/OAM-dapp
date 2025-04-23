
import '@rainbow-me/rainbowkit/styles.css';
import '../styles/globals.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { WagmiConfig } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { wagmiConfig, chains } from '../wagmi.config';

const queryClient = new QueryClient

function MyApp({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
    </QueryClientProvider>
  );
}

export default MyApp;
