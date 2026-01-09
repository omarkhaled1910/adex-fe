"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  DollarSign,
  Users,
  Globe,
  Timer,
  TrendingUp,
  Target,
  Zap,
  Layout,
  Image,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { AdminStatsCard } from "@/components/admin/AdminStatsCard";
import { RefreshControl } from "@/components/admin/RefreshControl";
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
import { cn, formatCurrency, shortenAddress } from "@/lib/utils";

interface AdSlotByType {
  type: string;
  count: number;
  impressions: number;
  clicks: number;
  revenue: number;
}

interface CreativeByFormat {
  format: string;
  count: number;
  impressions: number;
  clicks: number;
  avgCtr: number;
}

interface CreativeByReviewStatus {
  status: string;
  count: number;
}

interface AdminStats {
  totalAuctions: number;
  completedAuctions: number;
  activeAuctions: number;
  totalBids: number;
  avgBidAmount: number;
  avgResponseTime: number;
  avgDuration: number;
  timeoutCount: number;
  withBidsCount: number;
  noBidsCount: number;
  totalRevenue: number;
  activePublishers: number;
  totalPublishers: number;
  activeAdvertisers: number;
  totalAdvertisers: number;
  activeCampaigns: number;
  totalCampaigns: number;
  activeAdSlots: number;
  totalAdSlots: number;
  adSlotsByType: AdSlotByType[];
  activeCreatives: number;
  totalCreatives: number;
  creativesByFormat: CreativeByFormat[];
  creativesByReviewStatus: CreativeByReviewStatus[];
  completionRate: number;
  bidRate: number;
  timeoutRate: number;
  avgBidsPerAuction: number;
}

interface RecentAuction {
  id: string;
  domain: string | null;
  status: string;
  total_bids: number;
  duration_ms: number | null;
  winning_amount: number | null;
  completion_reason: string | null;
  created_at: Date;
}

// Fetch functions
async function fetchAdminStats(): Promise<AdminStats> {
  const res = await fetch("/api/admin/auctions/get-all-stats");
  if (!res.ok) throw new Error("Failed to fetch admin stats");
  return res.json();
}

async function fetchRecentAuctions(
  limit: number = 20
): Promise<RecentAuction[]> {
  const res = await fetch(`/api/admin/auctions?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch recent auctions");
  const data = await res.json();
  return data.auctions;
}

export default function AdminDashboard() {
  const queryClient = useQueryClient();
  const [refreshInterval, setRefreshInterval] = useState(10); // seconds
  const [auctionsRowCount, setAuctionsRowCount] = useState(20); // number of rows to show
  const refetchIntervalMs =
    refreshInterval > 0 ? refreshInterval * 1000 : false;

  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: fetchAdminStats,
    refetchInterval: refetchIntervalMs,
  });

  const { data: recentAuctions = [], isLoading: auctionsLoading } = useQuery({
    queryKey: ["admin", "recent-auctions", auctionsRowCount],
    queryFn: () => fetchRecentAuctions(auctionsRowCount),
    refetchInterval: refetchIntervalMs,
  });

  const isLoading = statsLoading || auctionsLoading;
  const isError = statsError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Zap className="h-12 w-12 text-[var(--neon-purple)] animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-500">
          <p className="text-lg font-medium">Error loading dashboard</p>
          <p className="text-sm text-muted-foreground">
            Please try again later
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Platform overview and historical data
          </p>
        </div>
        <RefreshControl
          defaultInterval={10}
          onRefresh={async () => {
            await queryClient.invalidateQueries({ queryKey: ["admin"] });
          }}
          onIntervalChange={setRefreshInterval}
        />
      </div>

      {/* Primary Stats Cards - Auctions */}
      <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
        Auction Metrics
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <AdminStatsCard
          title="Total Auctions"
          value={stats?.totalAuctions || 0}
          icon={Activity}
          color="purple"
        />
        <AdminStatsCard
          title="Completed"
          value={stats?.completedAuctions || 0}
          trend={`${(stats?.completionRate || 0).toFixed(1)}%`}
          trendUp={true}
          icon={Target}
          color="green"
        />
        <AdminStatsCard
          title="Active"
          value={stats?.activeAuctions || 0}
          icon={Zap}
          color="blue"
        />
        <AdminStatsCard
          title="Total Bids"
          value={stats?.totalBids || 0}
          trend={`${(stats?.avgBidsPerAuction || 0).toFixed(1)}/auction`}
          icon={TrendingUp}
          color="purple"
        />
        <AdminStatsCard
          title="Avg Bid Amount"
          value={formatCurrency(stats?.avgBidAmount || 0)}
          icon={DollarSign}
          color="green"
        />
        <AdminStatsCard
          title="Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={DollarSign}
          color="green"
        />
      </div>

      {/* Platform Stats Cards */}
      <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
        Platform Entities
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <AdminStatsCard
          title="Active Publishers"
          value={stats?.activePublishers || 0}
          trend={`${stats?.totalPublishers || 0} total`}
          icon={Globe}
          color="blue"
        />
        <AdminStatsCard
          title="Active Advertisers"
          value={stats?.activeAdvertisers || 0}
          trend={`${stats?.totalAdvertisers || 0} total`}
          icon={Users}
          color="purple"
        />
        <AdminStatsCard
          title="Active Campaigns"
          value={stats?.activeCampaigns || 0}
          trend={`${stats?.totalCampaigns || 0} total`}
          icon={Target}
          color="green"
        />
        <AdminStatsCard
          title="Active Ad Slots"
          value={stats?.activeAdSlots || 0}
          trend={`${stats?.totalAdSlots || 0} total`}
          icon={Layout}
          color="orange"
        />
        <AdminStatsCard
          title="Active Creatives"
          value={stats?.activeCreatives || 0}
          trend={`${stats?.totalCreatives || 0} total`}
          icon={Image}
          color="blue"
        />
        <AdminStatsCard
          title="Avg Duration"
          value={`${(stats?.avgDuration || 0).toFixed(0)}ms`}
          icon={Timer}
          color="orange"
        />
      </div>

      {/* Performance Metrics */}
      <h2 className="text-lg font-semibold mb-3 text-muted-foreground">
        Performance Metrics
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="card-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Bid Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[var(--neon-green)]">
              {(stats?.bidRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.withBidsCount || 0} of {stats?.completedAuctions || 0}{" "}
              auctions received bids
            </p>
            <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--neon-green)]"
                style={{ width: `${stats?.bidRate || 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Timeout Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-3xl font-bold",
                (stats?.timeoutRate || 0) > 10
                  ? "text-red-500"
                  : "text-[var(--neon-orange)]"
              )}
            >
              {(stats?.timeoutRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.timeoutCount || 0} auctions timed out
            </p>
            <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--neon-orange)]"
                style={{ width: `${stats?.timeoutRate || 0}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">No Bids Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[var(--neon-purple)]">
              {stats?.completedAuctions
                ? (
                    ((stats?.noBidsCount || 0) / stats.completedAuctions) *
                    100
                  ).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.noBidsCount || 0} auctions with no bids
            </p>
            <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--neon-purple)]"
                style={{
                  width: `${
                    stats?.completedAuctions
                      ? ((stats?.noBidsCount || 0) / stats.completedAuctions) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="card-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[var(--neon-purple)]">
              {(stats?.avgResponseTime || 0).toFixed(0)}ms
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average bid response time
            </p>
            <div className="mt-3 flex gap-1">
              {[50, 100, 150, 200].map((threshold, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-2 flex-1 rounded-full",
                    (stats?.avgResponseTime || 0) < threshold
                      ? "bg-[var(--neon-green)]"
                      : "bg-secondary"
                  )}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ad Slots & Creatives Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Ad Slots by Type */}
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Ad Slots by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.adSlotsByType && stats.adSlotsByType.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.adSlotsByType.map((slot) => (
                    <TableRow key={slot.type}>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {slot.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {slot.count}
                      </TableCell>
                      <TableCell className="text-right">
                        {slot.impressions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {slot.clicks.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(slot.revenue)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No ad slot data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Creatives by Format */}
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Creatives by Format
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.creativesByFormat && stats.creativesByFormat.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Format</TableHead>
                    <TableHead className="text-right">Count</TableHead>
                    <TableHead className="text-right">Impressions</TableHead>
                    <TableHead className="text-right">Clicks</TableHead>
                    <TableHead className="text-right">Avg CTR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.creativesByFormat.map((creative) => (
                    <TableRow key={creative.format}>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {creative.format}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {creative.count}
                      </TableCell>
                      <TableCell className="text-right">
                        {creative.impressions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {creative.clicks.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {(creative.avgCtr * 100).toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No creative data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Creative Review Status */}
      <Card className="card-glow mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Creative Review Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.creativesByReviewStatus &&
          stats.creativesByReviewStatus.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {stats.creativesByReviewStatus.map((status) => (
                <div
                  key={status.status}
                  className="flex items-center gap-3 bg-secondary/50 rounded-lg px-4 py-3"
                >
                  {status.status === "approved" && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {status.status === "pending" && (
                    <Clock className="h-5 w-5 text-yellow-500" />
                  )}
                  {status.status === "rejected" && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {status.status}
                    </p>
                    <p className="text-2xl font-bold">{status.count}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No review status data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Auctions */}
      <Card className="card-glow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Auctions</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows:</span>
              <select
                value={auctionsRowCount}
                onChange={(e) => setAuctionsRowCount(Number(e.target.value))}
                className="bg-secondary border border-border rounded px-2 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {recentAuctions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No auctions yet. Start the simulator to generate activity.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Publisher</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bids</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Winning Amount</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAuctions.map((auction) => (
                  <TableRow key={auction.id}>
                    <TableCell className="font-mono text-xs">
                      {shortenAddress(auction.id)}
                    </TableCell>
                    <TableCell>{auction.domain || "Unknown"}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          auction.status === "active" && "bg-blue-500",
                          auction.status === "completed" && "bg-green-500"
                        )}
                      >
                        {auction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{auction.total_bids}</TableCell>
                    <TableCell>
                      {auction.duration_ms ? `${auction.duration_ms}ms` : "-"}
                    </TableCell>
                    <TableCell>
                      {auction.winning_amount
                        ? formatCurrency(auction.winning_amount)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(auction.created_at).toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
