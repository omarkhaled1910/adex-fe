"use client";

import { use, useState, useEffect } from "react";
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
  AlertTriangle,
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
import { useCreative, useUpdateCreative } from "@/lib/hooks/useCreatives";

interface FormData {
  name: string;
  format: string;
  headline: string;
  description: string;
  cta_text: string;
  landing_url: string;
  width: string;
  height: string;
  status: string;
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

export default function EditCreativePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();

  // React Query hooks
  const { data: creative, isLoading, error } = useCreative(id);
  const updateMutation = useUpdateCreative();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    format: "banner",
    headline: "",
    description: "",
    cta_text: "Learn More",
    landing_url: "",
    width: "300",
    height: "250",
    status: "active",
  });

  // Update form when creative data loads
  useEffect(() => {
    if (creative) {
      setFormData({
        name: creative.name || "",
        format: creative.format,
        headline: creative.headline || "",
        description: creative.description || "",
        cta_text: creative.cta_text || "Learn More",
        landing_url: creative.landing_url,
        width: creative.width?.toString() || "300",
        height: creative.height?.toString() || "250",
        status: creative.status,
      });
    }
  }, [creative]);

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

    if (!formData.landing_url || !formData.format) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          name: formData.name || undefined,
          format: formData.format,
          headline: formData.headline || undefined,
          description: formData.description || undefined,
          cta_text: formData.cta_text || undefined,
          landing_url: formData.landing_url,
          width: parseInt(formData.width),
          height: parseInt(formData.height),
          status: formData.status,
        },
      });
      toast({
        title: "Creative Updated",
        description: "Your ad creative has been updated successfully.",
        variant: "success",
      });
      router.push("/advertiser/creatives");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update creative",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--neon-green)]" />
        </div>
      </div>
    );
  }

  if (error || !creative) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/advertiser/creatives">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Edit Creative</h1>
        </div>

        <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-6 flex items-center gap-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-red-500 font-medium text-lg">
                Creative not found
              </p>
              <p className="text-muted-foreground">
                The creative you're trying to edit doesn't exist or you don't
                have permission to access it.
              </p>
            </div>
          </CardContent>
        </Card>

        <Link href="/advertiser/creatives">
          <Button variant="outline">Back to Creatives</Button>
        </Link>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold tracking-tight">Edit Creative</h1>
          <p className="text-muted-foreground mt-1">
            Update "{creative.name || creative.headline || "Creative"}"
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Info (Read-only) */}
            <Card className="neon-border">
              <CardHeader>
                <CardTitle>Campaign</CardTitle>
                <CardDescription>
                  This creative belongs to the following campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-lg border border-border/50 bg-secondary/30">
                  <p className="font-medium">{creative.campaign_name}</p>
                </div>
              </CardContent>
            </Card>

            {/* Format Selection */}
            <Card className="neon-border">
              <CardHeader>
                <CardTitle>Ad Format</CardTitle>
                <CardDescription>
                  Select the type of ad creative
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
                  Update your ad copy and call-to-action
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

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <div className="flex gap-2">
                    {["active", "paused"].map((status) => (
                      <Button
                        key={status}
                        type="button"
                        variant={
                          formData.status === status ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handleInputChange("status", status)}
                        className={`capitalize ${
                          formData.status === status
                            ? status === "active"
                              ? "bg-[var(--neon-green)] hover:bg-[var(--neon-green)]/80"
                              : ""
                            : ""
                        }`}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
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
                      <p className="text-sm text-muted-foreground">
                        Ad Preview
                      </p>
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
                    <span className="text-muted-foreground">Status</span>
                    <Badge
                      className={
                        formData.status === "active"
                          ? "bg-[var(--neon-green)]/20 text-[var(--neon-green)]"
                          : ""
                      }
                    >
                      {formData.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full gap-2"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Save Changes
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
