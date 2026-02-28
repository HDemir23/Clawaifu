"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid, ContactShadows, Environment } from "@react-three/drei";
import * as THREE from "three";

function WaifuPlaceholder() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y =
        0 + Math.sin(state.clock.elapsedTime * 0.8) * 0.15;
      meshRef.current.rotation.y += 0.003;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <capsuleGeometry args={[0.5, 1.5, 4, 16]} />
      <meshStandardMaterial
        color="#00ffff"
        wireframe={true}
        emissive="#00ffff"
        emissiveIntensity={0.3}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.2} />

      <spotLight
        position={[-5, 8, 3]}
        angle={0.4}
        penumbra={0.5}
        intensity={2}
        color="#00ffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <spotLight
        position={[5, 5, 3]}
        angle={0.4}
        penumbra={0.5}
        intensity={2}
        color="#ff00ff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <pointLight
        position={[0, -2, 2]}
        intensity={0.5}
        color="#00ffff"
        distance={10}
        decay={2}
      />

      {/*
       * ═══════════════════════════════════════════════════════════════════════════
       * WAIFU MODEL PLACEHOLDER
       * ═══════════════════════════════════════════════════════════════════════════
       *
       * To replace the placeholder with your actual .glb model:
       *
       * 1. Import useGLTF from @react-three/drei at the top of this file:
       *    import { Grid, ContactShadows, Environment, useGLTF } from '@react-three/drei'
       *
       * 2. Create a new component for your waifu model:
       *
       *    function WaifuModel() {
       *      const { scene } = useGLTF('/path/to/your/waifu.glb')
       *      const modelRef = useRef<THREE.Group>(null)
       *
       *      useFrame((state) => {
       *        if (modelRef.current) {
       *          // Optional: Add idle animation
       *          modelRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
       *          // Optional: Subtle breathing rotation
       *          modelRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.02
       *        }
       *      })
       *
       *      return <primitive ref={modelRef} object={scene} scale={1} position={[0, 0, 0]} />
       *    }
       *
       * 3. Replace <WaifuPlaceholder /> below with <WaifuModel />
       *
       * 4. Preload the model for better performance by adding at the bottom of the file:
       *    useGLTF.preload('/path/to/your/waifu.glb')
       *
       * NOTE: Make sure your .glb file is in the public/ folder of your Next.js project
       * so it can be served at the root path.
       * ═══════════════════════════════════════════════════════════════════════════
       */}

      <WaifuPlaceholder />

      <Grid
        position={[0, -1.5, 0]}
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#00ffff"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#0088aa"
        fadeDistance={15}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={true}
      />

      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.5}
        scale={10}
        blur={2}
        far={4}
        color="#00ffff"
      />

      <fog attach="fog" args={["#050505", 5, 20]} />
    </>
  );
}

const WaifuCanvas: React.FC = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{
          position: [0, 1.5, 5],
          fov: 45,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        shadows
      >
        <color attach="background" args={["#050505"]} />
        <Scene />
      </Canvas>
    </div>
  );
};

export default WaifuCanvas;
