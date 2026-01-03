"use client";

import {
  Activity,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Zap,
  Timer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Auction } from "@/lib/socket";

interface SessionStatusProps {
  auctions: Auction[];
  stats: {
    totalAuctions: number;
    totalBids: number;
    avgBid: number;
    earlyCompletions: number;
    timeoutCompletions: number;
    avgCompletionTime: number;
    avgBidRatio: number;
  };
}

export function SessionStatus({ auctions, stats }: SessionStatusProps) {
  const activeCount = auctions.filter(
    (a) => a.status === "active" || a.status === "grace_period"
  ).length;
  const completedCount = auctions.filter((a) => a.status === "completed").length;
  const withBidsCount = auctions.filter(
    (a) => a.status === "completed" && a.bids.length > 0
  ).length;
  const noBidsCount = auctions.filter(
    (a) => a.status === "completed" && a.bids.length === 0
  ).length;

  return (
    <Card className="card-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Session Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Active
          </span>
          <span className="font-mono font-bold">{activeCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-[var(--neon-green)]" />
            Completed
          </span>
          <span className="font-mono">{completedCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            With Bids
          </span>
          <span className="font-mono text-[var(--neon-green)]">{withBidsCount}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            No Bids
          </span>
          <span className="font-mono text-orange-400">{noBidsCount}</span>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Completion Breakdown
          </p>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1">
              <Zap className="h-3 w-3 text-[var(--neon-green)]" />
              Early Complete
            </span>
            <span className="font-mono text-[var(--neon-green)]">
              {stats.earlyCompletions}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1">
              <Timer className="h-3 w-3 text-orange-400" />
              Timeout
            </span>
            <span className="font-mono text-orange-400">
              {stats.timeoutCompletions}
            </span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Performance
          </p>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Avg Completion</span>
            <span className="font-mono">
              {stats.avgCompletionTime.toFixed(0)}ms
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">
              Bid Response Rate
            </span>
            <span className="font-mono">
              {(stats.avgBidRatio * 100).toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">
              Avg Bids/Auction
            </span>
            <span className="font-mono">
              {stats.totalBids > 0
                ? (
                    stats.totalBids / Math.max(1, stats.totalAuctions)
                  ).toFixed(1)
                : "0"}
            </span>
          </div>
        </div>

        <Separator />

        <div className="text-xs text-muted-foreground pt-2 space-y-2">
          <p>Run the bot to start bidding:</p>
          <code className="block bg-secondary/50 px-2 py-1 rounded-md">
            cd bots/advertiser-bot && npm start
          </code>
          <p className="pt-2">Run the simulator:</p>
          <code className="block bg-secondary/50 px-2 py-1 rounded-md">
            npm run simulate
          </code>
        </div>
      </CardContent>
    </Card>
  );
}
