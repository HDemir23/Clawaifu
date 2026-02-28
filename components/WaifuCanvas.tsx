"use client";

import { useRef, memo, Suspense, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { Grid, ContactShadows, useGLTF, OrbitControls, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { useControls, button, folder } from "leva";
import { CharacterId, CHARACTERS } from "../lib/characters";

interface BoneClickInfo {
  mesh: string;
  bone: string | null;
}

interface WaifuModelProps {
  characterId: CharacterId;
  onBoneClick: (info: BoneClickInfo) => void;
}

const WaifuModel: React.FC<WaifuModelProps> = memo(({ characterId, onBoneClick }) => {
  const { scene, animations } = useGLTF(CHARACTERS[characterId].path);
  const groupRef = useRef<THREE.Group>(null);
  const baseYRef = useRef(0);
  const highlightedMeshRef = useRef<THREE.Mesh | null>(null);
  const originalEmissiveRef = useRef(new THREE.Color(0, 0, 0));
  const selectedBoneRef = useRef<THREE.Object3D | null>(null);

  const { actions, names } = useAnimations(animations, groupRef);

  const {
    animationName,
    animationSpeed,
    headX,
    headY,
    smileAmount,
    browAmount,
    enableBob,
  } = useControls("Character Controls", {
    Animation: folder({
      animationName: { label: "Clip", options: names.length ? names : ["(none)"] },
      animationSpeed: { label: "Speed", value: 1, min: 0, max: 3, step: 0.1 },
    }),
    Head: folder({
      headX: { label: "X", value: 0, min: -0.6, max: 0.6, step: 0.01 },
      headY: { label: "Y", value: 0, min: -0.6, max: 0.6, step: 0.01 },
    }),
    Expressions: folder({
      smileAmount: { label: "Smile",      value: 0, min: 0, max: 1, step: 0.01 },
      browAmount:  { label: "Brow Raise", value: 0, min: 0, max: 1, step: 0.01 },
    }),
    enableBob: { label: "Float Bob", value: true },
    "Log Bones": button(() => {
      scene.traverse((o) => {
        if (o.type === "Bone") console.log("BONE:", o.name);
      });
    }),
    "Log Morphs": button(() => {
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh && m.morphTargetDictionary)
          console.log("MESH:", o.name, Object.keys(m.morphTargetDictionary));
      });
    }),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [{ boneRotX, boneRotY, boneRotZ }, setBoneRot] = useControls(() => ({
    "Selected Bone": folder({
      boneRotX: { label: "Rot X", value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
      boneRotY: { label: "Rot Y", value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
      boneRotZ: { label: "Rot Z", value: 0, min: -Math.PI, max: Math.PI, step: 0.01 },
    }),
  })) as unknown as [{ boneRotX: number; boneRotY: number; boneRotZ: number }, (v: Record<string, number>) => void];

  const handleClick = useCallback((event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();

    // Restore emissive on previously highlighted mesh
    if (highlightedMeshRef.current) {
      const prevMat = highlightedMeshRef.current.material;
      if (
        prevMat instanceof THREE.MeshStandardMaterial ||
        prevMat instanceof THREE.MeshPhysicalMaterial
      ) {
        prevMat.emissive.copy(originalEmissiveRef.current);
        prevMat.emissiveIntensity = 0;
      }
      highlightedMeshRef.current = null;
    }

    const clicked = event.object as THREE.Mesh;

    // Walk up parent chain to find nearest Bone ancestor
    let boneName: string | null = null;
    let node: THREE.Object3D | null = clicked.parent ?? null;
    while (node) {
      if (node.type === "Bone") {
        boneName = node.name;
        selectedBoneRef.current = node;
        break;
      }
      node = node.parent;
    }

    // Highlight clicked mesh
    const mat = clicked.material;
    if (
      mat instanceof THREE.MeshStandardMaterial ||
      mat instanceof THREE.MeshPhysicalMaterial
    ) {
      originalEmissiveRef.current.copy(mat.emissive);
      mat.emissive.set(0x00ffff);
      mat.emissiveIntensity = 0.4;
      highlightedMeshRef.current = clicked;
    }

    // Reset bone rotation sliders
    setBoneRot({ boneRotX: 0, boneRotY: 0, boneRotZ: 0 });

    const info: BoneClickInfo = { mesh: clicked.name, bone: boneName };
    onBoneClick(info);
    console.log(`[BONE CLICK] Mesh: "${info.mesh}" | Bone: "${info.bone ?? "—"}"`);
  }, [onBoneClick, setBoneRot]);

  // Play animation clip
  useEffect(() => {
    const action = actions[animationName];
    if (!action) return;
    action.reset().fadeIn(0.3).play();
    action.timeScale = animationSpeed;
    return () => { action.fadeOut(0.3); };
  }, [animationName, actions]);

  // Live speed update without restart
  useEffect(() => {
    if (actions[animationName]) actions[animationName]!.timeScale = animationSpeed;
  }, [animationSpeed, animationName, actions]);

  // Auto-scale & center
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.scale.setScalar(1);
    group.position.set(0, 0, 0);
    group.updateMatrixWorld(true);

    const box = new THREE.Box3();
    group.traverseVisible((child) => {
      if ((child as THREE.Mesh).isMesh) box.union(new THREE.Box3().setFromObject(child));
    });
    if (box.isEmpty()) return;

    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    if (!maxDim) return;

    const scale = 2.8 / maxDim;
    group.scale.setScalar(scale);
    const sMin = box.min.clone().multiplyScalar(scale);
    const sMax = box.max.clone().multiplyScalar(scale);
    const center = sMin.clone().add(sMax).multiplyScalar(0.5);
    group.position.set(-center.x, -sMin.y, -center.z);
    baseYRef.current = group.position.y;
  }, [scene]);

  // Per-frame: bob + head bone + morph targets + selected bone rotation
  useFrame((state) => {
    if (!groupRef.current) return;

    if (enableBob)
      groupRef.current.position.y =
        baseYRef.current + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;

    // Head bone
    const head =
      scene.getObjectByName("head") ??
      scene.getObjectByName("Head") ??
      scene.getObjectByName("J_Bip_C_Head");
    if (head) {
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, headX, 0.1);
      head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, headY, 0.1);
    }

    // Morph targets
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || !m.morphTargetDictionary || !m.morphTargetInfluences) return;
      const d = m.morphTargetDictionary;
      if (d["smile"]      !== undefined) m.morphTargetInfluences[d["smile"]]      = smileAmount;
      if (d["browRaiser"] !== undefined) m.morphTargetInfluences[d["browRaiser"]] = browAmount;
    });

    // Selected bone rotation
    if (selectedBoneRef.current) {
      selectedBoneRef.current.rotation.x = boneRotX;
      selectedBoneRef.current.rotation.y = boneRotY;
      selectedBoneRef.current.rotation.z = boneRotZ;
    }
  });

  return (
    <group ref={groupRef} onClick={handleClick}>
      <primitive object={scene} dispose={null} />
    </group>
  );
});

WaifuModel.displayName = "WaifuModel";

useGLTF.preload(CHARACTERS.chiku.path);

interface SceneProps {
  characterId: CharacterId;
  onBoneClick: (info: BoneClickInfo) => void;
}

const Scene: React.FC<SceneProps> = memo(({ characterId, onBoneClick }) => {
  return (
    <>
      <ambientLight intensity={1.5} />

      {/* Main front fill — white so textures read correctly */}
      <directionalLight
        position={[0, 3, 5]}
        intensity={3}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Cyan rim from the left */}
      <spotLight
        position={[-5, 8, 3]}
        angle={0.4}
        penumbra={0.5}
        intensity={8}
        color="#00ffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Magenta rim from the right */}
      <spotLight
        position={[5, 5, 3]}
        angle={0.4}
        penumbra={0.5}
        intensity={6}
        color="#ff00ff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Close front fill */}
      <pointLight
        position={[0, 2, 3]}
        intensity={3}
        color="#ffffff"
        distance={12}
        decay={2}
      />

      <Suspense fallback={null}>
        <WaifuModel key={characterId} characterId={characterId} onBoneClick={onBoneClick} />
      </Suspense>

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        enablePan={false}
        minDistance={2}
        maxDistance={12}
        maxPolarAngle={Math.PI * 0.85}
        target={[0, 1.4, 0]}
      />

      <Grid
        position={[0, 0, 0]}
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
        position={[0, 0, 0]}
        opacity={0.5}
        scale={10}
        blur={2}
        far={4}
        color="#00ffff"
      />

      <fog attach="fog" args={["#050505", 5, 20]} />
    </>
  );
});

Scene.displayName = "Scene";

interface WaifuCanvasProps {
  character: CharacterId;
}

const WaifuCanvas: React.FC<WaifuCanvasProps> = memo(({ character }) => {
  const [selectedBoneInfo, setSelectedBoneInfo] = useState<BoneClickInfo | null>(null);

  const handleBoneClick = useCallback((info: BoneClickInfo) => {
    setSelectedBoneInfo(info);
  }, []);

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
        <Scene characterId={character} onBoneClick={handleBoneClick} />
      </Canvas>

      {selectedBoneInfo && (
        <div className="absolute bottom-4 right-4 glassmorphism px-4 py-3 font-mono text-xs pointer-events-none z-10">
          <div className="text-white/50 mb-1">
            MESH: <span className="text-cyber-cyan">{selectedBoneInfo.mesh || "—"}</span>
          </div>
          <div className="text-white/50">
            BONE: <span className="text-cyber-magenta">{selectedBoneInfo.bone ?? "—"}</span>
          </div>
        </div>
      )}
    </div>
  );
});

WaifuCanvas.displayName = "WaifuCanvas";

export default WaifuCanvas;
