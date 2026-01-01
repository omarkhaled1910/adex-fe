"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  DollarSign,
  Target,
  Clock,
  Save,
  Loader2,
  AlertCircle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CampaignFormInput,
  defaultCampaignFormValues,
  validateCampaignForm,
  transformFormToApi,
} from "@/lib/validations/campaign";

const geoOptions = ["US", "UK", "CA", "AU", "DE", "FR", "JP", "BR", "IN", "MX"];
const deviceOptions = ["desktop", "mobile", "tablet"];
const osOptions = ["windows", "macos", "ios", "android", "linux"];
const browserOptions = ["chrome", "firefox", "safari", "edge"];
const dayOptions = [
  { value: 0, label: "Sun" },
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
];

interface CampaignFormProps {
  initialData?: CampaignFormInput;
  onSubmit: (data: ReturnType<typeof transformFormToApi>) => Promise<void>;
  isLoading?: boolean;
  mode?: "create" | "edit";
  currentStatus?: string;
}

export function CampaignForm({
  initialData,
  onSubmit,
  isLoading = false,
  mode = "create",
  currentStatus = "draft",
}: CampaignFormProps) {
  const [formData, setFormData] = useState<CampaignFormInput>(
    initialData || defaultCampaignFormValues
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (field: keyof CampaignFormInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => ({ ...prev, [field]: true }));

    // Clear error when field is modified
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleArrayItem = (field: keyof CampaignFormInput, item: any) => {
    setFormData((prev) => {
      const arr = prev[field] as any[];
      const newArr = arr.includes(item)
        ? arr.filter((i) => i !== item)
        : [...arr, item];
      return { ...prev, [field]: newArr };
    });
  };

  const handleSubmit = async (e: React.FormEvent, status?: string) => {
    // For edit mode, preserve the current status unless explicitly changing it
    const finalStatus = status ?? (mode === "edit" ? currentStatus : "draft");
    e.preventDefault();

    const validation = validateCampaignForm(formData);
    if (!validation.success) {
      setErrors(validation.errors);
      // Mark all error fields as touched
      const touchedFields = Object.keys(validation.errors).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {}
      );
      setTouched((prev) => ({ ...prev, ...touchedFields }));
      return;
    }

    const transformedData = transformFormToApi(formData, finalStatus);
    await onSubmit(transformedData);
  };

  const getFieldError = (field: string) => {
    return touched[field] && errors[field] ? errors[field] : null;
  };

  return (
    <form
      onSubmit={(e) =>
        handleSubmit(e, mode === "create" ? "active" : undefined)
      }
    >
      <Tabs defaultValue="basics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basics" className="gap-2">
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Basics</span>
          </TabsTrigger>
          <TabsTrigger value="targeting" className="gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Targeting</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Schedule</span>
          </TabsTrigger>
          <TabsTrigger value="limits" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Limits</span>
          </TabsTrigger>
        </TabsList>

        {/* Basics Tab */}
        <TabsContent value="basics">
          <Card className="neon-border">
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
              <CardDescription>
                Set up your campaign name, budget, and bidding strategy
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Campaign Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Campaign Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., Summer Sale 2024"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={getFieldError("name") ? "border-red-500" : ""}
                />
                {getFieldError("name") && (
                  <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {getFieldError("name")}
                  </p>
                )}
              </div>

              {/* Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Total Budget (USD) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="1000.00"
                      className={`pl-9 ${
                        getFieldError("total_budget") ? "border-red-500" : ""
                      }`}
                      value={formData.total_budget}
                      onChange={(e) =>
                        handleInputChange("total_budget", e.target.value)
                      }
                    />
                  </div>
                  {getFieldError("total_budget") && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {getFieldError("total_budget")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Daily Budget (USD)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="100.00"
                      className={`pl-9 ${
                        getFieldError("daily_budget") ? "border-red-500" : ""
                      }`}
                      value={formData.daily_budget}
                      onChange={(e) =>
                        handleInputChange("daily_budget", e.target.value)
                      }
                    />
                  </div>
                  {getFieldError("daily_budget") && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {getFieldError("daily_budget")}
                    </p>
                  )}
                </div>
              </div>

              {/* Bidding */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Max Bid (CPM) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.0001"
                      placeholder="5.00"
                      className={`pl-9 ${
                        getFieldError("max_bid") ? "border-red-500" : ""
                      }`}
                      value={formData.max_bid}
                      onChange={(e) =>
                        handleInputChange("max_bid", e.target.value)
                      }
                    />
                  </div>
                  {getFieldError("max_bid") && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {getFieldError("max_bid")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bid Strategy</label>
                  <div className="flex gap-2">
                    {["highest", "lowest", "average"].map((strategy) => (
                      <Button
                        key={strategy}
                        type="button"
                        variant={
                          formData.bid_strategy === strategy
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          handleInputChange("bid_strategy", strategy)
                        }
                        className="flex-1 capitalize"
                      >
                        {strategy}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Targeting Tab */}
        <TabsContent value="targeting">
          <Card className="neon-border">
            <CardHeader>
              <CardTitle>Audience Targeting</CardTitle>
              <CardDescription>
                Define your target audience for better ad performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Geographic Targeting */}
              <div className="space-y-3">
                <label className="text-sm font-medium">
                  Geographic Targeting
                </label>
                <div className="flex flex-wrap gap-2">
                  {geoOptions.map((geo) => (
                    <Badge
                      key={geo}
                      variant={
                        formData.target_geos.includes(geo)
                          ? "default"
                          : "outline"
                      }
                      className={`cursor-pointer transition-all ${
                        formData.target_geos.includes(geo)
                          ? "bg-[var(--neon-green)]/20 text-[var(--neon-green)] border-[var(--neon-green)]"
                          : "hover:border-[var(--neon-green)]/50"
                      }`}
                      onClick={() => toggleArrayItem("target_geos", geo)}
                    >
                      {geo}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Leave empty to target all regions
                </p>
              </div>

              {/* Device Targeting */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Devices</label>
                <div className="flex flex-wrap gap-2">
                  {deviceOptions.map((device) => (
                    <Badge
                      key={device}
                      variant={
                        formData.target_devices.includes(device)
                          ? "default"
                          : "outline"
                      }
                      className={`cursor-pointer capitalize transition-all ${
                        formData.target_devices.includes(device)
                          ? "bg-[var(--neon-blue)]/20 text-[var(--neon-blue)] border-[var(--neon-blue)]"
                          : "hover:border-[var(--neon-blue)]/50"
                      }`}
                      onClick={() => toggleArrayItem("target_devices", device)}
                    >
                      {device}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* OS Targeting */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Operating Systems</label>
                <div className="flex flex-wrap gap-2">
                  {osOptions.map((os) => (
                    <Badge
                      key={os}
                      variant={
                        formData.target_os.includes(os) ? "default" : "outline"
                      }
                      className={`cursor-pointer capitalize transition-all ${
                        formData.target_os.includes(os)
                          ? "bg-[var(--neon-purple)]/20 text-[var(--neon-purple)] border-[var(--neon-purple)]"
                          : "hover:border-[var(--neon-purple)]/50"
                      }`}
                      onClick={() => toggleArrayItem("target_os", os)}
                    >
                      {os}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Browser Targeting */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Browsers</label>
                <div className="flex flex-wrap gap-2">
                  {browserOptions.map((browser) => (
                    <Badge
                      key={browser}
                      variant={
                        formData.target_browsers.includes(browser)
                          ? "default"
                          : "outline"
                      }
                      className={`cursor-pointer capitalize transition-all ${
                        formData.target_browsers.includes(browser)
                          ? "bg-[var(--neon-orange)]/20 text-[var(--neon-orange)] border-[var(--neon-orange)]"
                          : "hover:border-[var(--neon-orange)]/50"
                      }`}
                      onClick={() =>
                        toggleArrayItem("target_browsers", browser)
                      }
                    >
                      {browser}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card className="neon-border">
            <CardHeader>
              <CardTitle>Campaign Schedule</CardTitle>
              <CardDescription>
                Set the start and end dates for your campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      handleInputChange("start_date", e.target.value)
                    }
                    className={
                      getFieldError("start_date") ? "border-red-500" : ""
                    }
                  />
                  {getFieldError("start_date") && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {getFieldError("start_date")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      handleInputChange("end_date", e.target.value)
                    }
                    className={
                      getFieldError("end_date") ? "border-red-500" : ""
                    }
                  />
                  {getFieldError("end_date") && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {getFieldError("end_date")}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Leave empty for ongoing campaign
                  </p>
                </div>
              </div>

              {/* Active Days */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Active Days</label>
                <div className="flex flex-wrap gap-2">
                  {dayOptions.map((day) => (
                    <Badge
                      key={day.value}
                      variant={
                        formData.active_days.includes(day.value)
                          ? "default"
                          : "outline"
                      }
                      className={`cursor-pointer transition-all ${
                        formData.active_days.includes(day.value)
                          ? "bg-[var(--neon-green)]/20 text-[var(--neon-green)] border-[var(--neon-green)]"
                          : "hover:border-[var(--neon-green)]/50"
                      }`}
                      onClick={() => toggleArrayItem("active_days", day.value)}
                    >
                      {day.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Limits Tab */}
        <TabsContent value="limits">
          <Card className="neon-border">
            <CardHeader>
              <CardTitle>Frequency Capping</CardTitle>
              <CardDescription>
                Control how often users see your ads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Max Impressions Per User
                  </label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={formData.max_impressions_per_user}
                    onChange={(e) =>
                      handleInputChange(
                        "max_impressions_per_user",
                        e.target.value
                      )
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Maximum times a single user sees your ad
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Max Impressions Per Day
                  </label>
                  <Input
                    type="number"
                    placeholder="1000"
                    value={formData.max_impressions_per_day}
                    onChange={(e) =>
                      handleInputChange(
                        "max_impressions_per_day",
                        e.target.value
                      )
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Daily impression limit for this campaign
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-6">
        {mode === "create" && (
          <Button
            type="button"
            variant="outline"
            onClick={(e) => handleSubmit(e, "draft")}
            disabled={isLoading}
          >
            Save as Draft
          </Button>
        )}
        <Button type="submit" disabled={isLoading} className="gap-2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {mode === "create" ? "Create & Activate" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
