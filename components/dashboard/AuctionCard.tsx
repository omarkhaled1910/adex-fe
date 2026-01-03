"use client";

import {
  Globe,
  DollarSign,
  Target,
  Users,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Smartphone,
  Tablet,
  MousePointer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn, formatCurrency, formatTimestamp, shortenAddress } from "@/lib/utils";
import type { Auction } from "@/lib/socket";

interface AuctionCardProps {
  auction: Auction;
  isSelected: boolean;
  onSelect: () => void;
  onSimulateClick: (auctionId: string) => void;
}

export function AuctionCard({
  auction,
  isSelected,
  onSelect,
  onSimulateClick,
}: AuctionCardProps) {
  const handleSettleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSimulateClick(auction.id);
  };

  return (
    <div
      className={cn(
        "p-4 rounded-lg border card-glow bid-item cursor-pointer transition-all",
        isSelected && "ring-2 ring-[var(--neon-green)]"
      )}
      onClick={onSelect}
    >
      {/* Header row */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant={
              auction.status === "active"
                ? "default"
                : auction.status === "grace_period"
                ? "outline"
                : "secondary"
            }
            className={cn(
              auction.status === "active" && "bg-blue-500",
              auction.status === "grace_period" &&
                "border-yellow-500 text-yellow-500"
            )}
          >
            {auction.status === "grace_period"
              ? "⏳ grace"
              : auction.status}
          </Badge>
          {auction.metadata?.reason && (
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                auction.metadata.reason ===
                  "all_bids_received" &&
                  "border-[var(--neon-green)] text-[var(--neon-green)]",
                auction.metadata.reason ===
                  "early_threshold" &&
                  "border-blue-400 text-blue-400",
                auction.metadata.reason === "timeout" &&
                  "border-orange-400 text-orange-400"
              )}
            >
              {auction.metadata.reason === "all_bids_received"
                ? "⚡ all bids"
                : auction.metadata.reason ===
                  "early_threshold"
                ? "⚡ early"
                : auction.metadata.reason === "timeout"
                ? "⏰ timeout"
                : auction.metadata.reason}
            </Badge>
          )}
          <span className="font-mono text-xs text-muted-foreground">
            {auction.id.substring(0, 20)}...
          </span>
        </div>
        <div className="flex items-center gap-2">
          {auction.metadata?.completionTime && (
            <span className="text-xs text-muted-foreground">
              {auction.metadata.completionTime}ms
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {formatTimestamp(auction.createdAt)}
          </span>
        </div>
      </div>

      {/* Main info row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-sm mb-2">
        <span className="flex items-center gap-1">
          <Globe className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">Publisher:</span>{" "}
          <span className="font-medium">
            {auction.domain || auction.publisherId}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <Target className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">Slot:</span>{" "}
          <span className="font-medium">
            {auction.adSlotType || auction.adSlotId}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <DollarSign className="h-3 w-3 text-muted-foreground" />
          <span className="text-muted-foreground">Floor:</span>{" "}
          <span className="font-medium">
            {formatCurrency(auction.floorPrice)}
          </span>
        </span>
        {auction.metadata?.bidCount !== undefined && (
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Bids:</span>{" "}
            <span className="font-medium">
              {auction.metadata.bidCount}/
              {auction.metadata.expectedCount}
              <span className="text-xs text-muted-foreground ml-1">
                (
                {(
                  (auction.metadata.bidRatio || 0) * 100
                ).toFixed(0)}
                %)
              </span>
            </span>
          </span>
        )}
      </div>

      {/* User context (collapsible) */}
      {isSelected && auction.userContext && (
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2 bg-secondary/30 rounded px-2 py-1">
          {auction.userContext.countryCode && (
            <span>🌍 {auction.userContext.countryCode}</span>
          )}
          {auction.userContext.device && (
            <span className="flex items-center gap-1">
              {auction.userContext.device === "desktop" ? (
                <Monitor className="h-3 w-3" />
              ) : auction.userContext.device === "mobile" ? (
                <Smartphone className="h-3 w-3" />
              ) : (
                <Tablet className="h-3 w-3" />
              )}
              {auction.userContext.device}
            </span>
          )}
          {auction.userContext.os && (
            <span>💻 {auction.userContext.os}</span>
          )}
          {auction.userContext.browser && (
            <span>🌐 {auction.userContext.browser}</span>
          )}
        </div>
      )}

      {/* Winner highlight */}
      {auction.status === "completed" && auction.winner && (
        <div className="bg-[var(--neon-green)]/10 border border-[var(--neon-green)]/30 rounded-md p-2 mb-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[var(--neon-green)]" />
              <span className="text-sm font-medium">
                Winner:{" "}
                {shortenAddress(
                  auction.winner.campaignId ||
                    auction.winner.advertiserId
                )}
              </span>
            </div>
            <div className="text-right">
              <div className="font-mono font-bold text-[var(--neon-green)]">
                {formatCurrency(auction.winner.amount)}
              </div>
              {auction.metadata?.winningPrice &&
                auction.metadata.winningPrice !==
                  auction.winner.amount && (
                  <div className="text-xs text-muted-foreground">
                    pays{" "}
                    {formatCurrency(
                      auction.metadata.winningPrice
                    )}{" "}
                    (2nd price)
                  </div>
                )}
            </div>
          </div>
        </div>
      )}

      {/* Bids list */}
      {auction.bids.length > 0 && (
        <>
          <Separator className="my-2" />
          <div className="space-y-1">
            {auction.bids
              .slice(
                0,
                isSelected
                  ? undefined
                  : 3
              )
              .map((bid, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex justify-between items-center text-sm p-1.5 rounded",
                    i === 0 &&
                      auction.status === "completed" &&
                      "bg-[var(--neon-green)]/5",
                    auction.winner?.advertiserId ===
                      bid.advertiserId && "winner-highlight"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      #{i + 1}
                    </span>
                    <span className="font-mono text-xs">
                      {shortenAddress(
                        bid.campaignId || bid.advertiserId
                      )}
                    </span>
                    {bid.responseTime && (
                      <span className="text-xs text-muted-foreground">
                        ({bid.responseTime}ms)
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-semibold">
                    {formatCurrency(bid.amount)}
                  </span>
                </div>
              ))}
            {!isSelected &&
              auction.bids.length > 3 && (
                <div className="text-xs text-center text-muted-foreground">
                  +{auction.bids.length - 3} more bids (click
                  to expand)
                </div>
              )}
          </div>
        </>
      )}

      {/* No bids state */}
      {auction.status === "completed" &&
        auction.bids.length === 0 && (
          <div className="flex items-center gap-2 text-sm text-orange-400 mt-2">
            <AlertCircle className="h-4 w-4" />
            <span>No bids received</span>
          </div>
        )}

      {/* Settle button */}
      {auction.status === "completed" && auction.winner && (
        <Button
          size="sm"
          className="w-full mt-2"
          onClick={handleSettleClick}
        >
          <MousePointer className="mr-2 h-4 w-4" />
          Simulate Click & Settle
        </Button>
      )}
    </div>
  );
}
