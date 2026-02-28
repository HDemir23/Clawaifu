"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Send, Wifi, Activity, Settings, Volume2 } from "lucide-react";

const InterfaceOverlay: React.FC = () => {
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleSend = () => {
    if (message.trim()) {
      console.log("Sending message:", message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      <div className="w-full h-full pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="absolute top-6 right-6 flex items-center gap-4"
        >
          <div className="glassmorphism px-4 py-2 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Activity className="w-4 h-4 text-green-400" />
              </motion.div>
              <span className="text-xs text-white/70 font-mono">
                NEURAL LINK
              </span>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-400 shadow-neon-green animate-pulse" />
          </div>

          <button className="glassmorphism p-3 hover:bg-white/10 transition-colors group">
            <Wifi className="w-4 h-4 text-cyber-cyan group-hover:text-white transition-colors" />
          </button>

          <button className="glassmorphism p-3 hover:bg-white/10 transition-colors group">
            <Volume2 className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
          </button>

          <button className="glassmorphism p-3 hover:bg-white/10 transition-colors group">
            <Settings className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="absolute top-6 left-6"
        >
          <div className="glassmorphism px-6 py-3">
            <h1 className="text-lg md:text-xl font-mono text-cyber-cyan glow-text-subtle">
              WAIFU SYSTEMS
            </h1>
            <p className="text-xs text-white/50 font-mono mt-1">
              v3.14.159-stable
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4"
        >
          <div className="glassmorphism-dark p-4 md:p-6">
            <div className="flex items-center gap-3 md:gap-4">
              <button
                onClick={toggleListening}
                className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isListening
                    ? "bg-red-500/20 border border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)]"
                    : "bg-white/5 border border-white/10 hover:bg-white/10"
                }`}
              >
                <Mic
                  className={`w-5 h-5 md:w-6 md:h-6 transition-colors ${
                    isListening ? "text-red-400" : "text-white/70"
                  }`}
                />
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Speak to system..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 md:py-4 
                           text-white placeholder-white/30 font-mono text-sm md:text-base
                           focus:border-cyber-cyan/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(0,255,255,0.1)]
                           transition-all duration-300 outline-none"
                />
                {isListening && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-red-500"
                    />
                    <span className="text-xs text-red-400 font-mono">REC</span>
                  </motion.div>
                )}
              </div>

              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center
                          transition-all duration-300 ${
                            message.trim()
                              ? "bg-cyber-cyan/20 border border-cyber-cyan/50 hover:bg-cyber-cyan/30 hover:shadow-[0_0_20px_rgba(0,255,255,0.3)]"
                              : "bg-white/5 border border-white/10 opacity-50 cursor-not-allowed"
                          }`}
              >
                <Send
                  className={`w-5 h-5 md:w-6 md:h-6 ${
                    message.trim() ? "text-cyber-cyan" : "text-white/30"
                  }`}
                />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-white/40 font-mono">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Online
                </span>
                <span>Latency: 2ms</span>
              </div>
              <span>Press Enter to send</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="absolute bottom-8 left-6 hidden md:block"
        >
          <div className="glassmorphism px-4 py-3 space-y-1">
            <div className="flex items-center gap-2 text-xs text-white/50 font-mono">
              <span className="text-cyber-cyan">SYS:</span>
              <span>Awaiting input...</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/50 font-mono">
              <span className="text-cyber-magenta">MEM:</span>
              <span>512TB Available</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="absolute bottom-8 right-6 hidden lg:block"
        >
          <div className="glassmorphism px-4 py-3 text-xs font-mono space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/50">Frame Rate</span>
              <span className="text-green-400">60 FPS</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-white/50">Render Time</span>
              <span className="text-cyber-cyan">8.2ms</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default InterfaceOverlay;
