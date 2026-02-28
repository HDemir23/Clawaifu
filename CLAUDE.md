# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Development server (Next.js)
npm run build        # Production build
npm run lint         # ESLint via Next.js
npx tsc --noEmit    # Type check (no dedicated script)
```

No test framework is configured.

## Architecture

### Two-Phase App Flow

`app/page.tsx` owns the `phase: "boot" | "canvas"` state. On mount the app shows `BootSequence`; after its 5-second animation completes it transitions to the canvas phase, which renders `WaifuCanvas` + `InterfaceOverlay` side-by-side.

### 3D Scene Hierarchy

```
WaifuCanvas          ← holds selectedBoneInfo state, renders DOM info overlay (outside Canvas)
 └─ <Canvas>         ← R3F canvas, configured with shadows, dpr=[1,2], fixed camera
     └─ Scene        ← lights, grid, contact shadows, fog, OrbitControls
         └─ WaifuModel  ← loads GLB, auto-scales, runs useFrame animations
```

State flows **down** as props (`onBoneClick`), never through context.

### Character Registry

`lib/characters.ts` is the single source of truth. Currently locked to a single entry:

```ts
export type CharacterId = "chiku";
export const CHARACTERS = { chiku: { name: "Chiku", path: "/models/chiku/chiku_fart_girl.glb" } };
```

`WaifuModel` reads `CHARACTERS[characterId].path` for `useGLTF`. The preload call at module scope (`useGLTF.preload(CHARACTERS.chiku.path)`) must be updated whenever the model path changes.

### Bone Click System

`WaifuModel` handles `ThreeEvent<MouseEvent>` clicks on the `<group>`:
1. Restores emissive on the previous mesh (stored in `highlightedMeshRef`)
2. Walks `event.object.parent` chain to find the nearest `type === "Bone"` ancestor → stores it in `selectedBoneRef`
3. Sets `emissive = #00ffff`, `emissiveIntensity = 0.4` on the clicked mesh
4. Calls `onBoneClick({ mesh, bone })` → lifted to `WaifuCanvas` state → shown in DOM overlay
5. Resets Leva "Selected Bone" sliders via `setBoneRot` (tuple form of `useControls`)

`useFrame` applies `boneRotX/Y/Z` from Leva to `selectedBoneRef.current.rotation`.

### Leva Controls

Two `useControls` calls in `WaifuModel`:
- `useControls("Character Controls", {...})` — named panel, returns values object (animation clip, speed, head rotation, morph targets, bob toggle, log buttons)
- `useControls(() => ({...}))` — unnamed/function form, returns `[values, set]` tuple — used for the "Selected Bone" folder to get the `set` function for slider resets

### Styling System

All components use `"use client"`. Tailwind is the primary styling tool. Custom utilities in `globals.css` (not generated — defined in `@layer components`):

| Class | Purpose |
|---|---|
| `.glassmorphism` | `bg-white/5` + `backdrop-blur-md` + border |
| `.glassmorphism-dark` | `bg-black/30` + `backdrop-blur-lg` + border |
| `.terminal-text` / `.terminal-text-cyan` | Colored glowing text |
| `.glow-text` / `.glow-text-subtle` | `text-shadow` glow |
| `.crt-overlay` | Fixed z-9999 scanline + vignette overlay |
| `.blink-cursor` | `::after` block cursor |

Custom Tailwind colors: `hacker-green (#00FF41)`, `cyber-cyan (#00FFFF)`, `cyber-magenta (#FF00FF)`, `terminal-black (#050505)`.

### Model Assets

GLB files live in `public/models/<name>/`. The `3Dmodels/` directory at the repo root contains raw source files (not served). Only the `public/` path is accessible at runtime.

### Key Constraints

- `three` is transpiled via `next.config.js` (`transpilePackages: ["three"]`) — required for SSR compatibility
- `reactStrictMode: true` — effects run twice in dev; be careful with `useFrame` side effects
- All components are wrapped in `memo()` with `.displayName` set
- Animation constants (variants, transitions) are hoisted to module scope to avoid re-creating objects on render
