"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdSlots } from "@/lib/hooks/usePublisher";
import type { SlotType } from "@/lib/types/publisher";
import { cn } from "@/lib/utils";

const slotTypes: { value: SlotType; label: string; description: string; defaultSize: string }[] = [
  {
    value: "banner",
    label: "Banner",
    description: "Standard display ads for headers, footers, and sidebars",
    defaultSize: "728×90",
  },
  {
    value: "video",
    label: "Video",
    description: "Video ads for pre-roll, mid-roll, or in-stream placements",
    defaultSize: "640×360",
  },
  {
    value: "native",
    label: "Native",
    description: "Ads that blend naturally with your content",
    defaultSize: "Flexible",
  },
  {
    value: "interstitial",
    label: "Interstitial",
    description: "Full-screen ads shown between page transitions",
    defaultSize: "Full screen",
  },
];

const commonSizes = [
  { label: "Leaderboard (728×90)", width: 728, height: 90 },
  { label: "Medium Rectangle (300×250)", width: 300, height: 250 },
  { label: "Large Rectangle (336×280)", width: 336, height: 280 },
  { label: "Skyscraper (160×600)", width: 160, height: 600 },
  { label: "Wide Skyscraper (300×600)", width: 300, height: 600 },
  { label: "Mobile Banner (320×50)", width: 320, height: 50 },
  { label: "Video (640×360)", width: 640, height: 360 },
];

export default function NewAdSlotPage() {
  const router = useRouter();
  const { createAdSlot } = useAdSlots();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedType, setSelectedType] = useState<SlotType>("banner");

  const [formData, setFormData] = useState({
    slot_name: "",
    slot_type: "banner" as SlotType,
    width: 728,
    height: 90,
    floor_price: "0.50",
  });

  const handleTypeChange = (type: SlotType) => {
    setSelectedType(type);
    const typeInfo = slotTypes.find((t) => t.value === type);

    // Set default size based on type
    if (type === "native" || type === "interstitial") {
      setFormData({ ...formData, slot_type: type, width: 0, height: 0 });
    } else if (type === "video") {
      setFormData({ ...formData, slot_type: type, width: 640, height: 360 });
    } else {
      setFormData({ ...formData, slot_type: type, width: 728, height: 90 });
    }
  };

  const handleSizePreset = (width: number, height: number) => {
    setFormData({ ...formData, width, height });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.slot_name.trim()) {
      newErrors.slot_name = "Slot name is required";
    }
    if (!formData.slot_type) {
      newErrors.slot_type = "Slot type is required";
    }
    if (formData.slot_type !== "native" && formData.slot_type !== "interstitial") {
      if (!formData.width || formData.width <= 0) {
        newErrors.width = "Valid width is required";
      }
      if (!formData.height || formData.height <= 0) {
        newErrors.height = "Valid height is required";
      }
    }
    if (!formData.floor_price || parseFloat(formData.floor_price) < 0.01) {
      newErrors.floor_price = "Floor price must be at least $0.01";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      await createAdSlot({
        slot_name: formData.slot_name,
        slot_type: formData.slot_type,
        width: formData.slot_type === "native" || formData.slot_type === "interstitial" ? null : formData.width,
        height: formData.slot_type === "native" || formData.slot_type === "interstitial" ? null : formData.height,
        floor_price: parseFloat(formData.floor_price),
      });
      router.push("/publisher/ad-slots");
    } catch (err: any) {
      setErrors({ form: err.message || "Failed to create ad slot" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/publisher/ad-slots">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Ad Slot</h1>
          <p className="text-muted-foreground mt-1">
            Add a new ad placement to your inventory
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.form && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200">
            {errors.form}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Slot Type Selection */}
          <Card className="bg-card/50 backdrop-blur-xl border-border/50 lg:col-span-2">
            <CardHeader>
              <CardTitle>Select Ad Type</CardTitle>
              <CardDescription>
                Choose the type of ad that will be displayed in this slot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {slotTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeChange(type.value)}
                    className={cn(
                      "p-4 rounded-lg border-2 text-left transition-all",
                      selectedType === type.value
                        ? "border-[var(--neon-blue)] bg-[var(--neon-blue)]/10"
                        : "border-border/50 hover:border-border bg-secondary/30"
                    )}
                  >
                    <div className="font-semibold mb-1">{type.label}</div>
                    <div className="text-xs text-muted-foreground">{type.description}</div>
                    <div className="text-xs text-[var(--neon-blue)] mt-2">{type.defaultSize}</div>
                  </button>
                ))}
              </div>
              {errors.slot_type && (
                <p className="text-red-400 text-sm mt-2">{errors.slot_type}</p>
              )}
            </CardContent>
          </Card>

          {/* Slot Details */}
          <Card className="bg-card/50 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle>Slot Details</CardTitle>
              <CardDescription>
                Configure the basic settings for your ad slot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slot_name">Slot Name *</Label>
                <Input
                  id="slot_name"
                  placeholder="e.g., Homepage Leaderboard"
                  value={formData.slot_name}
                  onChange={(e) => setFormData({ ...formData, slot_name: e.target.value })}
                  className={cn(errors.slot_name && "border-red-500")}
                />
                {errors.slot_name && (
                  <p className="text-red-400 text-sm">{errors.slot_name}</p>
                )}
              </div>

              {selectedType !== "native" && selectedType !== "interstitial" && (
                <>
                  <div className="space-y-2">
                    <Label>Size Presets</Label>
                    <div className="flex flex-wrap gap-2">
                      {commonSizes.map((size) => (
                        <button
                          key={size.label}
                          type="button"
                          onClick={() => handleSizePreset(size.width, size.height)}
                          className={cn(
                            "px-3 py-1.5 text-xs rounded border transition-colors",
                            formData.width === size.width && formData.height === size.height
                              ? "bg-[var(--neon-blue)] border-[var(--neon-blue)] text-white"
                              : "border-border hover:border-[var(--neon-blue)] bg-secondary/30"
                          )}
                        >
                          {size.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="width">Width (px) *</Label>
                      <Input
                        id="width"
                        type="number"
                        min="1"
                        value={formData.width}
                        onChange={(e) => setFormData({ ...formData, width: parseInt(e.target.value) || 0 })}
                        className={cn(errors.width && "border-red-500")}
                      />
                      {errors.width && (
                        <p className="text-red-400 text-sm">{errors.width}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height (px) *</Label>
                      <Input
                        id="height"
                        type="number"
                        min="1"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: parseInt(e.target.value) || 0 })}
                        className={cn(errors.height && "border-red-500")}
                      />
                      {errors.height && (
                        <p className="text-red-400 text-sm">{errors.height}</p>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="floor_price">Floor Price (USD/CPM) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="floor_price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="pl-7"
                    value={formData.floor_price}
                    onChange={(e) => setFormData({ ...formData, floor_price: e.target.value })}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum price you'll accept per 1000 impressions
                </p>
                {errors.floor_price && (
                  <p className="text-red-400 text-sm">{errors.floor_price}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="bg-card/50 backdrop-blur-xl border-border/50">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                See how your ad slot will appear
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 bg-zinc-950 rounded-lg flex items-center justify-center min-h-48">
                {selectedType === "native" || selectedType === "interstitial" ? (
                  <div className="text-center">
                    <div className={cn(
                      "w-full max-w-xs p-4 rounded border-2 border-dashed",
                      selectedType === "native" ? "border-[var(--neon-green)]/50" : "border-[var(--neon-purple)]/50"
                    )}>
                      <p className="text-sm font-medium capitalize">{selectedType} Ad</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedType === "native"
                          ? "Ads will blend with your content style"
                          : "Full-screen ad between page transitions"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-[var(--neon-blue)]/50 rounded flex items-center justify-center text-[var(--neon-blue)]/50 text-sm"
                    style={{
                      width: `${Math.min(formData.width, 400)}px`,
                      height: `${Math.max(formData.height * (Math.min(formData.width, 400) / formData.width), 60)}px`,
                      maxWidth: "100%",
                    }}
                  >
                    {formData.width}×{formData.height}
                  </div>
                )}
              </div>
              <div className="mt-4 p-4 rounded-lg bg-secondary/50 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium">{formData.slot_name || "Unnamed"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{selectedType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span className="font-medium">
                    {selectedType === "native" || selectedType === "interstitial"
                      ? "Flexible"
                      : `${formData.width}×${formData.height}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Floor Price:</span>
                  <span className="font-medium text-[var(--neon-green)]">${formData.floor_price}/CPM</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Link href="/publisher/ad-slots">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            className="bg-[var(--neon-blue)] hover:bg-[var(--neon-blue)]/80 text-white"
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Creating..." : "Create Ad Slot"}
          </Button>
        </div>
      </form>
    </div>
  );
}
