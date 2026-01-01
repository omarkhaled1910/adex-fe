"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  Eye,
  MousePointer,
  Plus,
  ArrowUpRight,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

interface DashboardStats {
  totalSpent: number;
  impressions: number;
  clicks: number;
  ctr: number;
  activeCampaigns: number;
  activeCreatives: number;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  spent_amount: number;
  total_budget: number;
  impressions_served: number;
  clicks: number;
}

export default function AdvertiserDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSpent: 0,
    impressions: 0,
    clicks: 0,
    ctr: 0,
    activeCampaigns: 0,
    activeCreatives: 0,
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, campaignsRes] = await Promise.all([
        fetch("/api/advertiser/stats"),
        fetch("/api/campaigns?limit=5"),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (campaignsRes.ok) {
        const campaignsData = await campaignsRes.json();
        setCampaigns(campaignsData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Spent",
      value: formatCurrency(stats.totalSpent),
      icon: DollarSign,
      trend: "+12.5%",
      trendUp: false,
    },
    {
      title: "Impressions",
      value: stats.impressions.toLocaleString(),
      icon: Eye,
      trend: "+23.1%",
      trendUp: true,
    },
    {
      title: "Clicks",
      value: stats.clicks.toLocaleString(),
      icon: MousePointer,
      trend: "+8.4%",
      trendUp: true,
    },
    {
      title: "CTR",
      value: `${(stats.ctr * 100).toFixed(2)}%`,
      icon: TrendingUp,
      trend: "+2.1%",
      trendUp: true,
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your advertising performance.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/advertiser/campaigns/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Campaign
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="card-glow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                <Badge
                  variant={stat.trendUp ? "default" : "secondary"}
                  className={
                    stat.trendUp
                      ? "bg-[var(--neon-green)]/20 text-[var(--neon-green)] hover:bg-[var(--neon-green)]/30"
                      : ""
                  }
                >
                  {stat.trend}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  vs last month
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="neon-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Campaigns</CardTitle>
              <CardDescription>Currently running campaigns</CardDescription>
            </div>
            <div className="text-4xl font-bold text-[var(--neon-green)]">
              {stats.activeCampaigns}
            </div>
          </CardHeader>
        </Card>
        <Card className="neon-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Creatives</CardTitle>
              <CardDescription>Approved ad creatives</CardDescription>
            </div>
            <div className="text-4xl font-bold text-[var(--neon-blue)]">
              {stats.activeCreatives}
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card className="card-glow">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>Your latest campaign performance</CardDescription>
          </div>
          <Link href="/advertiser/campaigns">
            <Button variant="ghost" size="sm" className="gap-1">
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Activity className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No campaigns yet. Create your first campaign to start
                advertising.
              </p>
              <Link href="/advertiser/campaigns/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:border-[var(--neon-green)]/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={
                            campaign.status === "active"
                              ? "default"
                              : "secondary"
                          }
                          className={
                            campaign.status === "active"
                              ? "bg-[var(--neon-green)]/20 text-[var(--neon-green)]"
                              : ""
                          }
                        >
                          {campaign.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatCurrency(campaign.spent_amount)} /{" "}
                          {formatCurrency(campaign.total_budget)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm">
                      {campaign.impressions_served.toLocaleString()} impr
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {campaign.clicks.toLocaleString()} clicks
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
