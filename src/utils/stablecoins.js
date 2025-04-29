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
  