"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Activity,
  Wallet,
  TrendingUp,
  Zap,
  Globe,
  Users,
  DollarSign,
  Clock,
  MousePointer,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server as ServerIcon,
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
import { socket, type Auction, type Bid, type BidResponse, type SettlementEvent } from "@/lib/socket";
import { cn, formatCurrency, formatTimestamp, shortenAddress } from "@/lib/utils";
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
  });
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleReconnect = useCallback(() => {
    console.log("handleReconnect")
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
      setAuctions((prev) =>
        prev.map((a) =>
          a.id === data.auctionId
            ? {
                ...a,
                bids: [...a.bids, data.bid].sort((x, y) => y.amount - x.amount),
              }
            : a
        )
      );
      setStats((s) => ({
        ...s,
        totalBids: s.totalBids + 1,
        totalVolume: s.totalVolume + data.bid.amount,
        avgBid: (s.totalVolume + data.bid.amount) / (s.totalBids + 1),
      }));
    });

    socket.on("auction_completed", (auction: Auction) => {
      setAuctions((prev) =>
        prev.map((a) => (a.id === auction.id ? auction : a))
      );
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
      toast({ title: "Wallet Connected", description: `Address: ${shortenAddress(address)}` });
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
      toast({ title: "Deposit Successful", description: `${depositAmount} ETH deposited.`, variant: 'success' });
    } catch (e) {
      toast({ title: "Deposit Failed", description: "Transaction failed or was rejected.", variant: 'destructive' });
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
      toast({ title: "Withdrawal Successful", description: `${withdrawAmount} ETH withdrawn.`, variant: 'success' });
    } catch (e) {
      toast({ title: "Withdrawal Failed", description: "Transaction failed or was rejected.", variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleSimulateClick = (auctionId: string) => {
    socket.emit("simulate_click", { auctionId });
    toast({ title: "Click Simulated", description: "Requesting settlement from server..." });
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
            <div className={cn("w-3 h-3 rounded-full", connected ? "bg-[var(--neon-green)] animate-pulse-green" : "bg-red-500")} />
            {connected ? (
              <span className="text-sm text-muted-foreground">Live</span>
            ) : (
              <Button variant="link" className="p-0 h-auto text-sm text-muted-foreground" onClick={handleReconnect}>
                Disconnected. Click to reconnect.
              </Button>
            )}
          </div>
          {walletAddress ? (
            <div className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-2">
              <Wallet className="h-4 w-4 text-[var(--neon-green)]" />
              <span className="text-sm font-mono">{shortenAddress(walletAddress)}</span>
            </div>
          ) : (
            <Button onClick={handleConnectWallet} disabled={isLoading}><Wallet className="mr-2 h-4 w-4" />Connect Wallet</Button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="card-glow"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Auctions</CardTitle><Activity className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalAuctions}</div></CardContent></Card>
        <Card className="card-glow"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Bids</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalBids}</div></CardContent></Card>
        <Card className="card-glow"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Volume</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(stats.totalVolume)}</div></CardContent></Card>
        <Card className="card-glow"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Average Bid</CardTitle><Globe className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(stats.avgBid)}</div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col neon-border"><CardHeader><CardTitle>Live Auction Feed</CardTitle><CardDescription>Showing last 50 auctions</CardDescription></CardHeader>
            <CardContent className="flex-grow overflow-hidden"><ScrollArea className="h-full" ref={scrollAreaRef}>
                {auctions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <ServerIcon className="w-12 h-12 mb-4" />
                    <p className="font-semibold">Waiting for auctions...</p>
                    <p className="text-sm">Run the simulation script to see live data.</p>
                    <code className="mt-2 text-xs bg-secondary/50 px-2 py-1 rounded-md">npm run simulate</code>
                  </div>
                ) : (
                  <div className="space-y-4 pr-4">
                    {auctions.map((auction) => (
                      <div key={auction.id} className="p-4 rounded-lg border card-glow bid-item">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={auction.status === 'active' ? 'default' : 'secondary'}>{auction.status}</Badge>
                            <span className="font-mono text-xs">{auction.id}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{formatTimestamp(auction.createdAt)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-2">
                          <span><strong className="text-muted-foreground">Publisher:</strong> {auction.publisherId}</span>
                          <span><strong className="text-muted-foreground">Ad Slot:</strong> {auction.adSlotId}</span>
                          <span><strong className="text-muted-foreground">Floor Price:</strong> {formatCurrency(auction.floorPrice)}</span>
                        </div>
                        {auction.bids.length > 0 && <Separator className="my-2" />}
                        <div className="space-y-1">
                          {auction.bids.map((bid, i) => (
                            <div key={i} className={cn("flex justify-between items-center text-sm p-1 rounded", auction.winner?.advertiserId === bid.advertiserId && "winner-highlight")}>
                              <span>{bid.advertiserId}</span>
                              <span className="font-mono font-semibold">{formatCurrency(bid.amount)}</span>
                            </div>
                          ))}
                        </div>
                        {auction.status === 'completed' && auction.winner && (
                          <Button size="sm" className="w-full mt-2" onClick={() => handleSimulateClick(auction.id)}><MousePointer className="mr-2 h-4 w-4" />Simulate Click & Settle</Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
            </ScrollArea></CardContent>
          </Card>
        </div>
        <aside className="space-y-6">
          <Card className="neon-border"><CardHeader><CardTitle>Wallet & Balance</CardTitle><CardDescription>Interact with the AdExchange contract</CardDescription></CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <p className="text-3xl font-bold font-mono text-[var(--neon-green)]">{balance} <span className="text-lg text-muted-foreground">ETH</span></p>
              </div>
              <Tabs defaultValue="deposit">
                <TabsList className="grid w-full grid-cols-2"><TabsTrigger value="deposit">Deposit</TabsTrigger><TabsTrigger value="withdraw">Withdraw</TabsTrigger></TabsList>
                <TabsContent value="deposit" className="pt-4 space-y-2"><Input type="number" placeholder="0.1" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} /><Button className="w-full" onClick={handleDeposit} disabled={isLoading || !walletAddress}>Deposit</Button></TabsContent>
                <TabsContent value="withdraw" className="pt-4 space-y-2"><Input type="number" placeholder="0.1" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} /><Button className="w-full" variant="secondary" onClick={handleWithdraw} disabled={isLoading || !walletAddress}>Withdraw</Button></TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          <Card className="card-glow"><CardHeader><CardTitle>Session Status</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Active Auctions</span><span className="font-mono">{auctions.filter(a => a.status === 'active').length}</span></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Completed Auctions</span><span className="font-mono">{auctions.filter(a => a.status === 'completed').length}</span></div>
                <Separator />
                <div className="text-xs text-muted-foreground pt-2">
                    <p>Run the bot to start bidding:</p>
                    <code className="mt-1 block bg-secondary/50 px-2 py-1 rounded-md">npm run bot</code>
                </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}