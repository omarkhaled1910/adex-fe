"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Coins,
  RefreshCw,
  Wallet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatEther, formatCurrency } from "@/lib/utils";

interface BalanceCardProps {
  balance: bigint;
  role: "advertiser" | "publisher";
  totalSpent?: bigint;
  totalEarned?: bigint;
  onDeposit: (amount: string) => Promise<void>;
  onWithdraw: (amount: string) => Promise<void>;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function BalanceCard({
  balance,
  role,
  totalSpent,
  totalEarned,
  onDeposit,
  onWithdraw,
  onRefresh,
  isLoading,
}: BalanceCardProps) {
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    setIsDepositing(true);
    try {
      await onDeposit(depositAmount);
      setDepositAmount("");
    } catch (error) {
      console.error("Deposit failed:", error);
    } finally {
      setIsDepositing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    setIsWithdrawing(true);
    try {
      await onWithdraw(withdrawAmount);
      setWithdrawAmount("");
    } catch (error) {
      console.error("Withdraw failed:", error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const ethPrice = 2500; // Mock ETH price
  const balanceInEth = Number(balance) / 1e18;
  const usdValue = balanceInEth * ethPrice;

  return (
    <Card className="overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-green/5 via-transparent to-neon-blue/5 pointer-events-none" />

      <CardHeader className="relative pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Wallet className="w-4 h-4 text-neon-green" />
            On-Chain Balance
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 w-8"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Balance Display */}
        <div className="text-center py-4">
          <motion.div
            key={balance.toString()}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-1"
          >
            <span className="text-4xl font-bold font-mono text-white">
              {formatEther(balance)}
            </span>
            <span className="text-xl text-zinc-400 ml-2">ETH</span>
          </motion.div>
          <p className="text-sm text-zinc-500">
            ≈ {formatCurrency(usdValue, 2)}
          </p>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6">
          {role === "advertiser" && totalSpent !== undefined && (
            <div className="text-center">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                Total Spent
              </p>
              <p className="text-sm font-mono text-red-400">
                -{formatEther(totalSpent)} ETH
              </p>
            </div>
          )}
          {role === "publisher" && totalEarned !== undefined && (
            <div className="text-center">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                Total Earned
              </p>
              <p className="text-sm font-mono text-neon-green">
                +{formatEther(totalEarned)} ETH
              </p>
            </div>
          )}
        </div>

        <Separator />

        {/* Deposit Section (Advertisers only) */}
        {role === "advertiser" && (
          <div className="space-y-2">
            <label className="text-xs text-zinc-500 uppercase tracking-wider">
              Deposit Funds
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="0.0"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                step="0.01"
                min="0"
                className="font-mono"
              />
              <Button
                variant="neon"
                onClick={handleDeposit}
                disabled={isDepositing || !depositAmount}
                className="shrink-0"
              >
                {isDepositing ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <ArrowDownToLine className="w-4 h-4 mr-1" />
                    Deposit
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Withdraw Section */}
        <div className="space-y-2">
          <label className="text-xs text-zinc-500 uppercase tracking-wider">
            Withdraw Funds
          </label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.0"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              step="0.01"
              min="0"
              className="font-mono"
            />
            <Button
              variant="outline"
              onClick={handleWithdraw}
              disabled={isWithdrawing || !withdrawAmount || balance === 0n}
              className="shrink-0"
            >
              {isWithdrawing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <ArrowUpFromLine className="w-4 h-4 mr-1" />
                  Withdraw
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quick amounts */}
        <div className="flex gap-2">
          {["0.1", "0.5", "1.0", "5.0"].map((amount) => (
            <Button
              key={amount}
              variant="ghost"
              size="sm"
              onClick={() => setDepositAmount(amount)}
              className="flex-1 text-xs font-mono"
            >
              {amount} ETH
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
