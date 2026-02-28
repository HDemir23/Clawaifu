"use client";

import {
  useRef,
  memo,
  Suspense,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import {
  Grid,
  ContactShadows,
  useGLTF,
  OrbitControls,
  useAnimations,
} from "@react-three/drei";
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

const WaifuModel: React.FC<WaifuModelProps> = memo(
  ({ characterId, onBoneClick }) => {
    const { scene, animations } = useGLTF(CHARACTERS[characterId].path);
    const groupRef = useRef<THREE.Group>(null);
    const baseYRef = useRef(0);
    const lastClickTimeRef = useRef(0);
    const highlightStateRef = useRef<
      Map<
        THREE.Mesh,
        {
          emissive: THREE.Color;
          emissiveIntensity: number;
        }
      >
    >(new Map());
    const selectedBoneRef = useRef<THREE.Object3D | null>(null);
    const boneMapRef = useRef<Map<string, THREE.Object3D>>(new Map());
    const origColorsRef = useRef<Map<THREE.Material, THREE.Color>>(new Map());
    const [origColorsReady, setOrigColorsReady] = useState(false);
    const targetRotationsRef = useRef<
      Map<string, { x: number; y: number; z: number }>
    >(new Map());

    const { actions, names } = useAnimations(animations, groupRef);

    const [isRecording, setIsRecording] = useState(false);
    const recordedRangesRef = useRef<
      Map<string, { min: THREE.Vector3; max: THREE.Vector3 }>
    >(new Map());

    const {
      animationName,
      animationSpeed,
      headX,
      headY,
      smileAmount,
      browAmount,
      enableBob,
      colorTint,
    } = useControls("Character Controls", {
      Animation: folder({
        animationName: {
          label: "Clip",
          options: names.length ? names : ["(none)"],
        },
        animationSpeed: { label: "Speed", value: 1, min: 0, max: 3, step: 0.1 },
      }),
      "Record Ranges": button(() => {
        setIsRecording(true);
        recordedRangesRef.current.clear();
        const targetBones = [
          "Head_021",
          "Neck_020",
          "Spine_018",
          "Spine_1_019",
          "ShoulderR_043",
          "ShoulderL_067",
          "UpperarmR_044",
          "UpperarmL_068",
          "ForearmR_045",
          "ForearmL_069",
          "HandR_046",
          "HandL_070",
          "ThighR_093",
          "ThighL_099",
          "CalfR_094",
          "CalfL_0100",
        ];
        setTimeout(() => {
          setIsRecording(false);
          console.log("--- CLEAN RECORDED RANGES ---");
          const result: any = {};
          recordedRangesRef.current.forEach((range, name) => {
            if (targetBones.includes(name)) {
              result[name] = {
                x: [
                  Number(range.min.x.toFixed(3)),
                  Number(range.max.x.toFixed(3)),
                ],
                y: [
                  Number(range.min.y.toFixed(3)),
                  Number(range.max.y.toFixed(3)),
                ],
                z: [
                  Number(range.min.z.toFixed(3)),
                  Number(range.max.z.toFixed(3)),
                ],
              };
            }
          });
          console.log(JSON.stringify(result, null, 2));
        }, 5000);
      }),
      Head: folder({
        headX: { label: "X", value: 0, min: -0.6, max: 0.6, step: 0.01 },
        headY: { label: "Y", value: 0, min: -0.6, max: 0.6, step: 0.01 },
      }),
      Expressions: folder({
        smileAmount: { label: "Smile", value: 0, min: 0, max: 1, step: 0.01 },
        browAmount: {
          label: "Brow Raise",
          value: 0,
          min: 0,
          max: 1,
          step: 0.01,
        },
      }),
      enableBob: { label: "Float Bob", value: true },
      colorTint: { label: "Color Tint", value: "#c900fe" },
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

    const boneNames = useMemo(() => {
      const ns: string[] = [];
      scene.traverse((o) => {
        if (o.type === "Bone" && o.name) ns.push(o.name);
      });
      return ns.sort();
    }, [scene]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [{ boneRotX, boneRotY, boneRotZ, selectedBoneName }, setBoneRot] =
      useControls(() => ({
        "Selected Bone": folder({
          selectedBoneName: {
            label: "Bone",
            value: boneNames[0] ?? "",
            options: boneNames.length ? boneNames : ["(no bones)"],
          },
          boneRotX: {
            label: "Rot X",
            value: 0,
            min: -Math.PI,
            max: Math.PI,
            step: 0.01,
          },
          boneRotY: {
            label: "Rot Y",
            value: 0,
            min: -Math.PI,
            max: Math.PI,
            step: 0.01,
          },
          boneRotZ: {
            label: "Rot Z",
            value: 0,
            min: -Math.PI,
            max: Math.PI,
            step: 0.01,
          },
        }),
      })) as unknown as [
        {
          boneRotX: number;
          boneRotY: number;
          boneRotZ: number;
          selectedBoneName: string;
        },
        (v: Record<string, number | string>) => void,
      ];

    const handleClick = useCallback(
      (event: ThreeEvent<MouseEvent>) => {
        event.stopPropagation();
        const now = Date.now();
        if (now - lastClickTimeRef.current < 300) return;
        lastClickTimeRef.current = now;

        // Restore emissive on all previously highlighted meshes
        highlightStateRef.current.forEach((state, mesh) => {
          const mats = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          for (const mat of mats) {
            if (
              mat instanceof THREE.MeshStandardMaterial ||
              mat instanceof THREE.MeshPhysicalMaterial
            ) {
              mat.emissive.copy(state.emissive);
              mat.emissiveIntensity = state.emissiveIntensity;
            }
          }
        });
        highlightStateRef.current.clear();

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

        // Highlight clicked mesh - handle material arrays
        const mats = Array.isArray(clicked.material)
          ? clicked.material
          : [clicked.material];
        for (const mat of mats) {
          if (
            mat instanceof THREE.MeshStandardMaterial ||
            mat instanceof THREE.MeshPhysicalMaterial
          ) {
            highlightStateRef.current.set(clicked, {
              emissive: mat.emissive.clone(),
              emissiveIntensity: mat.emissiveIntensity,
            });
            mat.emissive.set(0x00ffff);
            mat.emissiveIntensity = 0.4;
          }
        }

        // Reset bone rotation sliders
        setBoneRot({ boneRotX: 0, boneRotY: 0, boneRotZ: 0 });

        const info: BoneClickInfo = { mesh: clicked.name, bone: boneName };
        onBoneClick(info);
        console.log(
          `[BONE CLICK] Mesh: "${info.mesh}" | Bone: "${info.bone ?? "—"}"`,
        );
      },
      [onBoneClick, setBoneRot],
    );

    // Play animation clip
    useEffect(() => {
      const action = actions[animationName];
      if (!action) return;
      action.reset().fadeIn(0.3).play();
      action.timeScale = animationSpeed;
      return () => {
        action.fadeOut(0.3);
      };
    }, [animationName, actions]);

    // Live speed update without restart
    useEffect(() => {
      if (actions[animationName])
        actions[animationName]!.timeScale = animationSpeed;
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
        if ((child as THREE.Mesh).isMesh)
          box.union(new THREE.Box3().setFromObject(child));
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

    // Effect 1 — Scene load: populate boneMap, register bones, store original colors
    useEffect(() => {
      const boneMap = boneMapRef.current;
      boneMap.clear();
      scene.traverse((o) => {
        if (o.type === "Bone" && o.name) boneMap.set(o.name, o);
      });

      const names = Array.from(boneMap.keys());
      fetch("/api/bones/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bones: names }),
      }).then(() => {
        console.log(`[clawbot] Registered ${names.length} bones`);
      });

      const origColors = origColorsRef.current;
      origColors.clear();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const mats = Array.isArray(m.material) ? m.material : [m.material];
        for (const mat of mats) {
          if (
            (mat as THREE.MeshStandardMaterial).color &&
            !origColors.has(mat)
          ) {
            origColors.set(
              mat,
              (mat as THREE.MeshStandardMaterial).color.clone(),
            );
          }
        }
      });

      return () => {
        origColorsRef.current.clear();
        setOrigColorsReady(false);
      };
    }, [scene]);

    // Signal when origColors are ready
    useEffect(() => {
      if (origColorsRef.current.size > 0 && !origColorsReady) {
        setOrigColorsReady(true);
      }
    }, [origColorsReady]);

    // Effect 2 — Color tint
    useEffect(() => {
      if (origColorsRef.current.size === 0) return;
      const tint = new THREE.Color(colorTint);
      origColorsRef.current.forEach((origColor, mat) => {
        (mat as THREE.MeshStandardMaterial).color
          .copy(origColor)
          .multiply(tint);
      });
    }, [colorTint, origColorsReady]);

    // Cleanup: restore highlighted meshes on unmount
    useEffect(() => {
      return () => {
        highlightStateRef.current.forEach((state, mesh) => {
          const mats = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          for (const mat of mats) {
            if (
              mat instanceof THREE.MeshStandardMaterial ||
              mat instanceof THREE.MeshPhysicalMaterial
            ) {
              mat.emissive.copy(state.emissive);
              mat.emissiveIntensity = state.emissiveIntensity;
            }
          }
        });
        highlightStateRef.current.clear();
      };
    }, []);

    // Effect 3 — Named bone select sync
    useEffect(() => {
      if (!selectedBoneName || selectedBoneName === "(no bones)") return;
      const bone = boneMapRef.current.get(selectedBoneName);
      if (bone) {
        selectedBoneRef.current = bone;
        setBoneRot({ boneRotX: 0, boneRotY: 0, boneRotZ: 0 });
      }
    }, [selectedBoneName, setBoneRot]);

    // Effect 4 — Polling for LLM bone commands (store targets, don't apply directly)
    useEffect(() => {
      const id = setInterval(async () => {
        const res = await fetch("/api/bones");
        const { commands } = await res.json();
        for (const cmd of commands) {
          const bone = boneMapRef.current.get(cmd.bone);
          if (!bone) {
            console.warn(`[clawbot] Unknown bone: "${cmd.bone}"`);
            continue;
          }
          targetRotationsRef.current.set(cmd.bone, {
            x: cmd.x,
            y: cmd.y,
            z: cmd.z,
          });
          console.log(`[clawbot] Queued: ${cmd.bone}`, cmd);
        }
      }, 200);
      return () => clearInterval(id);
    }, [setBoneRot]);

    // Effect 5 — Sync actual bone rotations to server state (source of truth for LLM)
    useEffect(() => {
      const id = setInterval(async () => {
        const states: Record<string, { x: number; y: number; z: number }> = {};
        boneMapRef.current.forEach((bone, name) => {
          states[name] = {
            x: bone.rotation.x,
            y: bone.rotation.y,
            z: bone.rotation.z,
          };
        });
        if (Object.keys(states).length > 0) {
          await fetch("/api/bones/state", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ states }),
          });
        }
      }, 500);
      return () => clearInterval(id);
    }, []);

    // Per-frame: bob + head bone + morph targets + selected bone rotation
    useFrame((state) => {
      if (!groupRef.current) return;

      if (isRecording) {
        scene.traverse((o) => {
          if (o.type === "Bone") {
            const range = recordedRangesRef.current.get(o.name) || {
              min: new THREE.Vector3(Infinity, Infinity, Infinity),
              max: new THREE.Vector3(-Infinity, -Infinity, -Infinity),
            };
            range.min.x = Math.min(range.min.x, o.rotation.x);
            range.min.y = Math.min(range.min.y, o.rotation.y);
            range.min.z = Math.min(range.min.z, o.rotation.z);
            range.max.x = Math.max(range.max.x, o.rotation.x);
            range.max.y = Math.max(range.max.y, o.rotation.y);
            range.max.z = Math.max(range.max.z, o.rotation.z);
            recordedRangesRef.current.set(o.name, range);
          }
        });
      }

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
        if (!m.isMesh || !m.morphTargetDictionary || !m.morphTargetInfluences)
          return;
        const d = m.morphTargetDictionary;
        if (d["smile"] !== undefined)
          m.morphTargetInfluences[d["smile"]] = smileAmount;
        if (d["browRaiser"] !== undefined)
          m.morphTargetInfluences[d["browRaiser"]] = browAmount;
      });

      // Interpolate bone rotations towards targets (LLM commands override animation)
      const lerpFactor = 0.04;
      const animationBlendFactor = 0.3;
      targetRotationsRef.current.forEach((target, boneName) => {
        const bone = boneMapRef.current.get(boneName);
        if (!bone) return;
        bone.rotation.x = THREE.MathUtils.lerp(
          bone.rotation.x,
          target.x,
          lerpFactor,
        );
        bone.rotation.y = THREE.MathUtils.lerp(
          bone.rotation.y,
          target.y,
          lerpFactor,
        );
        bone.rotation.z = THREE.MathUtils.lerp(
          bone.rotation.z,
          target.z,
          lerpFactor,
        );
      });

      // Selected bone rotation
      if (selectedBoneRef.current) {
        selectedBoneRef.current.rotation.x = boneRotX;
        selectedBoneRef.current.rotation.y = boneRotY;
        selectedBoneRef.current.rotation.z = boneRotZ;
      }
    });

    return (
      <group
        ref={groupRef}
        onClick={handleClick}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <primitive object={scene} dispose={null} />
      </group>
    );
  },
);

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
        <WaifuModel
          key={characterId}
          characterId={characterId}
          onBoneClick={onBoneClick}
        />
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
  const [selectedBoneInfo, setSelectedBoneInfo] =
    useState<BoneClickInfo | null>(null);

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
            MESH:{" "}
            <span className="text-cyber-cyan">
              {selectedBoneInfo.mesh || "—"}
            </span>
          </div>
          <div className="text-white/50">
            BONE:{" "}
            <span className="text-cyber-magenta">
              {selectedBoneInfo.bone ?? "—"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

WaifuCanvas.displayName = "WaifuCanvas";

export default WaifuCanvas;
