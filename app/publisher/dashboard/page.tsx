"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  Clock,
  Wallet,
  Layout,
  ExternalLink,
  Shield,
  Code,
  BarChart3,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePublisher, useAdSlots } from "@/lib/hooks/usePublisher";
import { formatCurrency } from "@/lib/utils";
import type { Publisher } from "@/lib/types/publisher";

// Stat Card Component
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
    green: "from-[var(--neon-green)]/20 to-[var(--neon-green)]/5 border-[var(--neon-green)]/30",
    blue: "from-[var(--neon-blue)]/20 to-[var(--neon-blue)]/5 border-[var(--neon-blue)]/30",
    purple: "from-[var(--neon-purple)]/20 to-[var(--neon-purple)]/5 border-[var(--neon-purple)]/30",
    amber: "from-amber-500/20 to-amber-500/5 border-amber-500/30",
  };

  return (
    <Card className={`bg-gradient-to-br ${colors[color].split(" ")[0]} ${colors[color].split(" ")[1]} border ${colors[color].split(" ")[2]}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${color === "green" ? "text-[var(--neon-green)]" : color === "blue" ? "text-[var(--neon-blue)]" : color === "purple" ? "text-[var(--neon-purple)]" : "text-amber-500"}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground mt-1">{change}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function PublisherDashboard() {
  const { publisher, loading } = usePublisher();
  const { adSlots } = useAdSlots();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const activeSlots = adSlots.filter((s) => s.status === "active").length;
  const totalImpressions = adSlots.reduce((sum, s) => sum + s.impressions_served, 0);
  const totalClicks = adSlots.reduce((sum, s) => sum + s.clicks, 0);
  const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Publisher Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {publisher?.company_name || "Publisher"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {publisher?.status === "active" ? (
            <Badge className="bg-[var(--neon-green)]/20 text-[var(--neon-green)] border-[var(--neon-green)]/30">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Active
            </Badge>
          ) : publisher?.status === "pending" ? (
            <Badge variant="outline" className="border-amber-500/50 text-amber-400">
              <AlertCircle className="w-3 h-3 mr-1" />
              Pending Verification
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertCircle className="w-3 h-3 mr-1" />
              Suspended
            </Badge>
          )}
        </div>
      </div>

      {/* Domain Verification Warning */}
      {!publisher?.domain_verified && (
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-amber-400" />
              <div>
                <p className="font-medium text-amber-200">Domain Verification Required</p>
                <p className="text-sm text-amber-200/70">
                  Verify your domain to activate your account and start serving ads.
                </p>
              </div>
            </div>
            <Link href="/publisher/verify">
              <Button variant="outline" className="border-amber-500/50 text-amber-200 hover:bg-amber-500/20">
                Verify Now
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Earnings Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Earnings"
          value={formatCurrency(publisher?.total_earnings || 0)}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Pending Earnings"
          value={formatCurrency(publisher?.pending_earnings || 0)}
          change="Available for withdrawal"
          icon={Clock}
          color="blue"
        />
        <StatCard
          title="Withdrawn"
          value={formatCurrency(publisher?.withdrawn_earnings || 0)}
          icon={Wallet}
          color="purple"
        />
        <StatCard
          title="Active Ad Slots"
          value={`${activeSlots} / ${adSlots.length}`}
          change={`Total: ${adSlots.length} slots`}
          icon={Layout}
          color="amber"
        />
      </div>

      {/* Performance Overview */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[var(--neon-green)]" />
              Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-sm text-muted-foreground">Total Impressions</p>
                <p className="text-2xl font-bold mt-1">{totalImpressions.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-secondary/50">
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <p className="text-2xl font-bold mt-1">{totalClicks.toLocaleString()}</p>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average CTR</p>
                  <p className="text-2xl font-bold mt-1">{ctr}%</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">RPM</p>
                  <p className="text-2xl font-bold mt-1 text-[var(--neon-green)]">
                    {totalImpressions > 0
                      ? formatCurrency(
                          (adSlots.reduce((sum, s) => sum + s.total_revenue, 0) / totalImpressions) * 1000
                        )
                      : "$0.0000"}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Ad Slots */}
        <Card className="bg-card/50 backdrop-blur-xl border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5 text-[var(--neon-blue)]" />
              Top Performing Slots
            </CardTitle>
            <Link href="/publisher/ad-slots">
              <Button variant="ghost" size="sm">
                View All
                <ExternalLink className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {adSlots.slice(0, 5).map((slot) => (
                <div
                  key={slot.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{slot.slot_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {slot.slot_type} • {slot.width}×{slot.height}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-medium text-[var(--neon-green)]">
                      {formatCurrency(slot.total_revenue)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {slot.impressions_served.toLocaleString()} impressions
                    </p>
                  </div>
                </div>
              ))}
              {adSlots.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Layout className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No ad slots yet</p>
                  <Link href="/publisher/ad-slots/new">
                    <Button className="mt-4" size="sm">
                      Create Your First Ad Slot
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-card/50 backdrop-blur-xl border-border/50">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/publisher/ad-slots/new">
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4 border-dashed border-[var(--neon-blue)]/30 hover:border-[var(--neon-blue)] hover:bg-[var(--neon-blue)]/10"
              >
                <Layout className="h-5 w-5 mr-3 text-[var(--neon-blue)]" />
                <div className="text-left">
                  <p className="font-medium">Create Ad Slot</p>
                  <p className="text-xs text-muted-foreground">Add a new ad placement</p>
                </div>
              </Button>
            </Link>
            <Link href="/publisher/integration">
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4 border-dashed border-[var(--neon-green)]/30 hover:border-[var(--neon-green)] hover:bg-[var(--neon-green)]/10"
              >
                <Code className="h-5 w-5 mr-3 text-[var(--neon-green)]" />
                <div className="text-left">
                  <p className="font-medium">Get Integration Code</p>
                  <p className="text-xs text-muted-foreground">SDK and embed scripts</p>
                </div>
              </Button>
            </Link>
            <Link href="/publisher/verify">
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4 border-dashed border-amber-500/30 hover:border-amber-500 hover:bg-amber-500/10"
              >
                <Shield className="h-5 w-5 mr-3 text-amber-500" />
                <div className="text-left">
                  <p className="font-medium">Verify Domain</p>
                  <p className="text-xs text-muted-foreground">
                    {publisher?.domain_verified ? "Verified" : "Complete verification"}
                  </p>
                </div>
              </Button>
            </Link>
            <Link href="/publisher/analytics">
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-4 border-dashed border-[var(--neon-purple)]/30 hover:border-[var(--neon-purple)] hover:bg-[var(--neon-purple)]/10"
              >
                <BarChart3 className="h-5 w-5 mr-3 text-[var(--neon-purple)]" />
                <div className="text-left">
                  <p className="font-medium">View Analytics</p>
                  <p className="text-xs text-muted-foreground">Performance insights</p>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
