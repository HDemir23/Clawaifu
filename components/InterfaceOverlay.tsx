"use client";

import { useState, useCallback, memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Mic, Send, Wifi, Activity, Settings, Volume2 } from "lucide-react";

const STATUS_VARIANTS = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
};

const INPUT_VARIANTS = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
};

const STATS_VARIANTS = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
};

const PULSE_ANIMATION = {
  scale: [1, 1.2, 1],
  opacity: [0.7, 1, 0.7],
};

const PULSE_TRANSITION = {
  duration: 2,
  repeat: Infinity,
  ease: "easeInOut" as const,
};

const REC_PULSE_ANIMATION = {
  scale: [1, 1.3, 1],
};

const REC_PULSE_TRANSITION = {
  duration: 0.8,
  repeat: Infinity,
};

const InterfaceOverlay: React.FC = memo(() => {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleSend = useCallback(() => {
    if (message.trim()) {
      console.log("Sending message:", message);
      setMessage("");
    }
  }, [message]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const toggleListening = useCallback(() => {
    setIsListening((prev) => !prev);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setMessage(e.target.value);
    },
    [],
  );

  const micButtonClass = useMemo(
    () =>
      isListening
        ? "bg-red-500/20 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
        : "bg-white/5 border border-white/10 hover:bg-white/10",
    [isListening],
  );

  const sendButtonClass = useMemo(
    () =>
      message.trim()
        ? "bg-cyber-cyan/20 border border-cyber-cyan/50 hover:bg-cyber-cyan/30 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]"
        : "bg-white/5 border border-white/10 opacity-50 cursor-not-allowed",
    [message],
  );

  const sendIconClass = useMemo(
    () => (message.trim() ? "text-cyber-cyan" : "text-white/30"),
    [message],
  );

  const micIconClass = useMemo(
    () => (isListening ? "text-red-400" : "text-white/70"),
    [isListening],
  );

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <div className="w-full h-full pointer-events-auto">
        <motion.div
          variants={STATUS_VARIANTS}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.8, delay: 0.5 }}
          className="absolute top-3 sm:top-4 md:top-6 right-3 sm:right-4 md:right-6 flex items-center gap-2 sm:gap-3 md:gap-4"
        >
          <div className="glassmorphism px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1 sm:gap-2">
              <motion.div
                animate={PULSE_ANIMATION}
                transition={PULSE_TRANSITION}
              >
                <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
              </motion.div>
              <span className="text-[10px] sm:text-xs text-white/70 font-mono hidden sm:inline">
                NEURAL LINK
              </span>
            </div>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 shadow-neon-green animate-pulse" />
          </div>

          <button className="glassmorphism p-2 sm:p-2.5 md:p-3 hover:bg-white/10 transition-colors group">
            <Wifi className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-cyber-cyan group-hover:text-white transition-colors" />
          </button>

          <button className="glassmorphism p-2 sm:p-2.5 md:p-3 hover:bg-white/10 transition-colors group">
            <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-white/70 group-hover:text-white transition-colors" />
          </button>

          <button className="glassmorphism p-2 sm:p-2.5 md:p-3 hover:bg-white/10 transition-colors group">
            <Settings className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-white/70 group-hover:text-white transition-colors" />
          </button>
        </motion.div>

        <motion.div
          variants={STATUS_VARIANTS}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.8, delay: 0.7 }}
          className="absolute top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6"
        >
          <div className="glassmorphism px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3">
            <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-mono text-cyber-cyan glow-text-subtle">
              WAIFU SYSTEMS
            </h1>
            <p className="text-[10px] sm:text-xs text-white/50 font-mono mt-0.5 sm:mt-1">
              v3.14.159-stable
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={INPUT_VARIANTS}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.8, delay: 0.9 }}
          className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-sm sm:max-w-md md:max-w-2xl px-3 sm:px-4"
        >
          <div className="glassmorphism-dark p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <button
                onClick={toggleListening}
                className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 ${micButtonClass}`}
              >
                <Mic
                  className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-colors ${micIconClass}`}
                />
              </button>

              <div className="flex-1 relative min-w-0">
                <input
                  type="text"
                  value={message}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Speak to system..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg sm:rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 md:py-4 
                           text-white placeholder-white/30 font-mono text-xs sm:text-sm md:text-base
                           focus:border-cyber-cyan/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(0,255,255,0.1)]
                           transition-all duration-300 outline-none"
                />
                {isListening && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-2 sm:right-3 md:right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-1 sm:gap-2"
                  >
                    <motion.div
                      animate={REC_PULSE_ANIMATION}
                      transition={REC_PULSE_TRANSITION}
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-500"
                    />
                    <span className="text-[10px] sm:text-xs text-red-400 font-mono">
                      REC
                    </span>
                  </motion.div>
                )}
              </div>

              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className={`flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center
                          transition-all duration-300 ${sendButtonClass}`}
              >
                <Send
                  className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${sendIconClass}`}
                />
              </button>
            </div>

            <div className="mt-2 sm:mt-3 flex items-center justify-between text-[10px] sm:text-xs text-white/40 font-mono">
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="flex items-center gap-1">
                  <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Online
                </span>
                <span className="hidden sm:inline">Latency: 2ms</span>
              </div>
              <span className="hidden xs:inline">Press Enter to send</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={STATS_VARIANTS}
          initial="initial"
          animate="animate"
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-3 sm:left-4 md:left-6 hidden md:block"
        >
          <div className="glassmorphism px-3 sm:px-4 py-2 sm:py-3 space-y-0.5 sm:space-y-1">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-white/50 font-mono">
              <span className="text-cyber-cyan">SYS:</span>
              <span>Awaiting input...</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-white/50 font-mono">
              <span className="text-cyber-magenta">MEM:</span>
              <span>512TB Available</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={STATS_VARIANTS}
          initial="initial"
          animate="animate"
          transition={{ duration: 1, delay: 1.4 }}
          className="absolute bottom-4 sm:bottom-6 md:bottom-8 right-3 sm:right-4 md:right-6 hidden lg:block"
        >
          <div className="glassmorphism px-3 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-mono space-y-0.5 sm:space-y-1">
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <span className="text-white/50">Frame Rate</span>
              <span className="text-green-400">60 FPS</span>
            </div>
            <div className="flex items-center justify-between gap-3 sm:gap-4">
              <span className="text-white/50">Render Time</span>
              <span className="text-cyber-cyan">8.2ms</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
});

InterfaceOverlay.displayName = "InterfaceOverlay";

export default InterfaceOverlay;
