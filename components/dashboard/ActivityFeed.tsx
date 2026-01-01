"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  DollarSign,
  Gavel,
  Radio,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency, getTimeAgo, shortenAddress } from "@/lib/utils";
import type { BidResponse, Settlement } from "@/types";

interface ActivityItem {
  id: string;
  type: "bid" | "settlement" | "auction_start" | "auction_won";
  data: any;
  timestamp: number;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

function ActivityRow({ activity }: { activity: ActivityItem }) {
  const iconConfig = {
    bid: { icon: DollarSign, color: "text-neon-green", bg: "bg-neon-green/10" },
    settlement: { icon: Check, color: "text-neon-blue", bg: "bg-neon-blue/10" },
    auction_start: {
      icon: Radio,
      color: "text-amber-400",
      bg: "bg-amber-400/10",
    },
    auction_won: {
      icon: Gavel,
      color: "text-neon-pink",
      bg: "bg-neon-pink/10",
    },
  };

  const config = iconConfig[activity.type];
  const Icon = config.icon;

  const renderContent = () => {
    switch (activity.type) {
      case "bid":
        return (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-white font-medium truncate">
                {activity.data.bidderName || activity.data.bidderId}
              </span>
              <Badge variant="outline" className="text-[10px]">
                BID
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 truncate">
              Placed {formatCurrency(activity.data.amount, 4)} on{" "}
              {activity.data.auctionId.slice(0, 15)}...
            </p>
          </div>
        );
      case "settlement":
        return (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-white font-medium">
                Settlement Complete
              </span>
              <Badge variant="neonBlue" className="text-[10px]">
                TX
              </Badge>
            </div>
            <p className="text-xs text-zinc-500">
              {formatCurrency(activity.data.amount, 4)} •{" "}
              {shortenAddress(activity.data.txHash || "0x...")}
            </p>
          </div>
        );
      case "auction_start":
        return (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-white font-medium">
                New Auction
              </span>
              <Badge variant="warning" className="text-[10px]">
                LIVE
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 truncate">
              {activity.data.adSlot} • Floor:{" "}
              {formatCurrency(Number(activity.data.floorPrice), 4)}
            </p>
          </div>
        );
      case "auction_won":
        return (
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-white font-medium">
                Auction Won
              </span>
              <Badge variant="neonPink" className="text-[10px]">
                WON
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 truncate">
              {activity.data.winner?.bidderName || "Unknown"} won with{" "}
              {formatCurrency(activity.data.winner?.amount || 0, 4)}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-start gap-3 py-3 px-4 hover:bg-zinc-800/30 transition-colors rounded-lg"
    >
      <div className={`p-2 rounded-lg ${config.bg} shrink-0`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>
      {renderContent()}
      <div className="text-[10px] text-zinc-600 shrink-0">
        {getTimeAgo(activity.timestamp)}
      </div>
    </motion.div>
  );
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Radio className="w-4 h-4 text-neon-green animate-pulse" />
          Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-1">
            <AnimatePresence mode="popLayout">
              {activities.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))}
            </AnimatePresence>

            {activities.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
                  <Radio className="w-5 h-5 text-zinc-600" />
                </div>
                <p className="text-zinc-500 text-sm">No activity yet</p>
                <p className="text-xs text-zinc-600 mt-1">
                  Events will appear here in real-time
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
