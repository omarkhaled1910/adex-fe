"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CampaignForm } from "@/components/campaigns/CampaignForm";
import { useCampaign, useUpdateCampaign } from "@/lib/hooks/useCampaigns";
import { useToast } from "@/hooks/use-toast";
import {
  CampaignFormData,
  CampaignFormInput,
} from "@/lib/validations/campaign";

export default function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  // Fetch campaign data
  const { data: campaign, isLoading, error } = useCampaign(id);
  const updateMutation = useUpdateCampaign();

  const handleSubmit = async (data: CampaignFormData) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      toast({
        title: "Campaign Updated",
        description: `Campaign "${data.name}" has been updated successfully.`,
        variant: "success",
      });
      router.push("/advertiser/campaigns");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update campaign",
        variant: "destructive",
      });
    }
  };

  // Transform campaign data to form input format
  const getInitialData = (): CampaignFormInput | undefined => {
    if (!campaign) return undefined;

    return {
      name: campaign.name,
      total_budget: campaign.total_budget.toString(),
      daily_budget: campaign.daily_budget?.toString() || "",
      max_bid: campaign.max_bid.toString(),
      bid_strategy: campaign.bid_strategy as "highest" | "lowest" | "average",
      start_date: campaign.start_date
        ? new Date(campaign.start_date).toISOString().split("T")[0]
        : "",
      end_date: campaign.end_date
        ? new Date(campaign.end_date).toISOString().split("T")[0]
        : "",
      target_geos: campaign.target_geos || [],
      target_devices: campaign.target_devices || [],
      target_os: campaign.target_os || [],
      target_browsers: campaign.target_browsers || [],
      target_categories: (campaign as any).target_categories || [],
      max_impressions_per_user:
        campaign.max_impressions_per_user?.toString() || "",
      max_impressions_per_day:
        campaign.max_impressions_per_day?.toString() || "",
      active_hours: campaign.active_hours || [],
      active_days: campaign.active_days || [0, 1, 2, 3, 4, 5, 6],
    };
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--neon-green)]" />
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/advertiser/campaigns">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Edit Campaign</h1>
        </div>

        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-6 flex items-center gap-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-red-500 font-medium text-lg">
                Campaign not found
              </p>
              <p className="text-muted-foreground">
                The campaign you're trying to edit doesn't exist or you don't
                have permission to access it.
              </p>
            </div>
          </CardContent>
        </Card>

        <Link href="/advertiser/campaigns">
          <Button variant="outline">Back to Campaigns</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/advertiser/campaigns">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Campaign</h1>
          <p className="text-muted-foreground mt-1">
            Update campaign settings for "{campaign.name}"
          </p>
        </div>
      </div>

      <CampaignForm
        initialData={getInitialData()}
        onSubmit={handleSubmit}
        isLoading={updateMutation.isPending}
        mode="edit"
        currentStatus={campaign.status}
      />
    </div>
  );
}
