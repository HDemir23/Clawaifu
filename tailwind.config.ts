import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "hacker-green": "#00FF41",
        "cyber-cyan": "#00FFFF",
        "cyber-magenta": "#FF00FF",
        "cyber-pink": "#FF69B4",
        "terminal-black": "#050505",
        "terminal-dark": "#0a0a0a",
      },
      fontFamily: {
        mono: [
          "JetBrains Mono",
          "Fira Code",
          "Consolas",
          "Monaco",
          "monospace",
        ],
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        scanline: "scanline 8s linear infinite",
        flicker: "flicker 0.15s infinite",
        blink: "blink 1s step-end infinite",
        float: "float 3s ease-in-out infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": {
            opacity: "1",
            textShadow:
              "0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor",
          },
          "50%": {
            opacity: "0.8",
            textShadow: "0 0 5px currentColor, 0 0 10px currentColor",
          },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        flicker: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        "neon-green": "0 0 5px #00FF41, 0 0 20px #00FF41, 0 0 40px #00FF41",
        "neon-cyan": "0 0 5px #00FFFF, 0 0 20px #00FFFF, 0 0 40px #00FFFF",
        "neon-magenta": "0 0 5px #FF00FF, 0 0 20px #FF00FF, 0 0 40px #FF00FF",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
      },
    },
  },
  plugins: [],
};

export default config;
