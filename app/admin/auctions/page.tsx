"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Filter,
  Timer,
  TrendingUp,
  Activity,
  Clock,
  Zap,
  AlertCircle,
  Grid3X3,
  List,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/admin/Pagination";
import { RefreshControl } from "@/components/admin/RefreshControl";
import {
  useAuctions,
  usePerformanceMetrics,
  type Auction,
} from "@/lib/hooks/use-admin-data";
import { cn, formatCurrency, shortenAddress } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export default function AuctionsMonitoringPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [timeFilter, setTimeFilter] = useState<number>(24);
  const [refreshInterval, setRefreshInterval] = useState(10); // seconds
  const refetchIntervalMs = refreshInterval > 0 ? refreshInterval * 1000 : false;

  const { data: auctionsData, isLoading, isError, error } = useAuctions(
    statusFilter,
    currentPage,
    ITEMS_PER_PAGE,
    timeFilter,
    refetchIntervalMs
  );

  const { data: metrics } = usePerformanceMetrics(timeFilter, refetchIntervalMs);

  const auctions = auctionsData?.auctions || [];
  const totalItems = auctionsData?.total || 0;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleTimeFilterChange = (value: string) => {
    setTimeFilter(parseInt(value));
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Activity className="h-12 w-12 text-[var(--neon-purple)] animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading auction data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-500">
          <p className="text-lg font-medium">Error loading auction data</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Auction Engine Monitoring</h1>
          <p className="text-muted-foreground text-sm">
            Real-time auction performance and metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshControl
            defaultInterval={10}
            onRefresh={async () => {
              await queryClient.invalidateQueries({ queryKey: ["admin", "auctions"] });
              await queryClient.invalidateQueries({ queryKey: ["admin", "performance"] });
            }}
            onIntervalChange={setRefreshInterval}
          />
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeFilter.toString()} onValueChange={handleTimeFilterChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 1h</SelectItem>
              <SelectItem value="6">Last 6h</SelectItem>
              <SelectItem value="24">Last 24h</SelectItem>
              <SelectItem value="168">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
            className={viewMode === "grid" ? "bg-[var(--neon-purple)]" : ""}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("table")}
            className={viewMode === "table" ? "bg-[var(--neon-purple)]" : ""}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Performance Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium flex items-center gap-2">
                <Timer className="h-4 w-4 text-[var(--neon-purple)]" />
                Avg Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.duration.avg.toFixed(0)}ms
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                P95: {metrics.duration.p95.toFixed(0)}ms
              </div>
            </CardContent>
          </Card>

          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-[var(--neon-blue)]" />
                Bid Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.bidResponse.avg.toFixed(0)}ms
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                P95: {metrics.bidResponse.p95.toFixed(0)}ms
              </div>
            </CardContent>
          </Card>

          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[var(--neon-green)]" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[var(--neon-green)]">
                {metrics.completion.completionRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {metrics.completion.totalAuctions} total auctions
              </div>
            </CardContent>
          </Card>

          <Card className="card-glow">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-[var(--neon-orange)]" />
                Timeout Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={cn(
                  "text-2xl font-bold",
                  metrics.completion.timeoutRate > 10
                    ? "text-red-500"
                    : "text-[var(--neon-orange)]"
                )}
              >
                {metrics.completion.timeoutRate.toFixed(1)}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Bid Success: {metrics.completion.bidSuccessRate.toFixed(1)}%
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Duration Percentiles */}
      {metrics && (
        <Card className="card-glow mb-6">
          <CardHeader>
            <CardTitle className="text-sm">Duration Percentiles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-24">
              {[
                { label: "Min", value: metrics.duration.min || 0 },
                { label: "Avg", value: metrics.duration.avg },
                { label: "P50", value: metrics.duration.median },
                { label: "P95", value: metrics.duration.p95 },
                { label: "P99", value: metrics.duration.p99 },
              ].map((stat) => {
                const max = Math.max(
                  metrics.duration.avg,
                  metrics.duration.median,
                  metrics.duration.p95,
                  metrics.duration.p99,
                  metrics.duration.min || 0
                );
                const height = (stat.value / max) * 100;
                return (
                  <div key={stat.label} className="flex-1 flex flex-col items-center">
                    <div className="text-xs text-muted-foreground mb-1">
                      {stat.value.toFixed(0)}ms
                    </div>
                    <div
                      className="w-full bg-[var(--neon-purple)]/30 border border-[var(--neon-purple)]/50 rounded-t-sm transition-all hover:bg-[var(--neon-purple)]/50"
                      style={{ height: `${Math.max(5, height)}%` }}
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Auctions Grid/Table */}
      {auctions.length === 0 ? (
        <Card className="card-glow">
          <CardContent className="text-center py-12 text-muted-foreground">
            No auctions found for the selected filters.
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Auctions (Last {timeFilter === 168 ? "7 days" : `${timeFilter}h`})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {auctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Auctions (Last {timeFilter === 168 ? "7 days" : `${timeFilter}h`})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Publisher</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Bids (Expected)</TableHead>
                    <TableHead>Bid Ratio</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Winning</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auctions.map((auction) => (
                    <TableRow key={auction.id}>
                      <TableCell className="font-mono text-xs">
                        {shortenAddress(auction.id)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {auction.domain || auction.publisher_name || "Unknown"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {shortenAddress(auction.publisher_id)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <AuctionStatusBadge status={auction.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{auction.bid_count}</span>
                          <span className="text-muted-foreground">/</span>
                          <span className="text-muted-foreground">
                            {auction.expected_bids || "-"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full",
                                (auction.bid_ratio || 0) >= 0.8
                                  ? "bg-[var(--neon-green)]"
                                  : (auction.bid_ratio || 0) >= 0.5
                                  ? "bg-[var(--neon-orange)]"
                                  : "bg-red-500"
                              )}
                              style={{
                                width: `${Math.min(100, (auction.bid_ratio || 0) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs">
                            {((auction.bid_ratio || 0) * 100).toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {auction.duration_ms
                          ? `${auction.duration_ms}ms`
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {auction.winning_amount
                          ? formatCurrency(auction.winning_amount)
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {auction.completion_reason ? (
                          <CompletionReasonBadge reason={auction.completion_reason} />
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(auction.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setCurrentPage}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Auction Card Component
function AuctionCard({ auction }: { auction: Auction }) {
  return (
    <Card className="card-glow hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="font-mono text-xs text-muted-foreground">
              {shortenAddress(auction.id)}
            </p>
            <p className="font-medium truncate mt-1">
              {auction.domain || auction.publisher_name || "Unknown Publisher"}
            </p>
          </div>
          <AuctionStatusBadge status={auction.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Bids</span>
          <span className="text-sm font-medium">
            {auction.bid_count} / {auction.expected_bids || "-"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Bid Ratio</span>
          <div className="flex items-center gap-2">
            <div className="w-12 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full",
                  (auction.bid_ratio || 0) >= 0.8
                    ? "bg-[var(--neon-green)]"
                    : (auction.bid_ratio || 0) >= 0.5
                    ? "bg-[var(--neon-orange)]"
                    : "bg-red-500"
                )}
                style={{
                  width: `${Math.min(100, (auction.bid_ratio || 0) * 100)}%`,
                }}
              />
            </div>
            <span className="text-xs">{((auction.bid_ratio || 0) * 100).toFixed(0)}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Duration</span>
          <span className="text-sm font-medium">
            {auction.duration_ms ? `${auction.duration_ms}ms` : "-"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Winning</span>
          <span className="text-sm font-medium text-[var(--neon-green)]">
            {auction.winning_amount ? formatCurrency(auction.winning_amount) : "-"}
          </span>
        </div>
        {auction.completion_reason && (
          <div className="pt-2 border-t border-border">
            <CompletionReasonBadge reason={auction.completion_reason} />
          </div>
        )}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {new Date(auction.created_at).toLocaleString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Auction Status Badge Component
function AuctionStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        status === "active" &&
          "bg-blue-500/20 text-blue-400 border-blue-500/30",
        status === "completed" &&
          "bg-green-500/20 text-green-400 border-green-500/30",
        status === "expired" &&
          "bg-gray-500/20 text-gray-400 border-gray-500/30"
      )}
    >
      {status}
    </Badge>
  );
}

// Completion Reason Badge Component
function CompletionReasonBadge({ reason }: { reason: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs",
        reason === "timeout" &&
          "border-[var(--neon-orange)] text-[var(--neon-orange)]",
        reason.includes("early") &&
          "border-[var(--neon-green)] text-[var(--neon-green)]",
        reason === "all_bids_received" &&
          "border-[var(--neon-blue)] text-[var(--neon-blue)]"
      )}
    >
      {reason}
    </Badge>
  );
}
