"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Activity,
  TrendingUp,
  Zap,
  DollarSign,
  Globe,
  Clock,
  Timer,
  Target,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { socket, type Auction, type Bid, type BidResponse, type SettlementEvent, type AuctionCompletedEvent } from "@/lib/socket";
import { formatCurrency } from "@/lib/utils";
import { connectWallet as connectWalletLib, deposit, withdraw, getBalance, addLocalNetwork, settleAuction } from "@/lib/contract";
import { useToast } from "@/hooks/use-toast";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { WalletCard } from "@/components/dashboard/WalletCard";
import { AuctionsSection } from "@/components/dashboard/AuctionsSection";
import { SessionStatus } from "@/components/dashboard/SessionStatus";

interface Stats {
  totalAuctions: number;
  totalBids: number;
  totalVolume: number;
  avgBid: number;
  earlyCompletions: number;
  timeoutCompletions: number;
  avgCompletionTime: number;
  avgBidRatio: number;
}

export default function Dashboard() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0.0000");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalAuctions: 0,
    totalBids: 0,
    totalVolume: 0,
    avgBid: 0,
    earlyCompletions: 0,
    timeoutCompletions: 0,
    avgCompletionTime: 0,
    avgBidRatio: 0,
  });
  const { toast } = useToast();

  const handleReconnect = useCallback(() => {
    socket.connect();
  }, []);

  useEffect(() => {
    if (socket.connected) {
      setConnected(true);
    }

    socket.on("connect", () => {
      setConnected(true);
      toast({ title: "Live", description: "Connected to real-time feed." });
    });

    socket.on("disconnect", () => {
      setConnected(false);
      toast({
        title: "Connection Lost",
        description: "You have been disconnected from the server.",
        variant: "destructive",
      });
    });

    socket.on("auctions_sync", (syncedAuctions: Auction[]) => {
      console.log("[Frontend] auctions_sync received:", syncedAuctions.length, "auctions");
      setAuctions(syncedAuctions);
    });

    socket.on("auction_created", (auction: Auction) => {
      console.log("[Frontend] auction_created received:", auction.id, auction.status);
      setAuctions((prev) => [auction, ...prev].slice(0, 50));
      setStats((s) => ({ ...s, totalAuctions: s.totalAuctions + 1 }));
    });

    socket.on("bid_received", (data: BidResponse) => {
      const bidData: Bid = data.bid || {
        advertiserId: data.campaignId || "unknown",
        campaignId: data.campaignId,
        amount: data.amount || 0,
        timestamp: Date.now(),
        responseTime: data.responseTime,
      };

      setAuctions((prev) =>
        prev.map((a) =>
          a.id === data.auctionId
            ? { ...a, bids: [...a.bids, bidData].sort((x, y) => y.amount - x.amount) }
            : a
        )
      );
      setStats((s) => ({
        ...s,
        totalBids: s.totalBids + 1,
        totalVolume: s.totalVolume + bidData.amount,
        avgBid: (s.totalVolume + bidData.amount) / (s.totalBids + 1),
      }));
    });

    socket.on("auction_completed", (event: AuctionCompletedEvent) => {
      console.log("[Frontend] auction_completed received:", event.auctionId, "winner:", event.winner?.amount);
      setAuctions((prev) =>
        prev.map((a) =>
          a.id === event.auctionId
            ? {
                ...a,
                status: "completed" as const,
                winner: event.winner || undefined,
                bids: event.allBids || a.bids,
                completedAt: event.completedAt,
                metadata: event.metadata,
                userContext: event.auctionRequest?.userContext || a.userContext,
              }
            : a
        )
      );

      if (event.metadata) {
        setStats((s) => {
          const completedCount = s.earlyCompletions + s.timeoutCompletions + 1;
          const isEarly =
            event.metadata.reason === "early_threshold" ||
            event.metadata.reason === "all_bids_received";

          return {
            ...s,
            earlyCompletions: isEarly ? s.earlyCompletions + 1 : s.earlyCompletions,
            timeoutCompletions: !isEarly ? s.timeoutCompletions + 1 : s.timeoutCompletions,
            avgCompletionTime: event.metadata.completionTime
              ? (s.avgCompletionTime * (completedCount - 1) + event.metadata.completionTime) /
                completedCount
              : s.avgCompletionTime,
            avgBidRatio:
              event.metadata.bidRatio !== undefined
                ? (s.avgBidRatio * (completedCount - 1) + event.metadata.bidRatio) /
                  completedCount
                : s.avgBidRatio,
          };
        });
      }
    });

    socket.on(
      "settlement_triggered",
      async (data: SettlementEvent & { signature: string }) => {
        toast({
          title: "Settlement Triggered",
          description: `Auction ready to settle.`,
        });
        try {
          await settleAuction(data);
          toast({
            title: "Settlement Successful",
            description: `Auction settled on-chain.`,
            variant: "success",
          });
        } catch (error) {
          console.error("Settlement failed:", error);
          toast({
            title: "Settlement Failed",
            description: "Could not settle auction on-chain.",
            variant: "destructive",
          });
        }
      }
    );

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("auctions_sync");
      socket.off("auction_created");
      socket.off("bid_received");
      socket.off("auction_completed");
      socket.off("settlement_triggered");
    };
  }, [toast]);

  const handleConnectWallet = useCallback(async () => {
    setIsLoading(true);
    await addLocalNetwork();
    const address = await connectWalletLib();
    if (address) {
      setWalletAddress(address);
      const newBalance = await getBalance(address);
      setBalance(newBalance);
      toast({
        title: "Wallet Connected",
        description: `Address: ${address}`,
      });
    }
    setIsLoading(false);
  }, [toast]);

  const handleDeposit = async () => {
    if (!walletAddress || !depositAmount) return;
    setIsLoading(true);
    try {
      await deposit(depositAmount);
      const newBalance = await getBalance(walletAddress);
      setBalance(newBalance);
      setDepositAmount("");
      toast({
        title: "Deposit Successful",
        description: `${depositAmount} ETH deposited.`,
        variant: "success",
      });
    } catch (e) {
      toast({
        title: "Deposit Failed",
        description: "Transaction failed or was rejected.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleWithdraw = async () => {
    if (!walletAddress || !withdrawAmount) return;
    setIsLoading(true);
    try {
      await withdraw(withdrawAmount);
      const newBalance = await getBalance(walletAddress);
      setBalance(newBalance);
      setWithdrawAmount("");
      toast({
        title: "Withdrawal Successful",
        description: `${withdrawAmount} ETH withdrawn.`,
        variant: "success",
      });
    } catch (e) {
      toast({
        title: "Withdrawal Failed",
        description: "Transaction failed or was rejected.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleSimulateClick = (auctionId: string) => {
    socket.emit("simulate_click", { auctionId });
    toast({
      title: "Click Simulated",
      description: "Requesting settlement from server...",
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6 lg:p-8 grid-pattern">
      <DashboardHeader
        connected={connected}
        walletAddress={walletAddress}
        isLoading={isLoading}
        onConnectWallet={handleConnectWallet}
        onReconnect={handleReconnect}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-medium">Auctions</CardTitle>
            <Activity className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-xl font-bold">{stats.totalAuctions}</div>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-medium">Total Bids</CardTitle>
            <TrendingUp className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-xl font-bold">{stats.totalBids}</div>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-medium">Volume</CardTitle>
            <DollarSign className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-xl font-bold">{formatCurrency(stats.totalVolume)}</div>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-medium">Avg Bid</CardTitle>
            <Globe className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-xl font-bold">{formatCurrency(stats.avgBid)}</div>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-medium">Early ⚡</CardTitle>
            <Zap className="h-3 w-3 text-[var(--neon-green)]" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-xl font-bold text-[var(--neon-green)]">
              {stats.earlyCompletions}
            </div>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-medium">Timeout</CardTitle>
            <Timer className="h-3 w-3 text-orange-400" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-xl font-bold text-orange-400">
              {stats.timeoutCompletions}
            </div>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-medium">Avg Time</CardTitle>
            <Clock className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-xl font-bold">
              {stats.avgCompletionTime.toFixed(0)}ms
            </div>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-medium">Bid Rate</CardTitle>
            <Target className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-xl font-bold">
              {(stats.avgBidRatio * 100).toFixed(0)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AuctionsSection auctions={auctions} onSimulateClick={handleSimulateClick} />

        <aside className="space-y-6">
          <WalletCard
            balance={balance}
            walletAddress={walletAddress}
            depositAmount={depositAmount}
            withdrawAmount={withdrawAmount}
            isLoading={isLoading}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
            setDepositAmount={setDepositAmount}
            setWithdrawAmount={setWithdrawAmount}
          />
          <SessionStatus auctions={auctions} stats={stats} />
        </aside>
      </div>
    </div>
  );
}
