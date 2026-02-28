"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BootSequence from "../components/BootSequence";
import WaifuCanvas from "../components/WaifuCanvas";
import InterfaceOverlay from "../components/InterfaceOverlay";

const BOOT_EXIT = {
  opacity: 0,
  scale: 1.05,
  filter: "blur(10px)",
};

const BOOT_TRANSITION = {
  duration: 1,
  ease: "easeInOut" as const,
};

const CANVAS_INITIAL = { opacity: 0 };
const CANVAS_ANIMATE = { opacity: 1 };
const CANVAS_TRANSITION = {
  duration: 1.5,
  ease: "easeOut" as const,
  delay: 0.2,
};

export default function Home() {
  const [phase, setPhase] = useState<"boot" | "canvas">("boot");

  const handleBootComplete = useCallback(() => {
    setPhase("canvas");
  }, []);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-terminal-black">
      <div className="crt-overlay" />

      <AnimatePresence mode="wait">
        {phase === "boot" && (
          <motion.div
            key="boot"
            initial={{ opacity: 1 }}
            exit={BOOT_EXIT}
            transition={BOOT_TRANSITION}
            className="absolute inset-0 z-20"
          >
            <BootSequence onComplete={handleBootComplete} />
          </motion.div>
        )}

        {phase === "canvas" && (
          <motion.div
            key="canvas"
            initial={CANVAS_INITIAL}
            animate={CANVAS_ANIMATE}
            transition={CANVAS_TRANSITION}
            className="absolute inset-0"
          >
            <WaifuCanvas />
            <InterfaceOverlay />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
