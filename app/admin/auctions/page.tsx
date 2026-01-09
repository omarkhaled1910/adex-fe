"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Timer,
  TrendingUp,
  Activity,
  Clock,
  Zap,
  AlertCircle,
  Grid3X3,
  List,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Heart,
  Server,
  Users,
  Target,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination } from "@/components/admin/Pagination";
import { RefreshControl } from "@/components/admin/RefreshControl";
import {
  useAuctions,
  usePerformanceMetrics,
  type Auction,
} from "@/lib/hooks/use-admin-data";
import { cn, formatCurrency, shortenAddress } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

// Types for health check data
interface HealthAlert {
  type: "error" | "warning" | "info";
  message: string;
}

interface CompletionReason {
  completion_reason: string | null;
  count: string;
  avg_duration: number;
  avg_bids: number;
  avg_bid_ratio: number;
}

interface StatusDistribution {
  status: string;
  count: string;
}

interface ProblematicAuction {
  id: string;
  publisher_id: string;
  domain: string | null;
  ad_slot_id: string;
  status: string;
  completion_reason: string | null;
  total_bids: number;
  expected_bids: number;
  bid_ratio: number;
  duration_ms: number | null;
  floor_price: number;
  created_at: string;
}

interface BidResponseTime {
  bucket: string;
  count: string;
  avg_bid_amount: number;
}

interface PublisherHealth {
  publisher_id: string;
  domain: string;
  total_auctions: string;
  no_bid_auctions: string;
  timeout_auctions: string;
  avg_duration: number;
  avg_bids: number;
  avg_bid_ratio: number;
  no_bid_rate: string;
}

interface CampaignHealth {
  campaign_id: string;
  campaign_name: string;
  advertiser_name: string;
  status: string;
  max_bid: number;
  daily_budget: number;
  spent_amount: number;
  total_bids: string;
  wins: string;
  avg_bid_amount: number;
  avg_response_time: number;
}

interface HealthData {
  healthStatus: "healthy" | "degraded" | "critical";
  healthScore: number;
  alerts: HealthAlert[];
  summary: {
    totalAuctions: number;
    completedAuctions: number;
    completionRate: string;
    timeoutRate: string;
    noBidRate: string;
    timeRange: string;
  };
  completionReasons: CompletionReason[];
  statusDistribution: StatusDistribution[];
  problematicAuctions: ProblematicAuction[];
  bidResponseTimes: BidResponseTime[];
  publisherHealth: PublisherHealth[];
  campaignHealth: CampaignHealth[];
  dataIntegrity: Record<string, string>;
}

// Fetch health data
async function fetchHealthData(hours: number): Promise<HealthData> {
  const res = await fetch(`/api/admin/auctions/health?hours=${hours}`);
  if (!res.ok) throw new Error("Failed to fetch health data");
  return res.json();
}

export default function AuctionsMonitoringPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [timeFilter, setTimeFilter] = useState<number>(24);
  const [refreshInterval, setRefreshInterval] = useState(10);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const refetchIntervalMs =
    refreshInterval > 0 ? refreshInterval * 1000 : false;

  const {
    data: auctionsData,
    isLoading,
    isError,
    error,
  } = useAuctions(
    statusFilter,
    currentPage,
    ITEMS_PER_PAGE,
    timeFilter,
    refetchIntervalMs
  );

  const { data: metrics } = usePerformanceMetrics(
    timeFilter,
    refetchIntervalMs
  );

  const { data: healthData, isLoading: healthLoading } = useQuery({
    queryKey: ["admin", "auction-health", timeFilter],
    queryFn: () => fetchHealthData(timeFilter),
    refetchInterval: refetchIntervalMs,
  });

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
            Real-time auction performance and QC diagnostics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshControl
            defaultInterval={10}
            onRefresh={async () => {
              await queryClient.invalidateQueries({
                queryKey: ["admin", "auctions"],
              });
              await queryClient.invalidateQueries({
                queryKey: ["admin", "performance"],
              });
              await queryClient.invalidateQueries({
                queryKey: ["admin", "auction-health"],
              });
            }}
            onIntervalChange={setRefreshInterval}
          />
          <Select
            value={timeFilter.toString()}
            onValueChange={handleTimeFilterChange}
          >
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
        </div>
      </div>

      {/* Health Status Banner */}
      {healthData && (
        <Card
          className={cn(
            "mb-6 border-2",
            healthData.healthStatus === "healthy" &&
              "border-green-500/50 bg-green-500/10",
            healthData.healthStatus === "degraded" &&
              "border-yellow-500/50 bg-yellow-500/10",
            healthData.healthStatus === "critical" &&
              "border-red-500/50 bg-red-500/10"
          )}
        >
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "p-3 rounded-full",
                    healthData.healthStatus === "healthy" && "bg-green-500/20",
                    healthData.healthStatus === "degraded" &&
                      "bg-yellow-500/20",
                    healthData.healthStatus === "critical" && "bg-red-500/20"
                  )}
                >
                  <Heart
                    className={cn(
                      "h-6 w-6",
                      healthData.healthStatus === "healthy" && "text-green-500",
                      healthData.healthStatus === "degraded" &&
                        "text-yellow-500",
                      healthData.healthStatus === "critical" && "text-red-500"
                    )}
                  />
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    System Health:{" "}
                    <span
                      className={cn(
                        "capitalize",
                        healthData.healthStatus === "healthy" &&
                          "text-green-500",
                        healthData.healthStatus === "degraded" &&
                          "text-yellow-500",
                        healthData.healthStatus === "critical" && "text-red-500"
                      )}
                    >
                      {healthData.healthStatus}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Health Score: {healthData.healthScore}/100 •{" "}
                    {healthData.summary.totalAuctions} auctions in last{" "}
                    {healthData.summary.timeRange}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-muted-foreground">Completion</p>
                  <p className="text-lg font-bold text-green-500">
                    {healthData.summary.completionRate}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">Timeout</p>
                  <p
                    className={cn(
                      "text-lg font-bold",
                      parseFloat(healthData.summary.timeoutRate) > 10
                        ? "text-red-500"
                        : "text-yellow-500"
                    )}
                  >
                    {healthData.summary.timeoutRate}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground">No Bids</p>
                  <p
                    className={cn(
                      "text-lg font-bold",
                      parseFloat(healthData.summary.noBidRate) > 20
                        ? "text-red-500"
                        : "text-yellow-500"
                    )}
                  >
                    {healthData.summary.noBidRate}%
                  </p>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {healthData.alerts.length > 0 && (
              <div className="mt-4 space-y-2">
                {healthData.alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg",
                      alert.type === "error" && "bg-red-500/20 text-red-400",
                      alert.type === "warning" &&
                        "bg-yellow-500/20 text-yellow-400",
                      alert.type === "info" && "bg-blue-500/20 text-blue-400"
                    )}
                  >
                    {alert.type === "error" && (
                      <XCircle className="h-4 w-4 flex-shrink-0" />
                    )}
                    {alert.type === "warning" && (
                      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    )}
                    {alert.type === "info" && (
                      <Info className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="text-sm">{alert.message}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs for different views */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="auctions">All Auctions</TabsTrigger>
          <TabsTrigger value="problems">Problems</TabsTrigger>
          <TabsTrigger value="publishers">Publisher Health</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Health</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Performance Metrics */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Completion Reasons Breakdown */}
          {healthData && healthData.completionReasons.length > 0 && (
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Completion Reasons Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reason</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">Avg Duration</TableHead>
                      <TableHead className="text-right">Avg Bids</TableHead>
                      <TableHead className="text-right">
                        Avg Bid Ratio
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {healthData.completionReasons.map((reason) => (
                      <TableRow key={reason.completion_reason || "unknown"}>
                        <TableCell>
                          <CompletionReasonBadge
                            reason={reason.completion_reason || "unknown"}
                          />
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {reason.count}
                        </TableCell>
                        <TableCell className="text-right">
                          {reason.avg_duration?.toFixed(0) || "-"}ms
                        </TableCell>
                        <TableCell className="text-right">
                          {reason.avg_bids?.toFixed(1) || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {reason.avg_bid_ratio
                            ? `${(reason.avg_bid_ratio * 100).toFixed(1)}%`
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Bid Response Time Distribution */}
          {healthData && healthData.bidResponseTimes.length > 0 && (
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Bid Response Time Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-32">
                  {healthData.bidResponseTimes.map((bucket) => {
                    const maxCount = Math.max(
                      ...healthData.bidResponseTimes.map((b) =>
                        parseInt(b.count)
                      )
                    );
                    const height =
                      maxCount > 0
                        ? (parseInt(bucket.count) / maxCount) * 100
                        : 0;
                    return (
                      <div
                        key={bucket.bucket}
                        className="flex-1 flex flex-col items-center"
                      >
                        <div className="text-xs text-muted-foreground mb-1">
                          {bucket.count}
                        </div>
                        <div
                          className={cn(
                            "w-full rounded-t-sm transition-all hover:opacity-80",
                            bucket.bucket.includes("500")
                              ? "bg-red-500"
                              : bucket.bucket.includes("200")
                              ? "bg-yellow-500"
                              : "bg-[var(--neon-green)]"
                          )}
                          style={{ height: `${Math.max(5, height)}%` }}
                        />
                        <div className="text-xs text-muted-foreground mt-1 text-center">
                          {bucket.bucket}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Duration Percentiles */}
          {metrics && (
            <Card className="card-glow">
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
                    const height = max > 0 ? (stat.value / max) * 100 : 0;
                    return (
                      <div
                        key={stat.label}
                        className="flex-1 flex flex-col items-center"
                      >
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
        </TabsContent>

        {/* All Auctions Tab */}
        <TabsContent value="auctions" className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Select
              value={statusFilter}
              onValueChange={handleStatusFilterChange}
            >
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

          {auctions.length === 0 ? (
            <Card className="card-glow">
              <CardContent className="text-center py-12 text-muted-foreground">
                No auctions found for the selected filters.
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            <Card className="card-glow">
              <CardHeader>
                <CardTitle>
                  Auctions (Last{" "}
                  {timeFilter === 168 ? "7 days" : `${timeFilter}h`})
                </CardTitle>
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
                <CardTitle>
                  Auctions (Last{" "}
                  {timeFilter === 168 ? "7 days" : `${timeFilter}h`})
                </CardTitle>
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
                                {auction.domain ||
                                  auction.publisher_name ||
                                  "Unknown"}
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
                                    width: `${Math.min(
                                      100,
                                      (auction.bid_ratio || 0) * 100
                                    )}%`,
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
                              <CompletionReasonBadge
                                reason={auction.completion_reason}
                              />
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
        </TabsContent>

        {/* Problems Tab */}
        <TabsContent value="problems" className="space-y-4">
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Problematic Auctions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {healthData?.problematicAuctions?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground flex flex-col items-center gap-2">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <p>No problematic auctions detected!</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Publisher</TableHead>
                      <TableHead>Issue</TableHead>
                      <TableHead>Bids</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Floor Price</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {healthData?.problematicAuctions?.map((auction) => (
                      <TableRow key={auction.id}>
                        <TableCell className="font-mono text-xs">
                          {shortenAddress(auction.id)}
                        </TableCell>
                        <TableCell>{auction.domain || "Unknown"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {auction.total_bids === 0 && (
                              <Badge variant="destructive" className="text-xs">
                                No Bids
                              </Badge>
                            )}
                            {auction.completion_reason === "timeout" && (
                              <Badge
                                variant="outline"
                                className="text-xs border-yellow-500 text-yellow-500"
                              >
                                Timeout
                              </Badge>
                            )}
                            {auction.duration_ms &&
                              auction.duration_ms > 3000 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-orange-500 text-orange-500"
                                >
                                  Slow ({auction.duration_ms}ms)
                                </Badge>
                              )}
                            {auction.bid_ratio < 0.1 &&
                              auction.bid_ratio > 0 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs border-purple-500 text-purple-500"
                                >
                                  Low Ratio
                                </Badge>
                              )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {auction.total_bids}/{auction.expected_bids || "-"}
                        </TableCell>
                        <TableCell>
                          {auction.duration_ms
                            ? `${auction.duration_ms}ms`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(auction.floor_price)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(auction.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Data Integrity Check */}
          {healthData?.dataIntegrity && (
            <Card className="card-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Data Integrity Check
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(healthData.dataIntegrity).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className={cn(
                          "p-3 rounded-lg text-center",
                          parseInt(value) > 0
                            ? "bg-red-500/20"
                            : "bg-green-500/20"
                        )}
                      >
                        <p className="text-xs text-muted-foreground capitalize">
                          {key.replace(/_/g, " ")}
                        </p>
                        <p
                          className={cn(
                            "text-xl font-bold",
                            parseInt(value) > 0
                              ? "text-red-500"
                              : "text-green-500"
                          )}
                        >
                          {value}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Publisher Health Tab */}
        <TabsContent value="publishers" className="space-y-4">
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Publisher Health (sorted by issues)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {healthData?.publisherHealth?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No publisher data available
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Publisher</TableHead>
                      <TableHead className="text-right">
                        Total Auctions
                      </TableHead>
                      <TableHead className="text-right">No Bids</TableHead>
                      <TableHead className="text-right">Timeouts</TableHead>
                      <TableHead className="text-right">Avg Duration</TableHead>
                      <TableHead className="text-right">Avg Bids</TableHead>
                      <TableHead className="text-right">No Bid Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {healthData?.publisherHealth?.map((publisher) => (
                      <TableRow key={publisher.publisher_id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {publisher.domain}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {shortenAddress(publisher.publisher_id)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {publisher.total_auctions}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={cn(
                              parseInt(publisher.no_bid_auctions) > 0 &&
                                "text-red-500"
                            )}
                          >
                            {publisher.no_bid_auctions}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={cn(
                              parseInt(publisher.timeout_auctions) > 0 &&
                                "text-yellow-500"
                            )}
                          >
                            {publisher.timeout_auctions}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {publisher.avg_duration?.toFixed(0) || "-"}ms
                        </TableCell>
                        <TableCell className="text-right">
                          {publisher.avg_bids?.toFixed(1) || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant="outline"
                            className={cn(
                              parseFloat(publisher.no_bid_rate || "0") > 20
                                ? "border-red-500 text-red-500"
                                : parseFloat(publisher.no_bid_rate || "0") > 10
                                ? "border-yellow-500 text-yellow-500"
                                : "border-green-500 text-green-500"
                            )}
                          >
                            {publisher.no_bid_rate || 0}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaign Health Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Campaign Health (sorted by lowest activity)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {healthData?.campaignHealth?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No campaign data available
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Advertiser</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Max Bid</TableHead>
                      <TableHead className="text-right">Budget</TableHead>
                      <TableHead className="text-right">Total Bids</TableHead>
                      <TableHead className="text-right">Wins</TableHead>
                      <TableHead className="text-right">Avg Response</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {healthData?.campaignHealth?.map((campaign) => (
                      <TableRow key={campaign.campaign_id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {campaign.campaign_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {shortenAddress(campaign.campaign_id)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{campaign.advertiser_name}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn(
                              campaign.status === "active" &&
                                "border-green-500 text-green-500",
                              campaign.status === "paused" &&
                                "border-yellow-500 text-yellow-500"
                            )}
                          >
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(campaign.max_bid)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(campaign.daily_budget)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={cn(
                              parseInt(campaign.total_bids) === 0 &&
                                "text-red-500"
                            )}
                          >
                            {campaign.total_bids}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {campaign.wins}
                        </TableCell>
                        <TableCell className="text-right">
                          {campaign.avg_response_time
                            ? `${campaign.avg_response_time.toFixed(0)}ms`
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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
            <span className="text-xs">
              {((auction.bid_ratio || 0) * 100).toFixed(0)}%
            </span>
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
            {auction.winning_amount
              ? formatCurrency(auction.winning_amount)
              : "-"}
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
