"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import BootSequence from "../components/BootSequence";
import WaifuCanvas from "../components/WaifuCanvas";
import InterfaceOverlay from "../components/InterfaceOverlay";

export default function Home() {
  const [phase, setPhase] = useState<"boot" | "canvas">("boot");

  const handleBootComplete = () => {
    setPhase("canvas");
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-terminal-black">
      <div className="crt-overlay" />

      <AnimatePresence mode="wait">
        {phase === "boot" && (
          <motion.div
            key="boot"
            initial={{ opacity: 1 }}
            exit={{
              opacity: 0,
              scale: 1.05,
              filter: "blur(10px)",
            }}
            transition={{
              duration: 1,
              ease: "easeInOut",
            }}
            className="absolute inset-0 z-20"
          >
            <BootSequence onComplete={handleBootComplete} />
          </motion.div>
        )}

        {phase === "canvas" && (
          <motion.div
            key="canvas"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 1.5,
              ease: "easeOut",
              delay: 0.2,
            }}
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
