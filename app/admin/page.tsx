"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  DollarSign,
  Users,
  Globe,
  Timer,
  TrendingUp,
  Target,
  Zap,
} from "lucide-react";
import { AdminStatsCard } from "@/components/admin/AdminStatsCard";
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
import { cn, formatCurrency, shortenAddress } from "@/lib/utils";

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
  activeAdvertisers: number;
  activeCampaigns: number;
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentAuctions, setRecentAuctions] = useState<RecentAuction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, auctionsRes] = await Promise.all([
        fetch("/api/admin/stats?hours=24"),
        fetch("/api/admin/auctions?limit=10&hours=24"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (auctionsRes.ok) {
        const auctionsData = await auctionsRes.json();
        setRecentAuctions(auctionsData.auctions);
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Zap className="h-12 w-12 text-[var(--neon-purple)] animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
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
            Platform overview and real-time monitoring
          </p>
        </div>
        <RefreshControl
          onRefresh={fetchData}
          defaultInterval={10}
          isRefreshing={refreshing}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <AdminStatsCard
          title="Total Auctions"
          value={stats?.totalAuctions || 0}
          icon={Activity}
          color="purple"
        />
        <AdminStatsCard
          title="Completed"
          value={stats?.completedAuctions || 0}
          trend={`${stats?.completionRate.toFixed(1)}%`}
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
          trend={`${stats?.avgBidsPerAuction.toFixed(1)}/auction`}
          icon={TrendingUp}
          color="purple"
        />
        <AdminStatsCard
          title="Revenue"
          value={formatCurrency(stats?.totalRevenue || 0)}
          icon={DollarSign}
          color="green"
        />
        <AdminStatsCard
          title="Publishers"
          value={stats?.activePublishers || 0}
          icon={Globe}
          color="blue"
        />
        <AdminStatsCard
          title="Advertisers"
          value={stats?.activeAdvertisers || 0}
          icon={Users}
          color="purple"
        />
        <AdminStatsCard
          title="Avg Duration"
          value={`${stats?.avgDuration.toFixed(0)}ms`}
          icon={Timer}
          color="orange"
        />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="card-glow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Bid Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[var(--neon-green)]">
              {stats?.bidRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.withBidsCount} of {stats?.completedAuctions} auctions
              received bids
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
                (stats?.timeoutRate || 0) > 10 ? "text-red-500" : "text-[var(--neon-orange)]"
              )}
            >
              {stats?.timeoutRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.timeoutCount} auctions timed out
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
            <CardTitle className="text-sm font-medium">
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[var(--neon-purple)]">
              {stats?.avgResponseTime.toFixed(0)}ms
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

      {/* Recent Auctions */}
      <Card className="card-glow">
        <CardHeader>
          <CardTitle>Recent Auctions</CardTitle>
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
                      {auction.duration_ms
                        ? `${auction.duration_ms}ms`
                        : "-"}
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
