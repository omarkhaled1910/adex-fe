"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Image,
  Link as LinkIcon,
  Type,
  FileText,
  Save,
  Loader2,
  Monitor,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCampaigns } from "@/lib/hooks/useCampaigns";
import { useCreateCreative, CreativeFormData } from "@/lib/hooks/useCreatives";
import { useState } from "react";

interface FormData {
  campaign_id: string;
  name: string;
  format: string;
  headline: string;
  description: string;
  cta_text: string;
  landing_url: string;
  width: string;
  height: string;
  assets: Record<string, any>;
}

const formatOptions = [
  {
    value: "banner",
    label: "Banner",
    icon: Monitor,
    description: "Standard display ad",
  },
  {
    value: "native",
    label: "Native",
    icon: FileText,
    description: "Blends with content",
  },
  {
    value: "video",
    label: "Video",
    icon: Image,
    description: "Video advertisement",
  },
  {
    value: "interstitial",
    label: "Interstitial",
    icon: Monitor,
    description: "Full-screen ad",
  },
];

const sizePresets = [
  { width: 300, height: 250, label: "Medium Rectangle" },
  { width: 728, height: 90, label: "Leaderboard" },
  { width: 160, height: 600, label: "Wide Skyscraper" },
  { width: 300, height: 600, label: "Half Page" },
  { width: 320, height: 50, label: "Mobile Banner" },
  { width: 970, height: 250, label: "Billboard" },
];

const ctaOptions = [
  "Learn More",
  "Shop Now",
  "Sign Up",
  "Get Started",
  "Download",
  "Subscribe",
  "Contact Us",
  "Try Free",
];

export default function NewCreativePage() {
  const router = useRouter();
  const { toast } = useToast();

  // React Query hooks
  const { data: campaigns = [], isLoading: campaignsLoading } = useCampaigns();
  const createMutation = useCreateCreative();

  const [formData, setFormData] = useState<FormData>({
    campaign_id: "",
    name: "",
    format: "banner",
    headline: "",
    description: "",
    cta_text: "Learn More",
    landing_url: "",
    width: "300",
    height: "250",
    assets: {},
  });

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSizePreset = (width: number, height: number) => {
    setFormData((prev) => ({
      ...prev,
      width: width.toString(),
      height: height.toString(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.campaign_id || !formData.landing_url || !formData.format) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const data: CreativeFormData = {
        campaign_id: formData.campaign_id,
        name: formData.name || undefined,
        format: formData.format,
        headline: formData.headline || undefined,
        description: formData.description || undefined,
        cta_text: formData.cta_text || undefined,
        landing_url: formData.landing_url,
        width: parseInt(formData.width),
        height: parseInt(formData.height),
        assets: formData.assets,
      };

      await createMutation.mutateAsync(data);
      toast({
        title: "Creative Created",
        description: "Your ad creative has been created and submitted for review.",
        variant: "success",
      });
      router.push("/advertiser/creatives");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create creative",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/advertiser/creatives">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Creative</h1>
          <p className="text-muted-foreground mt-1">
            Create a new ad creative for your campaign
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Selection */}
            <Card className="neon-border">
              <CardHeader>
                <CardTitle>Select Campaign</CardTitle>
                <CardDescription>
                  Choose which campaign this creative belongs to
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Campaign <span className="text-red-500">*</span>
                  </label>
                  {campaignsLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : campaigns.length === 0 ? (
                    <div className="p-4 border border-dashed border-border rounded-lg text-center">
                      <p className="text-muted-foreground text-sm mb-2">
                        No campaigns available
                      </p>
                      <Link href="/advertiser/campaigns/new">
                        <Button variant="outline" size="sm">
                          Create Campaign First
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {campaigns.map((campaign) => (
                        <div
                          key={campaign.id}
                          onClick={() =>
                            handleInputChange("campaign_id", campaign.id)
                          }
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            formData.campaign_id === campaign.id
                              ? "border-[var(--neon-green)] bg-[var(--neon-green)]/10"
                              : "border-border/50 hover:border-border"
                          }`}
                        >
                          <p className="font-medium truncate">{campaign.name}</p>
                          <Badge
                            variant="secondary"
                            className={
                              campaign.status === "active"
                                ? "bg-[var(--neon-green)]/20 text-[var(--neon-green)]"
                                : ""
                            }
                          >
                            {campaign.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Format Selection */}
            <Card className="neon-border">
              <CardHeader>
                <CardTitle>Ad Format</CardTitle>
                <CardDescription>
                  Select the type of ad creative you want to create
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {formatOptions.map((format) => (
                    <div
                      key={format.value}
                      onClick={() => handleInputChange("format", format.value)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all text-center ${
                        formData.format === format.value
                          ? "border-[var(--neon-green)] bg-[var(--neon-green)]/10"
                          : "border-border/50 hover:border-border"
                      }`}
                    >
                      <format.icon
                        className={`h-6 w-6 mx-auto mb-2 ${
                          formData.format === format.value
                            ? "text-[var(--neon-green)]"
                            : "text-muted-foreground"
                        }`}
                      />
                      <p className="font-medium text-sm">{format.label}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Creative Content */}
            <Card className="neon-border">
              <CardHeader>
                <CardTitle>Creative Content</CardTitle>
                <CardDescription>
                  Add your ad copy and call-to-action
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Creative Name</label>
                  <Input
                    placeholder="e.g., Summer Sale Banner v1"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>

                {/* Headline */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Type className="h-4 w-4" />
                    Headline
                  </label>
                  <Input
                    placeholder="Grab attention with a compelling headline"
                    value={formData.headline}
                    onChange={(e) =>
                      handleInputChange("headline", e.target.value)
                    }
                    maxLength={90}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.headline.length}/90
                  </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Description
                  </label>
                  <textarea
                    className="w-full min-h-[100px] px-3 py-2 bg-background border border-input rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Add more details about your offer"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    maxLength={200}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.description.length}/200
                  </p>
                </div>

                {/* CTA */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Call to Action</label>
                  <div className="flex flex-wrap gap-2">
                    {ctaOptions.map((cta) => (
                      <Badge
                        key={cta}
                        variant={
                          formData.cta_text === cta ? "default" : "outline"
                        }
                        className={`cursor-pointer transition-all ${
                          formData.cta_text === cta
                            ? "bg-[var(--neon-green)]/20 text-[var(--neon-green)] border-[var(--neon-green)]"
                            : "hover:border-[var(--neon-green)]/50"
                        }`}
                        onClick={() => handleInputChange("cta_text", cta)}
                      >
                        {cta}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Landing URL */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <LinkIcon className="h-4 w-4" />
                    Landing URL <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="url"
                    placeholder="https://yourwebsite.com/landing-page"
                    value={formData.landing_url}
                    onChange={(e) =>
                      handleInputChange("landing_url", e.target.value)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dimensions */}
            <Card className="neon-border">
              <CardHeader>
                <CardTitle>Dimensions</CardTitle>
                <CardDescription>
                  Set the size of your ad creative
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Size Presets */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Popular Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {sizePresets.map((preset) => (
                      <Badge
                        key={preset.label}
                        variant={
                          formData.width === preset.width.toString() &&
                          formData.height === preset.height.toString()
                            ? "default"
                            : "outline"
                        }
                        className={`cursor-pointer transition-all ${
                          formData.width === preset.width.toString() &&
                          formData.height === preset.height.toString()
                            ? "bg-[var(--neon-blue)]/20 text-[var(--neon-blue)] border-[var(--neon-blue)]"
                            : "hover:border-[var(--neon-blue)]/50"
                        }`}
                        onClick={() =>
                          handleSizePreset(preset.width, preset.height)
                        }
                      >
                        {preset.label} ({preset.width}×{preset.height})
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Custom Size */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Width (px)</label>
                    <Input
                      type="number"
                      value={formData.width}
                      onChange={(e) =>
                        handleInputChange("width", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Height (px)</label>
                    <Input
                      type="number"
                      value={formData.height}
                      onChange={(e) =>
                        handleInputChange("height", e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-6 neon-border">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>Live preview of your creative</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="border border-dashed border-border rounded-lg bg-secondary/30 flex flex-col items-center justify-center p-4 overflow-hidden"
                  style={{
                    aspectRatio: `${formData.width}/${formData.height}`,
                    maxHeight: "400px",
                  }}
                >
                  {formData.headline || formData.description ? (
                    <div className="text-center p-4 space-y-2">
                      {formData.headline && (
                        <h4 className="font-bold text-lg leading-tight">
                          {formData.headline}
                        </h4>
                      )}
                      {formData.description && (
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {formData.description}
                        </p>
                      )}
                      {formData.cta_text && (
                        <Button size="sm" className="mt-2">
                          {formData.cta_text}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                      <Image className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Ad Preview</p>
                      <p className="text-xs text-muted-foreground">
                        {formData.width} × {formData.height}
                      </p>
                    </>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Format</span>
                    <span className="capitalize">{formData.format}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Size</span>
                    <span>
                      {formData.width} × {formData.height}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">CTA</span>
                    <span>{formData.cta_text || "-"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                type="submit"
                disabled={createMutation.isPending || !formData.campaign_id}
                className="w-full gap-2"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Create Creative
              </Button>
              <Link href="/advertiser/creatives" className="block">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
