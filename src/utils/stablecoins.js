// /utils/stablecoins.js

export const STABLECOINS = {
    usdt: {
      ethereum: process.env.NEXT_PUBLIC_USDT_ETH_ADDRESS,
      polygon: process.env.NEXT_PUBLIC_USDT_POLYGON_ADDRESS
    },
    usdc: {
      ethereum: process.env.NEXT_PUBLIC_USDC_ETH_ADDRESS,
      polygon: process.env.NEXT_PUBLIC_USDC_POLYGON_ADDRESS
    }
  };
  
  export function getStablecoinAddress(tokenChain) {
    // Split tokenChain like "USDC-Polygon"
    const [token, network] = tokenChain.toLowerCase().split('-');
    const chain = network === 'eth' ? 'ethereum' : network;
  
    if (STABLECOINS[token] && STABLECOINS[token][chain]) {
      return STABLECOINS[token][chain];
    }
  
    console.warn(`Unrecognized stablecoin mapping for ${tokenChain}`);
    return null;
  }