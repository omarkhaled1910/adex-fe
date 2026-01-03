"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RealTimeFeed } from "./RealTimeFeed";
import { FilteredFeed } from "./FilteredFeed";
import type { Auction } from "@/lib/socket";
import type { AuctionFilterState } from "./AuctionFilters";

interface AuctionsSectionProps {
  auctions: Auction[];
  onSimulateClick: (auctionId: string) => void;
}

const DEFAULT_FILTERS: AuctionFilterState = {
  statuses: [],
  devices: [],
  countryCodes: [],
  minPrice: null,
  maxPrice: null,
  timeRange: "all",
};

export function AuctionsSection({ auctions, onSimulateClick }: AuctionsSectionProps) {
  const [activeTab, setActiveTab] = useState<"realtime" | "filtered">("realtime");
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [filters, setFilters] = useState<AuctionFilterState>(DEFAULT_FILTERS);

  const handleAuctionSelect = useCallback((auction: Auction | null) => {
    setSelectedAuction(auction);
  }, []);

  const handleFiltersChange = useCallback((newFilters: AuctionFilterState) => {
    setFilters(newFilters);
  }, []);

  const handleFiltersClear = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Calculate filtered count for badge
  const getFilteredCount = useCallback(() => {
    const now = Date.now();
    const timeThresholds = {
      "5m": now - 5 * 60 * 1000,
      "1h": now - 60 * 60 * 1000,
      "today": now - 24 * 60 * 60 * 1000,
    };

    return auctions.filter((auction) => {
      if (filters.statuses.length > 0 && !filters.statuses.includes(auction.status)) {
        return false;
      }
      if (
        filters.devices.length > 0 &&
        auction.userContext?.device &&
        !filters.devices.includes(auction.userContext.device as any)
      ) {
        return false;
      }
      if (
        filters.countryCodes.length > 0 &&
        auction.userContext?.countryCode &&
        !filters.countryCodes.includes(auction.userContext.countryCode)
      ) {
        return false;
      }
      if (filters.minPrice !== null && auction.floorPrice < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== null && auction.floorPrice > filters.maxPrice) {
        return false;
      }
      if (filters.timeRange !== "all" && auction.createdAt < timeThresholds[filters.timeRange]) {
        return false;
      }
      return true;
    }).length;
  }, [auctions, filters]);

  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.devices.length > 0 ||
    filters.countryCodes.length > 0 ||
    filters.minPrice !== null ||
    filters.maxPrice !== null ||
    filters.timeRange !== "all";

  const activeCount = auctions.filter(
    (a) => a.status === "active" || a.status === "grace_period"
  ).length;
  const filteredCount = getFilteredCount();

  return (
    <div className="lg:col-span-2">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="realtime" className="relative">
              Real-Time
              {activeCount > 0 && (
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 px-1.5 text-xs bg-blue-500/20 text-blue-400"
                >
                  {activeCount} active
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="filtered" className="relative">
              Filtered
              {hasActiveFilters ? (
                <Badge
                  variant="secondary"
                  className="ml-2 h-5 px-1.5 text-xs bg-purple-500/20 text-purple-400"
                >
                  {filteredCount}
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="ml-2 h-5 px-1.5 text-xs text-muted-foreground"
                >
                  {auctions.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {activeTab === "realtime" && (
          <RealTimeFeed
            auctions={auctions}
            selectedAuction={selectedAuction}
            onAuctionSelect={handleAuctionSelect}
            onSimulateClick={onSimulateClick}
          />
        )}

        {activeTab === "filtered" && (
          <FilteredFeed
            allAuctions={auctions}
            selectedAuction={selectedAuction}
            onAuctionSelect={handleAuctionSelect}
            onSimulateClick={onSimulateClick}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onFiltersClear={handleFiltersClear}
          />
        )}
      </Tabs>
    </div>
  );
}
