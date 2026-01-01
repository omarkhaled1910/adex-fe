"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getSocket, disconnectSocket } from "@/lib/socket";
import {
  getProvider,
  getSigner,
  getAdvertiserInfo,
  getPublisherInfo,
  depositAsAdvertiser,
  withdrawAdvertiser,
  withdrawPublisher,
  registerAsPublisher,
} from "@/lib/ethereum";
import type { Auction, BidResponse, DashboardStats, Settlement } from "@/types";

interface ActivityItem {
  id: string;
  type: "bid" | "settlement" | "auction_start" | "auction_won";
  data: any;
  timestamp: number;
}

export function useAdExchange() {
  // Wallet state
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [role, setRole] = useState<"advertiser" | "publisher">("advertiser");

  // Balance state
  const [balance, setBalance] = useState<bigint>(0n);
  const [totalSpent, setTotalSpent] = useState<bigint>(0n);
  const [totalEarned, setTotalEarned] = useState<bigint>(0n);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Auction state
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  // Stats
  const [stats, setStats] = useState<DashboardStats>({
    totalAuctions: 0,
    activeAuctions: 0,
    totalBids: 0,
    avgBidAmount: 0,
    totalVolume: 0,
    settlements: 0,
  });

  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    try {
      const signer = await getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
      setIsConnected(true);

      // Fetch initial balance
      await refreshBalance(address);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  }, []);

  // Refresh balance
  const refreshBalance = useCallback(
    async (address?: string) => {
      const addr = address || walletAddress;
      if (!addr) return;

      setIsLoadingBalance(true);
      try {
        if (role === "advertiser") {
          const info = await getAdvertiserInfo(addr);
          setBalance(info.balance);
          setTotalSpent(info.totalSpent);
        } else {
          const info = await getPublisherInfo(addr);
          setBalance(info.balance);
          setTotalEarned(info.totalEarned);
        }
      } catch (error) {
        console.error("Failed to fetch balance:", error);
      } finally {
        setIsLoadingBalance(false);
      }
    },
    [walletAddress, role]
  );

  // Deposit funds
  const handleDeposit = useCallback(
    async (amount: string) => {
      try {
        await depositAsAdvertiser(amount);
        await refreshBalance();
        addActivity({
          id: `deposit_${Date.now()}`,
          type: "settlement",
          data: { amount: parseFloat(amount), action: "deposit" },
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error("Deposit failed:", error);
        throw error;
      }
    },
    [refreshBalance]
  );

  // Withdraw funds
  const handleWithdraw = useCallback(
    async (amount: string) => {
      try {
        if (role === "advertiser") {
          await withdrawAdvertiser(amount);
        } else {
          await withdrawPublisher(amount);
        }
        await refreshBalance();
      } catch (error) {
        console.error("Withdraw failed:", error);
        throw error;
      }
    },
    [role, refreshBalance]
  );

  // Add activity
  const addActivity = useCallback((activity: ActivityItem) => {
    setActivities((prev) => [activity, ...prev].slice(0, 100));
  }, []);

  // Handle settlement
  const handleSettle = useCallback(
    async (auction: Auction) => {
      if (!auction.winner) return;

      // Simulate settlement (in production, this would sign and submit to blockchain)
      const settlement: Settlement = {
        auctionId: auction.auctionId,
        advertiser: auction.winner.bidderId,
        publisher: auction.publisherId,
        amount: auction.winner.amount,
        impressionId: Date.now().toString(),
        timestamp: Date.now(),
        status: "pending",
      };

      // Emit to socket for broadcast
      socketRef.current?.emit("simulate_settlement", settlement);

      addActivity({
        id: `settlement_${Date.now()}`,
        type: "settlement",
        data: {
          ...settlement,
          status: "settled",
          txHash: "0x" + Math.random().toString(16).slice(2),
        },
        timestamp: Date.now(),
      });

      await refreshBalance();
    },
    [refreshBalance, addActivity]
  );

  // Update stats
  const updateStats = useCallback((auctionList: Auction[]) => {
    const active = auctionList.filter((a) => a.status === "active");
    const allBids = auctionList.flatMap((a) => a.bids);
    const avgBid =
      allBids.length > 0
        ? allBids.reduce((sum, b) => sum + b.amount, 0) / allBids.length
        : 0;
    const totalVol = auctionList
      .filter((a) => a.winner)
      .reduce((sum, a) => sum + (a.winner?.amount || 0), 0);

    setStats({
      totalAuctions: auctionList.length,
      activeAuctions: active.length,
      totalBids: allBids.length,
      avgBidAmount: avgBid,
      totalVolume: totalVol,
      settlements: auctionList.filter((a) => a.status === "won").length,
    });
  }, []);

  // Socket connection
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    socket.on("active_auctions", (data: Auction[]) => {
      setAuctions(data);
      updateStats(data);
    });

    socket.on("new_auction", (auction: Auction) => {
      addActivity({
        id: `auction_${auction.auctionId}`,
        type: "auction_start",
        data: auction,
        timestamp: auction.timestamp,
      });
    });

    socket.on("bid_response", (bid: BidResponse) => {
      addActivity({
        id: `bid_${bid.auctionId}_${bid.bidderId}_${bid.timestamp}`,
        type: "bid",
        data: bid,
        timestamp: bid.timestamp,
      });
    });

    socket.on(
      "auction_won",
      (data: { auctionId: string; winner: any; totalBids: number }) => {
        addActivity({
          id: `won_${data.auctionId}`,
          type: "auction_won",
          data,
          timestamp: Date.now(),
        });
      }
    );

    socket.on("settlement", (settlement: Settlement) => {
      addActivity({
        id: `settlement_${settlement.auctionId}`,
        type: "settlement",
        data: settlement,
        timestamp: settlement.timestamp,
      });
    });

    return () => {
      socket.off("active_auctions");
      socket.off("new_auction");
      socket.off("bid_response");
      socket.off("auction_won");
      socket.off("settlement");
    };
  }, [addActivity, updateStats]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  return {
    // Wallet
    walletAddress,
    isConnected,
    connectWallet,
    role,
    setRole,

    // Balance
    balance,
    totalSpent,
    totalEarned,
    isLoadingBalance,
    refreshBalance,
    handleDeposit,
    handleWithdraw,

    // Auctions
    auctions,
    activities,
    stats,
    handleSettle,
  };
}
