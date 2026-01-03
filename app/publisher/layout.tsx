"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layout,
  Code,
  ShieldCheck,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Zap,
  LogOut,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navigation = [
  { name: "Dashboard", href: "/publisher/dashboard", icon: LayoutDashboard },
  { name: "Ad Slots", href: "/publisher/ad-slots", icon: Layout },
  { name: "Integration", href: "/publisher/integration", icon: Code },
  { name: "Verification", href: "/publisher/verify", icon: ShieldCheck },
  { name: "Analytics", href: "/publisher/analytics", icon: BarChart3 },
];

const quickActions = [
  { name: "New Ad Slot", href: "/publisher/ad-slots/new", icon: Plus },
];

export default function PublisherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            "relative flex flex-col border-r border-border/50 bg-card/30 backdrop-blur-xl transition-all duration-300",
            collapsed ? "w-[72px]" : "w-64"
          )}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-4 h-16 border-b border-border/50">
            <Zap className="h-8 w-8 text-[var(--neon-blue)] glow-blue flex-shrink-0" />
            {!collapsed && (
              <span className="text-xl font-bold tracking-wider whitespace-nowrap">
                AD<span className="text-[var(--neon-blue)]">EXCH</span>
                <span className="ml-2 text-xs text-muted-foreground">Publisher</span>
              </span>
            )}
          </div>

          {/* Quick Actions */}
          {!collapsed && (
            <div className="px-3 py-4 space-y-2">
              {quickActions.map((action) => (
                <Link key={action.name} href={action.href}>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 border-dashed border-[var(--neon-blue)]/30 hover:border-[var(--neon-blue)] hover:bg-[var(--neon-blue)]/10 transition-all"
                  >
                    <action.icon className="h-4 w-4" />
                    {action.name}
                  </Button>
                </Link>
              ))}
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/publisher/dashboard" && pathname.startsWith(item.href));

              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                    isActive
                      ? "bg-[var(--neon-blue)]/10 text-[var(--neon-blue)] border border-[var(--neon-blue)]/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0 transition-colors",
                      isActive && "text-[var(--neon-blue)]"
                    )}
                  />
                  {!collapsed && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </Link>
              );

              if (collapsed) {
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="bg-card border-border"
                    >
                      {item.name}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.name}>{linkContent}</div>;
            })}
          </nav>

          {/* User Section */}
          <div className="p-3 border-t border-border/50">
            {!collapsed ? (
              <div className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--neon-blue)] to-[var(--neon-purple)] flex items-center justify-center text-background font-bold text-sm">
                  P
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">Publisher</p>
                  <p className="text-xs text-muted-foreground truncate">
                    publisher@adexch.io
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="flex-shrink-0 h-8 w-8"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-10 h-10 mx-auto rounded-full bg-gradient-to-br from-[var(--neon-blue)] to-[var(--neon-purple)] flex items-center justify-center text-background font-bold text-sm cursor-pointer">
                    P
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-card border-border">
                  Publisher Account
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Collapse Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-background hover:bg-secondary"
          >
            {collapsed ? (
              <ChevronRight className="h-3 w-3" />
            ) : (
              <ChevronLeft className="h-3 w-3" />
            )}
          </Button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="grid-pattern fixed inset-0 pointer-events-none" />
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </TooltipProvider>
  );
}
