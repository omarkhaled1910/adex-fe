"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  DollarSign,
  Globe,
  Laptop,
  Smartphone,
  Trophy,
  ChevronRight,
  Zap,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, getTimeAgo, formatTimestamp } from "@/lib/utils";
import type { Auction, Bid } from "@/types";

interface LiveAuctionsProps {
  auctions: Auction[];
  onSettleClick: (auction: Auction) => void;
}

function AuctionCard({
  auction,
  onSettleClick,
}: {
  auction: Auction;
  onSettleClick: (auction: Auction) => void;
}) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const prevBidsCount = useRef(auction.bids.length);

  useEffect(() => {
    if (auction.bids.length > prevBidsCount.current) {
      setIsFlashing(true);
      setTimeout(() => setIsFlashing(false), 500);
    }
    prevBidsCount.current = auction.bids.length;
  }, [auction.bids.length]);

  useEffect(() => {
    const updateTimeLeft = () => {
      const remaining = Math.max(0, auction.expiresAt - Date.now());
      setTimeLeft(remaining);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 100);
    return () => clearInterval(interval);
  }, [auction.expiresAt]);

  const statusConfig = {
    active: { badge: "neon", label: "LIVE", dotClass: "status-active" },
    closed: { badge: "secondary", label: "CLOSED", dotClass: "status-closed" },
    won: { badge: "neonBlue", label: "WON", dotClass: "status-won" },
    expired: {
      badge: "destructive",
      label: "EXPIRED",
      dotClass: "status-closed",
    },
  };

  const config = statusConfig[auction.status];
  const isActive = auction.status === "active";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`relative ${isFlashing ? "flash-new-bid" : ""}`}
    >
      <Card
        className={`card-hover ${
          isActive ? "auction-active border-neon-green/30" : "border-zinc-800"
        }`}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`status-dot ${config.dotClass}`} />
              <Badge variant={config.badge as any} className="text-[10px]">
                {config.label}
              </Badge>
              <span className="text-xs text-zinc-500 font-mono">
                {auction.auctionId.slice(0, 20)}...
              </span>
            </div>
            {isActive && (
              <div className="flex items-center gap-1 text-xs text-amber-400">
                <Clock className="w-3 h-3" />
                <span className="font-mono">
                  {(timeLeft / 1000).toFixed(1)}s
                </span>
              </div>
            )}
          </div>

          {/* Info Row */}
          <div className="flex items-center gap-3 text-xs text-zinc-400 mb-3">
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <span>{auction.geo || "US"}</span>
            </div>
            <div className="flex items-center gap-1">
              {auction.deviceType === "mobile" ? (
                <Smartphone className="w-3 h-3" />
              ) : (
                <Laptop className="w-3 h-3" />
              )}
              <span>{auction.deviceType || "desktop"}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-zinc-600">Floor:</span>
              <span className="text-neon-green font-mono">
                {formatCurrency(Number(auction.floorPrice), 4)}
              </span>
            </div>
          </div>

          {/* Ad Slot */}
          <div className="mb-3 p-2 rounded bg-zinc-800/50 border border-zinc-700">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">
              Ad Slot
            </p>
            <p className="text-sm font-medium text-white">{auction.adSlot}</p>
            {auction.adSlotSize && (
              <p className="text-xs text-zinc-500">{auction.adSlotSize}</p>
            )}
          </div>

          {/* Bids Section */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">
                Bids ({auction.bids.length})
              </p>
              {auction.highestBid > 0 && (
                <div className="flex items-center gap-1 text-neon-green">
                  <Trophy className="w-3 h-3" />
                  <span className="font-mono font-bold text-sm">
                    {formatCurrency(auction.highestBid, 4)}
                  </span>
                </div>
              )}
            </div>

            {auction.bids.length > 0 ? (
              <div className="space-y-1">
                {auction.bids
                  .sort((a, b) => b.amount - a.amount)
                  .slice(0, 3)
                  .map((bid, i) => (
                    <BidRow
                      key={`${bid.bidderId}-${bid.timestamp}`}
                      bid={bid}
                      rank={i + 1}
                    />
                  ))}
                {auction.bids.length > 3 && (
                  <p className="text-xs text-zinc-600 text-center py-1">
                    +{auction.bids.length - 3} more bids
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-4 text-zinc-600 text-sm">
                Waiting for bids...
              </div>
            )}
          </div>

          {/* Winner & Settlement */}
          {auction.winner && (
            <>
              <Separator className="my-3" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                    Winner
                  </p>
                  <p className="text-sm font-medium text-neon-blue">
                    {auction.winner.bidderName || auction.winner.bidderId}
                  </p>
                </div>
                <Button
                  variant="neon"
                  size="sm"
                  onClick={() => onSettleClick(auction)}
                  className="gap-1"
                >
                  <Zap className="w-3 h-3" />
                  Settle On-Chain
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function BidRow({ bid, rank }: { bid: Bid; rank: number }) {
  return (
    <div className="flex items-center justify-between py-1.5 px-2 rounded bg-zinc-800/30">
      <div className="flex items-center gap-2">
        <span
          className={`text-xs font-bold ${
            rank === 1 ? "text-neon-green" : "text-zinc-500"
          }`}
        >
          #{rank}
        </span>
        <span className="text-xs text-zinc-400 truncate max-w-[120px]">
          {bid.bidderName || bid.bidderId}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-sm font-mono font-medium ${
            rank === 1 ? "text-neon-green" : "text-white"
          }`}
        >
          {formatCurrency(bid.amount, 4)}
        </span>
        <span className="text-[10px] text-zinc-600">
          {getTimeAgo(bid.timestamp)}
        </span>
      </div>
    </div>
  );
}

export function LiveAuctions({ auctions, onSettleClick }: LiveAuctionsProps) {
  const activeAuctions = auctions.filter((a) => a.status === "active");
  const closedAuctions = auctions.filter((a) => a.status !== "active");

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="status-dot status-active" />
            Live Auctions
            <Badge variant="neon" className="ml-2">
              {activeAuctions.length} Active
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-3 p-4 pt-0">
            <AnimatePresence mode="popLayout">
              {activeAuctions.map((auction) => (
                <AuctionCard
                  key={auction.auctionId}
                  auction={auction}
                  onSettleClick={onSettleClick}
                />
              ))}
            </AnimatePresence>

            {closedAuctions.length > 0 && (
              <>
                <Separator className="my-4" />
                <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">
                  Recent Completed
                </p>
                <AnimatePresence mode="popLayout">
                  {closedAuctions.slice(0, 5).map((auction) => (
                    <AuctionCard
                      key={auction.auctionId}
                      auction={auction}
                      onSettleClick={onSettleClick}
                    />
                  ))}
                </AnimatePresence>
              </>
            )}

            {auctions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
                  <Gavel className="w-8 h-8 text-zinc-600" />
                </div>
                <p className="text-zinc-500 mb-2">No active auctions</p>
                <p className="text-xs text-zinc-600">
                  Start the simulated user script to generate bid requests
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Re-export Gavel for the empty state
import { Gavel } from "lucide-react";
