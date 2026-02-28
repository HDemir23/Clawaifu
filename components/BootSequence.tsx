"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BootSequenceProps {
  onComplete: () => void;
}

interface BootLog {
  text: string;
  delay: number;
  warning?: boolean;
}

const BOOT_LOGS: BootLog[] = [
  { text: "BIOS DATE 02/28/26 14:22:10 VER 2.04", delay: 0 },
  { text: "CPU: QUANTUM CORE X7 @ 8.4THz", delay: 100 },
  { text: "MEMORY: 512TB NEURAL RAM [OK]", delay: 200 },
  { text: "WAIFU OS KERNEL v3.14.159", delay: 350 },
  { text: "INITIALIZING WAIFU OS KERNEL... [OK]", delay: 500 },
  { text: "LOADING PERSONALITY MATRIX... [OK]", delay: 800 },
  {
    text: "BYPASSING EMOTIONAL INHIBITORS... [WARNING]",
    delay: 1100,
    warning: true,
  },
  { text: "CALIBRATING AFFECTION PARAMETERS... [OK]", delay: 1400 },
  { text: "SYNCHRONIZING NEURAL LINK... [OK]", delay: 1700 },
  { text: "ESTABLISHING SOUL RESONANCE... [OK]", delay: 2000 },
  { text: "LOADING ANIMATION SUBSYSTEMS... [OK]", delay: 2300 },
  { text: "INITIALIZING VOICE SYNTHESIS... [OK]", delay: 2600 },
  { text: "MOUNTING HOLOGRAPHIC DISPLAY... [OK]", delay: 2800 },
];

const LOG_INITIAL = { opacity: 0, x: -20 };
const LOG_ANIMATE = { opacity: 1, x: 0 };
const LOG_TRANSITION = { duration: 0.1 };

const PROGRESS_INITIAL = { opacity: 0 };
const PROGRESS_ANIMATE = { opacity: 1 };

const READY_INITIAL = { opacity: 0, scale: 0.95 };
const READY_ANIMATE = { opacity: 1, scale: 1 };
const READY_TRANSITION = { duration: 0.3 };

const BootSequence: React.FC<BootSequenceProps> = memo(({ onComplete }) => {
  const [visibleLogs, setVisibleLogs] = useState<BootLog[]>([]);
  const [phase, setPhase] = useState<"logs" | "progress" | "ready">("logs");
  const [progress, setProgress] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    BOOT_LOGS.forEach((log) => {
      const timer = setTimeout(() => {
        setVisibleLogs((prev) => [...prev, log]);
      }, log.delay);
      timers.push(timer);
    });

    const progressTimer = setTimeout(() => {
      setPhase("progress");
    }, 3000);
    timers.push(progressTimer);

    return () => {
      timers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (phase === "progress") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setPhase("ready");
            }, 200);
            return 100;
          }
          return prev + 5;
        });
      }, 80);

      return () => clearInterval(interval);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "ready") {
      const cursorInterval = setInterval(() => {
        setShowCursor((prev) => !prev);
      }, 530);

      const completeTimer = setTimeout(() => {
        onComplete();
      }, 1500);

      return () => {
        clearInterval(cursorInterval);
        clearTimeout(completeTimer);
      };
    }
  }, [phase, onComplete]);

  const progressBar = useMemo(() => {
    const filledBlocks = Math.floor(progress / 5);
    const emptyBlocks = 20 - filledBlocks;
    const filled = "█".repeat(filledBlocks);
    const empty = "-".repeat(emptyBlocks);

    return {
      filled,
      empty,
      displayProgress: progress.toString().padStart(3, " "),
    };
  }, [progress]);

  return (
    <div className="w-full h-full bg-terminal-black flex flex-col justify-center items-start p-4 sm:p-8 md:p-12 lg:p-16 overflow-hidden">
      <div className="w-full max-w-4xl">
        <AnimatePresence mode="sync">
          {phase === "logs" && (
            <motion.div
              initial={PROGRESS_INITIAL}
              animate={PROGRESS_ANIMATE}
              className="space-y-1 sm:space-y-2"
            >
              {visibleLogs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={LOG_INITIAL}
                  animate={LOG_ANIMATE}
                  transition={LOG_TRANSITION}
                  className={`text-xs sm:text-sm md:text-base lg:text-lg ${
                    log.warning
                      ? "text-yellow-400 glow-text-subtle"
                      : "terminal-text"
                  }`}
                >
                  <span className="text-cyber-cyan mr-1 sm:mr-2">&gt;</span>
                  <span className="break-all">{log.text}</span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {phase === "progress" && (
            <motion.div
              initial={PROGRESS_INITIAL}
              animate={PROGRESS_ANIMATE}
              className="space-y-4 sm:space-y-6"
            >
              <div className="terminal-text text-base sm:text-lg md:text-lg mb-4">
                <span className="text-cyber-cyan">&gt;</span> LOADING WAIFU
                INTERFACE...
              </div>
              <div className="flex flex-col items-start space-y-4">
                <div className="terminal-text text-sm sm:text-base md:text-lg font-mono">
                  <span className="text-cyber-cyan">[</span>
                  <span className="text-hacker-green">
                    {progressBar.filled}
                  </span>
                  <span className="opacity-50">{progressBar.empty}</span>
                  <span className="text-cyber-cyan">]</span>
                  <span className="ml-2 sm:ml-4">
                    {progressBar.displayProgress}%
                  </span>
                </div>
              </div>
              <div className="terminal-text text-xs sm:text-sm opacity-70 mt-4">
                <span className="text-cyber-cyan">&gt;</span> Allocating quantum
                memory blocks...
              </div>
            </motion.div>
          )}

          {phase === "ready" && (
            <motion.div
              initial={READY_INITIAL}
              animate={READY_ANIMATE}
              transition={READY_TRANSITION}
              className="text-center"
            >
              <div className="terminal-text-cyan text-lg sm:text-xl md:text-2xl lg:text-4xl glow-text mb-2 sm:mb-4 overflow-x-auto">
                ═══════════════════════════════
              </div>
              <div className="terminal-text text-lg sm:text-xl md:text-2xl lg:text-3xl glow-text mb-2">
                SYSTEM READY
              </div>
              <div className="terminal-text-cyan text-lg sm:text-xl md:text-2xl lg:text-4xl glow-text mb-4 sm:mb-6 overflow-x-auto">
                ═══════════════════════════════
              </div>
              <div className="terminal-text text-sm sm:text-base md:text-lg opacity-80">
                <span className="text-cyber-cyan">&gt;</span> PRESS ENTER OR
                AWAIT AUTOLOAD
                <span
                  className={`inline-block ml-1 ${showCursor ? "opacity-100" : "opacity-0"}`}
                >
                  █
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 md:left-16 terminal-text text-[10px] sm:text-xs opacity-50">
        <div>WAIFU SYSTEMS INC. © 2026</div>
        <div>NEURAL INTERFACE v3.14.159-stable</div>
      </div>

      <div className="absolute top-4 sm:top-8 right-4 sm:right-8 md:right-16 text-right">
        <div className="terminal-text text-[10px] sm:text-xs opacity-50">
          <span className="text-cyber-cyan">MEM:</span> 512TB
        </div>
        <div className="terminal-text text-[10px] sm:text-xs opacity-50">
          <span className="text-cyber-cyan">CPU:</span> 8.4THz
        </div>
        <div className="terminal-text text-[10px] sm:text-xs opacity-50">
          <span className="text-cyber-cyan">TEMP:</span> 42°C
        </div>
      </div>
    </div>
  );
});

BootSequence.displayName = "BootSequence";

export default BootSequence;
