"use client";

import { useEffect, useState } from "react";
import {
  Filter,
  Timer,
  TrendingUp,
  Activity,
  Clock,
  Zap,
  AlertCircle,
} from "lucide-react";
import { RefreshControl } from "@/components/admin/RefreshControl";
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
import { cn, formatCurrency, shortenAddress } from "@/lib/utils";

interface Auction {
  id: string;
  publisher_id: string;
  domain: string | null;
  publisher_name: string | null;
  ad_slot_id: string;
  status: string;
  floor_price: number;
  total_bids: number;
  expected_bids: number;
  bid_ratio: number;
  duration_ms: number | null;
  winning_amount: number | null;
  winning_price: number | null;
  completion_reason: string | null;
  bid_count: number;
  highest_bid: number | null;
  avg_response_time_ms: number | null;
  created_at: Date;
}

interface PerformanceMetrics {
  duration: {
    avg: number;
    median: number;
    p95: number;
    p99: number;
  };
  bidResponse: {
    avg: number;
    median: number;
    p95: number;
    p99: number;
  };
  completion: {
    totalAuctions: number;
    completionRate: number;
    bidSuccessRate: number;
    timeoutRate: number;
  };
}

export default function AuctionsMonitoringPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [auctionsRes, metricsRes] = await Promise.all([
        fetch(`/api/admin/auctions?status=${statusFilter}&limit=100&hours=24`),
        fetch("/api/admin/performance?hours=24"),
      ]);

      if (auctionsRes.ok) {
        const data = await auctionsRes.json();
        setAuctions(data.auctions);
      }

      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error("Error fetching auctions data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Activity className="h-12 w-12 text-[var(--neon-purple)] animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading auction data...</p>
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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
          <RefreshControl
            onRefresh={fetchData}
            defaultInterval={5}
            isRefreshing={refreshing}
          />
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
                  metrics.completion.timeoutRate > 10 ? "text-red-500" : "text-[var(--neon-orange)]"
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
                const max = Math.max(...Object.values(metrics.duration));
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

      {/* Auctions Table */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Auctions (Last 24h)</CardTitle>
        </CardHeader>
        <CardContent>
          {auctions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No auctions found for the selected filters.
            </div>
          ) : (
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
                        <Badge
                          variant="outline"
                          className={cn(
                            auction.status === "active" &&
                              "bg-blue-500/20 text-blue-400 border-blue-500/30",
                            auction.status === "completed" &&
                              "bg-green-500/20 text-green-400 border-green-500/30",
                            auction.status === "expired" &&
                              "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          )}
                        >
                          {auction.status}
                        </Badge>
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
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs",
                              auction.completion_reason === "timeout" &&
                                "border-[var(--neon-orange)] text-[var(--neon-orange)]",
                              auction.completion_reason.includes("early") &&
                                "border-[var(--neon-green)] text-[var(--neon-green)]",
                              auction.completion_reason === "all_bids_received" &&
                                "border-[var(--neon-blue)] text-[var(--neon-blue)]"
                            )}
                          >
                            {auction.completion_reason}
                          </Badge>
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
