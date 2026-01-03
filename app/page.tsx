"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Activity,
  Wallet,
  TrendingUp,
  Zap,
  Globe,
  DollarSign,
  MousePointer,
  Server as ServerIcon,
  Clock,
  Users,
  Target,
  CheckCircle2,
  Timer,
  AlertCircle,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  socket,
  type Auction,
  type Bid,
  type BidResponse,
  type SettlementEvent,
  type AuctionCompletedEvent,
} from "@/lib/socket";
import {
  cn,
  formatCurrency,
  formatTimestamp,
  shortenAddress,
} from "@/lib/utils";
import {
  connectWallet as connectWalletLib,
  deposit,
  withdraw,
  getBalance,
  addLocalNetwork,
  settleAuction,
} from "@/lib/contract";
import { useToast } from "@/hooks/use-toast";

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
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleReconnect = useCallback(() => {
    console.log("handleReconnect");
    socket.connect();
  }, []);
  console.log(auctions, socket);

  useEffect(() => {
    // Check if socket is already connected when component mounts
    if (socket.connected) {
      setConnected(true);
    }

    socket.on("connect", () => {
      console.log("connect socket");
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
      console.log("auctions_sync socket", syncedAuctions);

      setAuctions(syncedAuctions);
    });

    socket.on("auction_created", (auction: Auction) => {
      console.log("auction_created socket");
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
            ? {
                ...a,
                bids: [...a.bids, bidData].sort((x, y) => y.amount - x.amount),
              }
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

      // Update stats with completion metadata
      if (event.metadata) {
        setStats((s) => {
          const completedCount = s.earlyCompletions + s.timeoutCompletions + 1;
          const isEarly =
            event.metadata.reason === "early_threshold" ||
            event.metadata.reason === "all_bids_received";

          return {
            ...s,
            earlyCompletions: isEarly
              ? s.earlyCompletions + 1
              : s.earlyCompletions,
            timeoutCompletions: !isEarly
              ? s.timeoutCompletions + 1
              : s.timeoutCompletions,
            avgCompletionTime: event.metadata.completionTime
              ? (s.avgCompletionTime * (completedCount - 1) +
                  event.metadata.completionTime) /
                completedCount
              : s.avgCompletionTime,
            avgBidRatio:
              event.metadata.bidRatio !== undefined
                ? (s.avgBidRatio * (completedCount - 1) +
                    event.metadata.bidRatio) /
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
          description: `Auction ${shortenAddress(
            data.auctionId
          )} ready to settle.`,
        });
        try {
          await settleAuction(data);
          toast({
            title: "Settlement Successful",
            description: `Auction ${shortenAddress(
              data.auctionId
            )} settled on-chain.`,
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
        description: `Address: ${shortenAddress(address)}`,
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
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className="h-8 w-8 text-[var(--neon-green)] glow-green" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-wider">
            AD<span className="text-[var(--neon-green)]">EXCH</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-3 h-3 rounded-full",
                connected
                  ? "bg-[var(--neon-green)] animate-pulse-green"
                  : "bg-red-500"
              )}
            />
            {connected ? (
              <span className="text-sm text-muted-foreground">Live</span>
            ) : (
              <Button
                variant="link"
                className="p-0 h-auto text-sm text-muted-foreground"
                onClick={handleReconnect}
              >
                Disconnected. Click to reconnect.
              </Button>
            )}
          </div>
          {walletAddress ? (
            <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2">
              <Wallet className="h-4 w-4 text-[var(--neon-green)]" />
              <span className="text-sm font-mono">
                {shortenAddress(walletAddress)}
              </span>
            </div>
          ) : (
            <Button onClick={handleConnectWallet} disabled={isLoading}>
              <Wallet className="mr-2 h-4 w-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      </header>

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
            <div className="text-xl font-bold">
              {formatCurrency(stats.totalVolume)}
            </div>
          </CardContent>
        </Card>
        <Card className="card-glow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-3 px-3">
            <CardTitle className="text-xs font-medium">Avg Bid</CardTitle>
            <Globe className="h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pb-3">
            <div className="text-xl font-bold">
              {formatCurrency(stats.avgBid)}
            </div>
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
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col neon-border">
            <CardHeader>
              <CardTitle>Live Auction Feed</CardTitle>
              <CardDescription>Showing last 50 auctions</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-hidden">
              <ScrollArea className="h-full" ref={scrollAreaRef}>
                {auctions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <ServerIcon className="w-12 h-12 mb-4" />
                    <p className="font-semibold">Waiting for auctions...</p>
                    <p className="text-sm">
                      Run the simulation script to see live data.
                    </p>
                    <code className="mt-2 text-xs bg-secondary/50 px-2 py-1 rounded-md">
                      npm run simulate
                    </code>
                  </div>
                ) : (
                  <div className="space-y-4 pr-4">
                    {auctions.map((auction) => (
                      <div
                        key={auction.id}
                        className={cn(
                          "p-4 rounded-lg border card-glow bid-item cursor-pointer transition-all",
                          selectedAuction?.id === auction.id &&
                            "ring-2 ring-[var(--neon-green)]"
                        )}
                        onClick={() =>
                          setSelectedAuction(
                            selectedAuction?.id === auction.id ? null : auction
                          )
                        }
                      >
                        {/* Header row */}
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant={
                                auction.status === "active"
                                  ? "default"
                                  : auction.status === "grace_period"
                                  ? "outline"
                                  : "secondary"
                              }
                              className={cn(
                                auction.status === "active" && "bg-blue-500",
                                auction.status === "grace_period" &&
                                  "border-yellow-500 text-yellow-500"
                              )}
                            >
                              {auction.status === "grace_period"
                                ? "⏳ grace"
                                : auction.status}
                            </Badge>
                            {auction.metadata?.reason && (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  auction.metadata.reason ===
                                    "all_bids_received" &&
                                    "border-[var(--neon-green)] text-[var(--neon-green)]",
                                  auction.metadata.reason ===
                                    "early_threshold" &&
                                    "border-blue-400 text-blue-400",
                                  auction.metadata.reason === "timeout" &&
                                    "border-orange-400 text-orange-400"
                                )}
                              >
                                {auction.metadata.reason === "all_bids_received"
                                  ? "⚡ all bids"
                                  : auction.metadata.reason ===
                                    "early_threshold"
                                  ? "⚡ early"
                                  : auction.metadata.reason === "timeout"
                                  ? "⏰ timeout"
                                  : auction.metadata.reason}
                              </Badge>
                            )}
                            <span className="font-mono text-xs text-muted-foreground">
                              {auction.id.substring(0, 20)}...
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {auction.metadata?.completionTime && (
                              <span className="text-xs text-muted-foreground">
                                {auction.metadata.completionTime}ms
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(auction.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Main info row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-1 text-sm mb-2">
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Publisher:
                            </span>{" "}
                            <span className="font-medium">
                              {auction.publisherId}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Slot:
                            </span>{" "}
                            <span className="font-medium">
                              {auction.adSlotType || auction.adSlotId}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Floor:
                            </span>{" "}
                            <span className="font-medium">
                              {formatCurrency(auction.floorPrice)}
                            </span>
                          </span>
                          {auction.metadata?.bidCount !== undefined && (
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Bids:
                              </span>{" "}
                              <span className="font-medium">
                                {auction.metadata.bidCount}/
                                {auction.metadata.expectedCount}
                                <span className="text-xs text-muted-foreground ml-1">
                                  (
                                  {(
                                    (auction.metadata.bidRatio || 0) * 100
                                  ).toFixed(0)}
                                  %)
                                </span>
                              </span>
                            </span>
                          )}
                        </div>

                        {/* User context (collapsible) */}
                        {selectedAuction?.id === auction.id &&
                          auction.userContext && (
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2 bg-secondary/30 rounded px-2 py-1">
                              {auction.userContext.countryCode && (
                                <span>
                                  🌍 {auction.userContext.countryCode}
                                </span>
                              )}
                              {auction.userContext.device && (
                                <span className="flex items-center gap-1">
                                  {auction.userContext.device === "desktop" ? (
                                    <Monitor className="h-3 w-3" />
                                  ) : auction.userContext.device ===
                                    "mobile" ? (
                                    <Smartphone className="h-3 w-3" />
                                  ) : (
                                    <Tablet className="h-3 w-3" />
                                  )}
                                  {auction.userContext.device}
                                </span>
                              )}
                              {auction.userContext.os && (
                                <span>💻 {auction.userContext.os}</span>
                              )}
                              {auction.userContext.browser && (
                                <span>🌐 {auction.userContext.browser}</span>
                              )}
                            </div>
                          )}

                        {/* Winner highlight */}
                        {auction.status === "completed" && auction.winner && (
                          <div className="bg-[var(--neon-green)]/10 border border-[var(--neon-green)]/30 rounded-md p-2 mb-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-[var(--neon-green)]" />
                                <span className="text-sm font-medium">
                                  Winner:{" "}
                                  {shortenAddress(
                                    auction.winner.campaignId ||
                                      auction.winner.advertiserId
                                  )}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="font-mono font-bold text-[var(--neon-green)]">
                                  {formatCurrency(auction.winner.amount)}
                                </div>
                                {auction.metadata?.winningPrice &&
                                  auction.metadata.winningPrice !==
                                    auction.winner.amount && (
                                    <div className="text-xs text-muted-foreground">
                                      pays{" "}
                                      {formatCurrency(
                                        auction.metadata.winningPrice
                                      )}{" "}
                                      (2nd price)
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Bids list */}
                        {auction.bids.length > 0 && (
                          <>
                            <Separator className="my-2" />
                            <div className="space-y-1">
                              {auction.bids
                                .slice(
                                  0,
                                  selectedAuction?.id === auction.id
                                    ? undefined
                                    : 3
                                )
                                .map((bid, i) => (
                                  <div
                                    key={i}
                                    className={cn(
                                      "flex justify-between items-center text-sm p-1.5 rounded",
                                      i === 0 &&
                                        auction.status === "completed" &&
                                        "bg-[var(--neon-green)]/5",
                                      auction.winner?.advertiserId ===
                                        bid.advertiserId && "winner-highlight"
                                    )}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground">
                                        #{i + 1}
                                      </span>
                                      <span className="font-mono text-xs">
                                        {shortenAddress(
                                          bid.campaignId || bid.advertiserId
                                        )}
                                      </span>
                                      {bid.responseTime && (
                                        <span className="text-xs text-muted-foreground">
                                          ({bid.responseTime}ms)
                                        </span>
                                      )}
                                    </div>
                                    <span className="font-mono font-semibold">
                                      {formatCurrency(bid.amount)}
                                    </span>
                                  </div>
                                ))}
                              {!selectedAuction?.id &&
                                auction.bids.length > 3 && (
                                  <div className="text-xs text-center text-muted-foreground">
                                    +{auction.bids.length - 3} more bids (click
                                    to expand)
                                  </div>
                                )}
                            </div>
                          </>
                        )}

                        {/* No bids state */}
                        {auction.status === "completed" &&
                          auction.bids.length === 0 && (
                            <div className="flex items-center gap-2 text-sm text-orange-400 mt-2">
                              <AlertCircle className="h-4 w-4" />
                              <span>No bids received</span>
                            </div>
                          )}

                        {/* Settle button */}
                        {auction.status === "completed" && auction.winner && (
                          <Button
                            size="sm"
                            className="w-full mt-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSimulateClick(auction.id);
                            }}
                          >
                            <MousePointer className="mr-2 h-4 w-4" />
                            Simulate Click & Settle
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        <aside className="space-y-6">
          <Card className="neon-border">
            <CardHeader>
              <CardTitle>Wallet & Balance</CardTitle>
              <CardDescription>
                Interact with the AdExchange contract
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className="text-3xl font-bold font-mono text-[var(--neon-green)]">
                  {balance}{" "}
                  <span className="text-lg text-muted-foreground">ETH</span>
                </p>
              </div>
              <Tabs defaultValue="deposit">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="deposit">Deposit</TabsTrigger>
                  <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                </TabsList>
                <TabsContent value="deposit" className="pt-4 space-y-2">
                  <Input
                    type="number"
                    placeholder="0.1"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                  />
                  <Button
                    className="w-full"
                    onClick={handleDeposit}
                    disabled={isLoading || !walletAddress}
                  >
                    Deposit
                  </Button>
                </TabsContent>
                <TabsContent value="withdraw" className="pt-4 space-y-2">
                  <Input
                    type="number"
                    placeholder="0.1"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                  />
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={handleWithdraw}
                    disabled={isLoading || !walletAddress}
                  >
                    Withdraw
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <Card className="card-glow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Session Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  Active
                </span>
                <span className="font-mono font-bold">
                  {
                    auctions.filter(
                      (a) =>
                        a.status === "active" || a.status === "grace_period"
                    ).length
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-[var(--neon-green)]" />
                  Completed
                </span>
                <span className="font-mono">
                  {auctions.filter((a) => a.status === "completed").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  With Bids
                </span>
                <span className="font-mono text-[var(--neon-green)]">
                  {
                    auctions.filter(
                      (a) => a.status === "completed" && a.bids.length > 0
                    ).length
                  }
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  No Bids
                </span>
                <span className="font-mono text-orange-400">
                  {
                    auctions.filter(
                      (a) => a.status === "completed" && a.bids.length === 0
                    ).length
                  }
                </span>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Completion Breakdown
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3 text-[var(--neon-green)]" />
                    Early Complete
                  </span>
                  <span className="font-mono text-[var(--neon-green)]">
                    {stats.earlyCompletions}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Timer className="h-3 w-3 text-orange-400" />
                    Timeout
                  </span>
                  <span className="font-mono text-orange-400">
                    {stats.timeoutCompletions}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Performance
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Avg Completion</span>
                  <span className="font-mono">
                    {stats.avgCompletionTime.toFixed(0)}ms
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Bid Response Rate
                  </span>
                  <span className="font-mono">
                    {(stats.avgBidRatio * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">
                    Avg Bids/Auction
                  </span>
                  <span className="font-mono">
                    {stats.totalBids > 0
                      ? (
                          stats.totalBids / Math.max(1, stats.totalAuctions)
                        ).toFixed(1)
                      : "0"}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="text-xs text-muted-foreground pt-2 space-y-2">
                <p>Run the bot to start bidding:</p>
                <code className="block bg-secondary/50 px-2 py-1 rounded-md">
                  cd bots/advertiser-bot && npm start
                </code>
                <p className="pt-2">Run the simulator:</p>
                <code className="block bg-secondary/50 px-2 py-1 rounded-md">
                  npm run simulate
                </code>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}