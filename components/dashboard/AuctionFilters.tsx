"use client";

import { Monitor, Smartphone, Tablet, X, Clock, DollarSign, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Auction } from "@/lib/socket";

export type AuctionStatus = "active" | "completed" | "expired" | "grace_period" | "completing";
export type DeviceType = "desktop" | "mobile" | "tablet";
export type TimeRangeOption = "all" | "5m" | "1h" | "today";

export interface AuctionFilterState {
  statuses: AuctionStatus[];
  devices: DeviceType[];
  countryCodes: string[];
  minPrice: number | null;
  maxPrice: number | null;
  timeRange: TimeRangeOption;
}

interface AuctionFiltersProps {
  filters: AuctionFilterState;
  onChange: (filters: AuctionFilterState) => void;
  onClear: () => void;
}

const STATUS_OPTIONS: { value: AuctionStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "grace_period", label: "Grace Period" },
];

const DEVICE_OPTIONS: { value: DeviceType; label: string; icon: typeof Monitor }[] = [
  { value: "desktop", label: "Desktop", icon: Monitor },
  { value: "mobile", label: "Mobile", icon: Smartphone },
  { value: "tablet", label: "Tablet", icon: Tablet },
];

const COUNTRY_OPTIONS = [
  { value: "US", label: "🇺🇸 United States" },
  { value: "GB", label: "🇬🇧 United Kingdom" },
  { value: "DE", label: "🇩🇪 Germany" },
  { value: "FR", label: "🇫🇷 France" },
  { value: "CA", label: "🇨🇦 Canada" },
  { value: "AU", label: "🇦🇺 Australia" },
  { value: "JP", label: "🇯🇵 Japan" },
  { value: "IN", label: "🇮🇳 India" },
  { value: "BR", label: "🇧🇷 Brazil" },
];

const TIME_RANGE_OPTIONS: { value: TimeRangeOption; label: string }[] = [
  { value: "all", label: "All Time" },
  { value: "5m", label: "Last 5 min" },
  { value: "1h", label: "Last Hour" },
  { value: "today", label: "Today" },
];

const PRICE_PRESETS = [
  { label: "All", min: null, max: null },
  { label: "< $0.01", min: null, max: 0.01 },
  { label: "$0.01 - $0.10", min: 0.01, max: 0.10 },
  { label: "$0.10 - $1.00", min: 0.10, max: 1.00 },
  { label: "> $1.00", min: 1.00, max: null },
];

function getActiveFilterCount(filters: AuctionFilterState): number {
  let count = 0;
  if (filters.statuses.length > 0) count++;
  if (filters.devices.length > 0) count++;
  if (filters.countryCodes.length > 0) count++;
  if (filters.minPrice !== null || filters.maxPrice !== null) count++;
  if (filters.timeRange !== "all") count++;
  return count;
}

export function AuctionFilters({
  filters,
  onChange,
  onClear,
}: AuctionFiltersProps) {
  const activeFilterCount = getActiveFilterCount(filters);
  const hasFilters = activeFilterCount > 0;

  const toggleStatus = (status: AuctionStatus) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onChange({ ...filters, statuses: newStatuses });
  };

  const toggleDevice = (device: DeviceType) => {
    const newDevices = filters.devices.includes(device)
      ? filters.devices.filter((d) => d !== device)
      : [...filters.devices, device];
    onChange({ ...filters, devices: newDevices });
  };

  const toggleCountry = (countryCode: string) => {
    const newCountries = filters.countryCodes.includes(countryCode)
      ? filters.countryCodes.filter((c) => c !== countryCode)
      : [...filters.countryCodes, countryCode];
    onChange({ ...filters, countryCodes: newCountries });
  };

  const setPricePreset = (min: number | null, max: number | null) => {
    onChange({ ...filters, minPrice: min, maxPrice: max });
  };

  return (
    <div className="space-y-4 pb-4 border-b">
      {/* Header with clear button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filters</span>
          {hasFilters && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount} active
            </Badge>
          )}
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-7 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            Status
          </label>
          <div className="flex flex-wrap gap-1">
            {STATUS_OPTIONS.map((option) => {
              const isSelected = filters.statuses.includes(option.value);
              return (
                <Button
                  key={option.value}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleStatus(option.value)}
                  className={cn(
                    "h-7 text-xs",
                    isSelected && option.value === "active" && "bg-blue-500",
                    isSelected && option.value === "completed" && "bg-green-600",
                    isSelected && option.value === "grace_period" && "bg-yellow-600"
                  )}
                >
                  {option.label}
                  {isSelected && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Device Filter */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            Device
          </label>
          <div className="flex flex-wrap gap-1">
            {DEVICE_OPTIONS.map((option) => {
              const isSelected = filters.devices.includes(option.value);
              const Icon = option.icon;
              return (
                <Button
                  key={option.value}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleDevice(option.value)}
                  className={cn(
                    "h-7 text-xs gap-1",
                    isSelected && "bg-purple-600"
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {option.label}
                  {isSelected && (
                    <X className="h-3 w-3" />
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Country Filter */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <Globe className="h-3 w-3" />
            Country
          </label>
          <div className="flex flex-wrap gap-1">
            {filters.countryCodes.length > 0 ? (
              filters.countryCodes.map((code) => (
                <Button
                  key={code}
                  variant="default"
                  size="sm"
                  onClick={() => toggleCountry(code)}
                  className="h-7 text-xs gap-1 bg-indigo-600"
                >
                  {code}
                  <X className="h-3 w-3" />
                </Button>
              ))
            ) : (
              <Select onValueChange={(value) => toggleCountry(value)}>
                <SelectTrigger className="h-7 text-xs w-full">
                  <SelectValue placeholder="Select countries" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            Price Range
          </label>
          <div className="flex flex-wrap gap-1">
            {PRICE_PRESETS.map((preset) => {
              const isSelected =
                filters.minPrice === preset.min &&
                filters.maxPrice === preset.max;
              return (
                <Button
                  key={preset.label}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPricePreset(preset.min, preset.max)}
                  className={cn(
                    "h-7 text-xs",
                    isSelected && "bg-emerald-600"
                  )}
                >
                  {preset.label}
                  {isSelected && preset.label !== "All" && (
                    <X className="h-3 w-3 ml-1" />
                  )}
                </Button>
              );
            })}
          </div>
          {/* Custom price inputs */}
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minPrice ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  minPrice: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
              className="h-7 text-xs"
            />
            <span className="text-xs text-muted-foreground">-</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxPrice ?? ""}
              onChange={(e) =>
                onChange({
                  ...filters,
                  maxPrice: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
              className="h-7 text-xs"
            />
          </div>
        </div>

        {/* Time Range Filter */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Time Range
          </label>
          <div className="flex flex-wrap gap-1">
            {TIME_RANGE_OPTIONS.map((option) => {
              const isSelected = filters.timeRange === option.value;
              return (
                <Button
                  key={option.value}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => onChange({ ...filters, timeRange: option.value })}
                  className={cn(
                    "h-7 text-xs",
                    isSelected && "bg-orange-600"
                  )}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function applyFilters(
  auctions: Auction[],
  filters: AuctionFilterState
): Auction[] {
  const now = Date.now();
  const timeThresholds = {
    "5m": now - 5 * 60 * 1000,
    "1h": now - 60 * 60 * 1000,
    "today": now - 24 * 60 * 60 * 1000,
  };

  return auctions.filter((auction) => {
    // Status filter
    if (filters.statuses.length > 0 && !filters.statuses.includes(auction.status)) {
      return false;
    }

    // Device filter
    if (
      filters.devices.length > 0 &&
      auction.userContext?.device &&
      !filters.devices.includes(auction.userContext.device as DeviceType)
    ) {
      return false;
    }

    // Country filter
    if (
      filters.countryCodes.length > 0 &&
      auction.userContext?.countryCode &&
      !filters.countryCodes.includes(auction.userContext.countryCode)
    ) {
      return false;
    }

    // Price range filter (filter by floor price)
    if (filters.minPrice !== null && auction.floorPrice < filters.minPrice) {
      return false;
    }
    if (filters.maxPrice !== null && auction.floorPrice > filters.maxPrice) {
      return false;
    }

    // Time range filter
    if (filters.timeRange !== "all") {
      const threshold = timeThresholds[filters.timeRange];
      if (auction.createdAt < threshold) {
        return false;
      }
    }

    return true;
  });
}

export function getFilterSummary(filters: AuctionFilterState): string {
  const parts: string[] = [];

  if (filters.statuses.length > 0) {
    parts.push(filters.statuses.join(", "));
  }
  if (filters.devices.length > 0) {
    parts.push(filters.devices.join(", "));
  }
  if (filters.countryCodes.length > 0) {
    parts.push(filters.countryCodes.join(", "));
  }
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    const min = filters.minPrice ?? 0;
    const max = filters.maxPrice ?? "∞";
    parts.push(`$${min}-${max}`);
  }
  if (filters.timeRange !== "all") {
    const labels = { "5m": "Last 5m", "1h": "Last hour", "today": "Today" };
    parts.push(labels[filters.timeRange]);
  }

  return parts.length > 0 ? parts.join(" • ") : "All auctions";
}
