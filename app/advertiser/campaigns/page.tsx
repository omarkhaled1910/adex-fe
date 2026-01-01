"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Play,
  Pause,
  Trash2,
  Edit,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import {
  useCampaigns,
  useUpdateCampaign,
  useDeleteCampaign,
} from "@/lib/hooks/useCampaigns";
import { useToast } from "@/hooks/use-toast";

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // React Query hooks
  const { data: campaigns = [], isLoading, error, refetch } = useCampaigns();
  const updateMutation = useUpdateCampaign();
  const deleteMutation = useDeleteCampaign();

  const filteredCampaigns = campaigns.filter((campaign) =>
    campaign.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-[var(--neon-green)]/20 text-[var(--neon-green)]";
      case "paused":
        return "bg-yellow-500/20 text-yellow-500";
      case "completed":
        return "bg-blue-500/20 text-blue-500";
      case "draft":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "";
    }
  };

  const getBudgetProgress = (spent: number, total: number) => {
    return Math.min((spent / total) * 100, 100);
  };

  const handleToggleStatus = async (
    campaignId: string,
    currentStatus: string
  ) => {
    const newStatus = currentStatus === "active" ? "paused" : "active";
    try {
      await updateMutation.mutateAsync({
        id: campaignId,
        data: { status: newStatus as any },
      });
      toast({
        title: "Campaign Updated",
        description: `Campaign ${
          newStatus === "active" ? "activated" : "paused"
        } successfully.`,
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update campaign",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (campaignId: string, campaignName: string) => {
    if (!confirm(`Are you sure you want to delete "${campaignName}"?`)) {
      return;
    }
    try {
      await deleteMutation.mutateAsync(campaignId);
      toast({
        title: "Campaign Deleted",
        description: `"${campaignName}" has been deleted.`,
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete campaign",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor your advertising campaigns
          </p>
        </div>
        <Link href="/advertiser/campaigns/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div className="flex-1">
              <p className="text-red-500 font-medium">
                Failed to load campaigns
              </p>
              <p className="text-sm text-muted-foreground">
                {(error as Error).message}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Campaigns List */}
      <Card className="card-glow">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--neon-green)]" />
            </div>
          ) : filteredCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "No campaigns match your search"
                  : "No campaigns yet. Create your first campaign to start advertising."}
              </p>
              {!searchQuery && (
                <Link href="/advertiser/campaigns/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Campaign
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {filteredCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="p-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <Link
                          href={`/advertiser/campaigns/${campaign.id}/edit`}
                          className="font-semibold truncate hover:text-[var(--neon-green)] transition-colors"
                        >
                          {campaign.name}
                        </Link>
                        <Badge className={getStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>

                      {/* Budget Progress */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Budget</span>
                          <span>
                            {formatCurrency(campaign.spent_amount)} /{" "}
                            {formatCurrency(campaign.total_budget)}
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[var(--neon-green)] to-[var(--neon-blue)] transition-all duration-500"
                            style={{
                              width: `${getBudgetProgress(
                                campaign.spent_amount,
                                campaign.total_budget
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Impressions</p>
                          <p className="font-mono font-medium">
                            {campaign.impressions_served.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Clicks</p>
                          <p className="font-mono font-medium">
                            {campaign.clicks.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">CTR</p>
                          <p className="font-mono font-medium">
                            {campaign.avg_ctr
                              ? `${(campaign.avg_ctr * 100).toFixed(2)}%`
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link href={`/advertiser/campaigns/${campaign.id}/edit`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 border-[var(--neon-green)]/30 hover:border-[var(--neon-green)] hover:bg-[var(--neon-green)]/10"
                        >
                          <Edit className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          handleToggleStatus(campaign.id, campaign.status)
                        }
                        disabled={updateMutation.isPending}
                      >
                        {campaign.status === "active" ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                        onClick={() => handleDelete(campaign.id, campaign.name)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
