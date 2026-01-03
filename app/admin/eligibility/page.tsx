"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { RefreshControl } from "@/components/admin/RefreshControl";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn, shortenAddress } from "@/lib/utils";

interface Campaign {
  id: string;
  name: string;
  advertiser_id: string;
}

interface Publisher {
  id: string;
  domain: string;
  company_name: string;
}

interface EligibilityResult {
  isEligible: boolean;
  reasons: string[];
  checks: Record<
    string,
    { pass: boolean; reason: string; details?: any }
  >;
  campaign: { id: string; name: string; status: string };
  publisher: { id: string; domain: string; status: string };
}

interface EligibilityStats {
  overall: {
    totalAuctions: number;
    avgEligibilityRate: number;
    noEligibleAuctions: number;
    highEligibilityAuctions: number;
    mediumEligibilityAuctions: number;
    lowEligibilityAuctions: number;
  };
  breakdown: Array<{ reason: string; count: number; percent: number }>;
  problematicCampaigns: Array<{
    campaignId: string;
    campaignName: string;
    advertiserName: string;
    status: string;
    remainingBudget: number;
    isBudgetExhausted: boolean;
    isPastEndDate: boolean;
    isNotStarted: boolean;
  }>;
  hourlyTrend: Array<{
    hour: string;
    avgBidRatio: number;
    auctionCount: number;
  }>;
}

export default function EligibilityPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [stats, setStats] = useState<EligibilityStats | null>(null);
  const [testResult, setTestResult] = useState<EligibilityResult | null>(null);
  const [testing, setTesting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Test form state
  const [testForm, setTestForm] = useState({
    campaignId: "",
    publisherId: "",
    adSlotType: "banner",
    countryCode: "US",
    device: "desktop",
    os: "Windows",
    browser: "Chrome",
  });

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [campaignsRes, publishersRes] = await Promise.all([
          fetch("/api/admin/campaigns?status=active&limit=100"),
          fetch("/api/admin/publishers?status=active&limit=100"),
        ]);

        if (campaignsRes.ok) {
          const data = await campaignsRes.json();
          setCampaigns(data.campaigns);
        }

        if (publishersRes.ok) {
          const data = await publishersRes.json();
          setPublishers(data.publishers);
        }
      } catch (error) {
        console.error("Error fetching dropdown data:", error);
      }
    };

    fetchDropdownData();
  }, []);

  // Fetch stats
  const fetchStats = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/eligibility/stats?hours=24");

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching eligibility stats:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Run eligibility test
  const runTest = async () => {
    if (!testForm.campaignId || !testForm.publisherId) {
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/eligibility/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: testForm.campaignId,
          publisherId: testForm.publisherId,
          adSlotType: testForm.adSlotType,
          userContext: {
            countryCode: testForm.countryCode,
            device: testForm.device,
            os: testForm.os,
            browser: testForm.browser,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTestResult(data);
      }
    } catch (error) {
      console.error("Error testing eligibility:", error);
    } finally {
      setTesting(false);
    }
  };

  const selectedCampaign = campaigns.find((c) => c.id === testForm.campaignId);
  const selectedPublisher = publishers.find((p) => p.id === testForm.publisherId);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Eligibility Testing & Monitoring</h1>
          <p className="text-muted-foreground text-sm">
            Test campaign eligibility and monitor eligibility metrics
          </p>
        </div>
        <RefreshControl
          onRefresh={fetchStats}
          defaultInterval={10}
          isRefreshing={refreshing}
        />
      </div>

      <Tabs defaultValue="test" className="space-y-6">
        <TabsList>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Test Eligibility
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Eligibility Stats
          </TabsTrigger>
        </TabsList>

        {/* Test Tab */}
        <TabsContent value="test" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Test Form */}
            <Card className="card-glow">
              <CardHeader>
                <CardTitle>Configure Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Campaign</Label>
                  <Select
                    value={testForm.campaignId}
                    onValueChange={(value) =>
                      setTestForm({ ...testForm, campaignId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      {campaigns.map((campaign) => (
                        <SelectItem key={campaign.id} value={campaign.id}>
                          {campaign.name} ({shortenAddress(campaign.id)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Publisher</Label>
                  <Select
                    value={testForm.publisherId}
                    onValueChange={(value) =>
                      setTestForm({ ...testForm, publisherId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a publisher" />
                    </SelectTrigger>
                    <SelectContent>
                      {publishers.map((publisher) => (
                        <SelectItem key={publisher.id} value={publisher.id}>
                          {publisher.domain || publisher.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ad Slot Type</Label>
                    <Select
                      value={testForm.adSlotType}
                      onValueChange={(value) =>
                        setTestForm({ ...testForm, adSlotType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="banner">Banner</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="native">Native</SelectItem>
                        <SelectItem value="interstitial">Interstitial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Select
                      value={testForm.countryCode}
                      onValueChange={(value) =>
                        setTestForm({ ...testForm, countryCode: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="US">US</SelectItem>
                        <SelectItem value="UK">UK</SelectItem>
                        <SelectItem value="DE">DE</SelectItem>
                        <SelectItem value="FR">FR</SelectItem>
                        <SelectItem value="CA">CA</SelectItem>
                        <SelectItem value="AU">AU</SelectItem>
                        <SelectItem value="JP">JP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Device</Label>
                    <Select
                      value={testForm.device}
                      onValueChange={(value) =>
                        setTestForm({ ...testForm, device: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desktop">Desktop</SelectItem>
                        <SelectItem value="mobile">Mobile</SelectItem>
                        <SelectItem value="tablet">Tablet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>OS</Label>
                    <Select
                      value={testForm.os}
                      onValueChange={(value) =>
                        setTestForm({ ...testForm, os: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Windows">Windows</SelectItem>
                        <SelectItem value="macOS">macOS</SelectItem>
                        <SelectItem value="Linux">Linux</SelectItem>
                        <SelectItem value="iOS">iOS</SelectItem>
                        <SelectItem value="Android">Android</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={runTest}
                  disabled={testing || !testForm.campaignId || !testForm.publisherId}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {testing ? "Testing..." : "Test Eligibility"}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            <Card className="card-glow">
              <CardHeader>
                <CardTitle>Results</CardTitle>
              </CardHeader>
              <CardContent>
                {!testResult ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShieldCheck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Select a campaign and publisher, then click "Test Eligibility"</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Overall Result */}
                    <div
                      className={cn(
                        "p-4 rounded-lg border-2 flex items-center gap-3",
                        testResult.isEligible
                          ? "bg-[var(--neon-green)]/10 border-[var(--neon-green)]/30"
                          : "bg-red-500/10 border-red-500/30"
                      )}
                    >
                      {testResult.isEligible ? (
                        <CheckCircle className="h-8 w-8 text-[var(--neon-green)]" />
                      ) : (
                        <XCircle className="h-8 w-8 text-red-500" />
                      )}
                      <div>
                        <div className="font-semibold text-lg">
                          {testResult.isEligible
                            ? "Eligible"
                            : "Not Eligible"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Campaign: {testResult.campaign.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Publisher: {testResult.publisher.domain}
                        </div>
                      </div>
                    </div>

                    {/* Failure Reasons */}
                    {!testResult.isEligible && testResult.reasons.length > 0 && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium text-red-400 mb-2">
                          <AlertCircle className="h-4 w-4" />
                          Rejection Reasons
                        </div>
                        <ul className="space-y-1">
                          {testResult.reasons.map((reason, i) => (
                            <li key={i} className="text-sm text-red-300">
                              • {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Detailed Checks */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Detailed Checks</div>
                      {Object.entries(testResult.checks).map(([key, check]) => (
                        <div
                          key={key}
                          className={cn(
                            "flex items-center justify-between p-2 rounded border",
                            check.pass
                              ? "border-[var(--neon-green)]/30 bg-[var(--neon-green)]/5"
                              : "border-red-500/30 bg-red-500/5"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {check.pass ? (
                              <CheckCircle className="h-4 w-4 text-[var(--neon-green)]" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm capitalize">
                              {key.replace(/([A-Z])/g, " $1").trim()}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground max-w-[60%] text-right">
                            {check.reason}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-6">
          {stats && (
            <>
              {/* Overall Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <Card className="card-glow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium">
                      Total Auctions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.overall.totalAuctions}
                    </div>
                  </CardContent>
                </Card>
                <Card className="card-glow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium">
                      Eligibility Rate
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={cn(
                        "text-2xl font-bold",
                        stats.overall.avgEligibilityRate >= 70
                          ? "text-[var(--neon-green)]"
                          : stats.overall.avgEligibilityRate >= 40
                          ? "text-[var(--neon-orange)]"
                          : "text-red-500"
                      )}
                    >
                      {stats.overall.avgEligibilityRate.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
                <Card className="card-glow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-[var(--neon-green)]">
                      High (&gt;80%)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[var(--neon-green)]">
                      {stats.overall.highEligibilityAuctions}
                    </div>
                  </CardContent>
                </Card>
                <Card className="card-glow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-[var(--neon-orange)]">
                      Medium (30-80%)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-[var(--neon-orange)]">
                      {stats.overall.mediumEligibilityAuctions}
                    </div>
                  </CardContent>
                </Card>
                <Card className="card-glow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-red-500">
                      Low (&lt;30%)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-500">
                      {stats.overall.lowEligibilityAuctions}
                    </div>
                  </CardContent>
                </Card>
                <Card className="card-glow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-red-500">
                      No Bids (0%)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-500">
                      {stats.overall.noEligibleAuctions}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Breakdown Chart */}
                <Card className="card-glow">
                  <CardHeader>
                    <CardTitle className="text-sm">Campaign Status Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stats.breakdown.map((item) => (
                        <div key={item.reason} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{item.reason}</span>
                            <span className="text-muted-foreground">
                              {item.count} ({item.percent.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full",
                                item.reason === "Healthy"
                                  ? "bg-[var(--neon-green)]"
                          : "bg-[var(--neon-orange)]"
                              )}
                              style={{ width: `${item.percent}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Problematic Campaigns */}
                <Card className="card-glow">
                  <CardHeader>
                    <CardTitle className="text-sm">Campaigns with Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.problematicCampaigns.length === 0 ? (
                      <div className="text-center py-4 text-sm text-muted-foreground">
                        No campaign issues detected
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {stats.problematicCampaigns.map((campaign) => (
                          <div
                            key={campaign.campaignId}
                            className="p-2 bg-secondary/50 rounded border border-border/50"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-sm font-medium">
                                  {campaign.campaignName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {campaign.advertiserName}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                {campaign.isBudgetExhausted && (
                                  <Badge variant="destructive" className="text-xs">
                                    Budget Exhausted
                                  </Badge>
                                )}
                                {campaign.isPastEndDate && (
                                  <Badge variant="destructive" className="text-xs">
                                    Ended
                                  </Badge>
                                )}
                                {campaign.isNotStarted && (
                                  <Badge variant="secondary" className="text-xs">
                                    Not Started
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Remaining: ${campaign.remainingBudget.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Hourly Trend */}
              <Card className="card-glow">
                <CardHeader>
                  <CardTitle className="text-sm">Hourly Eligibility Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-1 h-32">
                    {stats.hourlyTrend.map((data, i) => {
                      const height = Math.max(5, data.avgBidRatio);
                      return (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center group"
                        >
                          <div
                            className={cn(
                              "w-full rounded-t-sm transition-all hover:opacity-80",
                              height >= 80
                                ? "bg-[var(--neon-green)]"
                                : height >= 40
                                ? "bg-[var(--neon-orange)]"
                                : "bg-red-500"
                            )}
                            style={{ height: `${height}%` }}
                          />
                          <div className="text-xs text-muted-foreground mt-1">
                            {data.hour}
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 text-xs bg-popover border rounded px-1 py-0.5 absolute -mt-8 pointer-events-none">
                            {data.avgBidRatio.toFixed(0)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
