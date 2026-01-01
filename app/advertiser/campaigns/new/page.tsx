"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CampaignForm } from "@/components/campaigns/CampaignForm";
import { useCreateCampaign } from "@/lib/hooks/useCampaigns";
import { useToast } from "@/hooks/use-toast";
import { CampaignFormData } from "@/lib/validations/campaign";

export default function NewCampaignPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createMutation = useCreateCampaign();

  const handleSubmit = async (data: CampaignFormData) => {
    try {
      await createMutation.mutateAsync(data);
      toast({
        title: "Campaign Created",
        description: `Campaign "${data.name}" has been created successfully.`,
        variant: "success",
      });
      router.push("/advertiser/campaigns");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create campaign",
        variant: "destructive",
      });
    }
  };

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
          <h1 className="text-3xl font-bold tracking-tight">New Campaign</h1>
          <p className="text-muted-foreground mt-1">
            Create a new advertising campaign
          </p>
        </div>
      </div>

      <CampaignForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        mode="create"
      />
    </div>
  );
}
