# Boot-to-Waifu Interface

A two-phase Next.js experience that transforms a retro-futuristic terminal boot sequence into a fully interactive 3D waifu with real-time AI control — powered by x402 micropayments on Monad.

![Demo](demo.gif)

## Overview

**Phase 1 — Boot Sequence**
eDEX-UI inspired terminal animation with system logs, hardware checks, and a dramatic countdown. 5 seconds of pure retro-futuristic vibes.

**Phase 2 — Waifu Canvas**
The terminal fades into a sleek 3D environment featuring:

- Interactive 3D character with bone-level control
- Real-time morph targets (expressions, smiles, brow movement)
- Floating bob animation with cyberpunk lighting
- Glassmorphism UI overlay

## Features

- **3D Bone Control** — Click any body part to select its bone, then rotate via Leva controls or API
- **Expression System** — Morph target sliders for smile, brow raise, and more
- **Animation Playback** — Load and play GLTF animations with speed control
- **REST API** — External AI systems can animate the model via HTTP
- **x402 Payments** — Micropayments for AI-generated movements and interactions
- **Monad Settlement** — Sub-second transaction finality for seamless UX

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## x402 Payment Integration

The interface uses x402 protocol for pay-per-action AI interactions, settled on Monad blockchain.

### How It Works

1. User requests AI action (pose, dance, expression)
2. x402 generates a micropayment invoice (~$0.001-0.01)
3. User approves via connected wallet (RainbowKit)
4. Monad settles in ~500ms with near-zero gas
5. AI command executes on the 3D model

### Payment-Gated Endpoints

| Endpoint                | Cost (MON) | Description                    |
| ----------------------- | ---------- | ------------------------------ |
| `POST /api/bones`       | 0.0001     | Single bone rotation command   |
| `POST /api/bones/batch` | 0.0005     | Batch bone commands (up to 10) |
| `POST /api/ai/pose`     | 0.002      | AI-generated pose sequence     |
| `POST /api/ai/dance`    | 0.01       | Full dance animation (10s)     |

### Wallet Connection

Users connect via RainbowKit supporting:

- MetaMask
- WalletConnect
- Coinbase Wallet
- Rainbow Wallet

## API Reference

### Bone Control

```bash
# Rotate head (radians)
curl -X POST http://localhost:3000/api/bones \
  -H "Content-Type: application/json" \
  -H "X-Payment: <x402-proof>" \
  -d '{"bone": "Head_021", "x": 0.3, "y": 0, "z": 0}'
```

Response:

```json
{
  "ok": true,
  "queued": 1,
  "clamped": false,
  "payment": {
    "txHash": "0x...",
    "amount": "0.0001",
    "network": "monad-testnet"
  }
}
```

### List Registered Bones

```bash
curl http://localhost:3000/api/bones/register
```

### Poll Commands (Frontend)

```bash
curl http://localhost:3000/api/bones
```

## Tech Stack

| Layer         | Technologies                                   |
| ------------- | ---------------------------------------------- |
| **Framework** | Next.js 14 (App Router), React 18              |
| **3D**        | React Three Fiber, @react-three/drei, Three.js |
| **Animation** | Framer Motion, GLTF Animations                 |
| **Styling**   | Tailwind CSS 3.4, Custom CRT effects           |
| **Controls**  | Leva (debug UI), OrbitControls                 |
| **Payments**  | x402 Protocol, Monad Testnet                   |
| **Web3**      | wagmi, viem, RainbowKit                        |

## Project Structure

```
app/
├── api/
│   ├── bones/
│   │   ├── route.ts          # Bone commands (x402-gated)
│   │   ├── register/route.ts # Bone registration
│   │   └── state/route.ts    # State sync
│   └── payment/
│       └── verify/route.ts   # x402 proof verification
├── layout.tsx
├── page.tsx                  # Main orchestrator
└── globals.css
components/
├── BootSequence.tsx          # Phase 1: Terminal boot
├── WaifuCanvas.tsx           # Phase 2: 3D canvas
├── InterfaceOverlay.tsx      # Glassmorphism UI
└── PaymentProvider.tsx       # x402 + RainbowKit wrapper
lib/
├── characters.ts             # Character configs
├── x402.ts                   # Payment protocol utils
└── monad.ts                  # Chain configuration
```

## Configuration

### Environment Variables

```env
# Monad Testnet
NEXT_PUBLIC_MONAD_CHAIN_ID=10143
NEXT_PUBLIC_MONAD_RPC=https://testnet-rpc.monad.xyz

# x402 Protocol
NEXT_PUBLIC_X402_CONTRACT=0x...
X402_SIGNER_PRIVATE_KEY=...

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=...
```

### Adding New Characters

Edit `lib/characters.ts`:

```typescript
export const CHARACTERS: Record<CharacterId, CharacterConfig> = {
  chiku: {
    name: "Chiku",
    path: "/models/chiku.glb",
    thumbnail: "/thumbnails/chiku.png",
  },
  // Add more...
};
```

## Bone Limits

Human-accurate joint limits are enforced server-side for natural movement:

- **Head**: X: ±0.6, Y: ±0.8, Z: ±0.3 rad
- **Neck**: X: ±0.4, Y: ±0.5, Z: ±0.2 rad
- **Spine**: X: ±0.3, Y: ±0.4, Z: ±0.15 rad
- **Shoulders/Arms**: Full rotation with elbow constraints
- **Legs**: Hip flexion ±1.5, knee 0-2.5 rad

## Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Start production server
npx tsc --noEmit     # Type check
```

## License

MIT

---

_Built with Next.js, Three.js, and x402 on Monad._
