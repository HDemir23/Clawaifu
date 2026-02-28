// x402 Payment Server Template
// Uncomment and configure to enable x402 micropayment gating on API routes.
// Requires: npm install @x402/core @x402/evm
// Set PAY_TO_ADDRESS in your .env

// import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
// import type {
//   PaymentPayload,
//   PaymentRequirements,
//   VerifyResponse,
//   SettleResponse,
// } from "@x402/core/types";
// import { ExactEvmScheme } from "@x402/evm/exact/server";
// import {
//   MONAD_NETWORK,
//   MONAD_USDC_ADDRESS,
//   MONAD_FACILITATOR_URL,
//   USDC_DECIMALS,
// } from "./monad-chain";
//
// console.log("[x402-server] Initializing with facilitator:", MONAD_FACILITATOR_URL);
// console.log("[x402-server] Network:", MONAD_NETWORK);
// console.log("[x402-server] USDC:", MONAD_USDC_ADDRESS);
//
// const facilitatorClient = new HTTPFacilitatorClient({
//   url: MONAD_FACILITATOR_URL,
// });
//
// const monadScheme = new ExactEvmScheme();
// monadScheme.registerMoneyParser(async (amount: number, network: string) => {
//   if (network === MONAD_NETWORK) {
//     return {
//       amount: Math.floor(amount * 1_000_000).toString(),
//       asset: MONAD_USDC_ADDRESS,
//       extra: { name: "USDC", version: "2" },
//     };
//   }
//   return null;
// });
//
// export const server = new x402ResourceServer(facilitatorClient);
// server.register(MONAD_NETWORK, monadScheme);
//
// export const PAY_TO = process.env.PAY_TO_ADDRESS!;
