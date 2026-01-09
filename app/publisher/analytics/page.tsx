"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  Eye,
  MousePointerClick,
  DollarSign,
  Target,
  Calendar,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePublisherAnalytics, useAdSlots } from "@/lib/hooks/usePublisher";
import { formatCurrency, cn } from "@/lib/utils";

// Simple bar chart component (since we're keeping it minimal)
function SimpleBarChart({
  data,
  valueKey,
  color = "blue",
}: {
  data: any[];
  valueKey: string;
  color?: "green" | "blue" | "purple";
}) {
  const maxValue = Math.max(...data.map((d) => d[valueKey]), 1);

  const colors = {
    green: "bg-[var(--neon-green)]",
    blue: "bg-[var(--neon-blue)]",
    purple: "bg-[var(--neon-purple)]",
  };

  return (
    <div className="space-y-2">
      {data.map((item, i) => {
        const value = item[valueKey];
        const height = (value / maxValue) * 100;
        return (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-16 text-muted-foreground flex-shrink-0">
              {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            <div className="flex-1 h-16 bg-zinc-900 rounded relative overflow-hidden">
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 transition-all duration-500",
                  colors[color]
                )}
                style={{ height: `${height}%` }}
              />
            </div>
            <span className="w-20 text-right font-mono flex-shrink-0">
              {value.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Stat card component
function StatCard({
  title,
  value,
  change,
  icon: Icon,
  color = "green",
}: {
  title: string;
  value: string;
  change?: string;
  icon: any;
  color?: "green" | "blue" | "purple" | "amber";
}) {
  const colors = {
    green: "from-[var(--neon-green)]/20 to-[var(--neon-green)]/5 border-[var(--neon-green)]/30 text-[var(--neon-green)]",
    blue: "from-[var(--neon-blue)]/20 to-[var(--neon-blue)]/5 border-[var(--neon-blue)]/30 text-[var(--neon-blue)]",
    purple: "from-[var(--neon-purple)]/20 to-[var(--neon-purple)]/5 border-[var(--neon-purple)]/30 text-[var(--neon-purple)]",
    amber: "from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-500",
  };

  return (
    <Card className={cn("bg-gradient-to-br border", colors[color])}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {change && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {change}
              </p>
            )}
          </div>
          <div className={cn(
            "w-12 h-12 rounded-lg flex items-center justify-center",
            color === "green" && "bg-[var(--neon-green)]/20",
            color === "blue" && "bg-[var(--neon-blue)]/20",
            color === "purple" && "bg-[var(--neon-purple)]/20",
            color === "amber" && "bg-amber-500/20"
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(30);
  const [mounted, setMounted] = useState(false);
  const { analytics, loading } = usePublisherAnalytics(days);
  const { adSlots } = useAdSlots();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  const totalImpressions = analytics?.total_impressions || 0;
  const totalClicks = analytics?.total_clicks || 0;
  const totalRevenue = analytics?.total_revenue || 0;
  const avgCtr = analytics?.avg_ctr || 0;
  const fillRate = analytics?.fill_rate || 0;
  const dailyStats = analytics?.daily_stats || [];
  const slotStats = analytics?.slot_stats || [];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your ad performance and revenue
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={days.toString()} onValueChange={(v) => setDays(parseInt(v))}>
            <SelectTrigger className="w-32">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Impressions"
          value={totalImpressions.toLocaleString()}
          icon={Eye}
          color="blue"
        />
        <StatCard
          title="Total Clicks"
          value={totalClicks.toLocaleString()}
          icon={MousePointerClick}
          color="purple"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Avg CTR"
          value={`${avgCtr.toFixed(2)}%`}
          icon={Target}
          color="amber"
        />
        <StatCard
          title="Fill Rate"
          value={`${fillRate.toFixed(1)}%`}
          icon={TrendingUp}
          color="blue"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Impressions Chart */}
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-[var(--neon-blue)]" />
              Impressions Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyStats.length > 0 ? (
              <SimpleBarChart data={dailyStats} valueKey="impressions" color="blue" />
            ) : (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-[var(--neon-green)]" />
              Revenue Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyStats.length > 0 ? (
              <SimpleBarChart
                data={dailyStats.map((d: any) => ({ ...d, revenue: parseFloat(d.revenue.toFixed(2)) }))}
                valueKey="revenue"
                color="green"
              />
            ) : (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Clicks Chart */}
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointerClick className="h-5 w-5 text-[var(--neon-purple)]" />
              Clicks Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyStats.length > 0 ? (
              <SimpleBarChart data={dailyStats} valueKey="clicks" color="purple" />
            ) : (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* CTR Chart */}
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-500" />
              Click-Through Rate Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dailyStats.length > 0 ? (
              <SimpleBarChart
                data={dailyStats.map((d: any) => ({
                  ...d,
                  ctr: d.impressions > 0 ? parseFloat(((d.clicks / d.impressions) * 100).toFixed(2)) : 0
                }))}
                valueKey="ctr"
                color="purple"
              />
            ) : (
              <p className="text-muted-foreground text-center py-8">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Per-Slot Performance */}
      <Card className="bg-card/50 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle>Per-Slot Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Slot Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Impressions</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Clicks</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">CTR</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Revenue</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">RPM</th>
                </tr>
              </thead>
              <tbody>
                {slotStats.map((slot: any) => (
                  <tr key={slot.id} className="border-b border-border/30 hover:bg-secondary/30">
                    <td className="py-3 px-4 font-medium">{slot.slot_name}</td>
                    <td className="py-3 px-4 capitalize text-muted-foreground">{slot.slot_type}</td>
                    <td className="py-3 px-4 text-right">{slot.impressions_served.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{slot.clicks.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right">{slot.ctr.toFixed(2)}%</td>
                    <td className="py-3 px-4 text-right font-medium text-[var(--neon-green)]">
                      {formatCurrency(slot.total_revenue)}
                    </td>
                    <td className="py-3 px-4 text-right">${slot.rpm.toFixed(2)}</td>
                  </tr>
                ))}
                {slotStats.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No slot data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
