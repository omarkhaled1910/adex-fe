"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatCurrency, shortenAddress } from "@/lib/utils";

interface FinancialData {
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    auctionCount: number;
    avgWinningPrice: number;
  }>;
  dailyFees: Array<{ date: string; fees: number }>;
  cpmCpcTrends: Array<{
    date: string;
    impressions: number;
    clicks: number;
    avgCpm: number;
    avgCpc: number;
    ctr: number;
  }>;
  budgetUtilization: Array<{
    campaignId: string;
    campaignName: string;
    advertiserName: string;
    totalBudget: number;
    spentAmount: number;
    remainingBudget: number;
    utilizationPercent: number;
    status: string;
  }>;
  topCampaigns: Array<{
    campaignId: string;
    campaignName: string;
    advertiserName: string;
    spentAmount: number;
    impressionsWon: number;
    clicks: number;
    avgCpm: number;
    avgCtr: number;
  }>;
  publisherEarnings: Array<{
    publisherId: string;
    domain: string;
    companyName: string;
    totalEarnings: number;
    pendingEarnings: number;
    auctionCount: number;
  }>;
  summary: {
    totalRevenue: number;
    totalFees: number;
    totalImpressions: number;
    totalClicks: number;
    avgCpm: number;
    avgCpc: number;
    overallCtr: number;
  };
}

export default function FinancialPage() {
  const [data, setData] = useState<FinancialData | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`/api/admin/financial?days=${days}`);

      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error("Error fetching financial data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [days]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <DollarSign className="h-12 w-12 text-[var(--neon-purple)] animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading financial data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-muted-foreground">
          No financial data available
        </div>
      </div>
    );
  }

  // Calculate totals for the selected period
  const periodRevenue = data.dailyRevenue.reduce((sum, d) => sum + d.revenue, 0);
  const periodFees = periodRevenue * 0.05;
  const periodAuctions = data.dailyRevenue.reduce((sum, d) => sum + d.auctionCount, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Financial Analytics</h1>
          <p className="text-muted-foreground text-sm">
            Revenue, spending, and budget utilization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={days.toString()} onValueChange={(v) => setDays(parseInt(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <RefreshControl
            onRefresh={fetchData}
            defaultInterval={10}
            isRefreshing={refreshing}
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              Period Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-[var(--neon-green)]">
              {formatCurrency(periodRevenue)}
            </div>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium">Platform Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-[var(--neon-purple)]">
              {formatCurrency(periodFees)}
            </div>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium">Auctions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{periodAuctions}</div>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium">Impressions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {data.summary.totalImpressions.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium">Avg CPM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              ${data.summary.avgCpm.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium">CTR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {data.summary.overallCtr.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Daily Revenue Chart */}
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[var(--neon-green)]" />
              Daily Revenue & Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-40">
              {data.dailyRevenue.slice(0, 14).map((day, i) => {
                const maxRevenue = Math.max(...data.dailyRevenue.map((d) => d.revenue), 1);
                const height = (day.revenue / maxRevenue) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center group">
                    <div className="relative w-full flex gap-0.5">
                      <div
                        className="flex-1 bg-[var(--neon-green)]/80 hover:bg-[var(--neon-green)] rounded-t-sm transition-all"
                        style={{ height: `${Math.max(5, height * 0.95)}%` }}
                      />
                      <div
                        className="w-1 bg-[var(--neon-purple)]/80 hover:bg-[var(--neon-purple)] rounded-t-sm transition-all"
                        style={{ height: `${Math.max(5, height * 0.95)}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 rotate-0">
                      {new Date(day.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </div>
                    <div className="opacity-0 group-hover:opacity- transition-all text-xs bg-popover border rounded px-1 py-0.5 absolute -mt-8 pointer-events-none whitespace-nowrap">
                      {formatCurrency(day.revenue)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-[var(--neon-green)]" />
                <span>Revenue</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-1 bg-[var(--neon-purple)]" />
                <span>Fees (5%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CPM/CPC Trends */}
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[var(--neon-blue)]" />
              CPM & CPC Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>CPM</span>
                  <span className="text-[var(--neon-blue)]">
                    ${data.summary.avgCpm.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--neon-blue)]"
                    style={{ width: `${Math.min(100, (data.summary.avgCpm / 20) * 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>CPC</span>
                  <span className="text-[var(--neon-purple)]">
                    ${data.summary.avgCpc.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--neon-purple)]"
                    style={{ width: `${Math.min(100, (data.summary.avgCpc / 5) * 100)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>CTR</span>
                  <span className="text-[var(--neon-green)]">
                    {data.summary.overallCtr.toFixed(2)}%
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--neon-green)]"
                    style={{ width: `${Math.min(100, data.summary.overallCtr * 10)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Utilization */}
      <Card className="card-glow mb-6">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Budget Utilization (Active Campaigns)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.budgetUtilization.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No active campaigns
            </div>
          ) : (
            <div className="space-y-3">
              {data.budgetUtilization.slice(0, 10).map((campaign) => (
                <div key={campaign.campaignId} className="space-y-1">
                  <div className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-medium">{campaign.campaignName}</span>
                      <span className="text-muted-foreground mx-2">•</span>
                      <span className="text-muted-foreground">{campaign.advertiserName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(campaign.spentAmount)} / {formatCurrency(campaign.totalBudget)}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-medium",
                          campaign.utilizationPercent >= 90
                            ? "text-red-500"
                            : campaign.utilizationPercent >= 70
                            ? "text-[var(--neon-orange)]"
                            : "text-[var(--neon-green)]"
                        )}
                      >
                        {campaign.utilizationPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all",
                        campaign.utilizationPercent >= 90
                          ? "bg-red-500"
                          : campaign.utilizationPercent >= 70
                          ? "bg-[var(--neon-orange)]"
                          : "bg-[var(--neon-green)]"
                      )}
                      style={{ width: `${Math.min(100, campaign.utilizationPercent)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Campaigns */}
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="text-sm">Top Campaigns by Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Spent</TableHead>
                    <TableHead>Impressions</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>CTR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.topCampaigns.slice(0, 10).map((campaign) => (
                    <TableRow key={campaign.campaignId}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">
                            {campaign.campaignName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {campaign.advertiserName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(campaign.spentAmount)}</TableCell>
                      <TableCell>
                        {campaign.impressionsWon?.toLocaleString()}
                      </TableCell>
                      <TableCell>{campaign.clicks}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            campaign.avgCtr >= 1
                              ? "bg-[var(--neon-green)]/20 text-[var(--neon-green)] border-[var(--neon-green)]/30"
                              : "bg-secondary"
                          )}
                        >
                          {campaign.avgCtr?.toFixed(2)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Publisher Earnings */}
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="text-sm">Top Publisher Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Publisher</TableHead>
                    <TableHead>Total Earnings</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Auctions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.publisherEarnings.slice(0, 10).map((publisher) => (
                    <TableRow key={publisher.publisherId}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">
                            {publisher.domain}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {publisher.companyName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-[var(--neon-green)]">
                        {formatCurrency(publisher.totalEarnings)}
                      </TableCell>
                      <TableCell className="text-[var(--neon-orange)]">
                        {formatCurrency(publisher.pendingEarnings)}
                      </TableCell>
                      <TableCell>{publisher.auctionCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
