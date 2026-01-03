"use client";

import { Zap, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, shortenAddress } from "@/lib/utils";

interface DashboardHeaderProps {
  connected: boolean;
  walletAddress: string | null;
  isLoading: boolean;
  onConnectWallet: () => void;
  onReconnect: () => void;
}

export function DashboardHeader({
  connected,
  walletAddress,
  isLoading,
  onConnectWallet,
  onReconnect,
}: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <Zap className="h-8 w-8 text-[var(--neon-green)] glow-green" />
        <h1 className="text-2xl md:text-3xl font-bold tracking-wider">
          AD<span className="text-[var(--neon-green)]">EXCH</span>
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-3 h-3 rounded-full",
              connected
                ? "bg-[var(--neon-green)] animate-pulse-green"
                : "bg-red-500"
            )}
          />
          {connected ? (
            <span className="text-sm text-muted-foreground">Live</span>
          ) : (
            <Button
              variant="link"
              className="p-0 h-auto text-sm text-muted-foreground"
              onClick={onReconnect}
            >
              Disconnected. Click to reconnect.
            </Button>
          )}
        </div>
        {walletAddress ? (
          <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2">
            <Wallet className="h-4 w-4 text-[var(--neon-green)]" />
            <span className="text-sm font-mono">
              {shortenAddress(walletAddress)}
            </span>
          </div>
        ) : (
          <Button onClick={onConnectWallet} disabled={isLoading}>
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        )}
      </div>
    </header>
  );
}
