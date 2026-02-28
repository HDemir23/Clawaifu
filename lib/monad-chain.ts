import { defineChain } from "viem";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://testnet-rpc.monad.xyz"] },
  },
  blockExplorers: {
    default: {
      name: "Monad Explorer",
      url: "https://testnet.monadexplorer.com",
    },
  },
  testnet: true,
});

// x402 constants — used by x402-server.template.ts
export const MONAD_NETWORK = "monad-testnet";
export const MONAD_USDC_ADDRESS =
  "0xf817257fed379853cDe0fa4F97AB987181B1E5Ea" as `0x${string}`;
export const MONAD_FACILITATOR_URL =
  "https://facilitator.monad-testnet.x402.org";
export const USDC_DECIMALS = 6;
