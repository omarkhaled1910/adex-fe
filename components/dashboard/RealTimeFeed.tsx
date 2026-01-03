"use client";

import { Server as ServerIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AuctionCard } from "./AuctionCard";
import type { Auction } from "@/lib/socket";

interface RealTimeFeedProps {
  auctions: Auction[];
  selectedAuction: Auction | null;
  onAuctionSelect: (auction: Auction | null) => void;
  onSimulateClick: (auctionId: string) => void;
}

export function RealTimeFeed({
  auctions,
  selectedAuction,
  onAuctionSelect,
  onSimulateClick,
}: RealTimeFeedProps) {
  const activeCount = auctions.filter(
    (a) => a.status === "active" || a.status === "grace_period"
  ).length;

  return (
    <Card className="h-[600px] flex flex-col neon-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Live Auction Feed
              <Badge variant="default" className="bg-blue-500">
                {activeCount} active
              </Badge>
            </CardTitle>
            <CardDescription>Showing last 50 auctions in real-time</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--neon-green)] animate-pulse" />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <ScrollArea className="h-full">
          {auctions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
              <ServerIcon className="w-12 h-12 mb-4" />
              <p className="font-semibold">Waiting for auctions...</p>
              <p className="text-sm">
                Run the simulation script to see live data.
              </p>
              <code className="mt-2 text-xs bg-secondary/50 px-2 py-1 rounded-md">
                npm run simulate
              </code>
            </div>
          ) : (
            <div className="space-y-4 pr-4">
              {auctions.map((auction) => (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                  isSelected={selectedAuction?.id === auction.id}
                  onSelect={() =>
                    onAuctionSelect(
                      selectedAuction?.id === auction.id ? null : auction
                    )
                  }
                  onSimulateClick={onSimulateClick}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
