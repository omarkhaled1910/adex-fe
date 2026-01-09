"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface RefreshControlProps {
  onRefresh: () => void | Promise<void>;
  defaultInterval?: number;
  isRefreshing?: boolean;
  onIntervalChange?: (interval: number) => void;
}

const intervals = [
  { value: 0, label: "Off" },
  { value: 5, label: "5s" },
  { value: 10, label: "10s" },
  { value: 30, label: "30s" },
  { value: 60, label: "60s" },
];

export function useAutoRefresh(
  callback: () => void | Promise<void>,
  interval: number
) {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const executeRefresh = async () => {
    await callback();
    setLastUpdated(new Date());
  };

  return { executeRefresh, lastUpdated };
}

export function RefreshControl({
  onRefresh,
  defaultInterval = 10,
  isRefreshing = false,
  onIntervalChange,
}: RefreshControlProps) {
  const [interval, setIntervalValue] = useState(defaultInterval);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const handleRefresh = async () => {
    await onRefresh();
    setLastUpdated(new Date());
  };

  // Auto-refresh effect
  useEffect(() => {
    if (interval === 0) return;

    const id = window.setInterval(() => {
      handleRefresh();
    }, interval * 1000);

    return () => window.clearInterval(id);
  }, [interval, onRefresh]);

  const formatLastUpdate = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <div className="flex items-center gap-3 bg-card/50 border border-border/50 rounded-lg px-3 py-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="h-8"
      >
        <RefreshCw
          className={cn(
            "h-4 w-4 mr-2",
            isRefreshing && "animate-spin"
          )}
        />
        Refresh
      </Button>

      <Select
        value={interval.toString()}
        onValueChange={(val) => {
          const newInterval = parseInt(val);
          setIntervalValue(newInterval);
          onIntervalChange?.(newInterval);
        }}
      >
        <SelectTrigger className="h-8 w-20">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {intervals.map((int) => (
            <SelectItem key={int.value} value={int.value.toString()}>
              {int.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>{formatLastUpdate(lastUpdated)}</span>
      </div>
    </div>
  );
}
