"use client";

import { motion } from "framer-motion";
import {
  Activity,
  DollarSign,
  Gavel,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatEther } from "@/lib/utils";
import type { DashboardStats } from "@/types";

interface StatsCardsProps {
  stats: DashboardStats;
  balance: bigint;
  role: "advertiser" | "publisher";
}

export function StatsCards({ stats, balance, role }: StatsCardsProps) {
  const cards = [
    {
      title: "On-Chain Balance",
      value: `${formatEther(balance)} ETH`,
      icon: DollarSign,
      color: "neon-green",
      gradient: "from-neon-green/20 to-transparent",
    },
    {
      title: "Active Auctions",
      value: stats.activeAuctions.toString(),
      icon: Activity,
      color: "neon-blue",
      gradient: "from-neon-blue/20 to-transparent",
    },
    {
      title: "Total Bids",
      value: stats.totalBids.toString(),
      icon: Gavel,
      color: "neon-pink",
      gradient: "from-neon-pink/20 to-transparent",
    },
    {
      title: "Avg Bid",
      value: formatCurrency(stats.avgBidAmount, 4),
      icon: TrendingUp,
      color: "neon-orange",
      gradient: "from-neon-orange/20 to-transparent",
    },
    {
      title: "Settlements",
      value: stats.settlements.toString(),
      icon: Zap,
      color: "neon-purple",
      gradient: "from-neon-purple/20 to-transparent",
    },
    {
      title: role === "advertiser" ? "Impressions Bought" : "Impressions Sold",
      value: stats.totalAuctions.toString(),
      icon: Users,
      color: "neon-green",
      gradient: "from-neon-green/20 to-transparent",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="card-hover overflow-hidden">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50`}
            />
            <CardContent className="relative p-4">
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`p-2 rounded-lg bg-${card.color}/10 border border-${card.color}/20`}
                  style={{
                    backgroundColor: `var(--${card.color}, rgba(57,255,20,0.1))`,
                    borderColor: `var(--${card.color}, rgba(57,255,20,0.2))`,
                  }}
                >
                  <card.icon
                    className="w-4 h-4"
                    style={{ color: `var(--${card.color}, #39FF14)` }}
                  />
                </div>
              </div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
                {card.title}
              </p>
              <p className="text-xl font-bold font-mono text-white">
                {card.value}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
