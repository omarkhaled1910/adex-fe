import { LucideIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AdminStatsCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon?: LucideIcon;
  color?: "purple" | "orange" | "green" | "blue" | "red";
  sparkline?: number[];
}

const colorClasses = {
  purple: {
    text: "text-[var(--neon-purple)]",
    bg: "bg-[var(--neon-purple)]/10",
    border: "border-[var(--neon-purple)]/30",
    glow: "glow-purple",
  },
  orange: {
    text: "text-[var(--neon-orange)]",
    bg: "bg-[var(--neon-orange)]/10",
    border: "border-[var(--neon-orange)]/30",
    glow: "",
  },
  green: {
    text: "text-[var(--neon-green)]",
    bg: "bg-[var(--neon-green)]/10",
    border: "border-[var(--neon-green)]/30",
    glow: "glow-green",
  },
  blue: {
    text: "text-[var(--neon-blue)]",
    bg: "bg-[var(--neon-blue)]/10",
    border: "border-[var(--neon-blue)]/30",
    glow: "glow-blue",
  },
  red: {
    text: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    glow: "",
  },
};

export function AdminStatsCard({
  title,
  value,
  trend,
  trendUp,
  icon: Icon,
  color = "purple",
  sparkline,
}: AdminStatsCardProps) {
  const colors = colorClasses[color];

  return (
    <Card className="card-glow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3 px-3">
        <CardTitle className="text-xs font-medium">{title}</CardTitle>
        {Icon && (
          <Icon className={cn("h-3 w-3 text-muted-foreground", colors.text)} />
        )}
      </CardHeader>
      <CardContent className="px-3 pb-3">
        <div className="flex items-end justify-between">
          <div className="text-xl font-bold">{value}</div>
          {trend && (
            <div
              className={cn(
                "text-xs font-medium",
                trendUp ? "text-[var(--neon-green)]" : "text-[var(--neon-orange)]"
              )}
            >
              {trendUp ? "+" : ""}{trend}
            </div>
          )}
        </div>
        {sparkline && sparkline.length > 0 && (
          <div className="mt-2 flex items-end gap-0.5 h-6">
            {sparkline.map((val, i) => {
              const max = Math.max(...sparkline);
              const min = Math.min(...sparkline);
              const range = max - min || 1;
              const height = ((val - min) / range) * 100;
              return (
                <div
                  key={i}
                  className={cn(
                    "flex-1 rounded-t-sm transition-all",
                    colors.bg,
                    colors.border
                  )}
                  style={{ height: `${Math.max(10, height)}%` }}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
