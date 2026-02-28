"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { memo } from "react";

const WalletConnect = memo(() => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!ready) return null;

        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              className="glassmorphism px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2 hover:bg-white/10 transition-all duration-300 group pointer-events-auto"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-cyber-cyan animate-pulse" />
              <span className="text-[10px] sm:text-xs font-mono text-cyber-cyan group-hover:text-white transition-colors">
                CONNECT
              </span>
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              className="glassmorphism px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2 hover:bg-white/10 transition-all duration-300 pointer-events-auto"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-mono text-red-400">
                WRONG NET
              </span>
            </button>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={openChainModal}
              className="glassmorphism px-2 py-1.5 sm:px-3 sm:py-2 flex items-center gap-1.5 hover:bg-white/10 transition-all duration-300 pointer-events-auto"
            >
              {chain.hasIcon && chain.iconUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={chain.iconUrl}
                  alt={chain.name}
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full"
                />
              )}
              <span className="text-[10px] sm:text-xs font-mono text-white/60 hidden sm:inline">
                {chain.name}
              </span>
            </button>

            <button
              onClick={openAccountModal}
              className="glassmorphism px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2 hover:bg-white/10 transition-all duration-300 group pointer-events-auto"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-[10px] sm:text-xs font-mono text-white/70 group-hover:text-cyber-cyan transition-colors">
                {account.displayName}
              </span>
              {account.displayBalance && (
                <span className="text-[10px] font-mono text-cyber-cyan hidden md:inline">
                  {account.displayBalance}
                </span>
              )}
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
});

WalletConnect.displayName = "WalletConnect";

export default WalletConnect;
