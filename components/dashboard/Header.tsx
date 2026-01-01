"use client";

import { useState, useEffect } from "react";
import { Zap, Wifi, WifiOff, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { shortenAddress } from "@/lib/utils";

interface HeaderProps {
  isConnected: boolean;
  walletAddress: string | null;
  onConnect: () => void;
}

export function Header({ isConnected, walletAddress, onConnect }: HeaderProps) {
  const [socketStatus, setSocketStatus] = useState<
    "connected" | "disconnected" | "connecting"
  >("connecting");

  useEffect(() => {
    // Simulate socket connection status
    const timer = setTimeout(() => {
      setSocketStatus("connected");
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-neon-green/20 to-neon-blue/20 border border-neon-green/30">
            <Zap className="w-5 h-5 text-neon-green" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-neon-green">Ad</span>
              <span className="text-white">Exchange</span>
            </h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
              Decentralized RTB
            </p>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-4">
          {/* Socket Status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800">
            {socketStatus === "connected" ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-neon-green" />
                <span className="text-xs text-neon-green">Live</span>
              </>
            ) : socketStatus === "connecting" ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-xs text-amber-400">Connecting...</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs text-red-400">Offline</span>
              </>
            )}
          </div>

          {/* Network Badge */}
          <Badge variant="outline" className="border-zinc-700 text-zinc-400">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-2" />
            Hardhat Local
          </Badge>

          {/* Wallet Button */}
          {isConnected && walletAddress ? (
            <Button variant="outline" size="sm" className="font-mono text-xs">
              <Wallet className="w-3.5 h-3.5 mr-2 text-neon-green" />
              {shortenAddress(walletAddress)}
            </Button>
          ) : (
            <Button variant="neon" size="sm" onClick={onConnect}>
              <Wallet className="w-3.5 h-3.5 mr-2" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
