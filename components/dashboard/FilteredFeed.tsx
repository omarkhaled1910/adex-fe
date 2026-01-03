"use client";

import { Filter, Server as ServerIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { AuctionCard } from "./AuctionCard";
import { AuctionFilters, applyFilters, getFilterSummary, type AuctionFilterState } from "./AuctionFilters";
import type { Auction } from "@/lib/socket";

interface FilteredFeedProps {
  allAuctions: Auction[];
  selectedAuction: Auction | null;
  onAuctionSelect: (auction: Auction | null) => void;
  onSimulateClick: (auctionId: string) => void;
  filters: AuctionFilterState;
  onFiltersChange: (filters: AuctionFilterState) => void;
  onFiltersClear: () => void;
}

export function FilteredFeed({
  allAuctions,
  selectedAuction,
  onAuctionSelect,
  onSimulateClick,
  filters,
  onFiltersChange,
  onFiltersClear,
}: FilteredFeedProps) {
  const filteredAuctions = applyFilters(allAuctions, filters);
  const totalCount = allAuctions.length;
  const hasActiveFilters = Object.keys(filters).some((key) => {
    const value = filters[key as keyof AuctionFilterState];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "number") return true;
    if (value === "all") return false;
    return value !== null && value !== undefined;
  });

  const filterSummary = getFilterSummary(filters);

  return (
    <Card className="h-[600px] flex flex-col neon-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Filtered Auctions
              <Badge
                variant={hasActiveFilters ? "default" : "secondary"}
                className={hasActiveFilters ? "bg-purple-600" : ""}
              >
                <Filter className="h-3 w-3 mr-1" />
                {filteredAuctions.length}
              </Badge>
              {hasActiveFilters && (
                <Badge variant="outline" className="text-xs">
                  of {totalCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="flex items-center gap-2">
              {hasActiveFilters ? (
                <>
                  <span className="text-purple-400">{filterSummary}</span>
                </>
              ) : (
                "Apply filters to narrow down auctions"
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden flex flex-col">
        <div className="mb-4">
          <AuctionFilters
            filters={filters}
            onChange={onFiltersChange}
            onClear={onFiltersClear}
          />
        </div>
        <ScrollArea className="flex-grow">
          {filteredAuctions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-8">
              {hasActiveFilters ? (
                <>
                  <Filter className="w-12 h-12 mb-4 opacity-50" />
                  <p className="font-semibold">No auctions match your filters</p>
                  <p className="text-sm">
                    Try adjusting your filter criteria or clear all filters
                  </p>
                </>
              ) : (
                <>
                  <ServerIcon className="w-12 h-12 mb-4" />
                  <p className="font-semibold">No auctions available</p>
                  <p className="text-sm">
                    Run the simulation script to see live data.
                  </p>
                  <code className="mt-2 text-xs bg-secondary/50 px-2 py-1 rounded-md">
                    npm run simulate
                  </code>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4 pr-4">
              {filteredAuctions.map((auction) => (
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
